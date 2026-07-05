import { useState } from 'react'
import { useServerData } from '../context/serverData'
import '../styles/SyncModal.css'

interface SyncModalProps {
  onClose: () => void
}

// Canvas データ同期用のモーダル。
// APIキーはサーバーの .env（CANVAS_API_KEY）から使われるため、ここでは入力せず
// 「同期」ボタンを押すだけ。状態・最終同期時刻・エラーを表示する。
export function SyncModal({ onClose }: SyncModalProps) {
  const { status, lastUpdated, isSynced, sync } = useServerData()
  const [message, setMessage] = useState<string | null>(null)
  const [isError, setIsError] = useState(false)

  const isLoading = status === 'loading'

  async function handleSync() {
    setMessage(null)
    const result = await sync()
    setIsError(!result.ok)
    setMessage(result.message)
  }

  function statusLabel(): string {
    if (isLoading) return '同期中…'
    if (isSynced) return '同期済み'
    if (status === 'not_synced') return '未同期（ダミー表示中）'
    if (status === 'error') return 'エラー'
    return '未同期'
  }

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <h2 className="modal-title">Canvas データ同期</h2>

        <div className="sync-status">
          <span className="sync-status-label">状態</span>
          <span className="sync-status-value">{statusLabel()}</span>
        </div>
        {lastUpdated && (
          <div className="sync-status">
            <span className="sync-status-label">最終同期</span>
            <span className="sync-status-value">
              {new Date(lastUpdated).toLocaleString('ja-JP')}
            </span>
          </div>
        )}

        <p className="sync-note">
          APIキーはサーバーの .env（CANVAS_API_KEY）から使用されます。
        </p>

        {message && (
          <p className={isError ? 'sync-message is-error' : 'sync-message'}>
            {message}
          </p>
        )}

        <div className="modal-actions">
          <button
            type="button"
            className="modal-button-secondary"
            onClick={onClose}
          >
            閉じる
          </button>
          <button
            type="button"
            className="modal-button-primary"
            onClick={handleSync}
            disabled={isLoading}
          >
            {isLoading ? '同期中…' : '今すぐ同期'}
          </button>
        </div>
      </div>
    </div>
  )
}
