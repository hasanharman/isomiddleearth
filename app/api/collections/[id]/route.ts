import { NextResponse } from "next/server";
import { getCollectionMapById } from "@/lib/collections";

export async function GET(
  _request: Request,
  context: { params: Promise<{ id: string }> },
) {
  const { id } = await context.params;
  const map = await getCollectionMapById(id);

  if (!map) {
    return NextResponse.json({ error: "Collection map not found." }, { status: 404 });
  }

  return NextResponse.json(map);
}
