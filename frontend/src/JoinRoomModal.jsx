import { useState, useRef } from 'react'
import { showToast } from './Toast'
import { playKeyClick, playModalClose } from './sounds'

export default function JoinRoomModal({ onClose, onRoomJoined, user }) {
  const close = () => { playModalClose(); onClose() }
  const [chars,  setChars]  = useState(Array(6).fill(''))
  const [status, setStatus] = useState(null)
  const refsEl = useRef([])

  function focusAt(i) {
    refsEl.current[i]?.focus()
  }

  function handleChange(i, e) {
    playKeyClick()
    const val = e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, '')
    if (!val) return
    const next = [...chars]
    next[i] = val[val.length - 1]
    setChars(next)
    if (i < 5) focusAt(i + 1)
  }

  function handleKeyDown(i, e) {
    if (e.key === 'Backspace') {
      playKeyClick()
      const next = [...chars]
      if (next[i]) {
        next[i] = ''
        setChars(next)
      } else if (i > 0) {
        next[i - 1] = ''
        setChars(next)
        focusAt(i - 1)
      }
      e.preventDefault()
    } else if (e.key === 'ArrowLeft'  && i > 0) { focusAt(i - 1) }
      else if (e.key === 'ArrowRight' && i < 5) { focusAt(i + 1) }
      else if (e.key === 'Enter')                { handleJoin() }
  }

  function handlePaste(e) {
    e.preventDefault()
    const pasted = e.clipboardData.getData('text').toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 6)
    const next = Array(6).fill('')
    pasted.split('').forEach((c, i) => { next[i] = c })
    setChars(next)
    focusAt(Math.min(pasted.length, 5))
  }

  async function handleJoin() {
    const roomId = chars.join('')
    if (roomId.length < 6) { showToast('enter the full room code'); return }
    setStatus('loading')
    try {
      // 1. Get room details
      const roomRes = await fetch(`/room?roomId=${roomId}`)
      if (!roomRes.ok) {
        showToast('room not found')
        setStatus(null)
        return
      }
      const room = await roomRes.json()

      // 2. Add this player to the room — triggers WebSocket broadcast on backend
      await fetch(`/addPlayerToRoom?roomId=${roomId}&playerId=${user.id}`, {
        method: 'POST',
      })

      showToast('joined!', 'ok')
      setStatus('ok')
      setTimeout(() => { onRoomJoined(room); close() }, 800)
    } catch {
      showToast('could not reach server')
      setStatus(null)
    }
  }

  const roomId = chars.join('')

  return (
    <div className="modal-overlay" onClick={close}>
      <div className="modal" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <span className="modal-title">JOIN ROOM</span>
          <div className="modal-controls">
            <button className="modal-close" onClick={close}>✕</button>
          </div>
        </div>
        <div className="modal-body">
          <div className="field">
            <label>ROOM CODE</label>
            <div className="room-code-boxes">
              {chars.map((ch, i) => (
                <input
                  key={i}
                  ref={el => refsEl.current[i] = el}
                  className={`room-code-box${ch ? ' filled' : ''}`}
                  maxLength={2}
                  value={ch}
                  onChange={e => handleChange(i, e)}
                  onKeyDown={e => handleKeyDown(i, e)}
                  onPaste={handlePaste}
                  onFocus={e => e.target.select()}
                  autoFocus={i === 0}
                />
              ))}
            </div>
          </div>

          {roomId.length === 6 && (
            <div className="room-code-preview">♠ {roomId}</div>
          )}

          <button
            className="modal-submit"
            onClick={handleJoin}
            disabled={status === 'loading' || status === 'ok'}
          >
            {status === 'loading' ? '...' : status === 'ok' ? '✓ JOINED' : '♣ JOIN'}
          </button>
        </div>
      </div>
    </div>
  )
}
