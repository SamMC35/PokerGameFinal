import { useState, useEffect, useRef } from 'react'

let _showToast = () => {}

export function showToast(msg, type = 'error') {
  _showToast(msg, type)
}

export default function Toast() {
  const [toasts, setToasts] = useState([])
  const timerRef = useRef({})

  useEffect(() => {
    _showToast = (msg, type = 'error') => {
      const id = Date.now()
      setToasts(t => [...t, { id, msg, type, leaving: false }])
      timerRef.current[id] = setTimeout(() => dismiss(id), 3500)
    }
    return () => { _showToast = () => {} }
  }, [])

  function dismiss(id) {
    clearTimeout(timerRef.current[id])
    setToasts(t => t.map(x => x.id === id ? { ...x, leaving: true } : x))
    setTimeout(() => setToasts(t => t.filter(x => x.id !== id)), 350)
  }

  if (!toasts.length) return null
  return (
    <div className="toast-stack">
      {toasts.map(({ id, msg, type, leaving }) => (
        <div key={id} className={`toast toast-${type}${leaving ? ' toast-out' : ''}`}>
          <span className="toast-icon">{type === 'error' ? '⚠' : '✓'}</span>
          <span className="toast-msg">{msg}</span>
          <button className="toast-close" onClick={() => dismiss(id)}>✕</button>
        </div>
      ))}
    </div>
  )
}
