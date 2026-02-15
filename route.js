// ═══════════════════════════════════════════════════════
// API Route: /api/notion
// Fetches all ALLANIMA data from Notion with caching
// Revalidates every 60 seconds (ISR)
// ═══════════════════════════════════════════════════════

import { NextResponse } from "next/server";

const { fetchAllData } = require("@/lib/notion");

// Cache the response for 60 seconds
export const revalidate = 60;

export async function GET() {
  try {
    const data = await fetchAllData();

    return NextResponse.json(data, {
      headers: {
        "Cache-Control": "public, s-maxage=60, stale-while-revalidate=300",
      },
    });
  } catch (error) {
    console.error("API Error:", error);
    return NextResponse.json(
      { error: error.message, beings: [], layers: [], eras: [] },
      { status: 500 }
    );
  }
}
