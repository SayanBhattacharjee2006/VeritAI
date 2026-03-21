// Animation delays for staggered animations
export const animationDelays = {
  sm: 0.1,
  md: 0.15,
  lg: 0.2,
};

// Common animation variants
export const fadeInVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: (i = 0) => ({
    opacity: 1,
    y: 0,
    transition: {
      delay: i * 0.1,
    },
  }),
};

export const slideInVariants = {
  hidden: { opacity: 0, x: -20 },
  visible: (i = 0) => ({
    opacity: 1,
    x: 0,
    transition: {
      delay: i * 0.1,
    },
  }),
};

export const scaleInVariants = {
  hidden: { opacity: 0, scale: 0.9 },
  visible: {
    opacity: 1,
    scale: 1,
    transition: { duration: 0.3 },
  },
};

// Format confidence percentage
export function formatConfidence(confidence: number): string {
  return `${Math.round(confidence)}%`;
}

// Format date to readable format
export function formatDate(date: Date | string): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  return d.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}

// Truncate text with ellipsis
export function truncateText(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength) + '...';
}

// Get verdict color
export function getVerdictColor(verdict: 'TRUE' | 'FALSE' | 'MIXED'): string {
  switch (verdict) {
    case 'TRUE':
      return 'text-success';
    case 'FALSE':
      return 'text-destructive';
    case 'MIXED':
      return 'text-warning';
    default:
      return 'text-muted-foreground';
  }
}

// Get verdict background color
export function getVerdictBgColor(verdict: 'TRUE' | 'FALSE' | 'MIXED'): string {
  switch (verdict) {
    case 'TRUE':
      return 'bg-success/20';
    case 'FALSE':
      return 'bg-destructive/20';
    case 'MIXED':
      return 'bg-warning/20';
    default:
      return 'bg-muted';
  }
}

// Debounce function
export function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout;
  return (...args: Parameters<T>) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
}

// Generate mock processing steps for demo
export const processingSteps = [
  'Parsing claims from source...',
  'Extracting key phrases...',
  'Searching evidence database...',
  'Cross-referencing sources...',
  'Analyzing sentiment...',
  'Calculating confidence scores...',
  'Generating report...',
];
