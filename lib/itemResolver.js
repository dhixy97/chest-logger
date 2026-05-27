import itemData from "@/data/items.json";

// =============================
// ITEM MAP
// =============================
const itemMap = new Map(
  itemData.map((item) => [
    item.uniqueName.toUpperCase(),
    item,
  ])
);

// =============================
// NORMALIZE VALUE
// =============================
function normalize(value) {
  return String(value || "")
    .trim()
    .toUpperCase();
}

// =============================
// BUILD IMAGE URL
// =============================
function buildImageUrl(
  uniqueName,
  enchant = 0,
  quality = 1
) {
  const enchantSuffix =
    Number(enchant) > 0
      ? `@${Number(enchant)}`
      : "";

  const finalUniqueName =
    `${uniqueName}${enchantSuffix}`;

  return `https://render.albiononline.com/v1/item/${encodeURIComponent(
    finalUniqueName
  )}.png?quality=${quality}`;
}

// =============================
// RESOLVE ITEM
// =============================
export function resolveItem(
  itemName,
  enchant = 0,
  quality = 1
) {
  if (!itemName) {
    return {
      uniqueName: "UNKNOWN",
      displayName: "Unknown Item",
      image: "",
    };
  }

  const normalizedName =
    normalize(itemName);

  const enchantLevel =
    Number(enchant) || 0;

  const qualityLevel =
    Number(quality) || 1;

  // =============================
  // DIRECT MATCH
  // =============================
  const item =
    itemMap.get(normalizedName);

  if (item) {
    const enchantSuffix =
      enchantLevel > 0
        ? `@${enchantLevel}`
        : "";

    const finalUniqueName =
      `${item.uniqueName}${enchantSuffix}`;

    return {
      ...item,
      enchant: enchantLevel,
      quality: qualityLevel,
      uniqueName: finalUniqueName,

      image: buildImageUrl(
        item.uniqueName,
        enchantLevel,
        qualityLevel
      ),
    };
  }

  // =============================
  // FALLBACK
  // =============================
  return {
    uniqueName:
      enchantLevel > 0
        ? `${normalizedName}@${enchantLevel}`
        : normalizedName,

    displayName: itemName,

    enchant: enchantLevel,
    quality: qualityLevel,

    image: buildImageUrl(
      normalizedName,
      enchantLevel,
      qualityLevel
    ),
  };
}