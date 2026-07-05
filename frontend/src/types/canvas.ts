// バックエンド（Node サーバー）がそのまま返す生データの型。
// Canvas から取得した形をそのまま表す（変換は utils/mappers.ts で行う）。

// 1コマ分（"1".."7" の時限 → 授業名 or null）
export type BackendPeriodMap = Record<string, string | null>

// 曜日（"月".."日" の7日）→ 時限マップ
export type BackendTimetable = Record<string, BackendPeriodMap>

// 課題1件（due_at は Canvas の ISO 日時 or null）
export interface BackendTask {
  name: string
  due_at: string | null
}

// 授業名 → 課題の配列
export type BackendTasks = Record<string, BackendTask[]>

export interface SyncResponse {
  ok?: true
  message?: string
  error?: string
}

// GET 系の結果。「未同期(404)」と「本当の通信エラー」を呼び出し側が区別できるようにする。
export type FetchResult<T> =
  | { status: 'ok'; data: T }
  | { status: 'not_synced' }
  | { status: 'error'; message: string }
