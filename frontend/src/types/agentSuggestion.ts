import type { ItemType } from './item'

// エージェント入力欄の予測候補（授業・宿題どちらの候補かをtypeで示す）
export interface AgentSuggestion {
  id: string
  label: string
  type: ItemType
  deadline?: string
}
