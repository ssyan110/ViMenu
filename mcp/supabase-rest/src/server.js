import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
} from "@modelcontextprotocol/sdk/types.js";
import { createClient } from "@supabase/supabase-js";

function getEnv(name) {
  const value = process.env[name];
  if (!value) throw new Error(`Missing required env var: ${name}`);
  return value;
}

function parseAllowedTables(value) {
  const raw = (value ?? "").trim();
  if (!raw) return ["public_menu_items"];
  return raw
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);
}

function assertAllowedTable(table, allowed) {
  if (!allowed.includes(table)) {
    throw new Error(
      `Table/view not allowed: ${table}. Allowed: ${allowed.join(", ")}`,
    );
  }
}

function asText(value) {
  if (typeof value === "string") return value;
  return JSON.stringify(value, null, 2);
}

async function fetchPostgrestOpenApi({ supabaseUrl, supabaseAnonKey }) {
  const url = new URL("/rest/v1/", supabaseUrl);
  const res = await fetch(url, {
    method: "GET",
    headers: {
      apikey: supabaseAnonKey,
      Authorization: `Bearer ${supabaseAnonKey}`,
      Accept: "application/openapi+json",
    },
  });

  if (!res.ok) {
    const body = await res.text().catch(() => "");
    throw new Error(
      `Failed to fetch PostgREST OpenAPI (${res.status} ${res.statusText}): ${body}`,
    );
  }

  return /** @type {any} */ (await res.json());
}

function listEntitiesFromOpenApi(openApi) {
  const paths = openApi?.paths;
  if (!paths || typeof paths !== "object") return [];

  const out = new Set();
  for (const key of Object.keys(paths)) {
    // Typical keys: "/table_name"
    if (typeof key !== "string") continue;
    const name = key.replace(/^\//, "").trim();
    if (!name) continue;
    // Filter out non-table endpoints (rare), keep conservative.
    if (name.includes("{") || name.includes("}")) continue;
    out.add(name);
  }
  return Array.from(out).sort();
}

const supabaseUrl = getEnv("SUPABASE_URL");
const supabaseAnonKey = getEnv("SUPABASE_ANON_KEY");
const allowedTables = parseAllowedTables(process.env.SUPABASE_ALLOWED_TABLES);

const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: { persistSession: false, autoRefreshToken: false },
});

const server = new Server(
  {
    name: "vimenu-supabase-rest",
    version: "0.0.1",
  },
  {
    capabilities: {
      tools: {},
    },
  },
);

server.setRequestHandler(ListToolsRequestSchema, async () => {
  return {
    tools: [
      {
        name: "supabase_allowed_tables",
        description:
          "List which Supabase tables/views this MCP server allows querying (read-only).",
        inputSchema: {
          type: "object",
          properties: {},
          additionalProperties: false,
        },
      },
      {
        name: "supabase_list_rest_entities",
        description:
          "List tables/views exposed via Supabase PostgREST OpenAPI for the provided anon key (this may be a subset of all DB tables).",
        inputSchema: {
          type: "object",
          properties: {},
          additionalProperties: false,
        },
      },
      {
        name: "supabase_select",
        description:
          "Run a read-only select against an allowed Supabase table/view using the anon key (RLS applies).",
        inputSchema: {
          type: "object",
          properties: {
            table: {
              type: "string",
              description:
                "Table or view name (as used in PostgREST). Example: public_menu_items",
            },
            columns: {
              type: "string",
              description: "Select columns. Default: '*'",
            },
            filters: {
              type: "object",
              description:
                'Simple equality filters, e.g. {"restaurant_slug":"my-slug"}.',
              additionalProperties: {
                anyOf: [
                  { type: "string" },
                  { type: "number" },
                  { type: "boolean" },
                ],
              },
            },
            limit: {
              type: "number",
              description: "Max rows. Default: 50",
            },
            order: {
              type: "object",
              description:
                'Optional ordering: {"column":"created_at","ascending":false}',
              properties: {
                column: { type: "string" },
                ascending: { type: "boolean" },
              },
              additionalProperties: false,
            },
          },
          required: ["table"],
          additionalProperties: false,
        },
      },
    ],
  };
});

server.setRequestHandler(CallToolRequestSchema, async (request) => {
  const { name, arguments: args } = request.params;

  if (name === "supabase_allowed_tables") {
    return {
      content: [{ type: "text", text: asText({ allowedTables }) }],
    };
  }

  if (name === "supabase_list_rest_entities") {
    try {
      const openApi = await fetchPostgrestOpenApi({
        supabaseUrl,
        supabaseAnonKey,
      });
      const entities = listEntitiesFromOpenApi(openApi);
      return {
        content: [
          {
            type: "text",
            text: asText({
              ok: true,
              note: "This list comes from Supabase PostgREST OpenAPI and may be a subset of all database tables (depending on exposure/RLS).",
              entities,
            }),
          },
        ],
      };
    } catch (err) {
      return {
        content: [
          {
            type: "text",
            text: asText({
              ok: false,
              message: err instanceof Error ? err.message : String(err),
            }),
          },
        ],
      };
    }
  }

  if (name === "supabase_select") {
    const table = args?.table;
    const columns = args?.columns ?? "*";
    const filters = args?.filters ?? {};
    const limit = Number.isFinite(args?.limit) ? args.limit : 50;
    const order = args?.order;

    if (typeof table !== "string" || !table.trim()) {
      throw new Error("Invalid table");
    }

    assertAllowedTable(table, allowedTables);

    let query = supabase.from(table).select(columns).limit(limit);

    if (order?.column) {
      query = query.order(order.column, {
        ascending: order.ascending ?? true,
      });
    }

    for (const [key, value] of Object.entries(filters)) {
      query = query.eq(key, value);
    }

    const { data, error } = await query;
    if (error) {
      return {
        content: [
          {
            type: "text",
            text: asText({
              ok: false,
              message: error.message,
              details: error.details,
              hint: error.hint,
              code: error.code,
            }),
          },
        ],
      };
    }

    return {
      content: [{ type: "text", text: asText({ ok: true, data }) }],
    };
  }

  throw new Error(`Unknown tool: ${name}`);
});

const transport = new StdioServerTransport();
await server.connect(transport);
