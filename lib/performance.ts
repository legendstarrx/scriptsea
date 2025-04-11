export const measurePerformance = (label: string) => {
  if (typeof window !== 'undefined') {
    const start = performance.now();
    return () => {
      const duration = performance.now() - start;
      console.log(`${label} took ${duration.toFixed(2)}ms`);
    };
  }
  return () => {};
}; 