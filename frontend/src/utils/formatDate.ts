// ISO形式（YYYY-MM-DD）の日付文字列を "M/D" 表示用に変換する
export function formatDeadline(isoDate: string): string {
  const [, month, day] = isoDate.split('-')
  return `${Number(month)}/${Number(day)}`
}
