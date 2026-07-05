import { useState } from 'react'
import { HomePage } from './pages/HomePage'
import { HomeworkPage } from './pages/HomeworkPage'
import { TimetablePage } from './pages/TimetablePage'
import { SwipeScreens } from './components/SwipeScreens'
import { SyncModal } from './components/SyncModal'
import { ServerDataProvider } from './context/ServerDataContext'
import { useServerData } from './context/serverData'
import './styles/SyncModal.css'

function AppContent() {
  const [isSyncOpen, setIsSyncOpen] = useState(false)
  const { status } = useServerData()

  return (
    <>
      <button
        type="button"
        className={
          status === 'loading' ? 'sync-button is-syncing' : 'sync-button'
        }
        onClick={() => setIsSyncOpen(true)}
        aria-label="Canvas データ同期"
        title="Canvas データ同期"
      >
        ⟳
      </button>

      <SwipeScreens
        initialIndex={1}
        screens={[
          { key: 'homework', content: <HomeworkPage /> },
          { key: 'agent', content: <HomePage /> },
          { key: 'timetable', content: <TimetablePage /> },
        ]}
      />

      {isSyncOpen && <SyncModal onClose={() => setIsSyncOpen(false)} />}
    </>
  )
}

function App() {
  return (
    <ServerDataProvider>
      <AppContent />
    </ServerDataProvider>
  )
}

export default App
