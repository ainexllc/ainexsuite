"use client";

import { cn } from "../../lib/utils";
import {
  AnimatePresence,
  MotionValue,
  motion,
  useMotionValue,
  useSpring,
  useTransform,
} from "framer-motion";
import { useRef, useState } from "react";

export interface FloatingDockItem {
  title: string;
  icon: React.ReactNode;
  href?: string;
  onClick?: () => void;
  color?: string;
  isActive?: boolean;
  /** Called when mouse enters (for prefetching) */
  onHoverStart?: () => void;
  /** Called when mouse leaves */
  onHoverEnd?: () => void;
}

interface FloatingDockProps {
  items: FloatingDockItem[];
  desktopClassName?: string;
  mobileClassName?: string;
}

export function FloatingDock({
  items,
  desktopClassName,
  mobileClassName,
}: FloatingDockProps) {
  return (
    <>
      <FloatingDockDesktop items={items} className={desktopClassName} />
      <FloatingDockMobile items={items} className={mobileClassName} />
    </>
  );
}

function FloatingDockMobile({
  items,
  className,
}: {
  items: FloatingDockItem[];
  className?: string;
}) {
  const [open, setOpen] = useState(false);

  return (
    <div className={cn("relative block md:hidden", className)}>
      <AnimatePresence>
        {open && (
          <motion.div
            layoutId="nav"
            className="absolute bottom-full mb-2 inset-x-0 flex flex-col gap-2"
          >
            {items.map((item, idx) => (
              <motion.div
                key={item.title}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{
                  opacity: 0,
                  y: 10,
                  transition: { delay: idx * 0.05 },
                }}
                transition={{ delay: (items.length - 1 - idx) * 0.05 }}
              >
                {item.href ? (
                  <a
                    href={item.href}
                    className="h-10 w-10 rounded-full bg-surface-elevated flex items-center justify-center border border-ink-200/20"
                    style={{
                      backgroundColor: item.isActive ? item.color : undefined,
                      borderColor: item.color
                    }}
                  >
                    <div className="h-4 w-4">{item.icon}</div>
                  </a>
                ) : (
                  <button
                    onClick={item.onClick}
                    className="h-10 w-10 rounded-full bg-surface-elevated flex items-center justify-center border border-ink-200/20"
                    style={{
                      backgroundColor: item.isActive ? item.color : undefined,
                      borderColor: item.color
                    }}
                  >
                    <div className="h-4 w-4">{item.icon}</div>
                  </button>
                )}
              </motion.div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
      <button
        onClick={() => setOpen(!open)}
        className="h-10 w-10 rounded-full bg-surface-elevated flex items-center justify-center border border-ink-200/20"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="20"
          height="20"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="text-ink-500"
        >
          <rect x="3" y="3" width="7" height="7" />
          <rect x="14" y="3" width="7" height="7" />
          <rect x="14" y="14" width="7" height="7" />
          <rect x="3" y="14" width="7" height="7" />
        </svg>
      </button>
    </div>
  );
}

function FloatingDockDesktop({
  items,
  className,
}: {
  items: FloatingDockItem[];
  className?: string;
}) {
  const mouseX = useMotionValue(Infinity);
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  return (
    <div className={cn("mx-auto hidden md:block", className)}>
      {/* Wrapper for overflow visibility */}
      <motion.div
        ref={scrollContainerRef}
        onMouseMove={(e) => mouseX.set(e.pageX)}
        onMouseLeave={() => mouseX.set(Infinity)}
        className="flex h-16 gap-3 items-end rounded-2xl bg-surface-elevated/80 backdrop-blur-md px-4 pb-3 border border-ink-200/20 shadow-lg max-w-[90vw] overflow-visible"
        style={{
          scrollbarWidth: 'none',
          msOverflowStyle: 'none',
        }}
      >
        {items.map((item) => (
          <IconContainer
            key={item.title}
            mouseX={mouseX}
            {...item}
          />
        ))}
      </motion.div>
    </div>
  );
}

function IconContainer({
  mouseX,
  title,
  icon,
  href,
  onClick,
  color,
  isActive,
  onHoverStart,
  onHoverEnd,
}: {
  mouseX: MotionValue;
} & FloatingDockItem) {
  const ref = useRef<HTMLDivElement>(null);

  const distance = useTransform(mouseX, (val) => {
    const bounds = ref.current?.getBoundingClientRect() ?? { x: 0, width: 0 };
    return val - bounds.x - bounds.width / 2;
  });

  const widthTransform = useTransform(distance, [-150, 0, 150], [40, 80, 40]);
  const heightTransform = useTransform(distance, [-150, 0, 150], [40, 80, 40]);

  const widthTransformIcon = useTransform(distance, [-150, 0, 150], [20, 40, 20]);
  const heightTransformIcon = useTransform(distance, [-150, 0, 150], [20, 40, 20]);

  const width = useSpring(widthTransform, {
    mass: 0.1,
    stiffness: 150,
    damping: 12,
  });
  const height = useSpring(heightTransform, {
    mass: 0.1,
    stiffness: 150,
    damping: 12,
  });

  const widthIcon = useSpring(widthTransformIcon, {
    mass: 0.1,
    stiffness: 150,
    damping: 12,
  });
  const heightIcon = useSpring(heightTransformIcon, {
    mass: 0.1,
    stiffness: 150,
    damping: 12,
  });

  const [hovered, setHovered] = useState(false);

  const content = (
    <motion.div
      ref={ref}
      style={{ width, height }}
      onMouseEnter={() => {
        setHovered(true);
        onHoverStart?.();
      }}
      onMouseLeave={() => {
        setHovered(false);
        onHoverEnd?.();
      }}
      className={cn(
        "aspect-square rounded-xl flex items-center justify-center relative transition-colors",
        isActive
          ? "ring-2 ring-offset-2 ring-offset-surface-elevated"
          : "bg-surface-muted hover:bg-surface-muted/80"
      )}
      whileHover={{ y: -8 }}
    >
      <AnimatePresence>
        {hovered && (
          <motion.div
            initial={{ opacity: 0, y: 10, x: "-50%" }}
            animate={{ opacity: 1, y: 0, x: "-50%" }}
            exit={{ opacity: 0, y: 2, x: "-50%" }}
            className="px-2 py-0.5 whitespace-pre rounded-md bg-surface-elevated border border-ink-200/20 text-ink-700 absolute left-1/2 -top-8 w-fit text-xs shadow-sm"
          >
            {title}
          </motion.div>
        )}
      </AnimatePresence>
      <motion.div
        style={{
          width: widthIcon,
          height: heightIcon,
          color: color || 'currentColor'
        }}
        className="flex items-center justify-center"
      >
        {icon}
      </motion.div>
      {/* Color background layer */}
      <motion.div
        className="absolute inset-0 rounded-xl -z-10"
        style={{
          backgroundColor: color ? `${color}20` : undefined,
        }}
      />
      {/* Active ring */}
      {isActive && (
        <div
          className="absolute inset-0 rounded-xl ring-2"
          style={{
            // @ts-expect-error - CSS custom property for ring color
            '--tw-ring-color': color,
          }}
        />
      )}
    </motion.div>
  );

  if (href) {
    return (
      <a href={href} className="flex-shrink-0">
        {content}
      </a>
    );
  }

  return (
    <button onClick={onClick} className="flex-shrink-0">
      {content}
    </button>
  );
}
