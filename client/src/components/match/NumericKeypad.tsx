import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Delete, Check, X } from 'lucide-react';
import { cn } from '@/lib/utils';

interface NumericKeypadProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (value: number) => void;
  initialValue?: number;
  title?: string;
}

export function NumericKeypad({ isOpen, onClose, onConfirm, initialValue = 0, title }: NumericKeypadProps) {
  const [value, setValue] = useState(initialValue.toString());

  useEffect(() => {
    if (isOpen) setValue(initialValue.toString());
  }, [isOpen, initialValue]);

  const handlePress = (num: string) => {
    if (value === '0' && num !== '.') {
      setValue(num);
    } else {
      setValue(prev => prev + num);
    }
  };

  const handleBackspace = () => {
    setValue(prev => prev.slice(0, -1) || '0');
  };

  const handleClear = () => {
    setValue('0');
  };

  const handleSubmit = () => {
    onConfirm(parseFloat(value));
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-md bg-card border-white/10 p-0 overflow-hidden gap-0">
        <div className="p-6 bg-black/20 text-center border-b border-white/5">
          {title && <h3 className="text-sm font-medium text-muted-foreground mb-2">{title}</h3>}
          <div className="text-5xl font-mono font-bold text-white tracking-wider">
            {value}
          </div>
        </div>
        
        <div className="grid grid-cols-3 gap-1 p-4 bg-card">
          {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((num) => (
            <Button
              key={num}
              variant="secondary"
              className="h-16 text-2xl font-bold rounded-lg bg-secondary/50 hover:bg-secondary"
              onClick={() => handlePress(num.toString())}
            >
              {num}
            </Button>
          ))}
          <Button
            variant="secondary"
            className="h-16 text-2xl font-bold rounded-lg bg-secondary/50 hover:bg-secondary"
            onClick={() => handlePress('.')}
          >
            .
          </Button>
          <Button
            variant="secondary"
            className="h-16 text-2xl font-bold rounded-lg bg-secondary/50 hover:bg-secondary"
            onClick={() => handlePress('0')}
          >
            0
          </Button>
          <Button
            variant="ghost"
            className="h-16 text-2xl font-bold rounded-lg hover:bg-red-500/20 text-red-400"
            onClick={handleBackspace}
          >
            <Delete className="h-6 w-6" />
          </Button>
        </div>

        <div className="grid grid-cols-2 gap-4 p-4 pt-0">
          <Button variant="outline" className="h-14 text-lg border-white/10" onClick={onClose}>
            Cancel
          </Button>
          <Button className="h-14 text-lg bg-primary text-primary-foreground hover:bg-primary/90" onClick={handleSubmit}>
            <Check className="mr-2 h-5 w-5" /> Set
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
