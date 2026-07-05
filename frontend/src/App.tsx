import { HomePage } from './pages/HomePage'
import { HomeworkPage } from './pages/HomeworkPage'
import { TimetablePage } from './pages/TimetablePage'
import { SwipeScreens } from './components/SwipeScreens'

function App() {
  return (
    <SwipeScreens
      initialIndex={1}
      screens={[
        { key: 'homework', content: <HomeworkPage /> },
        { key: 'agent', content: <HomePage /> },
        { key: 'timetable', content: <TimetablePage /> },
      ]}
    />
  )
}

export default App
