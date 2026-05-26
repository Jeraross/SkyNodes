import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { HandWrittenTitle } from "./ui/hand-writing-text";

interface Props {
  onDone: () => void;
}

export default function IntroScreen({ onDone }: Props) {
  const [exiting, setExiting] = useState(false);

  // Auto-advance: SVG animation ~2.5s + text fades + hold = 5s total
  useEffect(() => {
    const timer = setTimeout(() => setExiting(true), 5000);
    return () => clearTimeout(timer);
  }, []);

  // Once exit animation starts, call onDone after it completes
  useEffect(() => {
    if (!exiting) return;
    const timer = setTimeout(onDone, 800);
    return () => clearTimeout(timer);
  }, [exiting, onDone]);

  return (
    <AnimatePresence>
      {!exiting && (
        <motion.div
          className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-[#020617] cursor-pointer select-none"
          initial={{ opacity: 1 }}
          exit={{ opacity: 0, scale: 1.04 }}
          transition={{ duration: 0.8, ease: "easeInOut" }}
          onClick={() => setExiting(true)}
        >
          {/* Subtle radial glow behind the title */}
          <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
            <div className="h-[500px] w-[800px] rounded-full bg-cyan-500/5 blur-3xl" />
          </div>

          <HandWrittenTitle
            title="SkyNodes"
            subtitle="Malha Aérea Brasileira"
          />

          {/* "click to enter" hint fades in after animation */}
          <motion.p
            className="absolute bottom-12 font-mono text-xs uppercase tracking-[0.25em] text-cyan-500/60"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 3.5, duration: 1 }}
          >
            clique para entrar
          </motion.p>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
