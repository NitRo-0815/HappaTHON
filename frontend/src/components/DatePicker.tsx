import { useState } from 'react'
import '../styles/DatePicker.css'

interface DatePickerProps {
  id?: string
  value: string
  onChange: (value: string) => void
}

const WEEKDAY_LABELS = ['日', '月', '火', '水', '木', '金', '土']

function pad(n: number) {
  return String(n).padStart(2, '0')
}

function toIsoDate(year: number, month: number, day: number) {
  return `${year}-${pad(month + 1)}-${pad(day)}`
}

function parseIsoDate(value: string) {
  if (!value) return null
  const [year, month, day] = value.split('-').map(Number)
  return { year, month: month - 1, day }
}

// クリックで開くカレンダーから日付を選択する、手入力なしの日付選択欄
// 値は常に "YYYY-MM-DD" 形式で親コンポーネントへ渡す
export function DatePicker({ id, value, onChange }: DatePickerProps) {
  const selected = parseIsoDate(value)
  const today = new Date()
  const [isOpen, setIsOpen] = useState(false)
  const [viewYear, setViewYear] = useState(selected?.year ?? today.getFullYear())
  const [viewMonth, setViewMonth] = useState(selected?.month ?? today.getMonth())

  function toggleCalendar() {
    if (!isOpen && selected) {
      setViewYear(selected.year)
      setViewMonth(selected.month)
    }
    setIsOpen((current) => !current)
  }

  function goPrevMonth() {
    if (viewMonth === 0) {
      setViewYear(viewYear - 1)
      setViewMonth(11)
    } else {
      setViewMonth(viewMonth - 1)
    }
  }

  function goNextMonth() {
    if (viewMonth === 11) {
      setViewYear(viewYear + 1)
      setViewMonth(0)
    } else {
      setViewMonth(viewMonth + 1)
    }
  }

  function selectDay(day: number) {
    onChange(toIsoDate(viewYear, viewMonth, day))
    setIsOpen(false)
  }

  const firstWeekday = new Date(viewYear, viewMonth, 1).getDay()
  const daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate()
  const leadingBlanks = Array.from({ length: firstWeekday }, (_, i) => -1 - i)
  const days = Array.from({ length: daysInMonth }, (_, i) => i + 1)

  return (
    <div className="date-picker">
      <button
        type="button"
        id={id}
        className="date-picker-trigger"
        onClick={toggleCalendar}
      >
        {value || '日付を選択'}
      </button>

      {isOpen && (
        <div className="date-picker-calendar">
          <div className="date-picker-header">
            <button type="button" onClick={goPrevMonth} aria-label="前の月へ">
              ‹
            </button>
            <span>
              {viewYear}年{viewMonth + 1}月
            </span>
            <button type="button" onClick={goNextMonth} aria-label="次の月へ">
              ›
            </button>
          </div>

          <div className="date-picker-weekdays">
            {WEEKDAY_LABELS.map((label) => (
              <span key={label}>{label}</span>
            ))}
          </div>

          <div className="date-picker-days">
            {leadingBlanks.map((key) => (
              <span key={key} />
            ))}
            {days.map((day) => (
              <button
                type="button"
                key={day}
                className={
                  selected &&
                  selected.year === viewYear &&
                  selected.month === viewMonth &&
                  selected.day === day
                    ? 'date-picker-day is-selected'
                    : 'date-picker-day'
                }
                onClick={() => selectDay(day)}
              >
                {day}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
