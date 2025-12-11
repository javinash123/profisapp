import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import { Plus, Minus, Edit2, AlertTriangle } from 'lucide-react';
import { Net, useMatchStore } from '@/lib/store';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';

interface NetTileProps {
  net: Net;
  onEdit: (netId: number) => void;
  onAdd: (amount: number) => void;
  onSubtract: (amount: number) => void;
}

export function NetTile({ net, onEdit, onAdd, onSubtract }: NetTileProps) {
  const { unit, fieldMode } = useMatchStore();
  
  const percentage = Math.min(100, (net.weight / net.capacity) * 100);
  
  // Color logic from spec
  let statusColor = "bg-emerald-500"; // Success < 80%
  let textColor = "text-emerald-400";
  let borderColor = "border-white/10";
  
  if (percentage >= 95) {
    statusColor = "bg-[#E74C3C]"; // Danger
    textColor = "text-[#E74C3C]";
    borderColor = "border-[#E74C3C]";
  } else if (percentage >= 80) {
    statusColor = "bg-[#FFC857]"; // Warning
    textColor = "text-[#FFC857]";
    borderColor = "border-[#FFC857]/50";
  }

  return (
    <motion.div 
      layout
      className={cn(
        "relative rounded-xl border p-3 flex flex-col gap-2 overflow-hidden",
        "bg-card transition-colors",
        borderColor,
        percentage >= 95 && "animate-pulse border-2 shadow-[0_0_15px_rgba(231,76,60,0.3)]"
      )}
    >
      <div className="flex justify-between items-center">
        <span className="text-sm font-medium text-muted-foreground">NET {net.id}</span>
        <Button 
          variant="ghost" 
          size="icon" 
          className="h-6 w-6 text-muted-foreground hover:text-white"
          onClick={() => onEdit(net.id)}
        >
          <Edit2 className="h-3 w-3" />
        </Button>
      </div>

      <div className="flex-1 flex flex-col justify-center items-center py-2">
        <span className={cn("text-4xl font-bold font-mono tracking-tighter", textColor)}>
          {net.weight.toFixed(2)}
          <span className="text-sm ml-1 text-muted-foreground font-sans">{unit}</span>
        </span>
        <span className="text-xs text-muted-foreground mt-1">
          Max: {net.capacity} {unit}
        </span>
      </div>

      <Progress value={percentage} className="h-2 bg-white/5" indicatorClassName={statusColor} />

      <div className="grid grid-cols-2 gap-2 mt-2">
        <Button 
          variant="outline" 
          className={cn(
            "h-12 bg-white/5 border-transparent hover:bg-white/10 active:scale-95 transition-all font-mono text-lg font-bold",
            fieldMode && "border-white/20"
          )}
          onClick={() => onSubtract(1)}
        >
          <Minus className="h-5 w-5 mr-1" /> 1
        </Button>
        <Button 
          className={cn(
            "h-12 bg-primary text-primary-foreground hover:bg-primary/90 active:scale-95 transition-all font-mono text-lg font-bold shadow-lg shadow-primary/20",
            fieldMode && "border-2 border-white"
          )}
          onClick={() => onAdd(1)}
        >
          <Plus className="h-5 w-5 mr-1" /> 1
        </Button>
      </div>
    </motion.div>
  );
}
