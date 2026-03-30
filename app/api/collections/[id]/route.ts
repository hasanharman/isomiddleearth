import { NextResponse } from "next/server";
import { getCollectionMapById } from "@/lib/collections";

export const runtime = "nodejs";

const CACHE_HEADERS = {
  "Cache-Control": "public, s-maxage=3600, stale-while-revalidate=86400",
};

export async function GET(
  _request: Request,
  context: { params: Promise<{ id: string }> },
) {
  const { id } = await context.params;
  const map = await getCollectionMapById(id);

  if (!map) {
    return NextResponse.json(
      { error: "Collection map not found." },
      { status: 404, headers: CACHE_HEADERS },
    );
  }

  return NextResponse.json(map, { headers: CACHE_HEADERS });
}
