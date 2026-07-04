import type { ItemType } from '../types/item'

const ITEM_TYPES: ItemType[] = ['授業', '宿題']

interface TypeSelectProps {
  value: ItemType
  onChange: (type: ItemType) => void
}

// 「授業」「宿題」を切り替えるプルダウン
export function TypeSelect({ value, onChange }: TypeSelectProps) {
  return (
    <select
      className="type-select"
      value={value}
      onChange={(e) => onChange(e.target.value as ItemType)}
    >
      {ITEM_TYPES.map((type) => (
        <option key={type} value={type}>
          {type}
        </option>
      ))}
    </select>
  )
}
