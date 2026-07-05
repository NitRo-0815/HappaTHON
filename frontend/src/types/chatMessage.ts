export type ChatRole = 'user' | 'assistant'

// 右側のチャット欄に表示する1件分のメッセージ
export interface ChatMessage {
  id: string
  role: ChatRole
  text: string
}
