import {
  useCallback,
  useEffect,
  useState,
  type ReactNode,
} from 'react'
import type { Item } from '../types/item'
import type { HomeworkItem } from '../types/homework'
import type { TimetableRow } from '../types/timetable'
import { fetchTasks, fetchTimetable, postSync } from '../services/itemService'
import {
  deriveClassItems,
  mapTasksToHomework,
  mapTimetable,
} from '../utils/mappers'
import { CLASS_ITEMS } from '../constants/dummyItems'
import { HOMEWORK_LIST } from '../constants/dummyHomework'
import { TIMETABLE_ROWS } from '../constants/timetable'
import { ServerDataContext, type ServerData, type SyncStatus } from './serverData'

// バックエンドのエラーコードを画面表示用の日本語に変換する
function friendlyError(error?: string, message?: string): string {
  switch (error) {
    case 'missing_api_key':
      return 'Canvas APIキーが未設定です。backend/happa-cli/.env に CANVAS_API_KEY を設定してください。'
    case 'canvas_error':
      return `Canvas との通信に失敗しました（キーの期限切れ等）。${message ?? ''}`
    case 'sync_failed':
      return `同期処理に失敗しました（Python環境をご確認ください）。${message ?? ''}`
    case 'invalid_json_from_python':
      return '同期データの解析に失敗しました。'
    case 'network_error':
      return 'サーバーに接続できません。バックエンドを起動してください。'
    default:
      return message ?? '同期に失敗しました。'
  }
}

export function ServerDataProvider({ children }: { children: ReactNode }) {
  // 初期値はダミー。フェッチ完了まで空白画面にせず、失敗時もそのまま残す。
  const [timetableRows, setTimetableRows] = useState<TimetableRow[]>(TIMETABLE_ROWS)
  const [homeworkList, setHomeworkList] = useState<HomeworkItem[]>(HOMEWORK_LIST)
  const [classItems, setClassItems] = useState<Item[]>(CLASS_ITEMS)
  const [status, setStatus] = useState<SyncStatus>('idle')
  const [lastUpdated, setLastUpdated] = useState<string | null>(null)

  // 時間割・課題を取得し、成功すれば実データへ、未同期/失敗ならダミーのまま。
  const refresh = useCallback(async () => {
    const [timetable, tasks] = await Promise.all([fetchTimetable(), fetchTasks()])

    if (timetable.status === 'error' || tasks.status === 'error') {
      setStatus('error')
      return
    }
    if (timetable.status === 'not_synced' || tasks.status === 'not_synced') {
      setStatus('not_synced')
      return
    }

    // 両方 ok
    const rows = mapTimetable(timetable.data)
    const homework = mapTasksToHomework(tasks.data)
    const classes = deriveClassItems(timetable.data, tasks.data)

    // マッパーが空を返した項目はダミーへフォールバック
    setTimetableRows(rows.length > 0 ? rows : TIMETABLE_ROWS)
    setHomeworkList(homework.length > 0 ? homework : HOMEWORK_LIST)
    setClassItems(classes.length > 0 ? classes : CLASS_ITEMS)
    setStatus('synced')
  }, [])

  // 起動時は「取得」のみ（軽い）。重い /api/sync は明示的なボタンで実行する。
  useEffect(() => {
    void refresh()
  }, [refresh])

  const sync = useCallback(async () => {
    setStatus('loading')
    const result = await postSync()

    if (result.ok) {
      await refresh()
      setLastUpdated(new Date().toISOString())
      return { ok: true, message: result.message ?? '同期が完了しました。' }
    }

    setStatus('error')
    return { ok: false, message: friendlyError(result.error, result.message) }
  }, [refresh])

  const value: ServerData = {
    timetableRows,
    homeworkList,
    classItems,
    status,
    lastUpdated,
    isSynced: status === 'synced',
    refresh,
    sync,
  }

  return (
    <ServerDataContext.Provider value={value}>
      {children}
    </ServerDataContext.Provider>
  )
}
