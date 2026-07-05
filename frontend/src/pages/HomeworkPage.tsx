import { useEffect, useState } from 'react'
import { HomeworkCard } from '../components/HomeworkCard'
import { AddHomeworkModal } from '../components/AddHomeworkModal'
import type { HomeworkItem } from '../types/homework'
import { sortByDeadline } from '../utils/sortByDeadline'
import { useServerData } from '../context/serverData'
import '../styles/HomeworkPage.css'

// 左画面：宿題リスト（同期データ、未同期時はダミーにフォールバック）
export function HomeworkPage() {
  const { homeworkList: serverHomework } = useServerData()
  const [homeworkList, setHomeworkList] = useState<HomeworkItem[]>(serverHomework)
  const [isModalOpen, setIsModalOpen] = useState(false)

  // 同期などでサーバー側のリストが更新されたら再シードする
  useEffect(() => {
    setHomeworkList(serverHomework)
  }, [serverHomework])

  function handleAdd(homework: HomeworkItem) {
    setHomeworkList((current) => [...current, homework])
    setIsModalOpen(false)
  }

  // 期日が近い宿題が上にくるように並び替える
  const sortedHomeworkList = sortByDeadline(homeworkList)

  return (
    <div className="homework-page">
      <div className="homework-header">
        <h1 className="screen-title">宿題</h1>
        <button
          type="button"
          className="add-button"
          onClick={() => setIsModalOpen(true)}
        >
          ＋追加
        </button>
      </div>
      <div className="homework-list">
        {sortedHomeworkList.map((homework) => (
          <HomeworkCard key={homework.id} homework={homework} />
        ))}
      </div>
      {isModalOpen && (
        <AddHomeworkModal
          onClose={() => setIsModalOpen(false)}
          onAdd={handleAdd}
        />
      )}
    </div>
  )
}
