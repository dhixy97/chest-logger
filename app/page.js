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

      (p?.items || []).forEach((i) => {
        const withdrawAmount =
          i?.withdraw?.amount || 0;

        const dep = (i?.deposit || []).reduce(
          (a, b) => a + (b.amount || 0),
          0
        );

        withdraw += withdrawAmount;
        deposit += dep;
        items += 1;

        if (i.status !== "OK") {
          pending += withdrawAmount - dep;
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
    <div className="min-h-screen bg-[#050816] text-white overflow-hidden">

      {/* BACKGROUND */}
      <div className="fixed inset-0 opacity-30 pointer-events-none">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(37,99,235,0.15),transparent_50%)]" />

        <div className="absolute top-0 left-0 w-[500px] h-[500px] bg-green-500/10 blur-3xl rounded-full" />

        <div className="absolute bottom-0 right-0 w-[500px] h-[500px] bg-blue-500/10 blur-3xl rounded-full" />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto p-6">

        {/* HEADER */}
        <div className="flex flex-col xl:flex-row xl:items-center xl:justify-between gap-6 mb-10">

          <div>
            <p className="text-green-400 text-sm font-semibold tracking-[0.35em] uppercase">
              Albion Online
            </p>

            <h1 className="text-4xl md:text-5xl font-black mt-3 leading-tight">
              Guild Bank Tracker
            </h1>

            <p className="text-gray-400 mt-3 text-lg">
              Rabbit Riders Community chest tracking system.
            </p>
          </div>

          {/* UPLOAD BUTTONS */}
          <div className="flex flex-col sm:flex-row gap-4">

            {/* WITHDRAW */}
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

              <div
                className="
                  min-w-[280px]
                  h-16
                  px-6
                  rounded-3xl
                  bg-gradient-to-br
                  from-green-500
                  to-emerald-700
                  hover:scale-[1.02]
                  transition
                  flex
                  items-center
                  justify-between
                  gap-4
                  font-semibold
                  shadow-2xl
                  shadow-green-900/40
                "
              >

                <div className="flex items-center gap-3">

                  <div
                    className="
                      w-10 h-10
                      rounded-2xl
                      bg-white/10
                      flex items-center justify-center
                    "
                  >
                    <Upload size={18} />
                  </div>

                  <div>
                    <p className="font-bold">
                      Withdraw Logs
                    </p>

                    <p className="text-xs text-white/70">
                      Upload Withdraw Logs files
                    </p>
                  </div>

                </div>

                <span
                  className="
                    text-xs
                    px-3
                    py-1.5
                    rounded-full
                    bg-black/20
                    border border-white/10
                    font-bold
                  "
                >
                  {withdrawFiles.length} files
                </span>

              </div>
            </label>

            {/* DEPOSIT */}
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

              <div
                className="
                  min-w-[280px]
                  h-16
                  px-6
                  rounded-3xl
                  bg-gradient-to-br
                  from-blue-500
                  to-indigo-700
                  hover:scale-[1.02]
                  transition
                  flex
                  items-center
                  justify-between
                  gap-4
                  font-semibold
                  shadow-2xl
                  shadow-blue-900/40
                "
              >

                <div className="flex items-center gap-3">

                  <div
                    className="
                      w-10 h-10
                      rounded-2xl
                      bg-white/10
                      flex items-center justify-center
                    "
                  >
                    <Upload size={18} />
                  </div>

                  <div>
                    <p className="font-bold">
                      Deposit Logs
                    </p>

                    <p className="text-xs text-white/70">
                      Upload Deposit Logs files
                    </p>
                  </div>

                </div>

                <span
                  className="
                    text-xs
                    px-3
                    py-1.5
                    rounded-full
                    bg-black/20
                    border border-white/10
                    font-bold
                  "
                >
                  {depositFiles.length} files
                </span>

              </div>
            </label>

          </div>

        </div>

        {/* ACTION BAR */}
        <div className="grid grid-cols-1 xl:grid-cols-[1fr_auto] gap-4 mb-8">

          <div className="flex flex-col lg:flex-row gap-4">

            {/* SEARCH */}
            <div className="relative flex-1">

              <Search
                className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500"
                size={18}
              />

              <input
                placeholder="Search player..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="
                  w-full
                  h-16
                  pl-12
                  pr-4
                  rounded-3xl
                  bg-white/[0.04]
                  border border-white/10
                  outline-none
                  focus:border-blue-500
                  transition
                  backdrop-blur-xl
                "
              />

            </div>

            {/* BUTTON */}
            <button
              onClick={upload}
              disabled={
                loading ||
                withdrawFiles.length === 0 ||
                depositFiles.length === 0
              }
              className="
                h-16
                px-10
                rounded-3xl
                bg-gradient-to-r
                from-indigo-600
                to-blue-600
                hover:scale-[1.02]
                disabled:opacity-40
                disabled:hover:scale-100
                transition
                font-bold
                shadow-2xl
                shadow-blue-900/30
              "
            >
              {loading
                ? "Analyzing..."
                : "Run Analysis"}
            </button>

          </div>

        </div>

        {/* STATS */}
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-5 mb-8">

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
        <div className="space-y-5">

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

            const totalWithdraw =
              (p?.items || []).reduce(
                (acc, item) =>
                  acc + (item?.withdraw?.amount || 0),
                0
              );

            return (
              <div
                key={player}
                className="
                  rounded-[30px]
                  border border-white/10
                  bg-white/[0.03]
                  overflow-hidden
                  backdrop-blur-xl
                  shadow-2xl
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

                  <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-6">

                    <div className="flex items-center gap-4">

                      <button
                        className="
                          w-10 h-10
                          rounded-2xl
                          bg-white/5
                          flex items-center justify-center
                        "
                      >
                        {open ? (
                          <ChevronDown size={20} />
                        ) : (
                          <ChevronRight size={20} />
                        )}
                      </button>

                      <div
                        className="
                          w-16 h-16
                          rounded-full
                          bg-gradient-to-br
                          from-green-500
                          to-emerald-700
                          flex items-center justify-center
                          text-2xl
                          shadow-lg
                        "
                      >
                        ⚔️
                      </div>

                      <div>
                        <h2 className="text-2xl font-black">
                          {player}
                        </h2>

                        <p className="text-gray-400 text-sm">
                          Guild Member
                        </p>
                      </div>

                    </div>

                    {/* MINI STATS */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-6">

                      <MiniStat
                        label="Withdraw"
                        value={totalWithdraw}
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

                    <table className="w-full border-separate border-spacing-y-3">

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

                                <td className="rounded-l-3xl px-4 py-4">

                                  <div className="flex items-center gap-4">

                                    <img
                                      src={
                                        item?.resolved?.image
                                      }
                                      className="w-14 h-14 rounded-2xl bg-black/30 object-cover"
                                      onError={(e) => {
                                        e.currentTarget.src =
                                          "https://render.albiononline.com/v1/item/UNKNOWN.png";
                                      }}
                                    />

                                    <div>
                                      <p className="font-bold text-lg">
                                        {item?.item}
                                      </p>

                                      <p className="text-xs text-gray-400 mt-1">
                                        Withdraw Date:
                                      </p>

                                      <p className="text-sm text-gray-300">
                                        {
                                          item?.withdraw
                                            ?.date
                                        }
                                      </p>
                                    </div>

                                  </div>

                                </td>

                                <td className="text-center">

                                  <div className="inline-flex px-4 py-2 rounded-2xl bg-red-500/10 border border-red-500/20 text-red-400 font-black text-lg">
                                    -
                                    {item?.withdraw?.amount ||
                                      0}
                                  </div>

                                </td>

                                <td className="text-center">

                                  <div className="inline-flex px-4 py-2 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 font-black text-lg">
                                    +
                                    {deposit}
                                  </div>

                                </td>

                                <td className="text-center">

                                  <div
                                    className={`
                                      inline-flex
                                      px-4
                                      py-2
                                      rounded-2xl
                                      font-black
                                      text-lg
                                      border
                                      ${
                                        pending > 0
                                          ? "bg-red-500/10 border-red-500/20 text-red-400"
                                          : "bg-emerald-500/10 border-emerald-500/20 text-emerald-400"
                                      }
                                    `}
                                  >
                                    {pending}
                                  </div>

                                </td>

                                <td className="rounded-r-3xl text-center">

                                  <span
                                    className={`
                                      inline-flex
                                      px-5
                                      py-2
                                      rounded-full
                                      text-xs
                                      font-black
                                      tracking-wider
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
        p-6
        backdrop-blur-xl
      `}
    >

      <div className="flex items-center justify-between">

        <div>
          <p className="text-gray-400 text-sm">
            {title}
          </p>

          <h2 className="text-4xl font-black mt-2">
            {value}
          </h2>
        </div>

        <div
          className="
            w-16 h-16
            rounded-3xl
            bg-white/10
            flex items-center justify-center
          "
        >
          {color === "red" ? (
            <AlertTriangle size={28} />
          ) : (
            <Package size={28} />
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
      <p className="text-xs text-gray-500 mb-1 uppercase tracking-wider">
        {label}
      </p>

      <p className={`text-2xl font-black ${color}`}>
        {value}
      </p>
    </div>
  );
}