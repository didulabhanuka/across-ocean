"use client";

import { motion } from "framer-motion";
import LottieLoader from "./LottieLoader";

export default function StartScreen({
  onStart,
}: {
  onStart: () => void;
}) {
  return (
    <motion.div
      className="fixed inset-0 z-[80] flex items-center justify-center px-5"
      initial={{ opacity: 1 }}
      animate={{ opacity: 1 }}
    >
      <div className="absolute inset-0"
        style={{
          background:
            "radial-gradient(900px 500px at 50% 20%, rgba(255,0,90,0.22), transparent 60%), radial-gradient(900px 700px at 10% 40%, rgba(120,0,255,0.18), transparent 62%), linear-gradient(180deg, rgba(0,0,0,0.82), rgba(0,0,0,0.90))",
        }}
      />
      <div className="relative w-full max-w-[420px]">
        <div className="glass rounded-3xl p-6 shadow-soft overflow-hidden">
          <div className="absolute -right-8 -top-8 h-40 w-40 rounded-full opacity-35"
            style={{ background: "radial-gradient(circle, rgba(255,0,90,0.35), transparent 60%)" }}
          />
          <div className="absolute -left-10 -bottom-10 h-48 w-48 rounded-full opacity-35"
            style={{ background: "radial-gradient(circle, rgba(120,0,255,0.35), transparent 60%)" }}
          />

          <div className="relative">
            <div className="flex items-center justify-between">
              <div className="text-xs text-white/55">Experience</div>
              <div className="text-xs text-white/45">tap to unlock sound</div>
            </div>

            <h1 className="mt-4 text-3xl font-semibold tracking-tight text-white">
              Across the Ocean
            </h1>
            <p className="mt-2 text-sm text-white/65 leading-relaxed">
              Ocean distance • constant love • real plans
            </p>

            <div className="mt-5 flex items-center justify-center">
              <div className="w-[140px] opacity-85 animate-floaty">
                <LottieLoader src="/lottie/stars.json" />
              </div>
            </div>

            <button
              onClick={onStart}
              className="mt-6 w-full rounded-2xl bg-white/10 border border-white/15 px-5 py-3 text-white shadow-soft hover:shadow-glow transition active:scale-[0.98]"
            >
              Tap to Begin
            </button>

          </div>
        </div>
      </div>
    </motion.div>
  );
}
