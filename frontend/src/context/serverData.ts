import { createContext, useContext } from 'react'
import type { Item } from '../types/item'
import type { HomeworkItem } from '../types/homework'
import type { TimetableRow } from '../types/timetable'

export type SyncStatus = 'idle' | 'loading' | 'synced' | 'not_synced' | 'error'

export interface ServerData {
  timetableRows: TimetableRow[]
  homeworkList: HomeworkItem[]
  classItems: Item[]
  status: SyncStatus
  lastUpdated: string | null
  isSynced: boolean
  refresh: () => Promise<void>
  sync: () => Promise<{ ok: boolean; message: string }>
}

export const ServerDataContext = createContext<ServerData | null>(null)

export function useServerData(): ServerData {
  const context = useContext(ServerDataContext)
  if (!context) {
    throw new Error('useServerData must be used within a ServerDataProvider')
  }
  return context
}
