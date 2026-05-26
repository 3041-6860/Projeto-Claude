import * as React from "react";
const variants: Record<string, string> = {
  default: "inline-flex items-center rounded-full border border-transparent bg-blue-100 text-blue-800 px-2.5 py-0.5 text-xs font-semibold",
  secondary: "inline-flex items-center rounded-full border border-transparent bg-gray-100 text-gray-800 px-2.5 py-0.5 text-xs font-semibold",
  destructive: "inline-flex items-center rounded-full border border-transparent bg-red-100 text-red-800 px-2.5 py-0.5 text-xs font-semibold",
  success: "inline-flex items-center rounded-full border border-transparent bg-green-100 text-green-800 px-2.5 py-0.5 text-xs font-semibold",
  warning: "inline-flex items-center rounded-full border border-transparent bg-amber-100 text-amber-800 px-2.5 py-0.5 text-xs font-semibold",
  outline: "inline-flex items-center rounded-full border border-gray-300 text-gray-700 px-2.5 py-0.5 text-xs font-semibold",
};
interface BadgeProps extends React.HTMLAttributes<HTMLDivElement> { variant?: keyof typeof variants }
function Badge({ className, variant = "default", ...props }: BadgeProps) {
  return <div className={[variants[variant], className].filter(Boolean).join(" ")} {...props} />;
}
export { Badge };
