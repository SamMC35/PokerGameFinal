import { useState } from 'react'
import CharacterCreator, { HAIRS, HAIR_COLORS, FACES, EYE_COLORS, SKINS, SHIRTS, SHIRT_COLORS } from './CharacterCreator'
import ModalInput from './ModalInput'
import { showToast } from './Toast'
import { playModalClose } from './sounds'

const DEFAULT_CHAR = { hairIdx: 0, hairColorIdx: 0, faceIdx: 0, skinIdx: 0, shirtIdx: 0, eyeColorIdx: 0, shirtColorIdx: 0 }

export default function SignUpModal({ onClose, onLogin }) {
  const close = () => { playModalClose(); onClose() }
  const [char, setChar]         = useState(DEFAULT_CHAR)
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [status, setStatus]     = useState(null) // 'loading' | 'ok'

  async function handleSubmit() {
    if (!username.trim() || !password.trim()) {
      showToast('fill in all fields')
      return
    }
    setStatus('loading')
    try {
      const characterJson = {
        hair:       HAIRS[char.hairIdx].label,
        hairColor:  HAIR_COLORS[char.hairColorIdx],
        face:       FACES[char.faceIdx].label,
        eyeColor:   EYE_COLORS[char.eyeColorIdx],
        skin:       SKINS[char.skinIdx],
        shirt:      SHIRTS[char.shirtIdx].label,
        shirtColor: SHIRT_COLORS[char.shirtColorIdx],
      }
      const res = await fetch('/createUser', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userName: username, password, characterJson }),
      })
      if (!res.ok) {
        const text = await res.text()
        showToast(text || 'something went wrong')
        setStatus(null)
      } else {
        const newUser = await res.json()
        setStatus('ok')
        showToast('account created!', 'ok')
        setTimeout(() => { onLogin(newUser); close() }, 800)
      }
    } catch {
      showToast('could not reach server')
      setStatus(null)
    }
  }

  return (
    <div className="modal-overlay" onClick={close}>
      <div className="modal signup-modal" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <span className="modal-title">CREATE ACCOUNT</span>
          <div className="modal-controls">
            <button className="modal-close" onClick={close}>✕</button>
          </div>
        </div>

        <div className="signup-body">
          <div className="signup-char">
            <CharacterCreator state={char} onChange={setChar} />
          </div>
          <div className="signup-divider" />
          <div className="modal-body signup-form">
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
              onClick={handleSubmit}
              disabled={status === 'loading' || status === 'ok'}
            >
              {status === 'loading' ? '...' : status === 'ok' ? '✓ DONE' : "LET'S PLAY"}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
