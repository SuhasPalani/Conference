// FILE: frontend/src/lib/utils.ts
import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatDate(date: string | Date) {
  return new Date(date).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}

export function getTimeAgo(date: string | Date) {
  const seconds = Math.floor((new Date().getTime() - new Date(date).getTime()) / 1000);
  
  const intervals = {
    year: 31536000,
    month: 2592000,
    week: 604800,
    day: 86400,
    hour: 3600,
    minute: 60,
  };

  for (const [unit, secondsInUnit] of Object.entries(intervals)) {
    const interval = Math.floor(seconds / secondsInUnit);
    if (interval >= 1) {
      return `${interval} ${unit}${interval !== 1 ? 's' : ''} ago`;
    }
  }

  return 'just now';
}

export function truncate(str: string, length: number) {
  return str.length > length ? str.substring(0, length) + '...' : str;
}

export function getStatusColor(status: string) {
  const colors: Record<string, string> = {
    draft: 'bg-gray-500',
    submitted: 'bg-blue-500',
    under_review: 'bg-yellow-500',
    approved: 'bg-green-500',
    rejected: 'bg-red-500',
    pending: 'bg-yellow-500',
    completed: 'bg-green-500',
  };
  return colors[status] || 'bg-gray-500';
}

export function getStatusText(status: string) {
  return status
    .split('_')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}

export function calculateAverageScore(scores: any) {
  const { innovation, feasibility, impact, presentation } = scores;
  return ((innovation + feasibility + impact + presentation) / 4).toFixed(1);
}