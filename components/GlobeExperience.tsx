"use client";

import dynamic from "next/dynamic";
import { useEffect, useMemo, useRef, useState } from "react";
import * as THREE from "three";

const Globe = dynamic(() => import("react-globe.gl"), { ssr: false });

type Point = { name: string; lat: number; lng: number };
type Props = {
  points: {
    sriLanka: Point;
    maldives: Point;
    paris: Point;
    bali: Point;
    japan: Point;
    ireland: Point;
    // France is handled as a country tap + highlight (Paris already represents France)
  };
};

function getCountryName(props: any) {
  return props?.name || props?.ADMIN || props?.NAME || props?.NAME_EN || "Unknown";
}

// Normalize country names (GeoJSON datasets differ)
function normalizeCountryName(name: string) {
  const n = (name || "").trim();
  const map: Record<string, string> = {
    "Republic of Ireland": "Ireland",
    "Irish Republic": "Ireland",
    "French Republic": "France",
  };
  return map[n] || n;
}

// Fast bbox center for polygon/multipolygon
function getGeomCenter(geom: any) {
  let minLng = 180,
    maxLng = -180,
    minLat = 90,
    maxLat = -90;

  const pushCoord = (c: any) => {
    const lng = c?.[0];
    const lat = c?.[1];
    if (typeof lng !== "number" || typeof lat !== "number") return;
    minLng = Math.min(minLng, lng);
    maxLng = Math.max(maxLng, lng);
    minLat = Math.min(minLat, lat);
    maxLat = Math.max(maxLat, lat);
  };

  const walk = (coords: any) => {
    if (!coords) return;
    if (typeof coords[0] === "number") pushCoord(coords);
    else coords.forEach(walk);
  };

  walk(geom?.coordinates);

  return {
    lng: (minLng + maxLng) / 2,
    lat: (minLat + maxLat) / 2,
  };
}

export default function GlobeExperience({ points }: Props) {
  const wrapRef = useRef<HTMLDivElement | null>(null);
  const globeRef = useRef<any>(null);
  const hideTimerRef = useRef<number | null>(null);

  const [size, setSize] = useState({ w: 0, h: 0 });
  const [countries, setCountries] = useState<any[]>([]);

  const [popup, setPopup] = useState<null | {
    id: string;
    lat: number;
    lng: number;
    title: string;
    lines: string[];
  }>(null);

  // Countries to "glow" (must match GeoJSON naming; normalize helps)
  const highlight = useMemo(
    () => new Set(["Sri Lanka", "Maldives", "France", "Ireland", "Japan"]),
    []
  );

// Country tap messages
const countryMsgs: Record<string, string[]> = useMemo(
  () => ({
    "Sri Lanka": [
      "We’ll walk the spice-scented roads together.",
      "And I’ll hold your hand like it’s the only thing that’s real.",
    ],
    "Maldives": [
      "Next time I land here…",
      "I’m pulling you into my arms and never letting the tide pull us apart.",
    ],
    "France": [
      "Under the midnight sky,",
      "I’ll whisper how much I love you in French.",
    ],
    "Ireland": [
      "We’ll share my jacket on a rainy street.",
      "And I’ll keep you warmer than any fireplace.",
    ],
    "Japan": [
      "Lost in the neon glow,",
      "I’ll hold you close enough to hear your heart sync with mine.",
    ],
    "Indonesia": [
      "As the sun melts into the sea,",
      "I’ll kiss you like the horizon is ours alone.",
    ],
  }),
  []
);

  const pins = useMemo(
    () => [
      {
        id: "sriLanka",
        name: points.sriLanka.name,
        lat: points.sriLanka.lat,
        lng: points.sriLanka.lng,
        lines: ["You’ll walk beside me.", "Like you belong there."],
      },
      {
        id: "maldives",
        name: points.maldives.name,
        lat: points.maldives.lat,
        lng: points.maldives.lng,
        lines: ["Next time I land here…", "I’m keeping you close."],
      },
      {
        id: "paris",
        name: points.paris.name, // Paris (France)
        lat: points.paris.lat,
        lng: points.paris.lng,
        lines: ["Midnight. Cold air.", "You holding my arm."],
      },
      {
        id: "bali",
        name: points.bali.name,
        lat: points.bali.lat,
        lng: points.bali.lng,
        lines: ["Sunset.", "Your head on my shoulder."],
      },
      {
        id: "ireland",
        name: points.ireland.name,
        lat: points.ireland.lat,
        lng: points.ireland.lng,
        lines: ["Rain on the window.", "You safe next to me."],
      },
      {
        id: "japan",
        name: points.japan.name,
        lat: points.japan.lat,
        lng: points.japan.lng,
        lines: ["Neon nights.", "You close. No distance."],
      },
    ],
    [points]
  );

  const arcs = useMemo(
    () => [
      // Sri Lanka → Maldives
      {
        startLat: points.sriLanka.lat,
        startLng: points.sriLanka.lng,
        endLat: points.maldives.lat,
        endLng: points.maldives.lng,
        color: ["rgba(255,255,255,0.55)", "rgba(255,0,90,0.85)"],
      },
      // Maldives → Paris (France)
      {
        startLat: points.maldives.lat,
        startLng: points.maldives.lng,
        endLat: points.paris.lat,
        endLng: points.paris.lng,
        color: ["rgba(255,0,90,0.75)", "rgba(255,255,255,0.45)"],
      },
      // Maldives → Bali
      {
        startLat: points.maldives.lat,
        startLng: points.maldives.lng,
        endLat: points.bali.lat,
        endLng: points.bali.lng,
        color: ["rgba(255,0,90,0.75)", "rgba(255,255,255,0.45)"],
      },
      // Maldives → Ireland
      {
        startLat: points.maldives.lat,
        startLng: points.maldives.lng,
        endLat: points.ireland.lat,
        endLng: points.ireland.lng,
        color: ["rgba(255,0,90,0.75)", "rgba(120,0,255,0.35)"],
      },
      // Maldives → Japan
      {
        startLat: points.maldives.lat,
        startLng: points.maldives.lng,
        endLat: points.japan.lat,
        endLng: points.japan.lng,
        color: ["rgba(255,0,90,0.75)", "rgba(120,0,255,0.35)"],
      },
    ],
    [points]
  );

  // measure container
  useEffect(() => {
    if (!wrapRef.current) return;
    const ro = new ResizeObserver(() => {
      const r = wrapRef.current!.getBoundingClientRect();
      setSize({ w: Math.floor(r.width), h: Math.floor(r.height) });
    });
    ro.observe(wrapRef.current);
    return () => ro.disconnect();
  }, []);

  // load countries from your API
  useEffect(() => {
    fetch("/api/countries")
      .then((r) => r.json())
      .then((geo) => setCountries(geo.features || []))
      .catch(() => setCountries([]));
  }, []);

  const globeMat = useMemo(() => {
  const mat = new THREE.MeshPhongMaterial();
  mat.color = new THREE.Color("#070a14");
  mat.emissive = new THREE.Color("#220011");
  mat.emissiveIntensity = 0.22;
  mat.shininess = 8;
  return mat;
}, []);

//   // style globe
//   useEffect(() => {
//     const g = globeRef.current;
//     if (!g) return;

//     const mat = g.globeMaterial() as THREE.MeshPhongMaterial;
//     mat.color = new THREE.Color("#070a14");
//     mat.emissive = new THREE.Color("#220011");
//     mat.emissiveIntensity = 0.22;
//     mat.shininess = 8;

//     g.controls().autoRotate = true;
//     g.controls().autoRotateSpeed = 0.35;
//     g.controls().enablePan = false;
//     g.pointOfView({ lat: 6.0, lng: 78.0, altitude: 1.8 }, 0);
//   }, [size.w, size.h]);

  const showPopup = (lat: number, lng: number, title: string, lines: string[]) => {
    setPopup({
      id: `${title}-${Date.now()}`,
      lat,
      lng,
      title,
      lines,
    });

    if (hideTimerRef.current) window.clearTimeout(hideTimerRef.current);
    hideTimerRef.current = window.setTimeout(() => setPopup(null), 4500);
  };

  return (
    <div ref={wrapRef} className="relative h-full w-full">
      {size.w > 0 && size.h > 0 && (
        <Globe
          ref={globeRef}
          width={size.w}
          height={size.h}
          backgroundColor="rgba(0,0,0,0)"
  globeMaterial={globeMat} 
          showAtmosphere
          atmosphereColor="rgba(255,0,90,0.35)"
          atmosphereAltitude={0.18}

          // Countries layer
          polygonsData={countries}
          polygonAltitude={(d: any) => {
            const name = normalizeCountryName(getCountryName(d.properties));
            return highlight.has(name) ? 0.06 : 0.015;
          }}
          polygonCapColor={(d: any) => {
            const name = normalizeCountryName(getCountryName(d.properties));
            return highlight.has(name)
              ? "rgba(255,0,90,0.30)"
              : "rgba(255,255,255,0.06)";
          }}
          polygonSideColor={() => "rgba(0,0,0,0.20)"}
          polygonStrokeColor={() => "rgba(255,255,255,0.14)"}
          polygonsTransitionDuration={280}

          onPolygonClick={(poly: any) => {
            const raw = getCountryName(poly?.properties);
            const name = normalizeCountryName(raw);

            const center = getGeomCenter(poly?.geometry);
            const lines = countryMsgs[name] ?? [`Selected: ${name}`, "Tap another place."];

            showPopup(center.lat, center.lng, name, lines);
          }}

          polygonLabel={(poly: any) => {
            const name = normalizeCountryName(getCountryName(poly?.properties));
            return `<div style="font-family: ui-sans-serif, system-ui; padding:8px 10px; color: rgba(255,255,255,0.92);">
              <div style="font-size:12px; opacity:0.7;">Country</div>
              <div style="font-size:14px;">${name}</div>
            </div>`;
          }}

          // Arcs
          arcsData={arcs}
          arcColor={"color"}
          arcStroke={0.9}
          arcAltitude={0.25}
          arcDashLength={0.45}
          arcDashGap={2.0}
          arcDashAnimateTime={4200}

          // Pins
          pointsData={pins}
          pointLat={"lat"}
          pointLng={"lng"}
          pointAltitude={0.03}
          pointRadius={(p: any) => (p.id === "maldives" ? 0.9 : 0.65)}
          pointColor={(p: any) =>
            p.id === "maldives" ? "rgba(255,0,90,0.95)" : "rgba(255,255,255,0.85)"
          }
          onPointClick={(p: any) => {
            globeRef.current?.pointOfView({ lat: p.lat, lng: p.lng, altitude: 1.55 }, 900);
            showPopup(p.lat, p.lng, p.name, p.lines ?? []);
          }}

          // Floating popup bubble
          htmlElementsData={popup ? [popup] : []}
          htmlLat={(d: any) => d.lat}
          htmlLng={(d: any) => d.lng}
          htmlAltitude={() => 0.22}
          htmlElement={(d: any) => {
            const el = document.createElement("div");
            el.style.pointerEvents = "none";
            el.style.transform = "translate(-50%, -120%)";
            el.style.padding = "10px 12px";
            el.style.borderRadius = "14px";
            el.style.border = "1px solid rgba(255,255,255,0.14)";
            el.style.background =
              "linear-gradient(180deg, rgba(255,255,255,0.10), rgba(255,255,255,0.06))";
            (el.style as any).backdropFilter = "blur(14px)";
            el.style.boxShadow = "0 14px 55px rgba(0,0,0,0.55)";
            el.style.maxWidth = "240px";
            el.style.color = "rgba(255,255,255,0.92)";
            el.style.fontFamily = "ui-sans-serif, system-ui, -apple-system";

            const title = document.createElement("div");
            title.style.fontSize = "12px";
            title.style.opacity = "0.72";
            title.style.marginBottom = "6px";
            title.innerText = d.title;

            el.appendChild(title);

            d.lines.forEach((line: string) => {
              const row = document.createElement("div");
              row.style.fontSize = "13px";
              row.style.lineHeight = "1.35";
              row.innerText = line;
              el.appendChild(row);
            });

            return el;
          }}
        />
      )}
    </div>
  );
}
