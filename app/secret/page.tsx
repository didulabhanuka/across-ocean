"use client";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";

const PASS = "01062024";

function TypewriterBlock({
  lines,
  speedMs = 22,
  pauseMs = 520,
}: {
  lines: string[];
  speedMs?: number;
  pauseMs?: number;
}) {
  const [out, setOut] = useState("");
  const [done, setDone] = useState(false);

  useEffect(() => {
    const prefersReduced =
      typeof window !== "undefined" &&
      window.matchMedia?.("(prefers-reduced-motion: reduce)")?.matches;

    if (prefersReduced) {
      setOut(lines.join("\n"));
      setDone(true);
      return;
    }

    setOut("");
    setDone(false);
    let li = 0;
    let ci = 0;
    let alive = true;
    let tickT: any = null;
    let pauseT: any = null;

    const tick = () => {
      tickT = setInterval(() => {
        if (!alive) return;
        const line = lines[li] ?? "";
        ci += 1;
        const currentLineText = line.slice(0, ci);
        const previous = lines.slice(0, li).join("\n");
        setOut(previous ? `${previous}\n${currentLineText}` : currentLineText);
        if (ci >= line.length) {
          clearInterval(tickT);
          tickT = null;
          pauseT = setTimeout(() => {
            if (!alive) return;
            li += 1;
            ci = 0;
            if (li >= lines.length) {
              setDone(true);
              return;
            }
            tick();
          }, pauseMs);
        }
      }, speedMs);
    };

    tick();

    return () => {
      alive = false;
      clearInterval(tickT);
      clearTimeout(pauseT);
    };
  }, [lines, speedMs, pauseMs]);

  return (
    <div className="rounded-2xl border border-white/15 bg-white/10 px-5 py-4 shadow-[0_14px_55px_rgba(0,0,0,0.55)]">
      <div className="text-white/90 text-sm leading-relaxed whitespace-pre-line">
        {out}
        <span
          className="inline-block align-baseline ml-1"
          style={{
            opacity: done ? 0.6 : 1,
            animation: done ? "none" : "pulseSoft 1.2s ease-in-out infinite",
          }}
        >
          {" "}
          |{" "}
        </span>
      </div>
    </div>
  );
}

export default function Secret() {
  const [code, setCode] = useState("");
  const [ok, setOk] = useState(false);
  const [shake, setShake] = useState(false);
  const [mode, setMode] = useState<"sweet" | "bold">("bold");

  const check = () => {
    if (code === PASS) setOk(true);
    else {
      setShake(true);
      setTimeout(() => setShake(false), 420);
    }
  };

  return (
    <div className="min-h-[100svh] w-full overflow-y-auto px-6 py-10 bg-black">
      <div className="mx-auto max-w-[420px]">
        <div className="glass relative overflow-hidden rounded-3xl p-6 shadow-[0_14px_55px_rgba(255,0,90,0.35)] border border-red-900/30">
          <div
            className="absolute inset-0 opacity-90"
            style={{
              background:
                "radial-gradient(900px 420px at 50% 0%, rgba(255,0,90,0.35), transparent 60%), radial-gradient(760px 560px at 40% 120%, rgba(255,0,90,0.25), transparent 65%)",
            }}
          />
          <div className="relative">
            {!ok ? (
              <>
                <div className="flex items-center justify-between">
                  <h1 className="text-2xl font-semibold text-white">Restricted</h1>
                  <div className="text-xs text-white/55">18+ only</div>
                </div>
                <p className="mt-2 text-sm text-white/60">
                  Hint:{" "}
                  <span className="text-white/80">the day we falling in love</span>
                </p>
                <div className="mt-5">
                  <input
                    value={code}
                    onChange={(e) => setCode(e.target.value)}
                    placeholder="Enter passcode"
                    inputMode="numeric"
                    className={`w-full rounded-2xl bg-white/10 border border-red-900/30 px-4 py-3 text-white outline-none placeholder-white/40 \${
                      shake ? "animate-[microshake_0.35s_ease-in-out]" : ""
                    }`}
                  />
                  <button
                    onClick={check}
                    className="mt-3 w-full rounded-2xl bg-red-900/20 border border-red-900/30 px-4 py-3 text-white shadow-soft hover:shadow-glow hover:bg-red-900/30 transition active:scale-[0.98]"
                  >
                    Enter
                  </button>
                </div>
                <a
                  href="/"
                  className="mt-4 inline-block text-xs text-white/40 hover:text-white/70"
                >
                  ← back
                </a>
              </>
            ) : (
              <motion.div
                initial={{ opacity: 0, y: 10, filter: "blur(10px)" }}
                animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
                transition={{ duration: 0.55 }}
                className="space-y-4"
              >
                <div className="flex items-center justify-between">
                  <h1 className="text-2xl font-semibold text-white">Uncensored.</h1>
                  <button
                    onClick={() => setOk(false)}
                    className="text-xs text-white/50 hover:text-white/80 transition"
                  >
                    lock
                  </button>
                </div>
                <div className="rounded-2xl border border-red-900/30 bg-white/10 px-4 py-3">
                  <div className="text-xs text-white/55">Choose your poison</div>
                  <div className="mt-2 grid grid-cols-2 gap-3">
                    <button
                      onClick={() => setMode("sweet")}
                      className={`rounded-2xl px-4 py-3 text-white border transition active:scale-[0.98] \${
                        mode === "sweet"
                          ? "bg-[rgba(255,105,180,0.14)] border-pink-500/30 shadow-soft"
                          : "bg-white/10 border-red-900/30 hover:bg-white/12"
                      }`}
                    >
                      🌙 Sensual
                    </button>
                    <button
                      onClick={() => setMode("bold")}
                      className={`rounded-2xl px-4 py-3 text-white border transition active:scale-[0.98] \${
                        mode === "bold"
                          ? "bg-[rgba(255,0,90,0.14)] border-red-500/30 shadow-soft"
                          : "bg-white/10 border-red-900/30 hover:bg-white/12"
                      }`}
                    >
                      🔥 Raw
                    </button>
                  </div>
                </div>
                {mode === "sweet" ? (
                  <TypewriterBlock
                    lines={[
                      "Come here.",
                      "Not for anyone else.",
                      "Just for me.",
                      "",
                      "I miss you in that quiet way…",
                      "the kind that gets louder at night.",
                      "",
                      "When I see you again,",
                      "I’m stealing a moment before the world gets one.",
                      "",
                      "I want to feel your skin against mine,",
                      "slow and warm, until we forget where we end.",
                      "",
                      "Let me undress you slowly,",
                      "kiss every inch of your body,",
                      "and taste you until you’re trembling.",
                      "",
                      "I want to be inside you,",
                      "moving together until we’re breathless and spent.",
                      "",
                      "Happy Valentine’s Day. 😌",
                    ]}
                    speedMs={22}
                    pauseMs={520}
                  />
                ) : (
                  <TypewriterBlock
                    lines={[
                      "You act calm on screens…",
                      "but I know you miss me.",
                      "",
                      "Distance is the only reason you get to pretend.",
                      "",
                      "When I’m there,",
                      "you won’t be able to hide that smile from me.",
                      "",
                      "I’m going to pin you down,",
                      "spread you open,",
                      "and fuck you until you’re shaking and raw.",
                      "",
                      "I want to hear you moan my name,",
                      "feel your nails dig into my back,",
                      "and watch you lose control completely.",
                      "",
                      "I’ll flip you over,",
                      "pull your hair,",
                      "and pound you from behind until you’re screaming.",
                      "",
                      "Then I’ll push you to your knees,",
                      "and fuck your mouth until you’re gagging and covered in me.",
                      "",
                      "Happy Valentine’s Day.",
                      "You’re my favorite problem. 🔥",
                    ]}
                    speedMs={22}
                    pauseMs={520}
                  />
                )}
                <div className="rounded-2xl border border-white/15 bg-white/10 px-5 py-4">
                  <p className="text-sm text-white/85">
                    “Private note.”{" "}
                    <span className="text-white/70">Keep it between us.</span>
                  </p>
                </div>
                <a
                  href="/"
                  className="inline-block text-xs text-white/40 hover:text-white/70"
                >
                  ← back to main experience
                </a>
              </motion.div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}