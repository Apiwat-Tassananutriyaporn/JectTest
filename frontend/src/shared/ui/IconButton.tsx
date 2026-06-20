import type { ButtonHTMLAttributes, ReactNode } from "react";

type IconButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  active?: boolean;
  className?: string;
  children: ReactNode;
  variant?: "icon-button" | "rail-button";
};

export function IconButton({
  active = false,
  className = "",
  children,
  variant = "icon-button",
  ...props
}: IconButtonProps) {
  const classes = [variant, active ? "is-active" : "", className].filter(Boolean).join(" ");

  return (
    <button className={classes} type="button" {...props}>
      {children}
    </button>
  );
}
