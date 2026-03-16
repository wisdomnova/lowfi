import React, { useState } from "react";
import { Eye, EyeOff } from "lucide-react";

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helperText?: string;
  hideLabel?: boolean;
}

export function Input({
  label,
  error,
  helperText,
  hideLabel,
  className,
  type,
  ...props
}: InputProps) {
  const [showPassword, setShowPassword] = useState(false);
  const isPassword = type === "password";

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  return (
    <div className="w-full">
      {label && !hideLabel && (
        <label className="block text-xs font-bold text-[#1F2937] mb-2 px-1">
          {label}
        </label>
      )}
      <div className="bg-white border-2 border-[#1F2937] rounded-2xl p-1 shadow-[4px_4px_0px_0px_#1F2937] transition-all focus-within:shadow-none focus-within:translate-x-[2px] focus-within:translate-y-[2px] flex items-center">
        <input
          type={isPassword ? (showPassword ? "text" : "password") : type}
          className={`flex-1 px-4 py-3 bg-transparent text-[#1F2937] text-sm font-medium placeholder:text-[#1F2937]/30 focus:outline-none focus:ring-0 border-none ${
            error ? "text-red-600" : ""
          } ${className}`}
          {...props}
        />
        {isPassword && (
          <button
            type="button"
            onClick={togglePasswordVisibility}
            className="px-4 text-[#1F2937]/50 hover:text-[#1F2937] transition-colors"
          >
            {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
          </button>
        )}
      </div>
      {error && <p className="text-red-600 text-[10px] font-bold mt-2 px-1">{error}</p>}
      {helperText && (
        <p className="text-[#1F2937]/50 text-[10px] font-bold mt-2 px-1">{helperText}</p>
      )}
    </div>
  );
}
