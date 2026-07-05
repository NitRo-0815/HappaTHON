import { useRef, useState, type TouchEvent } from 'react'

// この距離（px）以上スワイプしたら画面遷移とみなす
const SWIPE_THRESHOLD = 50

// 横スワイプ・矢印ボタンによる画面遷移（ループなし）を管理するフック
export function useSwipeNavigation(screenCount: number, initialIndex = 0) {
  const [index, setIndex] = useState(initialIndex)
  const [dragOffset, setDragOffset] = useState(0)
  const [isDragging, setIsDragging] = useState(false)
  const touchStartX = useRef<number | null>(null)

  const canGoPrev = index > 0
  const canGoNext = index < screenCount - 1

  function goPrev() {
    setIndex((current) => Math.max(0, current - 1))
  }

  function goNext() {
    setIndex((current) => Math.min(screenCount - 1, current + 1))
  }

  function handleTouchStart(e: TouchEvent) {
    touchStartX.current = e.touches[0].clientX
    setIsDragging(true)
  }

  function handleTouchMove(e: TouchEvent) {
    if (touchStartX.current === null) return
    const delta = e.touches[0].clientX - touchStartX.current

    // 左端・右端ではそれ以上引っ張られないようにする
    if (
      (index === 0 && delta > 0) ||
      (index === screenCount - 1 && delta < 0)
    ) {
      setDragOffset(0)
      return
    }
    setDragOffset(delta)
  }

  function handleTouchEnd() {
    if (touchStartX.current === null) return
    const delta = dragOffset

    touchStartX.current = null
    setIsDragging(false)
    setDragOffset(0)

    if (Math.abs(delta) < SWIPE_THRESHOLD) return

    if (delta < 0) {
      goNext() // 左スワイプ → 右の画面へ
    } else {
      goPrev() // 右スワイプ → 左の画面へ
    }
  }

  return {
    index,
    dragOffset,
    isDragging,
    canGoPrev,
    canGoNext,
    goPrev,
    goNext,
    touchHandlers: {
      onTouchStart: handleTouchStart,
      onTouchMove: handleTouchMove,
      onTouchEnd: handleTouchEnd,
    },
  }
}
