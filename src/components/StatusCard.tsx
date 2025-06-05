import { cn } from "@/lib/utils";
import { 
  Card, 
  CardContent, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { useState, useEffect } from "react";

interface StatusCardProps {
  title: string;
  value: string | number;
  description?: string;
  icon?: React.ReactNode;
  trend?: {
    value: number;
    positive: boolean;
  };
  className?: string;
  animated?: boolean;
}

// Componente de contador animado
function AnimatedCounter({ endValue, duration = 1500 }) {
  const [count, setCount] = useState(0);
  
  useEffect(() => {
    // Se o valor final não for um número, não animamos
    if (isNaN(Number(endValue))) {
      return;
    }
    
    let startTime;
    let animationFrame;
    
    const updateCount = (timestamp) => {
      if (!startTime) startTime = timestamp;
      const progress = timestamp - startTime;
      
      if (progress < duration) {
        const newCount = Math.floor((progress / duration) * Number(endValue));
        setCount(newCount);
        animationFrame = requestAnimationFrame(updateCount);
      } else {
        setCount(Number(endValue));
      }
    };
    
    animationFrame = requestAnimationFrame(updateCount);
    
    return () => {
      cancelAnimationFrame(animationFrame);
    };
  }, [endValue, duration]);
  
  // Se o valor não for um número simples, retornamos o original
  if (isNaN(Number(endValue)) || typeof endValue === 'string' && endValue.includes(',')) {
    return <div className="text-2xl font-bold">{endValue}</div>;
  }
  
  return <div className="text-2xl font-bold">{count}</div>;
}

export default function StatusCard({
  title,
  value,
  description,
  icon,
  trend,
  className,
  animated = false,
}: StatusCardProps) {
  return (
    <Card className={cn("overflow-hidden", className)}>
      <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
        <CardTitle className="text-sm font-medium text-muted-foreground">
          {title}
        </CardTitle>
        {icon && <div className="text-muted-foreground">{icon}</div>}
      </CardHeader>
      <CardContent>
        {animated ? (
          <AnimatedCounter endValue={value} />
        ) : (
          <div className="text-2xl font-bold">{value}</div>
        )}
        {description && (
          <p className="text-xs text-muted-foreground mt-1">{description}</p>
        )}
        {trend && (
          <div
            className={cn(
              "text-xs font-medium flex items-center mt-2",
              trend.positive ? "text-green-600" : "text-red-600"
            )}
          >
            {trend.positive ? (
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="h-3 w-3 mr-1"
              >
                <path d="m18 15-6-6-6 6" />
              </svg>
            ) : (
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="h-3 w-3 mr-1"
              >
                <path d="m6 9 6 6 6-6" />
              </svg>
            )}
            {trend.value}%{' '}
            <span className="ml-1">
              {trend.positive ? 'aumento' : 'queda'}
            </span>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
