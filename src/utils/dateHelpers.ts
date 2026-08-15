export function getRelativeTimeSpan(targetDate: string): string {
  const diff = new Date(targetDate).getTime() - Date.now();
  const days = Math.ceil(diff / (1000 * 60 * 60 * 24));
  if (days < 0) return `${Math.abs(days)} days overdue`;
  if (days === 0) return "Due today";
  return `Due in ${days} days`;
}
