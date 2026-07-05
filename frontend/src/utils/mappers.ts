import type { Item } from '../types/item'
import type { HomeworkItem } from '../types/homework'
import type { BackendTasks, BackendTimetable } from '../types/canvas'
import type { TimetableRow } from '../types/timetable'
import { WEEKDAYS } from '../types/timetable'

// 文字列を安定したid用スラグに変換する（英数字・日本語以外を - に）。外部依存なし。
function slug(text: string): string {
  return text
    .trim()
    .toLowerCase()
    .replace(/[^\p{L}\p{N}]+/gu, '-')
    .replace(/^-+|-+$/g, '')
}

// Canvasの授業名末尾に付く曜日+時限（例: "…水3"）を取り除く。
// さらに「（○○）」形式があれば、その中身を短い表示名として優先する。
export function stripSubjectLabel(fullName: string): string {
  if (!fullName) return ''
  const withoutSlot = fullName.replace(/[月火水木金土日][1-7]\s*$/u, '').trim()
  const paren = withoutSlot.match(/[（(]([^）)]+)[）)]/u)
  if (paren && paren[1].trim()) {
    return paren[1].trim()
  }
  return withoutSlot
}

// バックエンドの時間割（7日×7限、フル授業名）→ TimetablePage用の行データ。
// フロントは月〜土の6日表なので日曜は落とす。空のみの時限行は除外し、
// 全体が空なら [] を返す（呼び出し側でダミーにフォールバック）。
export function mapTimetable(bt: BackendTimetable): TimetableRow[] {
  const rows: TimetableRow[] = []

  for (let period = 1; period <= 7; period++) {
    const key = String(period)
    const subjects = WEEKDAYS.map((day) => {
      const name = bt?.[day]?.[key]
      return name ? stripSubjectLabel(name) : '-'
    })

    // その時限がすべて空きならスキップ
    if (subjects.some((s) => s !== '-')) {
      rows.push({ period: `${period}限`, subjects })
    }
  }

  return rows
}

// バックエンドの課題（授業名→[{name,due_at}]）→ HomeworkItem[]（フラット化）。
// due_at(ISO日時) は YYYY-MM-DD に切り詰め、null は '' にする。
export function mapTasksToHomework(bt: BackendTasks): HomeworkItem[] {
  const items: HomeworkItem[] = []

  for (const [course, tasks] of Object.entries(bt ?? {})) {
    tasks.forEach((task, index) => {
      items.push({
        id: `${slug(course)}-${index}`,
        title: task.name,
        deadline: task.due_at ? task.due_at.slice(0, 10) : '',
        description: stripSubjectLabel(course),
      })
    })
  }

  return items
}

// 同期データから授業リスト（Item[]）を導出する。
// 時間割の非nullの授業名 と 課題のキー（授業名）の和集合を、表示名で重複排除。
export function deriveClassItems(
  bt: BackendTimetable,
  tasks: BackendTasks,
): Item[] {
  const names = new Set<string>()

  for (const day of WEEKDAYS) {
    const periods = bt?.[day]
    if (!periods) continue
    for (const name of Object.values(periods)) {
      if (name) names.add(stripSubjectLabel(name))
    }
  }
  for (const course of Object.keys(tasks ?? {})) {
    names.add(stripSubjectLabel(course))
  }

  return Array.from(names)
    .filter((name) => name.length > 0)
    .map((name) => ({ id: slug(name), name }))
}
