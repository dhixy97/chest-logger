"use client";

import { useMemo, useState } from "react";
import {
  ChevronDown,
  ChevronRight,
  Search,
  Upload,
  AlertTriangle,
  Package,
} from "lucide-react";

export default function Page() {
  const [withdrawFiles, setWithdrawFiles] = useState([]);
  const [depositFiles, setDepositFiles] = useState([]);
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);

  const [openPlayers, setOpenPlayers] = useState({});
  const [search, setSearch] = useState("");

  function togglePlayer(name) {
    setOpenPlayers((prev) => ({
      ...prev,
      [name]: !prev[name],
    }));
  }

  async function upload() {
    setLoading(true);

    const form = new FormData();

    withdrawFiles.forEach((f) =>
      form.append("withdraws", f)
    );

    depositFiles.forEach((f) =>
      form.append("deposits", f)
    );

    try {
      const res = await fetch("/api/analyze", {
        method: "POST",
        body: form,
      });

      const json = await res.json();

      setResult(json || { players: {} });
    } catch (err) {
      console.error(err);
      setResult({ players: {} });
    }

    setLoading(false);
  }

  const players = result?.players || {};

  const filtered = useMemo(() => {
    return Object.entries(players).filter(([name]) =>
      name.toLowerCase().includes(search.toLowerCase())
    );
  }, [players, search]);

  // GLOBAL STATS
  const stats = useMemo(() => {
    let withdraw = 0;
    let deposit = 0;
    let pending = 0;
    let items = 0;

    Object.values(players).forEach((p) => {
      withdraw += p?.totalWithdraw || 0;

      (p?.items || []).forEach((i) => {
        const dep = (i?.deposit || []).reduce(
          (a, b) => a + (b.amount || 0),
          0
        );

        deposit += dep;
        items += 1;

        if (i.status !== "OK") {
          pending +=
            (i?.withdraw?.amount || 0) - dep;
        }
      });
    });

    return {
      withdraw,
      deposit,
      pending,
      items,
    };
  }, [players]);

  return (
    <div className="min-h-screen bg-[#050816] text-white">

      {/* BACKGROUND */}
      <div className="fixed inset-0 opacity-30 pointer-events-none">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(37,99,235,0.15),transparent_50%)]" />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto p-6">

        {/* HEADER */}
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-5 mb-8">

          <div>
            <p className="text-green-400 text-sm font-semibold tracking-[0.3em] uppercase">
              Albion Online
            </p>

            <h1 className="text-4xl font-black mt-2">
              Guild Bank Tracker Rabbit Riders Community
            </h1>

            <p className="text-gray-400 mt-2">
              Track guild bank withdraw and deposit transfers.
            </p>
          </div>

          {/* UPLOAD BUTTONS */}
          <div className="flex flex-col sm:flex-row gap-3">

            <label className="cursor-pointer">
              <input
                type="file"
                multiple
                hidden
                onChange={(e) =>
                  setWithdrawFiles(
                    Array.from(e.target.files || [])
                  )
                }
              />

              <div className="h-14 px-6 rounded-2xl bg-green-600 hover:bg-green-500 transition flex items-center gap-3 font-semibold shadow-lg shadow-green-900/40">
                <Upload size={18} />
                Upload Withdraw Logs
              </div>
            </label>

            <label className="cursor-pointer">
              <input
                type="file"
                multiple
                hidden
                onChange={(e) =>
                  setDepositFiles(
                    Array.from(e.target.files || [])
                  )
                }
              />

              <div className="h-14 px-6 rounded-2xl bg-blue-600 hover:bg-blue-500 transition flex items-center gap-3 font-semibold shadow-lg shadow-blue-900/40">
                <Upload size={18} />
                Upload Deposit Logs
              </div>
            </label>

          </div>

        </div>

        {/* ACTION BAR */}
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_auto] gap-4 mb-6">

          <div className="flex flex-col lg:flex-row gap-4">

            {/* SEARCH */}
            <div className="relative flex-1">

              <Search
                className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500"
                size={18}
              />

              <input
                placeholder="Search player or item..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="
                  w-full
                  h-14
                  pl-12
                  pr-4
                  rounded-2xl
                  bg-white/[0.04]
                  border border-white/10
                  outline-none
                  focus:border-blue-500
                  transition
                "
              />

            </div>

            {/* BUTTON */}
            <button
              onClick={upload}
              disabled={loading}
              className="
                h-14
                px-8
                rounded-2xl
                bg-indigo-600
                hover:bg-indigo-500
                disabled:opacity-50
                transition
                font-semibold
              "
            >
              {loading ? "Analyzing..." : "Run Analysis"}
            </button>

          </div>

        </div>

        {/* STATS */}
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4 mb-7">

          <StatCard
            title="Withdraw Logs"
            value={stats.withdraw}
            color="green"
          />

          <StatCard
            title="Deposit Logs"
            value={stats.deposit}
            color="blue"
          />

          <StatCard
            title="Tracked Items"
            value={stats.items}
            color="purple"
          />

          <StatCard
            title="Missing Items"
            value={stats.pending}
            color="red"
          />

        </div>

        {/* PLAYERS */}
        <div className="space-y-4">

          {filtered.map(([player, p]) => {
            const open = openPlayers[player] || false;

            const pending =
              p?.items?.reduce((acc, item) => {
                const dep = (item?.deposit || []).reduce(
                  (a, b) => a + (b.amount || 0),
                  0
                );

                return (
                  acc +
                  ((item?.withdraw?.amount || 0) - dep)
                );
              }, 0) || 0;

            const totalDeposit =
              p?.items?.reduce((acc, item) => {
                return (
                  acc +
                  (item?.deposit || []).reduce(
                    (a, b) => a + (b.amount || 0),
                    0
                  )
                );
              }, 0) || 0;

            return (
              <div
                key={player}
                className="
                  rounded-3xl
                  border border-white/10
                  bg-white/[0.03]
                  overflow-hidden
                  backdrop-blur-xl
                "
              >

                {/* HEADER */}
                <div
                  onClick={() => togglePlayer(player)}
                  className="
                    cursor-pointer
                    px-6
                    py-5
                    hover:bg-white/[0.03]
                    transition
                  "
                >

                  <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-5">

                    <div className="flex items-center gap-4">

                      <button
                        className="
                          w-8 h-8
                          rounded-full
                          bg-white/5
                          flex items-center justify-center
                        "
                      >
                        {open ? (
                          <ChevronDown size={18} />
                        ) : (
                          <ChevronRight size={18} />
                        )}
                      </button>

                      <div
                        className="
                          w-14 h-14
                          rounded-full
                          bg-gradient-to-br
                          from-green-500
                          to-emerald-700
                          flex items-center justify-center
                          font-bold text-lg
                        "
                      >
                        ⚔️
                      </div>

                      <div>
                        <h2 className="text-2xl font-bold">
                          {player}
                        </h2>

                        <p className="text-gray-400 text-sm">
                          Guild Member
                        </p>
                      </div>

                    </div>

                    {/* STATS */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-6">

                      <MiniStat
                        label="Withdraw"
                        value={p?.totalWithdraw || 0}
                        color="text-red-400"
                      />

                      <MiniStat
                        label="Deposit"
                        value={totalDeposit}
                        color="text-emerald-400"
                      />

                      <MiniStat
                        label="Pending"
                        value={pending}
                        color={
                          pending > 0
                            ? "text-red-400"
                            : "text-emerald-400"
                        }
                      />

                      <MiniStat
                        label="Items"
                        value={p?.items?.length || 0}
                        color="text-white"
                      />

                    </div>

                  </div>

                </div>

                {/* TABLE */}
                {open && (
                  <div className="px-4 pb-4 overflow-x-auto">

                    <table className="w-full border-separate border-spacing-y-2">

                      <thead>
                        <tr className="text-gray-400 text-sm">
                          <th className="text-left px-4">
                            Item
                          </th>

                          <th className="text-center">
                            Withdraw
                          </th>

                          <th className="text-center">
                            Deposit
                          </th>

                          <th className="text-center">
                            Pending
                          </th>

                          <th className="text-center">
                            Status
                          </th>
                        </tr>
                      </thead>

                      <tbody>

                        {(p?.items || []).map(
                          (item, i) => {
                            const deposit =
                              (item?.deposit || []).reduce(
                                (a, b) =>
                                  a + (b.amount || 0),
                                0
                              );

                            const pending =
                              (item?.withdraw?.amount || 0) -
                              deposit;

                            const isOk =
                              item.status === "OK";

                            return (
                              <tr
                                key={i}
                                className="
                                  bg-white/[0.03]
                                  border border-white/5
                                "
                              >

                                {/* ITEM */}
                                <td className="rounded-l-2xl px-4 py-3">

                                  <div className="flex items-center gap-3">

                                    <img
                                      src={
                                        item?.resolved?.image
                                      }
                                      className="w-12 h-12 rounded-lg bg-black/30"
                                      onError={(e) => {
                                        e.currentTarget.src =
                                          "https://render.albiononline.com/v1/item/UNKNOWN.png";
                                      }}
                                    />

                                    <div>
                                      <p className="font-semibold">
                                        {item?.item}
                                      </p>

                                      <p className="text-xs text-gray-400">
                                        {
                                          item?.withdraw
                                            ?.date
                                        }
                                      </p>
                                    </div>

                                  </div>

                                </td>

                                {/* WITHDRAW */}
                                <td className="text-center font-semibold text-red-400">
                                  {item?.withdraw?.amount ||
                                    0}
                                </td>

                                {/* DEPOSIT */}
                                <td className="text-center font-semibold text-emerald-400">
                                  {deposit}
                                </td>

                                {/* PENDING */}
                                <td
                                  className={`
                                    text-center font-bold
                                    ${
                                      pending > 0
                                        ? "text-red-400"
                                        : "text-emerald-400"
                                    }
                                  `}
                                >
                                  {pending}
                                </td>

                                {/* STATUS */}
                                <td className="rounded-r-2xl text-center">

                                  <span
                                    className={`
                                      inline-flex
                                      px-4
                                      py-1.5
                                      rounded-full
                                      text-xs
                                      font-bold
                                      border
                                      ${
                                        isOk
                                          ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
                                          : "bg-red-500/10 text-red-400 border-red-500/20"
                                      }
                                    `}
                                  >
                                    {isOk
                                      ? "COMPLETED"
                                      : "PENDING"}
                                  </span>

                                </td>

                              </tr>
                            );
                          }
                        )}

                      </tbody>

                    </table>

                  </div>
                )}

              </div>
            );
          })}

        </div>

      </div>

    </div>
  );
}

/* COMPONENTS */

function StatCard({
  title,
  value,
  color,
}) {
  const styles = {
    green:
      "from-green-500/20 to-green-700/10 border-green-500/20",
    blue:
      "from-blue-500/20 to-blue-700/10 border-blue-500/20",
    purple:
      "from-purple-500/20 to-purple-700/10 border-purple-500/20",
    red:
      "from-red-500/20 to-red-700/10 border-red-500/20",
  };

  return (
    <div
      className={`
        rounded-3xl
        border
        bg-gradient-to-br
        ${styles[color]}
        p-5
      `}
    >
      <div className="flex items-center justify-between">

        <div>
          <p className="text-gray-400 text-sm">
            {title}
          </p>

          <h2 className="text-4xl font-black mt-1">
            {value}
          </h2>
        </div>

        <div
          className="
            w-14 h-14
            rounded-2xl
            bg-white/10
            flex items-center justify-center
          "
        >
          {color === "red" ? (
            <AlertTriangle />
          ) : (
            <Package />
          )}
        </div>

      </div>
    </div>
  );
}

function MiniStat({
  label,
  value,
  color,
}) {
  return (
    <div className="text-center">
      <p className="text-xs text-gray-500 mb-1">
        {label}
      </p>

      <p className={`text-2xl font-bold ${color}`}>
        {value}
      </p>
    </div>
  );
}