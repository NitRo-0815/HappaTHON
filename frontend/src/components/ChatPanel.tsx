import { useEffect, useRef } from 'react'
import type { ChatMessage } from '../types/chatMessage'
import { ChatBubble } from './ChatBubble'
import '../styles/ChatPanel.css'

interface ChatPanelProps {
  messages: ChatMessage[]
}

// 右側：AIとの会話をLINE風の吹き出しで表示するパネル（履歴分は自動で下までスクロール）
export function ChatPanel({ messages }: ChatPanelProps) {
  const scrollRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const el = scrollRef.current
    if (!el) return
    el.scrollTop = el.scrollHeight
  }, [messages])

  return (
    <div className="chat-panel">
      <div className="chat-messages" ref={scrollRef}>
        {messages.map((message) => (
          <ChatBubble key={message.id} message={message} />
        ))}
      </div>
    </div>
  )
}
