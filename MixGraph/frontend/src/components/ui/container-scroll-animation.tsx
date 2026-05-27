import React, { useEffect } from "react";
import { useMotionValue, useSpring, useTransform, motion } from "motion/react";

export const ContainerScroll = ({
  titleComponent,
  sticker,
  children,
}: {
  titleComponent?: string | React.ReactNode;
  sticker?: React.ReactNode;
  children: React.ReactNode;
}) => {
  const progress = useMotionValue(0);
  const spring = useSpring(progress, { stiffness: 60, damping: 18, mass: 1.1 });

  useEffect(() => {
    progress.set(1);
  }, []);

  const rotate  = useTransform(spring, [0, 1], [65, 5]);
  const scale   = useTransform(spring, [0, 1], [0.60, 1]);
  const slideY  = useTransform(spring, [0, 1], [80, 0]);

  return (
    <div
      className="flex flex-col items-center w-full h-full"
      style={{ perspective: "900px", perspectiveOrigin: "50% 30%" }}
    >
      {titleComponent && (
        <motion.div style={{ translateY: slideY }} className="mb-2 text-center shrink-0">
          {titleComponent}
        </motion.div>
      )}

      {/* Tablet frame — sem overflow-hidden para o sticker sobressair */}
      <motion.div
        style={{
          rotateX: rotate,
          scale,
          translateY: slideY,
          transformOrigin: "50% 100%",
          background: "linear-gradient(145deg, #2a2a2a 0%, #1a1a1a 40%, #111111 100%)",
          boxShadow: [
            "0 0 0 1px #3a3a3a",
            "inset 0 1px 0 rgba(255,255,255,0.06)",
            "inset 0 -1px 0 rgba(0,0,0,0.4)",
            "0 20px 60px rgba(0,0,0,0.8)",
            "0 40px 80px rgba(0,0,0,0.5)",
            "0 2px 4px rgba(0,0,0,0.9)",
          ].join(", "),
        }}
        className="w-full flex-1 min-h-0 rounded-[42px] flex flex-col relative"
      >
        {/* Câmera */}
        <div className="shrink-0 flex items-center justify-center py-3">
          <div className="w-2 h-2 rounded-full bg-[#222] ring-1 ring-[#333] shadow-inner" />
        </div>

        {/* Tela */}
        <div
          className="flex-1 min-h-0 mx-3 mb-3 rounded-[28px] overflow-hidden flex flex-col"
          style={{
            background: "#0d1117",
            boxShadow: "inset 0 0 0 1px rgba(255,255,255,0.04), inset 0 2px 8px rgba(0,0,0,0.6)",
          }}
        >
          {children}
        </div>

        {/* Botão home */}
        <div className="shrink-0 flex items-center justify-center py-3">
          <div
            className="w-8 h-8 rounded-full"
            style={{
              background: "linear-gradient(145deg, #2e2e2e, #1a1a1a)",
              boxShadow: "0 0 0 1px #3a3a3a, inset 0 1px 0 rgba(255,255,255,0.05), inset 0 -1px 0 rgba(0,0,0,0.3)",
            }}
          />
        </div>

        {/* Slot do sticker — fica na borda do frame */}
        {sticker}
      </motion.div>
    </div>
  );
};
