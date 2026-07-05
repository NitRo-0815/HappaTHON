// ISO形式（YYYY-MM-DD）の日付文字列を "M/D" 表示用に変換する。
// 空文字（期限未定）は「期限未定」と表示する。
export function formatDeadline(isoDate: string): string {
  if (!isoDate) return '期限未定'
  const [, month, day] = isoDate.split('-')
  return `${Number(month)}/${Number(day)}`
}
