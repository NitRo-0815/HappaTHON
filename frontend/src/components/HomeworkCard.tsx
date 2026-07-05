import type { HomeworkItem } from '../types/homework'

interface HomeworkCardProps {
  homework: HomeworkItem
}

// 宿題1件分を表示するカード
export function HomeworkCard({ homework }: HomeworkCardProps) {
  return (
    <div className="homework-card">
      <p className="homework-title">{homework.title}</p>
      <p className="homework-deadline">締切 {homework.deadline}</p>
    </div>
  )
}
