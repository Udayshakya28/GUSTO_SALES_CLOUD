import { cn } from "@/lib/utils";
import { useState, useEffect, useRef } from "react";

// Particles Component (Customized for Orange Shades)
interface MousePosition {
    x: number;
    y: number;
  }
  
  function MousePosition(): MousePosition {
    const [mousePosition, setMousePosition] = useState<MousePosition>({
      x: 0,
      y: 0,
    });
  
    useEffect(() => {
      const handleMouseMove = (event: MouseEvent) => {
        setMousePosition({ x: event.clientX, y: event.clientY });
      };
  
      window.addEventListener("mousemove", handleMouseMove);
  
      return () => {
        window.removeEventListener("mousemove", handleMouseMove);
      };
    }, []);
  
    return mousePosition;
  }
  
  interface ParticlesProps extends React.ComponentPropsWithoutRef<"div"> {
    className?: string;
    quantity?: number;
    staticity?: number;
    ease?: number;
    size?: number;
    refresh?: boolean;
    vx?: number;
    vy?: number;
  }
  
  type Circle = {
    x: number;
    y: number;
    translateX: number;
    translateY: number;
    size: number;
    alpha: number;
    targetAlpha: number;
    dx: number;
    dy: number;
    magnetism: number;
    color: string;
  };
  
  export  const Particles: React.FC<ParticlesProps> = ({
    className = "",
    quantity = 200, // Increased default quantity
    staticity = 30, // Reduced staticity for more movement
    ease = 30, // Reduced ease for more responsive movement
    size = 0.8, // Slightly larger particles
    refresh = false,
    vx = 0,
    vy = 0,
    ...props
  }) => {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const canvasContainerRef = useRef<HTMLDivElement>(null);
    const context = useRef<CanvasRenderingContext2D | null>(null);
    const circles = useRef<Circle[]>([]);
    const mousePosition = MousePosition();
    const mouse = useRef<{ x: number; y: number }>({ x: 0, y: 0 });
    const canvasSize = useRef<{ w: number; h: number }>({ w: 0, h: 0 });
    const dpr = typeof window !== "undefined" ? window.devicePixelRatio : 1;
    const rafID = useRef<number | null>(null);
    const resizeTimeout = useRef<NodeJS.Timeout | null>(null);
  
    // Enhanced function to generate random orange shades with more variety
    const getRandomOrangeRgb = () => {
      const baseColors = [
        [255, 69, 0],    // Red-orange
        [255, 140, 0],   // Dark orange
        [255, 165, 0],   // Orange
        [255, 99, 71],   // Tomato
        [255, 127, 80],  // Coral
      ];
      
      const baseColor = baseColors[Math.floor(Math.random() * baseColors.length)];
      const variation = Math.floor(Math.random() * 40) - 20; // Vary by ±20
      
      const r = Math.min(255, Math.max(0, baseColor[0] + variation));
      const g = Math.min(255, Math.max(0, baseColor[1] + variation));
      const b = Math.min(255, Math.max(0, baseColor[2] + variation));
      
      return `rgb(${r}, ${g}, ${b})`;
    };
  
    useEffect(() => {
      if (canvasRef.current) {
        context.current = canvasRef.current.getContext("2d");
      }
      initCanvas();
      animate();
  
      const handleResize = () => {
        if (resizeTimeout.current) {
          clearTimeout(resizeTimeout.current);
        }
        resizeTimeout.current = setTimeout(() => {
          initCanvas();
        }, 200);
      };
  
      window.addEventListener("resize", handleResize);
  
      return () => {
        if (rafID.current != null) {
          window.cancelAnimationFrame(rafID.current);
        }
        if (resizeTimeout.current) {
          clearTimeout(resizeTimeout.current);
        }
        window.removeEventListener("resize", handleResize);
      };
    }, [refresh]);
  
    useEffect(() => {
      onMouseMove();
    }, [mousePosition.x, mousePosition.y]);
  
    const initCanvas = () => {
      resizeCanvas();
      drawParticles();
    };
  
    const onMouseMove = () => {
      if (canvasRef.current) {
        const rect = canvasRef.current.getBoundingClientRect();
        const { w, h } = canvasSize.current;
        const x = mousePosition.x - rect.left - w / 2;
        const y = mousePosition.y - rect.top - h / 2;
        const inside = x < w / 2 && x > -w / 2 && y < h / 2 && y > -h / 2;
        if (inside) {
          mouse.current.x = x;
          mouse.current.y = y;
        }
      }
    };
  
    const resizeCanvas = () => {
      if (canvasContainerRef.current && canvasRef.current && context.current) {
        canvasSize.current.w = canvasContainerRef.current.offsetWidth;
        canvasSize.current.h = canvasContainerRef.current.offsetHeight;
  
        canvasRef.current.width = canvasSize.current.w * dpr;
        canvasRef.current.height = canvasSize.current.h * dpr;
        canvasRef.current.style.width = `${canvasSize.current.w}px`;
        canvasRef.current.style.height = `${canvasSize.current.h}px`;
        context.current.scale(dpr, dpr);
  
        // Clear existing particles and create new ones with exact quantity
        circles.current = [];
        for (let i = 0; i < quantity; i++) {
          const circle = circleParams();
          drawCircle(circle);
        }
      }
    };
  
    const circleParams = (): Circle => {
      const x = Math.floor(Math.random() * canvasSize.current.w);
      const y = Math.floor(Math.random() * canvasSize.current.h);
      const translateX = 0;
      const translateY = 0;
      // Increased size variation
      const pSize = Math.floor(Math.random() * 3) + size;
      const alpha = 0;
      // Increased target alpha for more visible particles
      const targetAlpha = parseFloat((Math.random() * 0.8 + 0.2).toFixed(1));
      // Increased speed range for more dynamic movement
      const dx = (Math.random() - 0.5) * 0.3;
      const dy = (Math.random() - 0.5) * 0.3;
      // Increased magnetism for stronger mouse interaction
      const magnetism = 0.2 + Math.random() * 6;
      const color = getRandomOrangeRgb();
      
      return {
        x,
        y,
        translateX,
        translateY,
        size: pSize,
        alpha,
        targetAlpha,
        dx,
        dy,
        magnetism,
        color,
      };
    };
  
    const drawCircle = (circle: Circle, update = false) => {
      if (context.current) {
        const { x, y, translateX, translateY, size, alpha, color } = circle;
        context.current.translate(translateX, translateY);
        context.current.beginPath();
        context.current.arc(x, y, size, 0, 2 * Math.PI);
        context.current.fillStyle = `${color.slice(0, -1)}, ${alpha})`;
        context.current.fill();
        context.current.setTransform(dpr, 0, 0, dpr, 0, 0);
  
        if (!update) {
          circles.current.push(circle);
        }
      }
    };
  
    const clearContext = () => {
      if (context.current) {
        context.current.clearRect(
          0,
          0,
          canvasSize.current.w,
          canvasSize.current.h,
        );
      }
    };
  
    const drawParticles = () => {
      clearContext();
      const particleCount = quantity;
      for (let i = 0; i < particleCount; i++) {
        const circle = circleParams();
        drawCircle(circle);
      }
    };
  
    const remapValue = (
      value: number,
      start1: number,
      end1: number,
      start2: number,
      end2: number,
    ): number => {
      const remapped =
        ((value - start1) * (end2 - start2)) / (end1 - start1) + start2;
      return remapped > 0 ? remapped : 0;
    };
  
    const animate = () => {
      clearContext();
      circles.current.forEach((circle: Circle, i: number) => {
        // Handle the alpha value
        const edge = [
          circle.x + circle.translateX - circle.size,
          canvasSize.current.w - circle.x - circle.translateX - circle.size,
          circle.y + circle.translateY - circle.size,
          canvasSize.current.h - circle.y - circle.translateY - circle.size,
        ];
        const closestEdge = edge.reduce((a, b) => Math.min(a, b));
        const remapClosestEdge = parseFloat(
          remapValue(closestEdge, 0, 20, 0, 1).toFixed(2),
        );
        
        if (remapClosestEdge > 1) {
          // Faster alpha transition
          circle.alpha += 0.04;
          if (circle.alpha > circle.targetAlpha) {
            circle.alpha = circle.targetAlpha;
          }
        } else {
          circle.alpha = circle.targetAlpha * remapClosestEdge;
        }
        
        // Enhanced movement with more dynamic speed
        circle.x += circle.dx + vx * 1.5;
        circle.y += circle.dy + vy * 1.5;
        
        // More responsive mouse interaction
        circle.translateX +=
          (mouse.current.x / (staticity / circle.magnetism) - circle.translateX) /
          ease;
        circle.translateY +=
          (mouse.current.y / (staticity / circle.magnetism) - circle.translateY) /
          ease;
  
        drawCircle(circle, true);
  
        // Respawn particles that go out of bounds
        if (
          circle.x < -circle.size ||
          circle.x > canvasSize.current.w + circle.size ||
          circle.y < -circle.size ||
          circle.y > canvasSize.current.h + circle.size
        ) {
          circles.current.splice(i, 1);
          const newCircle = circleParams();
          drawCircle(newCircle);
        }
      });
      rafID.current = window.requestAnimationFrame(animate);
    };
  
    return (
      <div
        className={cn("pointer-events-none absolute inset-0 z-0", className)}
        ref={canvasContainerRef}
        aria-hidden="true"
        {...props}
      >
        <canvas ref={canvasRef} className="size-full" />
      </div>
    );
  };