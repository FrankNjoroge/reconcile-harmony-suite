
import React, { useState, useRef, useEffect } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { cn } from '@/lib/utils';

interface EnhancedTableProps {
  children: React.ReactNode;
  className?: string;
  stickyHeader?: boolean;
  swipeEnabled?: boolean;
}

const EnhancedTable: React.FC<EnhancedTableProps> = ({ 
  children, 
  className, 
  stickyHeader = true,
  swipeEnabled = true 
}) => {
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const [touchStart, setTouchStart] = useState<number | null>(null);
  const [touchEnd, setTouchEnd] = useState<number | null>(null);

  const checkScrollability = () => {
    if (scrollRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = scrollRef.current;
      setCanScrollLeft(scrollLeft > 0);
      setCanScrollRight(scrollLeft < scrollWidth - clientWidth - 1);
    }
  };

  useEffect(() => {
    checkScrollability();
    window.addEventListener('resize', checkScrollability);
    return () => window.removeEventListener('resize', checkScrollability);
  }, []);

  const scrollLeft = () => {
    if (scrollRef.current) {
      scrollRef.current.scrollBy({ left: -300, behavior: 'smooth' });
    }
  };

  const scrollRight = () => {
    if (scrollRef.current) {
      scrollRef.current.scrollBy({ left: 300, behavior: 'smooth' });
    }
  };

  // Touch handlers for swipe gestures
  const handleTouchStart = (e: React.TouchEvent) => {
    if (!swipeEnabled) return;
    setTouchEnd(null);
    setTouchStart(e.targetTouches[0].clientX);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!swipeEnabled) return;
    setTouchEnd(e.targetTouches[0].clientX);
  };

  const handleTouchEnd = () => {
    if (!swipeEnabled || !touchStart || !touchEnd) return;
    
    const distance = touchStart - touchEnd;
    const isLeftSwipe = distance > 50;
    const isRightSwipe = distance < -50;

    if (isLeftSwipe && canScrollRight) {
      scrollRight();
    }
    if (isRightSwipe && canScrollLeft) {
      scrollLeft();
    }
  };

  return (
    <div className="relative">
      {/* Scroll indicators for mobile */}
      {(canScrollLeft || canScrollRight) && (
        <div className="flex justify-between items-center mb-2 md:hidden">
          <Button
            variant="outline"
            size="sm"
            onClick={scrollLeft}
            disabled={!canScrollLeft}
            className="h-8"
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <span className="text-xs text-muted-foreground">
            Swipe to scroll horizontally
          </span>
          <Button
            variant="outline"
            size="sm"
            onClick={scrollRight}
            disabled={!canScrollRight}
            className="h-8"
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      )}

      <div
        ref={scrollRef}
        className={cn("relative w-full overflow-auto", className)}
        onScroll={checkScrollability}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        <Table>
          {React.Children.map(children, (child) => {
            if (React.isValidElement(child) && child.type === TableHeader) {
              const headerElement = child as React.ReactElement<React.ComponentProps<typeof TableHeader>>;
              return React.cloneElement(headerElement, {
                ...headerElement.props,
                className: cn(
                  headerElement.props.className,
                  stickyHeader && "sticky top-0 bg-background/95 backdrop-blur z-10 border-b-2"
                )
              });
            }
            if (React.isValidElement(child) && child.type === TableBody) {
              const bodyElement = child as React.ReactElement<React.ComponentProps<typeof TableBody>>;
              return React.cloneElement(bodyElement, {
                ...bodyElement.props,
                children: React.Children.map(bodyElement.props.children, (row, index) => {
                  if (React.isValidElement(row) && row.type === TableRow) {
                    const rowElement = row as React.ReactElement<React.ComponentProps<typeof TableRow>>;
                    return React.cloneElement(rowElement, {
                      ...rowElement.props,
                      className: cn(
                        rowElement.props.className,
                        "hover:bg-muted/50 transition-colors cursor-pointer",
                        "focus-within:bg-muted/70 focus-within:ring-2 focus-within:ring-primary/20"
                      )
                    });
                  }
                  return row;
                })
              });
            }
            return child;
          })}
        </Table>
      </div>
    </div>
  );
};

export { EnhancedTable, Table as BaseTable, TableBody, TableCell, TableHead, TableHeader, TableRow };
