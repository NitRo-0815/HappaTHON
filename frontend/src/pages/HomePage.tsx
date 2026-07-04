import { useMemo, useState } from 'react'
import type { ItemType } from '../types/item'
import { getItemsByType } from '../services/itemService'
import { useItemSearch } from '../hooks/useItemSearch'
import { Toolbar } from '../components/Toolbar'
import { OutputBox } from '../components/OutputBox'
import { DARUI_MESSAGE } from '../constants/messages'
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

  function handleDaruiClick() {
    // TODO: 将来的にAIの応答結果へ置き換える
    setOutputText(DARUI_MESSAGE)
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
