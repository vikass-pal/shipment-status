/**
 * Format date string into readable format (e.g. 'Sep 20, 2026, 09:30 AM')
 */
export function formatDate(dateString: string): string {
  if (!dateString) return 'N/A';
  const date = new Date(dateString);
  if (isNaN(date.getTime())) return dateString;

  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(date);
}

/**
 * Format date into concise date-only format (e.g. 'Sep 24, 2026')
 */
export function formatDateOnly(dateString: string): string {
  if (!dateString) return 'N/A';
  const date = new Date(dateString);
  if (isNaN(date.getTime())) return dateString;

  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  }).format(date);
}

/**
 * Returns relative days badge info for expected delivery dates
 */
export function getRelativeDeliveryInfo(dateString: string): { label: string; isOverdue: boolean } {
  if (!dateString) return { label: 'Date pending', isOverdue: false };
  const target = new Date(dateString);

  // Reset hours for day comparison
  target.setHours(0, 0, 0, 0);
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const diffTime = target.getTime() - today.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

  if (diffDays < 0) {
    return { label: `${Math.abs(diffDays)} day${Math.abs(diffDays) > 1 ? 's' : ''} past due`, isOverdue: true };
  } else if (diffDays === 0) {
    return { label: 'Due today', isOverdue: false };
  } else if (diffDays === 1) {
    return { label: 'Due tomorrow', isOverdue: false };
  } else {
    return { label: `Due in ${diffDays} days`, isOverdue: false };
  }
}
