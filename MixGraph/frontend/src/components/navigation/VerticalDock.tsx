// src/components/navigation/VerticalDock.tsx
import { motion, useMotionValue, useSpring, useTransform, AnimatePresence } from 'motion/react';
import type { MotionValue } from 'motion/react';
import { Children, cloneElement, isValidElement, useEffect, useMemo, useRef, useState } from 'react';
import type { ReactNode, ReactElement } from 'react';
import './VerticalDock.css';

interface SpringOptions { mass?: number; stiffness?: number; damping?: number; }
export interface VerticalDockItem { icon: ReactNode; label: string; onClick: () => void; className?: string; }

function DockItemRow({
  children, className = '', onClick, mouseY, spring, distance, magnification, baseItemSize,
}: {
  children: ReactNode;
  className?: string; onClick: () => void;
  mouseY: ReturnType<typeof useMotionValue<number>>;
  spring: SpringOptions; distance: number; magnification: number; baseItemSize: number;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const isHovered = useMotionValue(0);
  const mouseDistance = useTransform(mouseY, val => {
    const rect = ref.current?.getBoundingClientRect() ?? { y: 0, height: baseItemSize };
    return val - rect.y - baseItemSize / 2;
  });
  const targetSize = useTransform(mouseDistance, [-distance, 0, distance], [baseItemSize, magnification, baseItemSize]);
  const size = useSpring(targetSize, spring);
  return (
    <motion.div ref={ref} style={{ width: size, height: size }}
      onHoverStart={() => isHovered.set(1)} onHoverEnd={() => isHovered.set(0)}
      onFocus={() => isHovered.set(1)} onBlur={() => isHovered.set(0)}
      onClick={onClick} className={`vdock-item ${className ?? ''}`} tabIndex={0} role="button">
      {Children.map(children, child => isValidElement(child) ? cloneElement(child as ReactElement<{ isHovered?: MotionValue<number> }>, { isHovered }) : child)}
    </motion.div>
  );
}

function VerticalDockLabel({ children, isHovered }: { children: ReactNode; isHovered?: MotionValue<number> }) {
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    if (!isHovered) return;
    return isHovered.on('change', v => setVisible(v === 1));
  }, [isHovered]);
  return (
    <AnimatePresence>
      {visible && (
        <motion.div initial={{ opacity: 0, x: 0 }} animate={{ opacity: 1, x: 10 }}
          exit={{ opacity: 0, x: 0 }} transition={{ duration: 0.15 }}
          className="vdock-label" role="tooltip">
          {children}
        </motion.div>
      )}
    </AnimatePresence>
  );
}

function VerticalDockIcon({ children }: { children: ReactNode }) {
  return <div className="vdock-icon">{children}</div>;
}

interface VerticalDockProps {
  items: VerticalDockItem[];
  spring?: SpringOptions;
  magnification?: number;
  distance?: number;
  panelWidth?: number;
  baseItemSize?: number;
}

export default function VerticalDock({
  items, spring = { mass: 0.1, stiffness: 150, damping: 12 },
  magnification = 64, distance = 140, panelWidth = 58, baseItemSize = 44,
}: VerticalDockProps) {
  const mouseY = useMotionValue(Infinity);
  const isHovered = useMotionValue(0);
  const maxWidth = useMemo(() => Math.max(panelWidth + 16, magnification + 16), [magnification, panelWidth]);
  const widthRow = useTransform(isHovered, [0, 1], [panelWidth, maxWidth]);
  const width = useSpring(widthRow, spring);

  return (
    <motion.div style={{ width, scrollbarWidth: 'none' }} className="vdock-outer">
      <motion.div
        onMouseMove={({ pageY }) => { isHovered.set(1); mouseY.set(pageY); }}
        onMouseLeave={() => { isHovered.set(0); mouseY.set(Infinity); }}
        className="vdock-panel" style={{ width: panelWidth }} role="toolbar" aria-label="Navegação principal">
        {items.map((item, i) => (
          <DockItemRow key={i} onClick={item.onClick} className={item.className ?? ''}
            mouseY={mouseY} spring={spring} distance={distance}
            magnification={magnification} baseItemSize={baseItemSize}>
            <VerticalDockIcon>{item.icon}</VerticalDockIcon>
            <VerticalDockLabel>{item.label}</VerticalDockLabel>
          </DockItemRow>
        ))}
      </motion.div>
    </motion.div>
  );
}
