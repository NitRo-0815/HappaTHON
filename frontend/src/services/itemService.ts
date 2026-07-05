import type { Item } from '../types/item'
import type { HomeworkItem } from '../types/homework'
import type {
  BackendTasks,
  BackendTimetable,
  FetchResult,
  SyncResponse,
} from '../types/canvas'
import { CLASS_ITEMS } from '../constants/dummyItems'
import { HOMEWORK_LIST } from '../constants/dummyHomework'

// 既定は空文字 → 相対パス '/api/...' となり、Vite の dev プロキシ経由で :3001 に届く。
// 本番等でホストを固定したい場合のみ VITE_API_BASE_URL で上書きする。
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? ''

// 授業データ（ダミー）。同期前のフォールバックとして使う。
export function getClassItems(): Item[] {
  return CLASS_ITEMS
}

// 宿題データ（ダミー）。同期前のフォールバックとして使う。
export function getHomeworkList(): HomeworkItem[] {
  return HOMEWORK_LIST
}

// GET /api/timetable — 未同期なら 404 が返るので not_synced として扱う。
export async function fetchTimetable(): Promise<FetchResult<BackendTimetable>> {
  return getJson<BackendTimetable>('/api/timetable')
}

// GET /api/tasks — 未同期なら 404 が返るので not_synced として扱う。
export async function fetchTasks(): Promise<FetchResult<BackendTasks>> {
  return getJson<BackendTasks>('/api/tasks')
}

// POST /api/sync — Canvas キーはサーバーの .env（CANVAS_API_KEY）から使われるため、
// ボディは空でよい。成否に関わらずJSONを返す（error/messageはUIで表示）。
export async function postSync(): Promise<SyncResponse> {
  try {
    const response = await fetch(`${API_BASE_URL}/api/sync`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({}),
    })
    const data = (await response.json()) as SyncResponse
    return data
  } catch (error) {
    return { error: 'network_error', message: (error as Error).message }
  }
}

async function getJson<T>(path: string): Promise<FetchResult<T>> {
  try {
    const response = await fetch(`${API_BASE_URL}${path}`)
    if (response.status === 404) {
      return { status: 'not_synced' }
    }
    if (!response.ok) {
      return { status: 'error', message: `HTTP ${response.status}` }
    }
    const data = (await response.json()) as T
    return { status: 'ok', data }
  } catch (error) {
    return { status: 'error', message: (error as Error).message }
  }
}

export async function getAssistantMessage(payload: {
  category: string
  title: string
  feeling: string
  round: number
  history: string[]
}) {
  const response = await fetch(`${API_BASE_URL}/api/assistant`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  })

  if (!response.ok) {
    throw new Error('Failed to fetch assistant message')
  }

  const data = await response.json()
  return data.message as string
}
