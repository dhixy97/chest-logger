import { resolveItem } from "./itemResolver";

function key(d) {
  return `${d.item}|${d.enchantment}|${d.quality}`;
}

export function analyzeLogs({ withdraws, deposits }) {
  const depositMap = new Map();
  const players = {};

  function getPlayer(name) {
    if (!players[name]) {
      players[name] = {
        items: [],
        totalWithdraw: 0,
      };
    }
    return players[name];
  }

  // ======================
  // INDEX DEPOSITS
  // ======================
  for (const d of deposits) {
    const k = key(d);

    if (!depositMap.has(k)) depositMap.set(k, []);

    depositMap.get(k).push({
      amount: Math.abs(d.amount),
      date: d.date,
    });
  }

  // ======================
  // MATCH WITHDRAW
  // ======================
  for (const w of withdraws) {
    const p = getPlayer(w.player);
    p.totalWithdraw++;

    const k = key(w);
    const pool = depositMap.get(k) || [];

    let need = Math.abs(w.amount);

    const matchedDeposits = [];

    while (need > 0 && pool.length > 0) {
      const dep = pool[0];

      const used = Math.min(dep.amount, need);

      matchedDeposits.push({
        amount: used,
        date: dep.date,
      });

      dep.amount -= used;
      need -= used;

      if (dep.amount <= 0) pool.shift();
    }

    p.items.push({
      item: w.item,
      enchantment: w.enchantment,
      quality: w.quality,

      withdraw: {
        amount: Math.abs(w.amount),
        date: w.date,
      },

      deposit: matchedDeposits,

      status: need === 0 ? "OK" : "MISSING",

      resolved: resolveItem(w.item),
    });
  }

  return { players };
}