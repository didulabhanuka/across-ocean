import { NextResponse } from "next/server";

export const revalidate = 60 * 60 * 24; // 1 day cache

export async function GET() {
  const url =
    "https://cdn.jsdelivr.net/gh/johan/world.geo.json@master/countries.geo.json";

  const res = await fetch(url, { next: { revalidate } });
  if (!res.ok) {
    return NextResponse.json(
      { error: "Failed to fetch countries" },
      { status: 502 }
    );
  }

  const data = await res.json();
  return NextResponse.json(data, {
    headers: {
      "Cache-Control": "public, s-maxage=86400, stale-while-revalidate=604800",
    },
  });
}
