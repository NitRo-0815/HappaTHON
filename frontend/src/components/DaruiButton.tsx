interface DaruiButtonProps {
  onClick: () => void
  disabled?: boolean
}

// 入力内容をAIへ送信する主要アクションボタン
export function DaruiButton({ onClick, disabled }: DaruiButtonProps) {
  return (
    <button
      type="button"
      className="darui-button"
      onClick={onClick}
      disabled={disabled}
    >
      だるい！
    </button>
  )
}
