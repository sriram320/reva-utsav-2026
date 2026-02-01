import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";
import { motion, HTMLMotionProps } from "framer-motion";

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    variant?: "primary" | "secondary" | "outline" | "ghost" | "destructive";
    size?: "sm" | "md" | "lg" | "icon";
    glow?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
    ({ className, variant = "primary", size = "md", glow = false, ...props }, ref) => {

        const baseStyles = "inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none ring-offset-background font-orbitron tracking-wide transition-all duration-300";

        const variants = {
            primary: "bg-secondary text-black hover:bg-secondary/80 hover:scale-105",
            secondary: "bg-accent text-white hover:bg-accent/80 hover:scale-105",
            outline: "border border-secondary text-secondary hover:bg-secondary hover:text-black",
            ghost: "hover:bg-white/10 text-foreground",
            destructive: "bg-danger text-white hover:bg-danger/90",
        };

        const sizes = {
            sm: "h-9 px-3 rounded-md",
            md: "h-11 px-8 py-2 rounded-md",
            lg: "h-14 px-8 rounded-lg text-lg",
            icon: "h-10 w-10",
        };

        const glowStyles = glow ? "shadow-[0_0_15px_rgba(0,212,255,0.5)] hover:shadow-[0_0_25px_rgba(0,212,255,0.8)]" : "";

        return (
            <button
                ref={ref}
                className={cn(baseStyles, variants[variant], sizes[size], glowStyles, className)}
                {...props}
            />
        );
    }
);
Button.displayName = "Button";

export { Button };
