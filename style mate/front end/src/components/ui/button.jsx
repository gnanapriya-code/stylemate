import React from "react";

export function Button({ children, className = "", variant, size, ...rest }) {
  const base = "inline-flex items-center justify-center rounded-md px-3 py-2 font-medium";
  const classes = `${base} ${className}`.trim();
  return (
    <button className={classes} {...rest}>
      {children}
    </button>
  );
}
export default Button;
