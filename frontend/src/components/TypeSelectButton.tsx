import { useEffect, useRef, useState } from 'react'
import type { ItemType } from '../types/item'

const OPTIONS: ItemType[] = ['宿題', '授業']

interface TypeSelectButtonProps {
  value: ItemType | null
  onChange: (type: ItemType) => void
}

// 「宿題」「授業」を切り替える選択ボタン（プルダウン）。クリックでメニューが開閉する
export function TypeSelectButton({ value, onChange }: TypeSelectButtonProps) {
  const [isOpen, setIsOpen] = useState(false)
  const rootRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!isOpen) return

    function handleOutsideClick(e: MouseEvent) {
      if (rootRef.current && !rootRef.current.contains(e.target as Node)) {
        setIsOpen(false)
      }
    }

    document.addEventListener('mousedown', handleOutsideClick)
    return () => document.removeEventListener('mousedown', handleOutsideClick)
  }, [isOpen])

  function handleSelect(option: ItemType) {
    onChange(option)
    setIsOpen(false)
  }

  return (
    <div className="type-select" ref={rootRef}>
      <button
        type="button"
        className={
          value === null
            ? 'type-select-button is-placeholder'
            : 'type-select-button'
        }
        aria-haspopup="listbox"
        aria-expanded={isOpen}
        onClick={() => setIsOpen((current) => !current)}
      >
        {value ?? '選択'} ▼
      </button>

      {isOpen && (
        <ul className="type-select-menu" role="listbox">
          {OPTIONS.map((option) => (
            <li key={option}>
              <button
                type="button"
                role="option"
                aria-selected={option === value}
                className={
                  option === value
                    ? 'type-select-option is-active'
                    : 'type-select-option'
                }
                onClick={() => handleSelect(option)}
              >
                {option}
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
