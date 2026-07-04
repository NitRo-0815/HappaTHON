interface DaruiButtonProps {
  onClick: () => void
}

// 「だるい」ボタン。現時点では通常のボタンとしてのみ機能する。
export function DaruiButton({ onClick }: DaruiButtonProps) {
  return (
    <button type="button" className="darui-button" onClick={onClick}>
      だるい
    </button>
  )
}
