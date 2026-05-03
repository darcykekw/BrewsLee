"use client";
import { cn } from "@/lib/utils";
import { IconMenu2, IconX } from "@tabler/icons-react";
import {
  motion,
  AnimatePresence,
  useScroll,
  useMotionValueEvent,
} from "motion/react";
import React, { useRef, useState } from "react";

export const Navbar = ({ children, className }) => {
  const ref = useRef(null);
  const { scrollY } = useScroll({ target: ref, offset: ["start start", "end start"] });
  const [visible, setVisible] = useState(false);

  useMotionValueEvent(scrollY, "change", (latest) => {
    setVisible(latest > 100);
  });

  return (
    <motion.div
      ref={ref}
      className={cn("fixed inset-x-0 top-0 z-40 w-full", className)}
    >
      {React.Children.map(children, (child) =>
        React.isValidElement(child)
          ? React.cloneElement(child, { visible })
          : child,
      )}
    </motion.div>
  );
};

export const NavBody = ({ children, className, visible }) => {
  return (
    <motion.div
      animate={{
        backdropFilter: visible ? "blur(10px)" : "none",
        boxShadow: visible
          ? "0 0 24px rgba(34, 42, 53, 0.06), 0 1px 1px rgba(0, 0, 0, 0.05), 0 0 0 1px rgba(34, 42, 53, 0.04), 0 0 4px rgba(34, 42, 53, 0.08), 0 16px 68px rgba(47, 48, 55, 0.05), 0 1px 0 rgba(255, 255, 255, 0.1) inset"
          : "none",
        width: visible ? "40%" : "100%",
        y: visible ? 20 : 0,
        backgroundColor: visible ? "rgba(75, 46, 43, 0.75)" : "transparent",
      }}
      transition={{ type: "spring", stiffness: 200, damping: 50 }}
      style={{ minWidth: "800px" }}
      className={cn(
        "relative z-[60] mx-auto hidden w-full max-w-7xl flex-row items-center justify-between self-start rounded-full px-4 py-2 lg:flex",
        visible && "backdrop-blur-md",
        className,
      )}
    >
      {children}
    </motion.div>
  );
};

export const NavItems = ({ items, className, onItemClick }) => {
  const [hovered, setHovered] = useState(null);

  return (
    <motion.div
      onMouseLeave={() => setHovered(null)}
      className={cn(
        "absolute inset-0 hidden flex-1 flex-row items-center justify-center space-x-2 text-sm font-medium lg:flex lg:space-x-2",
        className,
      )}
    >
      {items.map((item, idx) => (
        <a
          onMouseEnter={() => setHovered(idx)}
          onClick={onItemClick}
          className="relative px-4 py-2 text-[#F5F0E8] hover:text-[#C8963E] transition-colors duration-200"
          key={`link-${idx}`}
          href={item.link}
        >
          {hovered === idx && (
            <motion.div
              layoutId="hovered"
              className="absolute inset-0 h-full w-full rounded-full bg-white/10"
            />
          )}
          <span className="relative z-20">{item.name}</span>
        </a>
      ))}
    </motion.div>
  );
};

export const MobileNav = ({ children, className, visible }) => {
  return (
    <motion.div
      animate={{
        backdropFilter: visible ? "blur(10px)" : "none",
        boxShadow: visible
          ? "0 0 24px rgba(34, 42, 53, 0.06), 0 1px 1px rgba(0, 0, 0, 0.05), 0 0 0 1px rgba(34, 42, 53, 0.04)"
          : "none",
        width: visible ? "90%" : "100%",
        paddingRight: visible ? "12px" : "0px",
        paddingLeft: visible ? "12px" : "0px",
        borderRadius: visible ? "4px" : "2rem",
        y: visible ? 20 : 0,
        backgroundColor: visible ? "rgba(75, 46, 43, 0.75)" : "transparent",
      }}
      transition={{ type: "spring", stiffness: 200, damping: 50 }}
      className={cn(
        "relative z-50 mx-auto flex w-full max-w-[calc(100vw-2rem)] flex-col items-center justify-between px-0 py-2 lg:hidden",
        visible && "backdrop-blur-md",
        className,
      )}
    >
      {children}
    </motion.div>
  );
};

export const MobileNavHeader = ({ children, className }) => {
  return (
    <div className={cn("flex w-full flex-row items-center justify-between", className)}>
      {children}
    </div>
  );
};

export const MobileNavMenu = ({ children, className, isOpen, onClose }) => {
  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className={cn(
            "absolute inset-x-0 top-16 z-50 flex w-full flex-col items-start justify-start gap-4 rounded-lg bg-[#4B2E2B]/90 backdrop-blur-md px-4 py-8 shadow-lg",
            className,
          )}
        >
          {children}
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export const MobileNavToggle = ({ isOpen, onClick }) => {
  return isOpen ? (
    <IconX className="text-[#F5F0E8]" onClick={onClick} />
  ) : (
    <IconMenu2 className="text-[#F5F0E8]" onClick={onClick} />
  );
};

export const NavbarLogo = () => {
  return (
    <a
      href="#hero"
      className="relative z-20 mr-4 flex items-center px-2 py-1"
    >
      <img
        src="/icon.png"
        alt="Brews Lee logo"
        className="w-8 h-8 md:w-9 md:h-9 object-contain transform scale-[2.25] origin-left"
      />
    </a>
  );
};

export const NavbarButton = ({
  href,
  as: Tag = "a",
  children,
  className,
  variant = "primary",
  ...props
}) => {
  const baseStyles =
    "px-4 py-2 rounded-full text-sm font-bold relative cursor-pointer inline-block text-center transition-all duration-300";

  const variantMap = {
    primary: "gradient-btn-primary",
    secondary: "gradient-btn-ghost",
    dark: "gradient-btn-secondary",
    gradient: "gradient-btn-primary",
  };
  
  const selectedVariant = variantMap[variant] || "gradient-btn-primary";

  // Re-use the global styles from GradientButton via class name if they are global, 
  // but to be safe and strictly follow instructions, we'll inject the bubble effect for NavbarButton.
  const style = `
    .navbar-btn-custom {
      position: relative;
      overflow: hidden;
      z-index: 1;
      border: ${variant === 'secondary' ? '1px solid #C08552' : 'none'};
      background: ${variant === 'primary' ? 'linear-gradient(45deg, #8C5A3C, #C08552)' : variant === 'dark' ? 'linear-gradient(45deg, #4B2E2B, #6B3F3C)' : 'transparent'};
      color: #FFF8F0;
    }
    .navbar-btn-custom:before {
      content: '';
      position: absolute;
      top: -50%;
      left: -50%;
      width: 200%;
      height: 200%;
      background: linear-gradient(45deg, rgba(255, 248, 240, 0.12), rgba(255, 248, 240, 0));
      transform: rotate(45deg);
      transition: all 0.5s ease;
      z-index: -1;
    }
    .navbar-btn-custom:hover:before {
      top: -100%;
      left: -100%;
    }
    .navbar-btn-custom:after {
      border-radius: 25px;
      position: absolute;
      content: '';
      width: 0;
      height: 100%;
      top: 0;
      z-index: -1;
      box-shadow: inset 2px 2px 2px 0px rgba(255, 248, 240, 0.2), 7px 7px 20px 0px rgba(75, 46, 43, 0.15), 4px 4px 5px 0px rgba(75, 46, 43, 0.1);
      transition: all 0.3s ease;
      background: ${variant === 'primary' ? 'linear-gradient(45deg, #C08552, #DBA84E)' : variant === 'dark' ? 'linear-gradient(45deg, #6B3F3C, #8C5A3C)' : 'linear-gradient(45deg, #8C5A3C, #C08552)'};
      right: 0;
    }
    .navbar-btn-custom:hover:after {
      width: 100%;
      left: 0;
    }
    .navbar-btn-custom:active {
      top: 2px;
      box-shadow: 0 2px 6px rgba(75, 46, 43, 0.25);
    }
    .navbar-btn-custom span {
      position: relative;
      z-index: 2;
    }
  `;

  return (
    <Tag
      href={href || undefined}
      className={cn(baseStyles, "navbar-btn-custom", className)}
      {...props}
    >
      <style jsx>{style}</style>
      <span>{children}</span>
    </Tag>
  );
};
