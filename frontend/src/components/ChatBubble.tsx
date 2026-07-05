import type { ChatMessage } from '../types/chatMessage'

interface ChatBubbleProps {
  message: ChatMessage
}

// 1件分のチャット吹き出し
export function ChatBubble({ message }: ChatBubbleProps) {
  return <div className={`chat-bubble ${message.role}`}>{message.text}</div>
}
