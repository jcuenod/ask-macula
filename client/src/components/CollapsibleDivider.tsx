import React, { useState, useEffect, useRef } from "react";

interface CollapsibleDividerProps {
  onToggleClick: () => void;
  onDrag: (clientX: number) => void;
  onDragEnd: () => void;
}

const CLICK_THRESHOLD_PIXELS = 5; // Max mouse movement to be considered a click

export function CollapsibleDivider({
  onToggleClick,
  onDrag,
  onDragEnd,
}: CollapsibleDividerProps) {
  const [isDragging, setIsDragging] = useState(false);
  const dragStartClientX = useRef<number>(0);

  const handleMouseDown = (event: React.MouseEvent<HTMLDivElement>) => {
    event.preventDefault();
    dragStartClientX.current = event.clientX;
    setIsDragging(true); // Set dragging true immediately for visual feedback if any
  };

  useEffect(() => {
    const handleMouseMove = (event: MouseEvent) => {
      if (isDragging) {
        onDrag(event.clientX);
      }
    };

    const handleMouseUp = (event: MouseEvent) => {
      if (isDragging) {
        if (
          Math.abs(event.clientX - dragStartClientX.current) <
          CLICK_THRESHOLD_PIXELS
        ) {
          onToggleClick(); // It's a click
        } else {
          onDragEnd(); // It was a drag
        }
        setIsDragging(false);
      }
    };

    if (isDragging) {
      window.addEventListener("mousemove", handleMouseMove);
      window.addEventListener("mouseup", handleMouseUp);
    }

    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", handleMouseUp);
    };
  }, [isDragging, onDrag, onDragEnd, onToggleClick]);

  return (
    <div
      onMouseDown={handleMouseDown}
      className={`w-1 h-full cursor-col-resize bg-border transition-colors duration-200 h-screen sticky top-0 ${
        isDragging ? "bg-primary" : "hover:bg-muted-foreground/20"
      }`}
      role="separator"
      aria-label="Toggle or resize sidebar"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          onToggleClick();
        }
      }}
    />
  );
}
