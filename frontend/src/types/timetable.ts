// 時間割画面（右画面）で扱うデータ
export const WEEKDAYS = ['月', '火', '水', '木', '金', '土'] as const

export type Weekday = (typeof WEEKDAYS)[number]

export interface TimetableRow {
  period: string
  // WEEKDAYS と同じ並び順の教科名（空きコマは '-'）
  subjects: string[]
}
