import { useState, type FormEvent } from 'react'
import type { HomeworkItem } from '../types/homework'
import { DatePicker } from './DatePicker'
import '../styles/AddHomeworkModal.css'

interface AddHomeworkModalProps {
  onClose: () => void
  onAdd: (homework: HomeworkItem) => void
}

interface FormErrors {
  title?: string
  deadline?: string
}

// 「＋追加」ボタンから開く、宿題追加用のモーダル
export function AddHomeworkModal({ onClose, onAdd }: AddHomeworkModalProps) {
  const [title, setTitle] = useState('')
  const [deadline, setDeadline] = useState('')
  const [description, setDescription] = useState('')
  const [errors, setErrors] = useState<FormErrors>({})

  function handleSubmit(e: FormEvent) {
    e.preventDefault()

    const nextErrors: FormErrors = {}
    if (title.trim() === '') nextErrors.title = 'タスク名を入力してください'
    if (deadline.trim() === '') nextErrors.deadline = '期限を入力してください'

    if (Object.keys(nextErrors).length > 0) {
      setErrors(nextErrors)
      return
    }

    onAdd({
      id: `hw-${Date.now()}`,
      title: title.trim(),
      deadline: deadline.trim(),
      description: description.trim() || undefined,
    })
  }

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <h2 className="modal-title">宿題を追加</h2>
        <form onSubmit={handleSubmit} noValidate>
          <div className="form-field">
            <label htmlFor="homework-title">タスク名</label>
            <input
              id="homework-title"
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              autoFocus
            />
            {errors.title && <p className="form-error">{errors.title}</p>}
          </div>

          <div className="form-field">
            <label htmlFor="homework-deadline">期限</label>
            <DatePicker
              id="homework-deadline"
              value={deadline}
              onChange={setDeadline}
            />
            {errors.deadline && <p className="form-error">{errors.deadline}</p>}
          </div>

          <div className="form-field">
            <label htmlFor="homework-description">概要（任意）</label>
            <textarea
              id="homework-description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>

          <div className="modal-actions">
            <button
              type="button"
              className="modal-button-secondary"
              onClick={onClose}
            >
              キャンセル
            </button>
            <button type="submit" className="modal-button-primary">
              追加
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
