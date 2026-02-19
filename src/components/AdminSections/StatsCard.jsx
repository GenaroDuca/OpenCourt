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
      border: "hover:border-primary/50",
      activeBorder: "border-primary/50",
      glow: "bg-primary/5 group-hover:bg-primary/10",
      activeGlow: "bg-primary/10",
      icon: "text-primary",
      text: "group-hover:text-primary",
      activeText: "text-primary",
    },
    blue: {
      border: "hover:border-sky-400/50",
      activeBorder: "border-sky-400/50",
      glow: "bg-sky-400/5 group-hover:bg-sky-400/10",
      activeGlow: "bg-sky-400/10",
      icon: "text-sky-400",
      text: "group-hover:text-sky-400",
      activeText: "text-sky-400",
    },
    purple: {
      border: "hover:border-purple-500/50",
      activeBorder: "border-purple-500/50",
      glow: "bg-purple-500/5 group-hover:bg-purple-500/10",
      activeGlow: "bg-purple-500/10",
      icon: "text-purple-500",
      text: "group-hover:text-purple-500",
      activeText: "text-purple-500",
    },
    yellow: {
      border: "hover:border-yellow-400/50",
      activeBorder: "border-yellow-400/50",
      glow: "bg-yellow-400/5 group-hover:bg-yellow-400/10",
      activeGlow: "bg-yellow-400/10",
      icon: "text-yellow-400",
      text: "group-hover:text-yellow-400",
      activeText: "text-yellow-400",
    },
  };

  const currentStyle = colorStyles[color] || colorStyles.green;

  return (
    <div
      onClick={onClick}
      className={`bg-background-card-color border border-border-color p-4 md:p-4 rounded-lg md:rounded-lg flex flex-col justify-between md:gap-4 gap-2 transition-all duration-300 group relative overflow-hidden ${
        isActive ? currentStyle.activeBorder : currentStyle.border
      } ${onClick ? "cursor-pointer" : ""}`}
    >
      <div
        className={`absolute top-0 right-0 w-32 h-32 rounded-full blur-3xl -z-10 transition-all duration-500 ${
          isActive ? currentStyle.activeGlow : currentStyle.glow
        }`}
      ></div>

      <div className="flex justify-between items-start">
        <div
          className={`p-3.5 rounded-lg bg-gradient-to-br from-white/10 to-white/5 border border-white/10 shadow-inner group-hover:scale-110 transition-transform duration-300 ${currentStyle.icon}`}
        >
          {icon}
        </div>
      </div>

      <div className="flex flex-col gap-1 mt-2">
        <span className="text-text-color/60 md:text-[12px] text-[10px] font-bold tracking-widest uppercase">
          {title}
        </span>
        <span
          className={`text-3xl font-black text-white font-display tracking-tight transition-colors duration-300 ${
            isActive ? currentStyle.activeText : currentStyle.text
          }`}
        >
          {value}
        </span>
      </div>
    </div>
  );
};
