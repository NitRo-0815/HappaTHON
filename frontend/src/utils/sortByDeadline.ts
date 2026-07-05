import type { HomeworkItem } from '../types/homework'

// 締切日（ISO形式 YYYY-MM-DD）が近い順に並び替える。
// 期限未定（空文字）は末尾に回す。
export function sortByDeadline(items: HomeworkItem[]): HomeworkItem[] {
  return [...items].sort((a, b) => {
    const da = a.deadline || '9999-12-31'
    const db = b.deadline || '9999-12-31'
    return da.localeCompare(db)
  })
}
