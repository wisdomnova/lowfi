// Button component following LowFi visual identity
import React from "react";
import { Loader } from "lucide-react";

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "danger" | "ghost";
  size?: "sm" | "md" | "lg" | "xl";
  isLoading?: boolean;
}

export function Button({
  variant = "primary",
  size = "md",
  isLoading,
  className,
  children,
  disabled,
  ...props
}: ButtonProps) {
  const baseClasses =
    "font-bold uppercase tracking-widest transition-all duration-300 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed active:translate-y-0";

  const variantClasses = {
    primary:
      "bg-[#1F2937] text-[#FAFAF8] shadow-[4px_4px_0px_0px_#1F2937] hover:shadow-none hover:translate-x-[2px] hover:translate-y-[2px]",
    secondary:
      "bg-white text-[#1F2937] border-2 border-[#1F2937] shadow-[4px_4px_0px_0px_#1F2937] hover:shadow-none hover:translate-x-[2px] hover:translate-y-[2px]",
    danger:
      "bg-red-500 text-white border-2 border-[#1F2937] shadow-[4px_4px_0px_0px_#1F2937] hover:shadow-none hover:translate-x-[2px] hover:translate-y-[2px]",
    ghost:
      "bg-transparent text-[#1F2937] border border-[#1F2937]/10 hover:bg-[#1F2937]/5",
  };

  const sizeClasses = {
    sm: "h-8 px-3 text-[9px] rounded-lg",
    md: "h-10 px-6 text-[10px] rounded-xl",
    lg: "h-12 px-6 text-xs rounded-2xl",
    xl: "h-14 px-10 text-sm rounded-[1.5rem]",
  };

  return (
    <button
      className={`${baseClasses} ${variantClasses[variant]} ${sizeClasses[size]} ${className}`}
      disabled={disabled || isLoading}
      {...props}
    >
      {isLoading ? (
        <Loader className="animate-spin w-4 h-4" />
      ) : (
        children
      )}
    </button>
  );
}
