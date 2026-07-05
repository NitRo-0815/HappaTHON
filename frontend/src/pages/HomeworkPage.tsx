import { HOMEWORK_LIST } from '../constants/dummyHomework'
import { HomeworkCard } from '../components/HomeworkCard'
import '../styles/HomeworkPage.css'

// 左画面：宿題リスト
export function HomeworkPage() {
  return (
    <div className="homework-page">
      <div className="homework-header">
        <h1 className="screen-title">宿題</h1>
        <button type="button" className="add-button">
          ＋追加
        </button>
      </div>
      <div className="homework-list">
        {HOMEWORK_LIST.map((homework) => (
          <HomeworkCard key={homework.id} homework={homework} />
        ))}
      </div>
    </div>
  )
}
