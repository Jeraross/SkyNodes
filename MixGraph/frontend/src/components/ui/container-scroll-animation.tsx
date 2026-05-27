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
  const scrollYProgress = useMotionValue(0);
  const scrollSpring = useSpring(scrollYProgress, { stiffness: 90, damping: 20 });

  useEffect(() => {
    scrollYProgress.set(1);
  }, []);

  const rotate    = useTransform(scrollSpring, [0, 1], [55, 0]);
  const scale     = useTransform(scrollSpring, [0, 1], [0.78, 1]);
  const translate = useTransform(scrollSpring, [0, 1], [0, -40]);

  return (
    <div className="flex items-center justify-center relative w-full h-full">
      <div
        className="w-full h-full relative"
        style={{ perspective: "700px" }}
      >
        {titleComponent && <Header translate={translate} titleComponent={titleComponent} />}
        <Card rotate={rotate} translate={translate} scale={scale}>
          {children}
        </Card>
      </div>
    </div>
  );
};

export const Header = ({ translate, titleComponent }: { translate: MotionValue<number>; titleComponent: React.ReactNode }) => {
  return (
    <motion.div
      style={{ translateY: translate }}
      className="max-w-5xl mx-auto text-center"
    >
      {titleComponent}
    </motion.div>
  );
};

export const Card = ({
  rotate,
  scale,
  children,
}: {
  rotate: MotionValue<number>;
  scale: MotionValue<number>;
  translate: MotionValue<number>;
  children: React.ReactNode;
}) => {
  return (
    <motion.div
      style={{
        rotateX: rotate,
        scale,
        boxShadow:
          "0 0 #0000004d, 0 9px 20px #0000004a, 0 37px 37px #00000042, 0 84px 50px #00000026, 0 149px 60px #0000000a, 0 233px 65px #00000003",
      }}
      className="-mt-4 mx-auto w-full h-full border-4 border-[#6C6C6C] bg-[#222222] rounded-[30px] shadow-2xl flex flex-col overflow-hidden"
    >
      <div className="h-full w-full overflow-hidden rounded-2xl bg-zinc-900 flex flex-col">
        {children}
      </div>
    </motion.div>
  );
};
