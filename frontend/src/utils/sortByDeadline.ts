import type { HomeworkItem } from '../types/homework'

// 締切日（ISO形式 YYYY-MM-DD）が近い順に並び替える
export function sortByDeadline(items: HomeworkItem[]): HomeworkItem[] {
  return [...items].sort((a, b) => a.deadline.localeCompare(b.deadline))
}
