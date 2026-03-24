import React from "react";

export function Card({ children, className = "", ...rest }) {
  return (
    <div className={`bg-white/40 backdrop-blur-sm rounded-lg p-4 ${className}`} {...rest}>
      {children}
    </div>
  );
}
export default Card;
