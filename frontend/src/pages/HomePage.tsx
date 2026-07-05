import { useMemo, useState } from 'react'
import type { ItemType } from '../types/item'
import { getAssistantMessage, getItemsByType } from '../services/itemService'
import { useItemSearch } from '../hooks/useItemSearch'
import { Toolbar } from '../components/Toolbar'
import { OutputBox } from '../components/OutputBox'
import '../styles/HomePage.css'

// 画面全体の状態（種類・検索・出力結果）を管理するページコンポーネント
export function HomePage() {
  const [type, setType] = useState<ItemType>('授業')
  const [outputText, setOutputText] = useState('')

  const items = useMemo(() => getItemsByType(type), [type])
  const {
    query,
    suggestions,
    isSuggestionOpen,
    handleQueryChange,
    selectSuggestion,
  } = useItemSearch(items)

  async function handleDaruiClick() {
    try {
      const selectedItem = items.find((item) => item.name === query) || items[0]
      const message = await getAssistantMessage({
        category: type,
        title: selectedItem?.name || '未指定',
        feeling: 'だるい',
        round: 1,
        history: [],
      })
      setOutputText(message)
    } catch (error) {
      setOutputText('AI への接続に失敗しました。サーバーを起動してください。')
    }
  }

  return (
    <main className="home-page">
      <Toolbar
        type={type}
        onTypeChange={setType}
        query={query}
        onQueryChange={handleQueryChange}
        suggestions={suggestions}
        isSuggestionOpen={isSuggestionOpen}
        onSelectSuggestion={selectSuggestion}
        onDaruiClick={handleDaruiClick}
      />
      <OutputBox text={outputText} />
    </main>
  )
}
