interface OutputBoxProps {
  text: string
}

// 画面下部の大きな出力ボックス。
// 現在は固定文章を表示するのみだが、今後AIの応答結果を表示する想定。
export function OutputBox({ text }: OutputBoxProps) {
  return (
    <div className="output-box">
      {text ? (
        <p className="output-text">{text}</p>
      ) : (
        <p className="output-placeholder">
          「だるい」ボタンを押すとここに結果が表示されます
        </p>
      )}
    </div>
  )
}
