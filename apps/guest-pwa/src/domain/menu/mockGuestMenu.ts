import type { MenuCategory, MenuItem } from "@/domain/menu/models";

export function getMockGuestMenu(): {
  categories: MenuCategory[];
  items: MenuItem[];
} {
  const categories: MenuCategory[] = [
    { id: "appetizers", name: "Appetizers", itemCount: 8 },
    { id: "mains", name: "Mains", itemCount: 12 },
    { id: "drinks", name: "Drinks" },
    { id: "desserts", name: "Desserts" },
    { id: "specials", name: "Specials" },
  ];

  const items: MenuItem[] = [
    {
      id: "spring-rolls",
      categoryId: "appetizers",
      nameVi: "Gỏi Cuốn",
      nameByLang: { en: "Spring Rolls" },
      priceText: "45k",
      imageUrl:
        "https://lh3.googleusercontent.com/aida-public/AB6AXuDehE93NfnHHFLmnReW66cHamzRPQc9yz2SRbs1QFTY0DyurEdp0exiGZZeuRD3oPAce6FJkyHkdN1k1gnZ4dUzzPtSExIRwOH_oOXdSlRCiR26A1yoGEwl8xyO0ozgVgEpVFE5GM3pC1TAPA0_E0Kud2LfiJFp1IzMqmTrsnc3ZXyBqkQxKmHcNB-0IXoUl7tvRkxr-Yfswmr4wY2t7Gy0HvZ7HEXIhEiwLT_6Ne_BqJeuX1tGyJP3E-IjvMRqaVToiq7FJLkzNsAq",
      allergens: [
        {
          code: "shrimp",
          display: "Hải sản",
          displayVi: "Hải sản",
          icon: "🦐",
        },
      ],
      dietaryTags: ["vegetarian"],
    },
    {
      id: "banh-xeo",
      categoryId: "appetizers",
      nameVi: "Bánh Xèo",
      nameByLang: { en: "Crispy Pancake" },
      descriptionByLang: {
        en: "Savory fried pancake made of rice flour, water, and turmeric powder.",
      },
      priceText: "85k",
      badges: [{ code: "popular", rank: 50 }],
    },
    {
      id: "pho-bo",
      categoryId: "mains",
      nameVi: "Phở Bò",
      nameByLang: { en: "Beef Noodle Soup" },
      priceText: "65k",
      imageUrl:
        "https://lh3.googleusercontent.com/aida-public/AB6AXuDHdxq72pRjlYIDDNn1SSn8nEy8GtYoOOmootVyq3ItugMllNh5XsLoGqxrEDWI4Whg-RqH1KB-k38TAotqZQLTrabR2vcOZ7YXUCcdRr3pAffwDLtQ4h1Pe1VQ3kmWa8kC28-OWeBkePpTxneAWTSDlu8DyMQzbT0c8tkwWPj5WZzKwWgW3UqpBM6ioi3DlrDL_TGp2BmowNVszEBRSO-NA9saR2uk4HrMAQNWCz4yOZ1m4r3EjD4u9cmBynWOgmIMuO76r45QUlk0",
      allergens: [
        {
          code: "peanut",
          display: "Đậu phộng",
          displayVi: "Đậu phộng",
          icon: "🥜",
        },
      ],
      dietaryTags: ["gluten_free"],
      badges: [{ code: "popular", rank: 100 }],
    },
  ];

  return { categories, items };
}
