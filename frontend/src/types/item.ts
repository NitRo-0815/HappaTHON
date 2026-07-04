// 検索対象の種類（プルダウンの選択肢）
export type ItemType = '授業' | '宿題'

// 授業・宿題1件分のデータ
export interface Item {
  id: string
  name: string
}
