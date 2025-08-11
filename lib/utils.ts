import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"
import { format, isToday, isTomorrow, isYesterday } from "date-fns"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatDate(date: Date): string {
  if (isToday(date)) {
    return "Today"
  } else if (isTomorrow(date)) {
    return "Tomorrow"
  } else if (isYesterday(date)) {
    return "Yesterday"
  } else {
    return format(date, "MMM dd, yyyy")
  }
}

export function formatTime(date: Date): string {
  return format(date, "h:mm a")
}

export function formatDateTime(date: Date): string {
  return format(date, "MMM dd, yyyy 'at' h:mm a")
}

export function formatDuration(startTime: Date, endTime: Date): string {
  const start = format(startTime, "h:mm a")
  const end = format(endTime, "h:mm a")
  return `${start} - ${end}`
}

export function formatTimeSafe(timeValue: any): string {
  if (!timeValue) return '--';
  
  if (timeValue instanceof Date) {
    return format(timeValue, "h:mm a");
  }
  
  if (typeof timeValue === 'string') {
    // Handle string time formats like "14:30" or "2:30 PM"
    if (timeValue.includes(':')) {
      return timeValue;
    }
    // Try to parse as date string
    const date = new Date(timeValue);
    if (!isNaN(date.getTime())) {
      return format(date, "h:mm a");
    }
  }
  
  if (timeValue?.toDate) {
    // Handle Firestore Timestamp
    return format(timeValue.toDate(), "h:mm a");
  }
  
  return '--';
}

export function formatTimeRange(startTime: any, endTime: any): string {
  const start = formatTimeSafe(startTime);
  const end = formatTimeSafe(endTime);
  return `${start} - ${end}`;
}

export function getStatusColor(status: string): string {
  switch (status) {
    case 'active':
    case 'confirmed':
    case 'checked-in':
    case 'success':
      return 'text-success-600 bg-success-50 border-success-200'
    case 'warning':
    case 'pending':
      return 'text-warning-600 bg-warning-50 border-warning-200'
    case 'error':
    case 'cancelled':
    case 'no-show':
      return 'text-danger-600 bg-danger-50 border-danger-200'
    case 'draft':
    case 'scheduled':
      return 'text-gray-600 bg-gray-50 border-gray-200'
    default:
      return 'text-gray-600 bg-gray-50 border-gray-200'
  }
}

export function getStatusBadgeColor(status: string): string {
  switch (status) {
    case 'active':
    case 'confirmed':
    case 'checked-in':
    case 'success':
      return 'bg-success-100 text-success-800'
    case 'warning':
    case 'pending':
      return 'bg-warning-100 text-warning-800'
    case 'error':
    case 'cancelled':
    case 'no-show':
      return 'bg-danger-100 text-danger-800'
    case 'draft':
    case 'scheduled':
      return 'bg-gray-100 text-gray-800'
    default:
      return 'bg-gray-100 text-gray-800'
  }
} 