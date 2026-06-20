import type { HTMLAttributes, ReactNode } from "react";

type PanelProps = HTMLAttributes<HTMLElement> & {
  as?: "aside" | "section" | "div";
  children: ReactNode;
  className?: string;
};

export function Panel({ as: Element = "section", children, className = "", ...props }: PanelProps) {
  return (
    <Element className={className} {...props}>
      {children}
    </Element>
  );
}
