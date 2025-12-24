// Temporary fallback: browser alert for toast
export function toast({ title, description }: { title: string; description?: string }) {
  alert(title + (description ? `\n${description}` : ""));
}
