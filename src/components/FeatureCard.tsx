import { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import React from "react";

interface FeatureCardProps extends React.HTMLAttributes<HTMLDivElement> {
  icon: LucideIcon;
  title: string;
  description: string;
  iconClassName?: string;
}

export function FeatureCard({ 
  icon: Icon, 
  title, 
  description, 
  className,
  iconClassName,
  ...props
}: FeatureCardProps) {
  return (
    <div 
      className={cn(
        "group p-6 rounded-2xl bg-card border border-border transition-all duration-300",
        "hover:border-primary/30 hover:shadow-soft-lg card-hover",
        className
      )}
      {...props}
    >
      <div 
        className={cn(
          "w-12 h-12 rounded-xl flex items-center justify-center mb-4",
          "bg-primary/10 text-primary group-hover:bg-primary group-hover:text-primary-foreground",
          "transition-all duration-300",
          iconClassName
        )}
      >
        <Icon className="w-6 h-6" />
      </div>
      
      <h3 className="text-lg font-semibold text-foreground mb-2">
        {title}
      </h3>
      
      <p className="text-muted-foreground text-sm leading-relaxed">
        {description}
      </p>
    </div>
  );
}
