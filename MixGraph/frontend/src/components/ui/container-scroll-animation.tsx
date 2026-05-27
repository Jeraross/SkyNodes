import React, { useEffect } from "react";
import { useMotionValue, useSpring, useTransform, motion } from "motion/react";
import type { MotionValue } from "motion/react";

export const ContainerScroll = ({
  titleComponent,
  children,
}: {
  titleComponent?: string | React.ReactNode;
  children: React.ReactNode;
}) => {
  const progress = useMotionValue(0);
  const spring = useSpring(progress, { stiffness: 60, damping: 18, mass: 1.1 });

  useEffect(() => {
    progress.set(1);
  }, []);

  // termina em 5 para manter leve inclinação 3D permanente
  const rotate   = useTransform(spring, [0, 1], [65, 5]);
  const scale    = useTransform(spring, [0, 1], [0.60, 1]);
  const slideY   = useTransform(spring, [0, 1], [80, 0]);

  return (
    <div className="flex flex-col items-center w-full h-full" style={{ perspective: "900px", perspectiveOrigin: "50% 30%" }}>
      {titleComponent && (
        <motion.div style={{ translateY: slideY }} className="mb-2 text-center shrink-0">
          {titleComponent}
        </motion.div>
      )}
      <motion.div
        style={{
          rotateX: rotate,
          scale,
          translateY: slideY,
          boxShadow:
            "0 0 #0000004d, 0 9px 20px #0000004a, 0 37px 37px #00000042, 0 84px 50px #00000026, 0 149px 60px #0000000a, 0 233px 65px #00000003",
          transformOrigin: "50% 100%",
        }}
        className="w-full flex-1 min-h-0 border-4 border-[#6C6C6C] bg-[#222222] rounded-[30px] shadow-2xl overflow-hidden"
      >
        <div className="h-full w-full overflow-hidden rounded-2xl bg-zinc-900 flex flex-col">
          {children}
        </div>
      </motion.div>
    </div>
  );
};
