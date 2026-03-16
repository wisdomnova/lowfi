// Card component following LowFi visual identity
import React from "react";

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
}

export function Card({ children, className, ...props }: CardProps) {
  return (
    <div
      className={`bg-[#FAFAF8] border-2 border-[#1F2937] rounded-[2.5rem] p-8 shadow-2xl shadow-[#1F2937]/10 ${className}`}
      {...props}
    >
      {children}
    </div>
  );
}

export function CardHeader({ children, className, ...props }: CardProps) {
  return (
    <div className={`mb-8 ${className}`} {...props}>
      {children}
    </div>
  );
}

export function CardTitle({
  children,
  className,
  ...props
}: React.HTMLAttributes<HTMLHeadingElement>) {
  return (
    <h2 className={`text-2xl font-bold text-[#1F2937] flex items-center gap-3 ${className}`} {...props}>
      {children}
    </h2>
  );
}

export function CardContent({
  children,
  className,
  ...props
}: CardProps) {
  return (
    <div className={className} {...props}>
      {children}
    </div>
  );
}
