interface ScreenArrowsProps {
  canGoPrev: boolean
  canGoNext: boolean
  onPrev: () => void
  onNext: () => void
}

// 画面遷移用の左右矢印ボタン（端では無効化する）
export function ScreenArrows({
  canGoPrev,
  canGoNext,
  onPrev,
  onNext,
}: ScreenArrowsProps) {
  return (
    <>
      <button
        type="button"
        className="screen-arrow screen-arrow-prev"
        onClick={onPrev}
        disabled={!canGoPrev}
        aria-label="前の画面へ"
      >
        ‹
      </button>
      <button
        type="button"
        className="screen-arrow screen-arrow-next"
        onClick={onNext}
        disabled={!canGoNext}
        aria-label="次の画面へ"
      >
        ›
      </button>
    </>
  )
}
