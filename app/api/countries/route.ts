import { NextResponse } from "next/server";

export async function GET() {
  const url =
    "https://cdn.jsdelivr.net/gh/johan/world.geo.json@master/countries.geo.json";

  const res = await fetch(url, {
    next: { revalidate: 60 * 60 * 24 },
  });

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
