import { useState } from 'react'
import { getAssistantMessage } from '../services/itemService'
import { useAgentInput } from '../hooks/useAgentInput'
import { AgentPanel } from '../components/AgentPanel'
import { ChatPanel } from '../components/ChatPanel'
import type { ChatMessage } from '../types/chatMessage'
import '../styles/HomePage.css'

const WELCOME_MESSAGE: ChatMessage = {
  id: 'welcome',
  role: 'assistant',
  text: '今日はどれがだるいですか？宿題か授業を選んで教えてください。',
}

// 中央画面：エージェントとの対話画面（左＝入力操作、右＝チャット履歴）
export function HomePage() {
  const [messages, setMessages] = useState<ChatMessage[]>([WELCOME_MESSAGE])
  const [isSending, setIsSending] = useState(false)

  const {
    type,
    effectiveType,
    query,
    suggestions,
    isSuggestionOpen,
    handleQueryChange,
    selectType,
    selectSuggestion,
    openSuggestions,
    clearQuery,
  } = useAgentInput()

  async function handleSend() {
    if (isSending) return

    const title = query.trim() || '未指定'
    const history = messages.map((message) => message.text)
    const round = messages.filter((message) => message.role === 'user').length + 1

    setMessages((current) => [
      ...current,
      { id: `user-${Date.now()}`, role: 'user', text: `${title}、だるい…` },
    ])
    clearQuery()
    setIsSending(true)

    try {
      const reply = await getAssistantMessage({
        category: effectiveType,
        title,
        feeling: 'だるい',
        round,
        history,
      })
      setMessages((current) => [
        ...current,
        { id: `assistant-${Date.now()}`, role: 'assistant', text: reply },
      ])
    } catch {
      setMessages((current) => [
        ...current,
        {
          id: `assistant-${Date.now()}`,
          role: 'assistant',
          text: 'AI への接続に失敗しました。サーバーを起動してください。',
        },
      ])
    } finally {
      setIsSending(false)
    }
  }

  return (
    <div className="agent-screen">
      <AgentPanel
        type={type}
        onTypeChange={selectType}
        query={query}
        onQueryChange={handleQueryChange}
        onFocusInput={openSuggestions}
        suggestions={suggestions}
        isSuggestionOpen={isSuggestionOpen}
        onSelectSuggestion={selectSuggestion}
        onSend={handleSend}
        isSending={isSending}
      />
      <ChatPanel messages={messages} />
    </div>
  )
}
