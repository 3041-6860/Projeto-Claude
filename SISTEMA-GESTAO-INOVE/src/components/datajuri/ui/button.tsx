import * as React from "react";

const variants: Record<string, string> = {
  default: "bg-[#8b2333] text-white shadow hover:bg-[#6d1a27]",
  destructive: "bg-red-500 text-white shadow-sm hover:bg-red-600",
  outline: "border border-gray-300 bg-white shadow-sm hover:bg-gray-50 text-gray-700",
  secondary: "bg-gray-100 text-gray-900 shadow-sm hover:bg-gray-200",
  ghost: "hover:bg-gray-100 text-gray-700",
  link: "text-blue-600 underline-offset-4 hover:underline",
  success: "bg-green-600 text-white shadow hover:bg-green-700",
  warning: "bg-amber-500 text-white shadow hover:bg-amber-600",
};

const sizes: Record<string, string> = {
  default: "h-9 px-4 py-2",
  sm: "h-8 rounded-md px-3 text-xs",
  lg: "h-10 rounded-md px-8",
  icon: "h-9 w-9",
};

const base = "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50";

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: keyof typeof variants;
  size?: keyof typeof sizes;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "default", size = "default", ...props }, ref) => {
    const cls = [base, variants[variant] ?? variants.default, sizes[size] ?? sizes.default, className].filter(Boolean).join(" ");
    return <button className={cls} ref={ref} {...props} />;
  }
);
Button.displayName = "Button";

export { Button };
