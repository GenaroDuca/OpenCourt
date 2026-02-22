import React from "react";

export const StatsCard = ({
  title,
  value,
  icon,
  color = "green",
  onClick,
  isActive,
}) => {
  const colorStyles = {
    green: {
      activeBorder: "border-primary/50",
      activeGlow: "bg-primary/10",
      icon: "text-primary",
      activeText: "text-primary",
    },
    blue: {
      activeBorder: "border-sky-400/50",
      activeGlow: "bg-sky-400/10",
      icon: "text-sky-400",
      activeText: "text-sky-400",
    },
    purple: {
      activeBorder: "border-purple-500/50",
      activeGlow: "bg-purple-500/10",
      icon: "text-purple-500",
      activeText: "text-purple-500",
    },
    yellow: {
      activeBorder: "border-yellow-400/50",
      activeGlow: "bg-yellow-400/10",
      icon: "text-yellow-400",
      activeText: "text-yellow-400",
    },
  };

  const currentStyle = colorStyles[color] || colorStyles.green;

  return (
    <div
      onClick={onClick}
      className={`bg-background-card-color border border-border-color p-2 md:p-4 rounded-2xl md:rounded-lg flex flex-col justify-center md:justify-between md:gap-4 gap-2 transition-all duration-300 group relative overflow-hidden ${
        isActive ? currentStyle.activeBorder : currentStyle.border
      } ${onClick ? "cursor-pointer" : ""}`}
    >
      <div
        className={`absolute top-0 right-0 w-32 h-32 rounded-full blur-3xl -z-10 transition-all duration-500 ${
          isActive ? currentStyle.activeGlow : currentStyle.glow
        }`}
      ></div>

      <div className="flex justify-center md:justify-between items-start">
        <div
          className={`md:p-3.5 p-2 rounded-lg bg-gradient-to-br from-white/10 to-white/5 border border-white/10 shadow-inner transition-transform duration-300 ${currentStyle.icon}`}
        >
          {icon}
        </div>
      </div>

      <div className="flex flex-col gap-1">
        <span className="hidden md:block text-text-color/60 md:text-[12px] text-[8px] font-bold tracking-widest uppercase">
          {title}
        </span>
        <span
          className={`text-center md:text-left text-sm md:text-2xl font-black text-white font-display tracking-tight transition-colors duration-300 ${
            isActive ? currentStyle.activeText : currentStyle.text
          }`}
        >
          {value}
        </span>
      </div>
    </div>
  );
};
