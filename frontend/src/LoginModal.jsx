import { useState } from 'react'
import ModalInput from './ModalInput'
import { showToast } from './Toast'
import { playModalClose } from './sounds'

export default function LoginModal({ onClose, onLogin }) {
  const close = () => { playModalClose(); onClose() }
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [status,   setStatus]   = useState(null) // 'loading' | 'ok'

  async function handleLogin() {
    if (!username.trim() || !password.trim()) {
      showToast('fill in all fields')
      return
    }
    setStatus('loading')
    try {
      const res = await fetch('/getUser', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userName: username, password }),
      })
      if (!res.ok) {
        const text = await res.text()
        showToast(text || 'invalid credentials')
        setStatus(null)
      } else {
        const user = await res.json()
        setStatus('ok')
        showToast('welcome back!', 'ok')
        setTimeout(() => { onLogin(user); close() }, 800)
      }
    } catch {
      showToast('could not reach server')
      setStatus(null)
    }
  }

  return (
    <div className="modal-overlay" onClick={close}>
      <div className="modal" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <span className="modal-title">LOG IN</span>
          <div className="modal-controls">
            <button className="modal-close" onClick={close}>✕</button>
          </div>
        </div>
        <div className="modal-body">
          <div className="field">
            <label>USERNAME</label>
            <ModalInput type="text" placeholder="enter username"
              value={username} onChange={e => setUsername(e.target.value)} />
          </div>
          <div className="field">
            <label>PASSWORD</label>
            <ModalInput type="password" placeholder="••••••••"
              value={password} onChange={e => setPassword(e.target.value)} />
          </div>
          <button
            className="modal-submit"
            onClick={handleLogin}
            disabled={status === 'loading' || status === 'ok'}
          >
            {status === 'loading' ? '...' : status === 'ok' ? '✓ WELCOME' : 'LOG IN'}
          </button>
        </div>
      </div>
    </div>
  )
}
