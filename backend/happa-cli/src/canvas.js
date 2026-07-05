import { spawnSync } from 'node:child_process'
import path from 'node:path'

function normalizeCanvasRows(rawRows) {
  if (!Array.isArray(rawRows)) {
    return []
  }

  return rawRows
    .filter(Array.isArray)
    .map(([name, dueAt]) => [String(name ?? ''), String(dueAt ?? '')])
}

export function getCanvasAssignments() {
  const scriptPath = path.resolve(process.cwd(), '..', 'canvas_api', 'match_syllabi.py')

  const result = spawnSync('python', [scriptPath, process.env.CANVAS_API_KEY || ''], {
    encoding: 'utf8',
    cwd: path.resolve(process.cwd(), '..', 'canvas_api'),
  })

  if (result.status !== 0) {
    return []
  }

  try {
    const parsed = JSON.parse(result.stdout || '[]')
    if (!Array.isArray(parsed)) {
      return []
    }

    return parsed
      .map((item) => Array.isArray(item?.assignments) ? item.assignments : [])
      .flat()
      .map((entry) => [entry?.name ?? '', entry?.due_at ?? ''])
  } catch {
    return []
  }
}
