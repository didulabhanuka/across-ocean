"use client";

import dynamic from "next/dynamic";
import { useEffect, useRef } from "react";

const Globe = dynamic(() => import("react-globe.gl"), { ssr: false });

export default function GlobeClient() {
  const globeRef = useRef<any>(null);

  useEffect(() => {
    if (!globeRef.current) return;

    // react-globe.gl exposes methods like controls(), pointOfView(), etc. :contentReference[oaicite:1]{index=1}
    const controls = globeRef.current.controls();
    controls.autoRotate = true;
    controls.autoRotateSpeed = 0.35;

    globeRef.current.pointOfView({ lat: 6, lng: 78, altitude: 1.8 }, 900);
  }, []);

  const points = [
    { name: "Sri Lanka", lat: 6.9271, lng: 79.8612 },
    { name: "Maldives", lat: 4.1755, lng: 73.5093 },
  ];

  const arcs = [
    {
      startLat: points[0].lat,
      startLng: points[0].lng,
      endLat: points[1].lat,
      endLng: points[1].lng,
      color: ["rgba(255,255,255,0.55)", "rgba(255,0,90,0.85)"],
    },
  ];

  return (
    // IMPORTANT: Globe must have a real height, otherwise it renders “invisible”.
    <div className="h-[420px] w-full">
      <Globe
        ref={globeRef}
        backgroundColor="rgba(0,0,0,0)"
        globeImageUrl="/textures/earth.jpg"   // or a URL
        pointsData={points}
        pointLat="lat"
        pointLng="lng"
        pointColor={() => "rgba(255,255,255,0.85)"}
        pointRadius={0.35}
        arcsData={arcs}
        arcColor={"color"}
        arcDashLength={0.45}
        arcDashGap={2.0}
        arcDashAnimateTime={4200}
      />
    </div>
  );
}
