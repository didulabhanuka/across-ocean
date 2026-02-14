"use client";

import { useEffect, useState } from "react";
import Lottie from "lottie-react";

export default function LottieLoader({
  src,
  loop = true,
  className,
}: {
  src: string;          // e.g. "/lottie/heart.json"
  loop?: boolean;
  className?: string;
}) {
  const [data, setData] = useState<any>(null);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    let alive = true;
    setFailed(false);

    fetch(src)
      .then((r) => {
        if (!r.ok) throw new Error("missing");
        return r.json();
      })
      .then((json) => alive && setData(json))
      .catch(() => alive && setFailed(true));

    return () => { alive = false; };
  }, [src]);

  if (failed) {
    return (
      <div className={className ?? ""}>
        <div className="h-10 w-10 rounded-full border border-white/20 bg-white/10 animate-pulseSoft" />
      </div>
    );
  }

  if (!data) {
    return <div className={className ?? ""}><div className="h-10 w-10 rounded-full bg-white/10 border border-white/10" /></div>;
  }

  return <Lottie animationData={data} loop={loop} className={className} />;
}
