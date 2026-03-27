import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatDate(dateString: string): string {
  if (!dateString) return "Unknown"
  const date = new Date(dateString)
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  })
}

export function formatRuntime(minutes: number): string {
  if (!minutes) return "Unknown"
  const hours = Math.floor(minutes / 60)
  const mins = minutes % 60
  return hours > 0 ? `${hours}h ${mins}m` : `${mins}m`
}

export function formatRating(rating: number): string {
  return rating ? rating.toFixed(1) : "N/A"
}

export function getImageUrl(path: string, size: string = "w500"): string {
  if (!path) return "/placeholder-movie.svg"
  // If it's already a full URL, return it as is
  if (path.startsWith('http')) return path
  // Otherwise, construct the TMDB URL
  return `https://image.tmdb.org/t/p/${size}${path}`
}

export function getYouTubeUrl(key: string): string {
  return `https://www.youtube.com/embed/${key}`
}

export function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): { (...args: Parameters<T>): void; cancel: () => void } {
  let timeout: NodeJS.Timeout
  const debouncedFn = (...args: Parameters<T>) => {
    clearTimeout(timeout)
    timeout = setTimeout(() => func(...args), wait)
  }
  debouncedFn.cancel = () => {
    clearTimeout(timeout)
  }
  return debouncedFn
}

export function truncateText(text: string, maxLength: number): string {
  if (!text || text.length <= maxLength) return text
  return text.substring(0, maxLength) + "..."
}
