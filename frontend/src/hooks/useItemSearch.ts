import { useEffect, useMemo, useState } from 'react'
import type { Item } from '../types/item'
import { filterItemsByQuery } from '../utils/filterItems'

// 検索ボックスの入力・候補一覧・候補の開閉状態をまとめて管理するフック。
// 検索対象データ（items）が切り替わった（＝プルダウンの種類が変わった）ときは、
// 検索ボックスと候補一覧をリセットする。
export function useItemSearch(items: Item[]) {
  const [query, setQuery] = useState('')
  const [isSuggestionOpen, setIsSuggestionOpen] = useState(false)

  useEffect(() => {
    setQuery('')
    setIsSuggestionOpen(false)
  }, [items])

  const suggestions = useMemo(
    () => filterItemsByQuery(items, query),
    [items, query],
  )

  function handleQueryChange(value: string) {
    setQuery(value)
    setIsSuggestionOpen(true)
  }

  function selectSuggestion(name: string) {
    setQuery(name)
    setIsSuggestionOpen(false)
  }

  return {
    query,
    suggestions,
    isSuggestionOpen,
    handleQueryChange,
    selectSuggestion,
  }
}
