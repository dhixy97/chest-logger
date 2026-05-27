export function parseLog(text) {
  return text
    .split("\n")
    .filter(Boolean)
    .slice(1)
    .map((line) => {
      const clean = line.replaceAll('"', "");
      const parts = clean.split("\t");

      if (parts.length < 6) return null;

      const [date, player, item, enchantment, quality, amount] = parts;

      return {
        date,
        player,
        item,
        enchantment,
        quality,
        amount: Number(amount),
      };
    })
    .filter(Boolean);
}