import React from "react";

export const Badge = ({ children, className = "", variant = "default" }) => {
  let badgeClass = "px-2 py-1 text-sm rounded-md";

  if (variant === "outline") {
    badgeClass += " border border-gray-400 text-gray-600";
  } else {
    badgeClass += " bg-blue-500 text-white";
  }

  return <span className={`${badgeClass} ${className}`}>{children}</span>;
};
