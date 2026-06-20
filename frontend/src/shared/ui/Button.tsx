import type { ButtonHTMLAttributes, ReactNode } from "react";

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  active?: boolean;
  className?: string;
  children: ReactNode;
  variant?: "toolbar" | "sidebar-tab" | "nav-item" | "tool-item" | "scene-color";
};

export function Button({
  active = false,
  className = "",
  children,
  variant = "toolbar",
  ...props
}: ButtonProps) {
  const variantClassMap = {
    "nav-item": "nav-item",
    "scene-color": "scene-color-control",
    "sidebar-tab": "sidebar-tab",
    toolbar: "toolbar-button",
    "tool-item": "tool-item",
  } as const;

  const classes = [variantClassMap[variant], active ? "is-active" : "", className]
    .filter(Boolean)
    .join(" ");

  return (
    <button className={classes} type="button" {...props}>
      {children}
    </button>
  );
}
