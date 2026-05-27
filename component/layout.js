"use client";

import Image from "next/image";
import { useMemo, useState } from "react";

import {
  ChevronDown,
  ChevronRight,
  Upload,
  Search,
} from "lucide-react";

import { parseAlbionLog } from "@/lib/parser";
import { buildTracking } from "@/lib/tracker";

export default function Page() {

  /**
   * STATE
   */

  const [logs, setLogs] =
    useState([]);

  const [search, setSearch] =
    useState("");

  const [pendingOnly, setPendingOnly] =
    useState(false);

  const [expandedItems, setExpandedItems] =
    useState({});

  /**
   * UPLOAD
   */

  async function handleUpload(e) {

    const files =
      Array.from(
        e.target.files || []
      );

    let allLogs = [];

    for (const file of files) {

      const text =
        await file.text();

      const parsed =
        parseAlbionLog(
          text,
          file.name
        );

      allLogs = [
        ...allLogs,
        ...parsed,
      ];
    }

    setLogs(allLogs);
  }

  /**
   * TRACKING
   */

  const trackedItems =
    useMemo(() => {

      let items =
        buildTracking(logs);

      /**
       * SEARCH
       */

      if (search) {

        items = items.filter(
          (item) =>
            item.item
              .toLowerCase()
              .includes(
                search.toLowerCase()
              )
        );
      }

      /**
       * PENDING ONLY
       */

      if (pendingOnly) {

        items = items.filter(
          (item) =>
            item.pending > 0
        );
      }

      return items;

    }, [
      logs,
      search,
      pendingOnly,
    ]);

  /**
   * SUMMARY
   */

  const totalWithdraw =
    trackedItems.reduce(
      (acc, item) =>
        acc +
        item.totalWithdraw,
      0
    );

  const totalDeposit =
    trackedItems.reduce(
      (acc, item) =>
        acc +
        item.totalDeposit,
      0
    );

  const totalPending =
    trackedItems.reduce(
      (acc, item) =>
        acc +
        item.pending,
      0
    );

  return (
    <main className="min-h-screen bg-[#070b14] text-white">

      <div className="max-w-[1800px] mx-auto p-6">

        {/* HEADER */}

        <div className="
          flex
          flex-col
          xl:flex-row
          xl:items-center
          xl:justify-between
          gap-6
        ">

          <div>

            <p className="
              text-green-400
              text-sm
              font-black
              tracking-[0.3em]
              uppercase
            ">
              Albion Online
            </p>

            <h1 className="
              text-6xl
              font-black
              mt-3
            ">
              Guild Bank Tracker
            </h1>

            <p className="
              text-zinc-400
              mt-4
              text-lg
              max-w-3xl
            ">
              Track withdraw and deposit
              item transfers from Albion logs.
            </p>

          </div>

          {/* UPLOAD */}

          <label className="
            cursor-pointer
            h-16
            px-8
            rounded-2xl
            bg-green-600
            hover:bg-green-500
            transition
            flex
            items-center
            gap-3
            font-black
            text-lg
          ">

            <Upload size={22} />

            Upload Logs

            <input
              type="file"
              multiple
              accept=".txt"
              className="hidden"
              onChange={
                handleUpload
              }
            />

          </label>

        </div>

        {/* FILTER */}

        <div className="
          flex
          flex-col
          xl:flex-row
          gap-4
          mt-8
        ">

          {/* SEARCH */}

          <div className="
            relative
            flex-1
          ">

            <Search
              size={20}
              className="
                absolute
                left-5
                top-1/2
                -translate-y-1/2
                text-zinc-500
              "
            />

            <input
              type="text"
              value={search}
              onChange={(e) =>
                setSearch(
                  e.target.value
                )
              }
              placeholder="Search item..."
              className="
                w-full
                h-16
                rounded-2xl
                bg-zinc-900
                border
                border-zinc-800
                pl-14
                pr-6
                outline-none
              "
            />

          </div>

          {/* FILTER */}

          <button
            onClick={() =>
              setPendingOnly(
                !pendingOnly
              )
            }
            className={`
              h-16
              px-8
              rounded-2xl
              font-bold
              transition

              ${
                pendingOnly
                  ? `
                    bg-red-500
                    text-white
                  `
                  : `
                    bg-zinc-900
                    border
                    border-zinc-800
                  `
              }
            `}
          >

            Pending Only

          </button>

        </div>

        {/* SUMMARY */}

        <div className="
          grid
          grid-cols-1
          md:grid-cols-4
          gap-4
          mt-8
        ">

          <SummaryCard
            title="Total Withdraw"
            value={totalWithdraw}
            color="text-red-400"
          />

          <SummaryCard
            title="Total Deposit"
            value={totalDeposit}
            color="text-green-400"
          />

          <SummaryCard
            title="Tracked Items"
            value={
              trackedItems.length
            }
            color="text-blue-400"
          />

          <SummaryCard
            title="Missing Items"
            value={totalPending}
            color="text-yellow-400"
          />

        </div>

        {/* ITEMS */}

        <div className="
          space-y-5
          mt-10
        ">

          {trackedItems.map(
            (item) => {

              const expanded =
                expandedItems[
                  item.key
                ];

              const completed =
                item.pending <= 0;

              return (

                <div
                  key={item.key}
                  className={`
                    rounded-3xl
                    overflow-hidden
                    border

                    ${
                      completed
                        ? `
                          border-green-500/30
                          bg-green-500/5
                        `
                        : `
                          border-red-500/30
                          bg-red-500/5
                        `
                    }
                  `}
                >

                  {/* HEADER */}

                  <button
                    onClick={() =>
                      setExpandedItems(
                        (prev) => ({
                          ...prev,
                          [item.key]:
                            !prev[
                              item.key
                            ],
                        })
                      )
                    }
                    className="
                      w-full
                      p-6
                      flex
                      items-center
                      justify-between
                      hover:bg-white/5
                      transition
                    "
                  >

                    <div className="
                      flex
                      items-center
                      gap-5
                    ">

                      <Image
                        src={item.image}
                        alt={item.item}
                        width={120}
                        height={120}
                        unoptimized
                        className={`
                          w-24
                          h-24
                          object-contain

                          ${
                            completed
                              ? `
                                drop-shadow-[0_0_15px_rgba(34,197,94,0.6)]
                              `
                              : ""
                          }
                        `}
                      />

                      <div className="
                        text-left
                      ">

                        <h2 className="
                          text-2xl
                          font-black
                        ">
                          {item.item}
                        </h2>

                        <p className="
                          text-zinc-400
                          mt-2
                        ">
                          Enchant .{item.enchant}
                        </p>

                      </div>

                    </div>

                    {/* STATS */}

                    <div className="
                      hidden
                      xl:flex
                      items-center
                      gap-16
                    ">

                      <MiniStat
                        label="Withdraw"
                        value={
                          item.totalWithdraw
                        }
                        color="text-red-400"
                      />

                      <MiniStat
                        label="Deposit"
                        value={
                          item.totalDeposit
                        }
                        color="text-green-400"
                      />

                      <MiniStat
                        label="Pending"
                        value={
                          item.pending
                        }
                        color={
                          item.pending > 0
                            ? "text-red-400"
                            : "text-green-400"
                        }
                      />

                    </div>

                    {/* EXPAND */}

                    <div>

                      {expanded ? (
                        <ChevronDown />
                      ) : (
                        <ChevronRight />
                      )}

                    </div>

                  </button>

                  {/* CONTENT */}

                  {expanded && (

                    <div className="
                      border-t
                      border-white/10
                      p-6
                    ">

                      <div className="
                        grid
                        grid-cols-1
                        2xl:grid-cols-3
                        gap-6
                      ">

                        {/* UNMATCHED */}

                        <div className="
                          rounded-3xl
                          bg-black/20
                          border
                          border-white/10
                          p-5
                        ">

                          <h3 className="
                            text-red-400
                            font-black
                            uppercase
                            text-sm
                          ">
                            Missing Items
                          </h3>

                          <div className="
                            space-y-3
                            mt-5
                            max-h-[500px]
                            overflow-auto
                            pr-2
                          ">

                            {item.unmatched.map(
                              (
                                entry,
                                index
                              ) => (

                                <div
                                  key={index}
                                  className="
                                    rounded-2xl
                                    bg-red-500/10
                                    border
                                    border-red-500/20
                                    p-4
                                  "
                                >

                                  <div className="
                                    flex
                                    justify-between
                                  ">

                                    <span className="
                                      font-bold
                                    ">
                                      {
                                        entry.player
                                      }
                                    </span>

                                    <span className="
                                      text-red-400
                                      font-black
                                    ">
                                      x
                                      {
                                        entry.remaining
                                      }
                                    </span>

                                  </div>

                                  <p className="
                                    text-zinc-500
                                    text-sm
                                    mt-2
                                  ">

                                    {
                                      entry.rawDate
                                    }

                                  </p>

                                </div>
                              )
                            )}

                          </div>

                        </div>

                        {/* MATCHES */}

                        <div className="
                          rounded-3xl
                          bg-black/20
                          border
                          border-white/10
                          p-5
                        ">

                          <h3 className="
                            text-green-400
                            font-black
                            uppercase
                            text-sm
                          ">
                            Transfer Match
                          </h3>

                          <div className="
                            space-y-3
                            mt-5
                            max-h-[500px]
                            overflow-auto
                            pr-2
                          ">

                            {item.matches.map(
                              (
                                match,
                                index
                              ) => (

                                <div
                                  key={index}
                                  className="
                                    rounded-2xl
                                    bg-green-500/10
                                    border
                                    border-green-500/20
                                    p-4
                                  "
                                >

                                  <div className="
                                    flex
                                    items-center
                                    justify-between
                                    gap-4
                                  ">

                                    <div>

                                      <p className="
                                        font-bold
                                        text-red-400
                                      ">
                                        {
                                          match.withdrawPlayer
                                        }
                                      </p>

                                      <p className="
                                        text-zinc-500
                                        text-sm
                                        mt-1
                                      ">
                                        {
                                          match.withdrawDate
                                        }
                                      </p>

                                    </div>

                                    <div className="
                                      text-center
                                    ">

                                      <p className="
                                        text-xl
                                        font-black
                                        text-green-400
                                      ">
                                        x
                                        {
                                          match.amount
                                        }
                                      </p>

                                    </div>

                                    <div className="
                                      text-right
                                    ">

                                      <p className="
                                        font-bold
                                        text-green-400
                                      ">
                                        {
                                          match.depositPlayer
                                        }
                                      </p>

                                      <p className="
                                        text-zinc-500
                                        text-sm
                                        mt-1
                                      ">
                                        {
                                          match.depositDate
                                        }
                                      </p>

                                    </div>

                                  </div>

                                </div>
                              )
                            )}

                          </div>

                        </div>

                        {/* PLAYER */}

                        <div className="
                          rounded-3xl
                          bg-black/20
                          border
                          border-white/10
                          p-5
                        ">

                          <h3 className="
                            text-blue-400
                            font-black
                            uppercase
                            text-sm
                          ">
                            Player Activity
                          </h3>

                          <div className="
                            space-y-3
                            mt-5
                            max-h-[500px]
                            overflow-auto
                            pr-2
                          ">

                            {item.players.map(
                              (
                                player
                              ) => (

                                <div
                                  key={
                                    player.player
                                  }
                                  className="
                                    rounded-2xl
                                    bg-white/5
                                    border
                                    border-white/10
                                    p-4
                                  "
                                >

                                  <div className="
                                    flex
                                    items-center
                                    justify-between
                                  ">

                                    <div>

                                      <p className="
                                        text-lg
                                        font-black
                                      ">
                                        {
                                          player.player
                                        }
                                      </p>

                                    </div>

                                    <div className="
                                      text-right
                                    ">

                                      <p className="
                                        text-red-400
                                        font-black
                                      ">
                                        W:
                                        {" "}
                                        {
                                          player.withdraw
                                        }
                                      </p>

                                      <p className="
                                        text-green-400
                                        font-black
                                        mt-1
                                      ">
                                        D:
                                        {" "}
                                        {
                                          player.deposit
                                        }
                                      </p>

                                    </div>

                                  </div>

                                </div>
                              )
                            )}

                          </div>

                        </div>

                      </div>

                    </div>
                  )}

                </div>
              );
            }
          )}

        </div>

      </div>

    </main>
  );
}

/**
 * SUMMARY CARD
 */

function SummaryCard({
  title,
  value,
  color,
}) {

  return (

    <div className="
      rounded-3xl
      border
      border-zinc-800
      bg-zinc-900/70
      p-6
    ">

      <p className="
        text-zinc-500
      ">
        {title}
      </p>

      <h2 className={`
        text-5xl
        font-black
        mt-4
        ${color}
      `}>
        {value}
      </h2>

    </div>
  );
}

/**
 * MINI STAT
 */

function MiniStat({
  label,
  value,
  color,
}) {

  return (

    <div className="
      text-center
    ">

      <p className="
        text-zinc-500
        text-sm
      ">
        {label}
      </p>

      <h3 className={`
        text-3xl
        font-black
        mt-2
        ${color}
      `}>
        {value}
      </h3>

    </div>
  );
}