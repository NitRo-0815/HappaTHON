import { useState } from 'react'
import type { ItemType } from '../types/item'
import type { AgentSuggestion } from '../types/agentSuggestion'
import { getClassItems, getHomeworkList } from '../services/itemService'
import { filterByQuery } from '../utils/filterItems'
import { sortByDeadline } from '../utils/sortByDeadline'

function getClassSuggestions(query: string): AgentSuggestion[] {
  return filterByQuery(getClassItems(), query, (item) => item.name).map(
    (item) => ({ id: item.id, label: item.name, type: '授業' }),
  )
}

function getHomeworkSuggestions(query: string): AgentSuggestion[] {
  const matched = filterByQuery(getHomeworkList(), query, (item) => item.title)
  return sortByDeadline(matched).map((item) => ({
    id: item.id,
    label: item.title,
    type: '宿題',
    deadline: item.deadline,
  }))
}

function getSuggestionsByType(type: ItemType, query: string): AgentSuggestion[] {
  return type === '宿題' ? getHomeworkSuggestions(query) : getClassSuggestions(query)
}

// 「宿題」「授業」の選択状態・入力テキスト・予測候補をまとめて管理するフック。
// ユーザーが選択ボタンで明示的に選ぶまでは type は null（＝未選択）のまま。
// 候補の優先順位は「授業」を既定としつつ、選択中の種類（未選択時は授業）を優先し、
// 該当がなければもう一方の種類の候補を提案する。両方に該当がある場合は両方表示する。
export function useAgentInput() {
  const [type, setType] = useState<ItemType | null>(null)
  const [query, setQuery] = useState('')
  const [isSuggestionOpen, setIsSuggestionOpen] = useState(false)

  const effectiveType: ItemType = type ?? '授業'

  const primary = getSuggestionsByType(effectiveType, query)
  const otherType: ItemType = effectiveType === '宿題' ? '授業' : '宿題'
  const secondary = query.trim() === '' ? [] : getSuggestionsByType(otherType, query)

  const suggestions = primary.length > 0 ? [...primary, ...secondary] : secondary

  function handleQueryChange(value: string) {
    setQuery(value)
    setIsSuggestionOpen(true)
  }

  function selectType(nextType: ItemType) {
    setType(nextType)
    setIsSuggestionOpen(true)
  }

  function selectSuggestion(suggestion: AgentSuggestion) {
    setQuery(suggestion.label)
    setType(suggestion.type)
    setIsSuggestionOpen(false)
  }

  function openSuggestions() {
    setIsSuggestionOpen(true)
  }

  function clearQuery() {
    setQuery('')
  }

  return {
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
  }
}
