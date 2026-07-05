import { WEEKDAYS } from '../types/timetable'
import { useServerData } from '../context/serverData'
import '../styles/TimetablePage.css'

// 右画面：週の時間割（同期データ、未同期時はダミーにフォールバック）
export function TimetablePage() {
  const { timetableRows } = useServerData()

  return (
    <div className="timetable-page">
      <h1 className="screen-title">時間割</h1>
      <div className="timetable-wrapper">
        <table className="timetable">
          <thead>
            <tr>
              <th></th>
              {WEEKDAYS.map((day) => (
                <th key={day}>{day}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {timetableRows.map((row) => (
              <tr key={row.period}>
                <th scope="row">{row.period}</th>
                {row.subjects.map((subject, i) => (
                  <td key={WEEKDAYS[i]}>{subject}</td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
