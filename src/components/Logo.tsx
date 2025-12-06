import { Cpu } from "lucide-react";
import { cn } from "@/lib/utils";

interface LogoProps {
  size?: "sm" | "md" | "lg";
  showText?: boolean;
  className?: string;
}

const Logo = ({ size = "md", showText = true, className }: LogoProps) => {
  const iconSizes = {
    sm: "w-8 h-8",
    md: "w-10 h-10",
    lg: "w-16 h-16",
  };

  const iconInnerSizes = {
    sm: "w-4 h-4",
    md: "w-5 h-5",
    lg: "w-8 h-8",
  };

  const textSizes = {
    sm: "text-base",
    md: "text-lg",
    lg: "text-2xl",
  };

  const subtitleSizes = {
    sm: "text-[10px]",
    md: "text-xs",
    lg: "text-sm",
  };

  return (
    <div className={cn("flex items-center gap-3", className)}>
      <div
        className={cn(
          "rounded-xl bg-gradient-to-br from-primary to-secondary flex items-center justify-center glow-blue",
          size === "lg" ? "rounded-2xl" : "rounded-xl",
          iconSizes[size]
        )}
      >
        {/* Replace Cpu icon with your custom logo */}
        <Cpu className={cn("text-white", iconInnerSizes[size])} />
      </div>
      {showText && (
        <div>
          <h1 className={cn("font-bold gradient-text", textSizes[size])}>
            SmartRoom
          </h1>
          <p className={cn("text-muted-foreground", subtitleSizes[size])}>
            Premium Edition
          </p>
        </div>
      )}
    </div>
  );
};

export default Logo;
