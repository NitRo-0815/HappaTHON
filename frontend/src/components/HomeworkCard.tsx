import type { HomeworkItem } from '../types/homework'
import { formatDeadline } from '../utils/formatDate'

interface HomeworkCardProps {
  homework: HomeworkItem
}

// 宿題1件分を表示するカード
export function HomeworkCard({ homework }: HomeworkCardProps) {
  return (
    <div className="homework-card">
      <p className="homework-title">{homework.title}</p>
      <p className="homework-deadline">締切 {formatDeadline(homework.deadline)}</p>
      {homework.description && (
        <p className="homework-description">{homework.description}</p>
      )}
    </div>
  )
}
