import type { ReactNode } from 'react'
import { useSwipeNavigation } from '../hooks/useSwipeNavigation'
import { ScreenArrows } from './ScreenArrows'
import '../styles/SwipeScreens.css'

interface Screen {
  key: string
  content: ReactNode
}

interface SwipeScreensProps {
  screens: Screen[]
  initialIndex?: number
}

// 複数画面を横一列に並べ、スワイプ or 矢印ボタンのみで移動できるコンテナ
export function SwipeScreens({ screens, initialIndex = 0 }: SwipeScreensProps) {
  const { index, dragOffset, isDragging, canGoPrev, canGoNext, goPrev, goNext, touchHandlers } =
    useSwipeNavigation(screens.length, initialIndex)

  const trackClassName = `swipe-track${isDragging ? ' is-dragging' : ''}`
  const transform = `translateX(calc(${-index * 100}% + ${dragOffset}px))`

  return (
    <div className="swipe-screens">
      <div className="swipe-viewport" {...touchHandlers}>
        <div className={trackClassName} style={{ transform }}>
          {screens.map((screen) => (
            <div key={screen.key} className="swipe-screen">
              {screen.content}
            </div>
          ))}
        </div>
      </div>
      {/* overflow:hidden の影響を受けないよう、swipe-viewport の外側に配置する */}
      <ScreenArrows
        canGoPrev={canGoPrev}
        canGoNext={canGoNext}
        onPrev={goPrev}
        onNext={goNext}
      />
    </div>
  )
}
