// Performance monitoring utility to prevent CPU overheating
export class PerformanceMonitor {
  private static startTime: number = 0;
  private static memoryBaseline: number = 0;
  
  static startMonitoring(): void {
    this.startTime = performance.now();
    if ('memory' in performance) {
      this.memoryBaseline = (performance as any).memory.usedJSHeapSize;
    }
  }
  
  static getMetrics(): {
    duration: number;
    memoryUsed: number;
    cpuUsage: string;
  } {
    const duration = performance.now() - this.startTime;
    let memoryUsed = 0;
    
    if ('memory' in performance) {
      const currentMemory = (performance as any).memory.usedJSHeapSize;
      memoryUsed = currentMemory - this.memoryBaseline;
    }
    
    return {
      duration,
      memoryUsed,
      cpuUsage: duration > 100 ? 'HIGH' : duration > 50 ? 'MEDIUM' : 'LOW'
    };
  }
  
  static logMetrics(operation: string): void {
    const metrics = this.getMetrics();
    console.log(`Performance [${operation}]:`, {
      duration: `${metrics.duration.toFixed(2)}ms`,
      memory: `${(metrics.memoryUsed / 1024 / 1024).toFixed(2)}MB`,
      cpuUsage: metrics.cpuUsage
    });
    
    // Alert if performance is concerning
    if (metrics.duration > 1000) {
      console.warn(`⚠️ Slow operation detected: ${operation} took ${metrics.duration.toFixed(2)}ms`);
    }
    
    if (metrics.memoryUsed > 100 * 1024 * 1024) { // 100MB
      console.warn(`⚠️ High memory usage: ${operation} used ${(metrics.memoryUsed / 1024 / 1024).toFixed(2)}MB`);
    }
  }
  
  static clearMemory(): void {
    // Force garbage collection if available (Chrome DevTools)
    if ((window as any).gc) {
      (window as any).gc();
      console.log('🗑️ Forced garbage collection');
    }
    
    // Clear any large cached data
    try {
      const caches = ['reconciliation-cache', 'transaction-cache', 'export-cache'];
      caches.forEach(cache => {
        sessionStorage.removeItem(cache);
        localStorage.removeItem(cache);
      });
    } catch (error) {
      console.warn('Could not clear cache:', error);
    }
  }
  
  static throttle<T extends (...args: any[]) => any>(
    func: T,
    delay: number
  ): (...args: Parameters<T>) => Promise<ReturnType<T>> {
    let timeoutId: NodeJS.Timeout | null = null;
    let lastArgs: Parameters<T>;
    
    return (...args: Parameters<T>): Promise<ReturnType<T>> => {
      lastArgs = args;
      
      return new Promise((resolve) => {
        if (timeoutId) {
          clearTimeout(timeoutId);
        }
        
        timeoutId = setTimeout(() => {
          resolve(func(...lastArgs));
          timeoutId = null;
        }, delay);
      });
    };
  }
  
  static async withYield<T>(operation: () => T): Promise<T> {
    // Yield control to the browser
    await new Promise(resolve => setTimeout(resolve, 0));
    return operation();
  }
}

// Memory leak detection
export class MemoryLeakDetector {
  private static intervals: NodeJS.Timeout[] = [];
  private static eventListeners: Array<{
    element: EventTarget;
    event: string;
    handler: EventListener;
  }> = [];
  
  static addInterval(interval: NodeJS.Timeout): void {
    this.intervals.push(interval);
  }
  
  static addEventListener(
    element: EventTarget, 
    event: string, 
    handler: EventListener
  ): void {
    this.eventListeners.push({ element, event, handler });
    element.addEventListener(event, handler);
  }
  
  static cleanup(): void {
    // Clear all intervals
    this.intervals.forEach(interval => clearInterval(interval));
    this.intervals.length = 0;
    
    // Remove all event listeners
    this.eventListeners.forEach(({ element, event, handler }) => {
      element.removeEventListener(event, handler);
    });
    this.eventListeners.length = 0;
    
    console.log('🧹 Memory leak cleanup completed');
  }
}