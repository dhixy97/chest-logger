import { parseLog } from "@/lib/parser";
import { analyzeLogs } from "@/lib/matcher";

export async function POST(req) {
  try {
    const formData = await req.formData();

    const withdrawFiles = formData.getAll("withdraws");
    const depositFiles = formData.getAll("deposits");

    let withdraws = [];
    let deposits = [];

    for (const file of withdrawFiles) {
      withdraws.push(...parseLog(await file.text()));
    }

    for (const file of depositFiles) {
      deposits.push(...parseLog(await file.text()));
    }

    const result = analyzeLogs({ withdraws, deposits });

    return Response.json({
      players: result.players || {},
    });
  } catch (e) {
    return Response.json({ players: {}, error: e.message });
  }
}