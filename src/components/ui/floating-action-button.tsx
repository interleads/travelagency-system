import React from "react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { LucideIcon } from "lucide-react";
import { useIsMobile } from "@/hooks/use-mobile";

interface FloatingActionButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  icon: LucideIcon;
  label?: string;
  variant?: "default" | "secondary" | "outline";
  position?: "bottom-right" | "bottom-left" | "bottom-center";
}

export function FloatingActionButton({ 
  icon: Icon, 
  label, 
  className, 
  variant = "default",
  position = "bottom-right",
  ...props 
}: FloatingActionButtonProps) {
  const isMobile = useIsMobile();

  // Only show FAB on mobile devices
  if (!isMobile) {
    return null;
  }

  const positionClasses = {
    "bottom-right": "bottom-6 right-6",
    "bottom-left": "bottom-6 left-6", 
    "bottom-center": "bottom-6 left-1/2 transform -translate-x-1/2"
  };

  return (
    <Button
      {...props}
      size="lg"
      variant={variant}
      className={cn(
        "fixed z-50 h-14 w-14 rounded-full shadow-lg hover:shadow-xl transition-all duration-200",
        "bg-primary hover:bg-primary/90 text-primary-foreground",
        "active:scale-95",
        positionClasses[position],
        label && "w-auto px-4 gap-2",
        className
      )}
    >
      <Icon size={20} />
      {label && <span className="text-sm font-medium">{label}</span>}
    </Button>
  );
}