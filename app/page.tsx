"use client";

import { useEffect, useMemo, useRef, useState, useCallback } from "react";
import { motion, useScroll, useSpring, useTransform } from "framer-motion";
import clsx from "clsx";

import StartScreen from "../components/StartScreen";
import Starfield from "../components/Starfield";
import OceanShimmer from "../components/OceanShimmer";
import GlobeExperience from "../components/GlobeExperience";
import LottieLoader from "../components/LottieLoader";

import { haversineKm } from "../lib/geo";
import { formatDuration } from "../lib/time";

/** --------------------------------
 * TYPEWRITER (with pauses)
 * -------------------------------- */
function TypewriterLine({
  parts,
  speedMs = 30,
  pauseMs = 650,
  startDelayMs = 0,
}: {
  parts: string[];
  speedMs?: number;
  pauseMs?: number;
  startDelayMs?: number;
}) {
  const fullText = useMemo(() => parts.join(" "), [parts]);
  const [text, setText] = useState("");
  const [done, setDone] = useState(false);

  useEffect(() => {
    // Respect reduced motion: show instantly
    const prefersReduced =
      typeof window !== "undefined" &&
      window.matchMedia?.("(prefers-reduced-motion: reduce)")?.matches;

    if (prefersReduced) {
      setText(fullText);
      setDone(true);
      return;
    }

    setText("");
    setDone(false);

    // build pause checkpoints after each "part"
    const checkpoints: number[] = [];
    let cum = 0;
    parts.forEach((p, idx) => {
      cum += p.length;
      if (idx < parts.length - 1) {
        cum += 1; // the space between parts in join(" ")
        checkpoints.push(cum);
      }
    });

    let i = 0;
    let interval: any = null;
    let cancelled = false;
    let pauseT: any = null;
    let delayT: any = null;

    const tick = () => {
      interval = setInterval(() => {
        if (cancelled) return;
        i += 1;
        setText(fullText.slice(0, i));

        if (checkpoints.includes(i)) {
          clearInterval(interval);
          interval = null;

          pauseT = setTimeout(() => {
            if (cancelled) return;
            tick();
          }, pauseMs);
        }

        if (i >= fullText.length) {
          clearInterval(interval);
          interval = null;
          setDone(true);
        }
      }, speedMs);
    };

    delayT = setTimeout(tick, startDelayMs);

    return () => {
      cancelled = true;
      clearTimeout(delayT);
      clearTimeout(pauseT);
      clearInterval(interval);
    };
  }, [fullText, speedMs, pauseMs, startDelayMs, parts]);

  return (
    <div className="glass rounded-2xl px-4 py-3 shadow-[0_14px_55px_rgba(0,0,0,0.55)]">
      <div className="text-white/90 text-sm leading-relaxed">
        {text}
        <span
          className="inline-block align-baseline ml-1"
          style={{
            opacity: done ? 0.6 : 1,
            animation: done ? "none" : "pulseSoft 1.2s ease-in-out infinite",
          }}
        >
          |
        </span>
      </div>

      {!done && <div className="mt-2 text-[11px] text-white/45">loading…</div>}
    </div>
  );
}

/** --------------------------------
 * CONFIG (edit these)
 * -------------------------------- */
const CFG = {
  herName: "Kavindi",
  since: "2024-06-01T00:00:00+05:30",
  nextMeet: "2026-04-01T12:00:00+08:00", // change to your real date/time
  points: {
    sriLanka: { name: "Sri Lanka", lat: 6.9271, lng: 79.8612 },
    maldives: { name: "Maldives", lat: 4.1755, lng: 73.5093 },
    paris: { name: "Paris", lat: 48.8566, lng: 2.3522 },
    bali: { name: "Bali", lat: -8.4095, lng: 115.1889 },
    ireland: { name: "Ireland", lat: 53.3498, lng: -6.2603 }, // Dublin
    japan: { name: "Japan", lat: 35.6762, lng: 139.6503 }, // Tokyo
  },
};

function Pill({ children }: { children: React.ReactNode }) {
  return (
    <div className="glass inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm text-white/80 shadow-soft">
      {children}
    </div>
  );
}

function Section({ id, children }: { id: string; children: React.ReactNode }) {
  return (
    <section
      id={id}
      className="h-[100svh] w-full snap-start px-4 sm:px-8 flex items-center justify-center"
    >
      <div className="w-full max-w-[420px]">{children}</div>
    </section>
  );
}

export default function Page() {
  const [started, setStarted] = useState(false);
  const [introGone, setIntroGone] = useState(false);

  // time + distance
  const sinceMs = useMemo(() => new Date(CFG.since).getTime(), []);
  const nextMeetMs = useMemo(() => new Date(CFG.nextMeet).getTime(), []);
  const [now, setNow] = useState(() => Date.now());

  useEffect(() => {
    const t = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(t);
  }, []);

  const daysSince = Math.floor((now - sinceMs) / 86400000);
  const until = formatDuration(nextMeetMs - now);

  const distanceKm = useMemo(() => {
    const a = CFG.points.sriLanka;
    const b = CFG.points.maldives;
    return haversineKm(a.lat, a.lng, b.lat, b.lng);
  }, []);

  // scroll progress
  const containerRef = useRef<HTMLDivElement | null>(null);
  const { scrollYProgress } = useScroll({ container: containerRef });
  const prog = useSpring(scrollYProgress, {
    stiffness: 120,
    damping: 20,
    mass: 0.2,
  });
  const progWidth = useTransform(prog, [0, 1], ["0%", "100%"]);

  return (
    <div className="relative h-[100svh] w-full">
      <Starfield />
      <OceanShimmer progress={scrollYProgress} />

      {/* progress bar */}
      <div className="fixed left-0 top-0 z-40 h-[2px] w-full bg-white/5">
        <motion.div className="h-full bg-white/40" style={{ width: progWidth }} />
      </div>

      {/* top controls */}
      <div className="fixed right-4 top-4 z-50 flex items-center gap-2">
        <Pill>🌊 Sri Lanka → Maldives</Pill>
      </div>

      {/* intro */}
      {!introGone && (
        <motion.div
          initial={{ opacity: 1 }}
          animate={{ opacity: started ? 0 : 1 }}
          transition={{ duration: 0.7 }}
          onAnimationComplete={() => started && setIntroGone(true)}
        >
          <StartScreen
            onStart={() => {
              setStarted(true);
            }}
          />
        </motion.div>
      )}

      {/* scroll container */}
      <div
        ref={containerRef}
        className="h-[100svh] w-full overflow-y-auto snap-y snap-mandatory scroll-smooth"
      >
        {/* HERO */}
        <Section id="hero">
          <div className="relative">
            <div className="flex items-center justify-between">
              <Pill>Since June 01, 2024</Pill>
              <a
                href="/secret"
                className="text-xs text-white/50 hover:text-white/80 transition"
              >
                hidden →
              </a>
            </div>

            <h1 className="mt-6 text-4xl font-semibold tracking-tight text-white">
              Across the Ocean, <span className="text-white/90">{CFG.herName}</span>.
            </h1>
            <p className="mt-3 text-[15px] leading-relaxed text-white/70">
              Dark ocean. Controlled intensity.
            </p>

            <div className="glass relative mt-5 overflow-hidden rounded-3xl p-4 shadow-soft">
              <div
                className="absolute inset-0"
                style={{
                  background:
                    "radial-gradient(650px 240px at 50% 0%, rgba(255,0,90,0.25), transparent 60%), radial-gradient(420px 260px at 70% 80%, rgba(120,0,255,0.20), transparent 60%)",
                }}
              />
              <div className="relative flex items-center justify-between">
                <div>
                  <div className="text-xs text-white/55">Sri Lanka</div>
                  <div className="text-sm text-white/85">Colombo</div>
                </div>
                <div className="text-xs text-white/40">→</div>
                <div className="text-right">
                  <div className="text-xs text-white/55">Maldives</div>
                  <div className="text-sm text-white/85">Malé</div>
                </div>
              </div>

              <svg viewBox="0 0 420 120" className="relative mt-3 h-[120px] w-full">
                <defs>
                  <linearGradient id="g" x1="0" y1="0" x2="1" y2="0">
                    <stop offset="0%" stopColor="rgba(255,255,255,0.25)" />
                    <stop offset="50%" stopColor="rgba(255,0,90,0.55)" />
                    <stop offset="100%" stopColor="rgba(255,255,255,0.25)" />
                  </linearGradient>
                  <filter id="glow">
                    <feGaussianBlur stdDeviation="3" result="blur" />
                    <feMerge>
                      <feMergeNode in="blur" />
                      <feMergeNode in="SourceGraphic" />
                    </feMerge>
                  </filter>
                </defs>

                <circle
                  cx="72"
                  cy="78"
                  r="7"
                  fill="rgba(255,255,255,0.8)"
                  filter="url(#glow)"
                />
                <circle
                  cx="348"
                  cy="58"
                  r="7"
                  fill="rgba(255,0,90,0.9)"
                  filter="url(#glow)"
                />
                <path
                  d="M72 78 C 160 12, 260 12, 348 58"
                  fill="none"
                  stroke="url(#g)"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  strokeDasharray="6 8"
                  filter="url(#glow)"
                >
                  <animate
                    attributeName="stroke-dashoffset"
                    from="0"
                    to="-60"
                    dur="3s"
                    repeatCount="indefinite"
                  />
                </path>
                <circle
                  cx="72"
                  cy="78"
                  r="18"
                  fill="rgba(255,255,255,0.12)"
                  className="animate-pulse"
                />
                <circle
                  cx="348"
                  cy="58"
                  r="18"
                  fill="rgba(255,0,90,0.14)"
                  className="animate-pulse"
                />
              </svg>

              <div className="relative mt-1 text-xs text-white/55">
                Stars fade • route stays lit
              </div>
            </div>

            <div className="mt-6">
              <TypewriterLine
                parts={[
                  `${CFG.herName}.`,
                  "You may be in Maldives…",
                  "But my choice hasn’t changed.",
                  "Distance doesn’t weaken what I feel.",
                  "It builds tension.",
                ]}
                speedMs={42}
                pauseMs={700}
                startDelayMs={350}
              />
            </div>

            <div className="mt-7 text-center text-xs text-white/40">Scroll ↓</div>
          </div>
        </Section>

        {/* COUNTER + LOTTIE */}
        <Section id="counter">
          <div className="space-y-4">
            <Header title="Calm confidence." sub="Time keeps counting • distance keeps losing" />

            <div className="mt-8 grid gap-3">
              <Stat label="❤️ Days since 01 June 2024" value={`${daysSince} days`} />
              <Stat label="🌊 Distance between us" value={`${Math.round(distanceKm)} km`} />
              <Stat
                label="⏳ Countdown until I see you"
                value={`${until.d}d ${until.h}h ${until.m}m`}
              />
            </div>

            <div className="glass rounded-2xl px-5 py-4 shadow-soft">
              <p className="text-white/85">
                “That distance is brave… standing between me and you.”
              </p>

              <div className="mt-4 flex items-center justify-between">
                <div className="w-[70px] opacity-95">
                  <LottieLoader src="/lottie/heart.json" />
                </div>
                <div className="w-[90px] opacity-95 animate-floaty">
                  <LottieLoader src="/lottie/plane.json" />
                </div>
              </div>
            </div>

            <div className="text-center text-xs text-white/40">Scroll ↓</div>
          </div>
        </Section>

        {/* MESSAGES */}
        <Section id="messages">
          <div className="space-y-4">
            <Header title="Say it like you mean it." sub="Controlled heat • clean words" />

            <div className="mt-8 glass rounded-3xl p-3 shadow-soft">
              {/* Premium scroll mask */}
              <div className="relative">
                <div className="max-h-[62svh] overflow-y-auto overscroll-contain pr-2">
            <ChatStack
                    lines={[
                      "Every night, I think about you.",
                      "Not softly.",
                      "Intensely.",
                      "You’re not a maybe.",
                      "You’re my decision.",
                      "I don’t chase.",
                      "I claim what I choose.",
                      "You can act calm on screens…",
                      "but I know what you feel when it’s quiet.",
                      "If I was there right now…",
                      "I’d pull you close and you’d stop pretending you don’t miss me.",
                      "Distance is the only thing saving you from my hugs.",
                      "And honestly? It’s running out of excuses.",
                      "I’m not jealous.",
                      "I’m protective.",
                      "I don’t need to control you.",
                      "I just don’t let go of what’s mine.",
                      "You’re safe with me.",
                      "But you won’t be distant with me.",
                      "I want your trust, not your fear.",
                      "So I’ll be patient…",
                      "and still be certain.",
                      "When I say I’m coming…",
                      "I mean it.",
                      "No mixed signals.",
                      "No confusion.",
                      "I don’t love halfway.",
                      "I don’t leave gaps.",
                      "Keep your smile ready.",
                      "I’m closing the distance.",
                      "Across every ocean —",
                      "I still choose you.",
                    ]}
                  />
                </div>

                {/* top/bottom fade */}
                <div
                  className="pointer-events-none absolute inset-x-0 top-0 h-10"
                  style={{
                    background:
                      "linear-gradient(180deg, rgba(6,8,18,0.92), rgba(6,8,18,0))",
                  }}
                />
                <div
                  className="pointer-events-none absolute inset-x-0 bottom-0 h-10"
                  style={{
                    background:
                      "linear-gradient(0deg, rgba(6,8,18,0.92), rgba(6,8,18,0))",
                  }}
                />
              </div>
            </div>

            <div className="text-center text-xs text-white/40">Scroll ↓</div>
          </div>
        </Section>

        {/* 3D GLOBE (REAL) */}
        <Section id="globe">
          <div className="space-y-4">

            <Header title="Plans, not fantasies." sub="Our world • our route • tap and feel it" />

            <div className="mt-8 glass rounded-3xl p-3 shadow-soft">
              <div style={{ height: 420, borderRadius: 18, overflow: "hidden" }}>
                <GlobeExperience points={CFG.points} />
              </div>
            </div>

            <div className="glass rounded-2xl px-5 py-4 shadow-soft">
              <div className="text-xs text-white/55">
                Tap a country — bubble appears above it
              </div>
              <div className="mt-1 text-sm text-white/90">Tap a country / pin</div>
            </div>
          </div>
        </Section>

        {/* FINALE (UPGRADED) */}
        <Section id="finale">
          <Finale herName={CFG.herName} />
        </Section>

        <div className="h-16 snap-end" />
      </div>
    </div>
  );
}

/** UI blocks */
function Header({ title, sub }: { title: string; sub: string }) {
  return (
    <div className="mb-1">
      <h2 className="text-2xl font-semibold text-white">{title}</h2>
      <p className="mt-1 text-sm text-white/60">{sub}</p>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="glass rounded-2xl px-5 py-4 shadow-soft">
      <div className="text-xs text-white/55">{label}</div>
      <div className="mt-1 text-2xl font-semibold text-white">{value}</div>
    </div>
  );
}

function ChatStack({ lines }: { lines: string[] }) {
  return (
    <div className="space-y-3">
      {lines.map((t, i) => {
        const left = i % 2 === 0;
        return (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 14, filter: "blur(6px)" }}
            whileInView={{ opacity: 1, y: 0, filter: "blur(0px)" }}
            viewport={{ once: true, amount: 0.5 }}
            transition={{ duration: 0.55, delay: i * 0.03 }}
            className={clsx("flex", left ? "justify-start" : "justify-end")}
          >
            <div
              className={clsx(
                "max-w-[88%] rounded-2xl px-4 py-3 shadow-soft border backdrop-blur-xl",
                left
                  ? "bg-white/10 border-white/15 text-white/90"
                  : "bg-[rgba(255,0,90,0.12)] border-[rgba(255,0,90,0.25)] text-white"
              )}
            >
              <div className="text-sm leading-relaxed">{t}</div>
              <div className="mt-2 flex items-center gap-2 text-[10px] text-white/45">
                <span
                  className={clsx(
                    "h-2 w-2 rounded-full",
                    left ? "bg-white/30" : "bg-[rgba(255,0,90,0.55)]"
                  )}
                />
                delivered
              </div>
            </div>
          </motion.div>
        );
      })}
    </div>
  );
}

function HoldToUnlock({
  holdMs = 900,
  onUnlock,
}: {
  holdMs?: number;
  onUnlock: () => void;
}) {
  const rafRef = useRef<number | null>(null);
  const startRef = useRef<number>(0);
  const unlockedRef = useRef(false);

  const [p, setP] = useState(0);
  const [holding, setHolding] = useState(false);

  const stop = useCallback(
    (keepProgress = false) => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      rafRef.current = null;
      setHolding(false);

      // If user released early, reset progress
      if (!unlockedRef.current && !keepProgress) setP(0);
    },
    []
  );

  const loop = useCallback(
    (t: number) => {
      const dt = t - startRef.current;
      const next = Math.min(1, dt / holdMs);
      setP(next);

      if (next >= 1 && !unlockedRef.current) {
        unlockedRef.current = true;
        stop(true); // keep progress filled
        onUnlock();
        return;
      }

      rafRef.current = requestAnimationFrame(loop);
    },
    [holdMs, onUnlock, stop]
  );

  const start = useCallback(() => {
    unlockedRef.current = false;
    setHolding(true);
    startRef.current = performance.now();
    rafRef.current = requestAnimationFrame(loop);
  }, [loop]);

  // Cleanup if unmounted mid-hold
  useEffect(() => {
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, []);

  return (
    <button
      onPointerDown={(e) => {
        e.currentTarget.setPointerCapture?.(e.pointerId);
        start();
      }}
      onPointerUp={() => stop(false)}
      onPointerCancel={() => stop(false)}
      onPointerLeave={() => holding && stop(false)}
      className={clsx(
        "w-full relative overflow-hidden rounded-2xl px-5 py-4 border border-white/15",
        "bg-white/10 backdrop-blur-xl transition active:scale-[0.99]",
        "shadow-[0_14px_55px_rgba(0,0,0,0.55)]"
      )}
      aria-label="Hold to unlock"
    >
      <span
        className="absolute inset-0"
        style={{
          width: `${p * 100}%`,
          background:
            "linear-gradient(90deg, rgba(255,0,90,0.18), rgba(120,0,255,0.16))",
        }}
      />
      <span className="relative flex items-center justify-between">
        <span className="text-white font-medium">
          {holding ? "Keep holding…" : "Hold to unlock"}
        </span>
        <span className="text-white/70 text-sm">{Math.round(p * 100)}%</span>
      </span>
      <span className="relative mt-2 block text-left text-xs text-white/55">
        Release resets. Full hold reveals.
      </span>
    </button>
  );
}

function TypewriterBlock({
  lines,
  speedMs = 26,
  pauseMs = 520,
  onDone,
}: {
  lines: string[];
  speedMs?: number;
  pauseMs?: number;
  onDone?: () => void;
}) {
  const [out, setOut] = useState("");
  const [done, setDone] = useState(false);

  // ✅ Stable key so it won’t restart on re-render unless content actually changes
  const textKey = useMemo(() => lines.join("\n"), [lines]);
  const doneCalledRef = useRef(false);

  useEffect(() => {
    doneCalledRef.current = false;

    const prefersReduced =
      typeof window !== "undefined" &&
      window.matchMedia?.("(prefers-reduced-motion: reduce)")?.matches;

    if (prefersReduced) {
      setOut(textKey);
      setDone(true);
      if (!doneCalledRef.current) {
        doneCalledRef.current = true;
        onDone?.();
      }
      return;
    }

    setOut("");
    setDone(false);

    let li = 0; // line index
    let ci = 0; // char index
    let alive = true;
    let tickT: any = null;
    let pauseT: any = null;

    const tick = () => {
      tickT = setInterval(() => {
        if (!alive) return;

        const currentLine = lines[li] ?? "";
        ci += 1;

        const currentLineText = currentLine.slice(0, ci);
        const previous = lines.slice(0, li).join("\n");
        setOut(previous ? `${previous}\n${currentLineText}` : currentLineText);

        if (ci >= currentLine.length) {
          clearInterval(tickT);
          tickT = null;

          pauseT = setTimeout(() => {
            if (!alive) return;

            li += 1;
            ci = 0;

            if (li >= lines.length) {
              setDone(true);
              // ✅ call only once
              if (!doneCalledRef.current) {
                doneCalledRef.current = true;
                onDone?.();
              }
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
  }, [textKey, lines, speedMs, pauseMs, onDone]);

  return (
    <div className="glass rounded-2xl px-4 py-4 border border-white/10 ">
      <div className="text-white/90 text-sm leading-relaxed whitespace-pre-line">
        {out}
        <span
          className="inline-block align-baseline ml-1"
          style={{
            opacity: done ? 0.6 : 1,
            animation: done ? "none" : "pulseSoft 1.2s ease-in-out infinite",
          }}
        >
          |
        </span>
      </div>
    </div>
  );
}

/** Finale — hold to unlock + typed reveal + Valentine payoff */
function Finale({ herName }: { herName: string }) {
  const [unlocked, setUnlocked] = useState(false);
  const [typedDone, setTypedDone] = useState(false);

  const reset = useCallback(() => {
    setUnlocked(false);
    setTypedDone(false);
  }, []);

  const finaleLines = useMemo(
    () => [
        `${herName}…`,
        "I don’t do half-love.",
        "Even from far away — I’m still here.",
        "Still steady.",
        "Still choosing you.",
        "And on Valentine’s Day…",
        "I want you to feel that clearly.",
        "You’re mine to adore.",
        "I’ll remind you how it feels to be cherished.",
        "And claimed.",
        "Completely.",
        "",
        "I want to trace your skin like it’s my own.",
        "Whisper your name like a prayer.",
        "And make you forget anyone else ever touched you.",
        "",
        "You’re not just a chapter — you’re the whole story.",
        "The one I’ll never put down.",
        "",
        "When i'm going to see you,",
        "I’m pulling you in so close there’s no space left between us.",
        "And I’m not letting go.",
        "",
        "Happy Valentine’s Day.",
        "You’re my favorite everything.",
    ],
    [herName]
  );

  const handleTypedDone = useCallback(() => setTypedDone(true), []);

  return (
    <div className="space-y-4">
      <Header title="One last scene." sub="Hold to unlock • Valentine reveal" />

      <div className="mt-8 glass relative overflow-hidden rounded-3xl p-6 shadow-soft">
        <div
          className="absolute inset-0 opacity-60"
          style={{
            background:
              "radial-gradient(650px 240px at 50% 0%, rgba(255,0,90,0.18), transparent 60%), radial-gradient(420px 260px at 70% 80%, rgba(120,0,255,0.14), transparent 60%)",
          }}
        />

        <div className="relative space-y-4">
          <div className="flex items-center justify-between">
            <div className="glass inline-flex items-center gap-2 rounded-full px-4 py-2 text-xs text-white/75 border border-white/10">
              💌 Final message
            </div>

            {unlocked && (
              <button
                onClick={reset}
                className="text-xs text-white/55 hover:text-white/85 transition"
              >
                Replay
              </button>
            )}
          </div>

          {!unlocked ? (
            <>
              <div className="space-y-2">
                <p className="text-white/90 text-lg">Don’t tap.</p>
                <p className="text-white/70 text-sm">
                  Hold it for a moment — like you mean it.
                </p>
              </div>

              <HoldToUnlock
                holdMs={850}
                onUnlock={() => {
                  setUnlocked(true);
                  try {
                    navigator.vibrate?.(18);
                  } catch {}
                }}
              />

              <div className="text-center text-xs text-white/45">
                (Hold to unlock the Valentine note)
              </div>
            </>
          ) : (
            <motion.div
              initial={{ opacity: 0, y: 14, filter: "blur(10px)" }}
              animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
              transition={{ duration: 0.55 }}
              className="space-y-4"
            >
              {/* <TypewriterBlock
                speedMs={26}
                pauseMs={520}
                lines={finaleLines}
                onDone={handleTypedDone}
              /> */}
<div className="glass rounded-3xl p-3">
  <div className="relative">
    <div className="h-[25svh] rounded-2xl overflow-y-auto overscroll-contain pr-2">
      <TypewriterBlock
        speedMs={26}
        pauseMs={520}
        lines={finaleLines}
        onDone={handleTypedDone}
      />
    </div>

    {/* top/bottom fade */}
    <div
      className="pointer-events-none absolute inset-x-0 top-0 h-10"
    />
    <div
      className="pointer-events-none absolute inset-x-0 bottom-0 h-10"
    />
  </div>
</div>


              {typedDone && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.45 }}
                  className="rounded-2xl border border-white/15 bg-white/8 px-4 py-3 shadow-[0_14px_55px_rgba(0,0,0,0.55)]"
                >
                  <div className="text-center text-xl font-semibold text-white">
                    Happy Valentine’s Day, {herName}. ❤️
                  </div>
                  <div className="mt-1 text-center text-sm text-white/75">
                    You’re my favorite decision.
                  </div>
                </motion.div>
              )}

              <div className="mt-2 flex items-center justify-between">
                <div className="w-[76px] opacity-95">
                  <LottieLoader src="/lottie/heart.json" />
                </div>
                <div className="text-xs text-white/55">patient • respectful</div>
              </div>

              {typedDone && (
                <div className="grid grid-cols-2 gap-3 pt-1">
                  <a
                    className="text-center w-full rounded-2xl bg-white/10 border border-white/15 px-4 py-3 text-white shadow-[0_14px_55px_rgba(0,0,0,0.55)] hover:shadow-[0_0_45px_rgba(255,0,90,0.18)] transition active:scale-[0.98]"
                    href="#hero"
                  >
                    Back to start
                  </a>
                  <a
                    className="text-center w-full rounded-2xl bg-white/10 border border-white/15 px-4 py-3 text-white shadow-[0_14px_55px_rgba(0,0,0,0.55)] hover:shadow-[0_0_45px_rgba(255,0,90,0.18)] transition active:scale-[0.98]"
                    href="/secret"
                  >
                    Secret page
                  </a>
                </div>
              )}
            </motion.div>
          )}
        </div>
      </div>

      <div className="text-center text-xs text-white/40">Made with love.</div>
    </div>
  );
}
