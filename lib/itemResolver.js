import itemData from "@/data/items.json";

const itemMap = new Map(
  itemData.map((i) => [i.uniqueName, i])
);

// =============================
// AUTO RESOLVE ALBION ITEM
// =============================
export function resolveItem(name) {
  if (!name) return null;

  // 1. direct match dari item.json
  if (itemMap.has(name)) {
    return itemMap.get(name);
  }

  // 2. fallback render albion (AUTO)
  return {
    uniqueName: name,
    displayName: name,
    image: `https://render.albiononline.com/v1/item/${encodeURIComponent(
      name
    )}.png`,
  };
}