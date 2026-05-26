import * as React from "react";
import { cn } from "@/lib/datajuri/utils";

// Select nativo — sem dependência de @radix-ui
export interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {}

const Select = React.forwardRef<HTMLSelectElement, SelectProps>(
  ({ className, children, ...props }, ref) => (
    // eslint-disable-next-line jsx-a11y/no-onchange
    <select
      ref={ref}
      aria-label={props['aria-label'] ?? 'select'}
      className={cn(
        "flex h-9 w-full items-center rounded-md border border-gray-300 bg-white px-3 py-1 text-sm shadow-sm focus:outline-none focus:ring-1 focus:ring-blue-500 disabled:cursor-not-allowed disabled:opacity-50",
        className
      )}
      {...props}
    >
      {children}
    </select>
  )
);
Select.displayName = "Select";

// Shims para compatibilidade com imports existentes
const SelectTrigger = ({ children, className }: React.HTMLAttributes<HTMLDivElement>) => (
  <div className={cn("relative", className)}>{children}</div>
);
const SelectContent = ({ children }: { children: React.ReactNode }) => <>{children}</>;
const SelectItem = ({ value, children }: { value: string; children: React.ReactNode }) => (
  <option value={value}>{children}</option>
);
const SelectValue = ({ placeholder }: { placeholder?: string }) => (
  <option value="" disabled>{placeholder}</option>
);
const SelectGroup = ({ children }: { children: React.ReactNode }) => <>{children}</>;
const SelectLabel = ({ children }: { children: React.ReactNode }) => <>{children}</>;

export { Select, SelectTrigger, SelectContent, SelectItem, SelectValue, SelectGroup, SelectLabel };
