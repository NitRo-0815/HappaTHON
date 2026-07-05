import type { TimetableRow } from '../types/timetable'

// 時間割のダミーデータ（バックエンド未実装のため仮データとして保持）
// WEEKDAYS（月火水木金土）の並び順に対応
export const TIMETABLE_ROWS: TimetableRow[] = [
  { period: '1限', subjects: ['数', '英', 'AI', '経', '情', '-'] },
  { period: '2限', subjects: ['情', '数', '英', 'AI', 'プ', '-'] },
  { period: '3限', subjects: ['空', '空', 'プ', '空', '空', '-'] },
]
