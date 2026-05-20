import nextCoreWebVitals from "eslint-config-next/core-web-vitals";
import nextTypescript from "eslint-config-next/typescript";

const config = [
  ...nextCoreWebVitals,
  ...nextTypescript,
  {
    rules: {
      // Existing app patterns rely on client-side hydration/localStorage effects and
      // server-page fallback try/catch blocks. Keep these as non-blocking for the
      // current deploy build; refactor later if adopting React Compiler-strict rules.
      "react-hooks/set-state-in-effect": "off",
      "react-hooks/error-boundaries": "off",
    },
  },
];

export default config;
