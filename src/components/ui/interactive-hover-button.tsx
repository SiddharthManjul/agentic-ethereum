/* eslint-disable @typescript-eslint/no-unused-vars */
"use client";
import React, { useState, useEffect } from "react";
import { cn } from "@/lib/utils";

type InteractiveHoverButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement>

export const InteractiveHoverButton = React.forwardRef<
  HTMLButtonElement,
  InteractiveHoverButtonProps
>(({ children, className, ...props }, ref) => {
  // Initialize with null to prevent hydration mismatch
  const [isOnline, setIsOnline] = useState<boolean | null>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const updateOnlineStatus = () => {
      try {
        setIsOnline(navigator?.onLine ?? true);
      } catch (error) {
        // Fallback to true if navigator.onLine is not supported
        setIsOnline(true);
      }
    };

    // Set initial state and mounted flag
    setMounted(true);
    updateOnlineStatus();

    // Add event listeners
    window.addEventListener('online', updateOnlineStatus);
    window.addEventListener('offline', updateOnlineStatus);

    // Cleanup
    return () => {
      window.removeEventListener('online', updateOnlineStatus);
      window.removeEventListener('offline', updateOnlineStatus);
    };
  }, []);

  // Don't render anything until mounted to prevent hydration mismatch
  if (!mounted) {
    return (
      <button
        ref={ref}
        className={cn(
          "group relative w-auto cursor-pointer overflow-hidden rounded-full border bg-background p-2 px-5 text-center font-semibold",
          className,
        )}
        {...props}
      >
        <div className="flex items-center gap-2">
          <div className="h-2 w-2 rounded-full bg-gray-500 transition-all duration-300" />
          <span className="inline-block transition-all duration-300">
            Connecting...
          </span>
        </div>
      </button>
    );
  }

  return (
    <button
      ref={ref}
      className={cn(
        "group relative w-auto cursor-pointer overflow-hidden rounded-full border bg-background p-2 px-5 text-center font-semibold",
        className,
      )}
      {...props}
    >
      <div className="flex items-center gap-2">
        <div 
          className={cn(
            "h-2 w-2 rounded-full transition-all duration-300 group-hover:scale-[100.8]",
            isOnline ? "bg-[#198754]" : "bg-red-500"
          )}
        />
        <span className="inline-block transition-all duration-300 group-hover:z-50">
          {isOnline ? "Online" : "Offline"}
        </span>
      </div>
    </button>
  );
});

InteractiveHoverButton.displayName = "InteractiveHoverButton";