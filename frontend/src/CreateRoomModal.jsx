import { useState } from 'react'
import ModalInput from './ModalInput'
import { showToast } from './Toast'
import { playKeyClick, playModalClose } from './sounds'

const STARTING_MONEY_OPTIONS = [500, 1000, 2000, 5000, 10000]

export default function CreateRoomModal({ onClose, onRoomCreated, user }) {
  const close = () => { playModalClose(); onClose() }
  const [roomName, setRoomName] = useState('')
  const [money,    setMoney]    = useState(1000)
  const [status,   setStatus]   = useState(null)

  async function handleCreate() {
    if (!roomName.trim()) { showToast('enter a room name'); return }
    setStatus('loading')
    try {
      const res = await fetch('/room', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ roomName: roomName.trim(), startingMoney: money, adminPlayerId: user.id }),
      })
      if (!res.ok) {
        const text = await res.text()
        showToast(text || 'could not create room')
        setStatus(null)
      } else {
        const newRoom = await res.json()
        // Add the admin as the first player so they appear in the player list
        await fetch(`/addPlayerToRoom?roomId=${newRoom.roomId}&playerId=${user.id}`, {
          method: 'POST',
        })
        showToast(`room ${newRoom.roomId} created!`, 'ok')
        setStatus('ok')
        setTimeout(() => { onRoomCreated(newRoom); close() }, 800)
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
          <span className="modal-title">CREATE ROOM</span>
          <div className="modal-controls">
            <button className="modal-close" onClick={close}>✕</button>
          </div>
        </div>
        <div className="modal-body">

          <div className="field">
            <label>ROOM NAME</label>
            <ModalInput
              type="text"
              placeholder="e.g. friday night"
              value={roomName}
              onChange={e => setRoomName(e.target.value)}
            />
          </div>

          <div className="field">
            <label>STARTING MONEY</label>
            <div className="money-options">
              {STARTING_MONEY_OPTIONS.map(amt => (
                <button
                  key={amt}
                  className={`money-opt${money === amt ? ' selected' : ''}`}
                  onClick={() => { playKeyClick(); setMoney(amt) }}
                >
                  ${amt.toLocaleString()}
                </button>
              ))}
            </div>
          </div>

          <div className="room-summary">
            <span className="room-summary-row">
              <span className="rs-label">ROOM</span>
              <span className="rs-value">{roomName || '—'}</span>
            </span>
            <span className="room-summary-row">
              <span className="rs-label">CHIPS</span>
              <span className="rs-value">${money.toLocaleString()}</span>
            </span>
          </div>

          <button
            className="modal-submit"
            onClick={handleCreate}
            disabled={status === 'loading' || status === 'ok'}
          >
            {status === 'loading' ? '...' : status === 'ok' ? '✓ CREATED' : '♠ CREATE'}
          </button>
        </div>
      </div>
    </div>
  )
}
