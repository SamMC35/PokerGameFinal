import { useState, useEffect } from 'react'
import './App.css'
import PixelSuit from './PixelSuit'
import { playCardDeal, playKeyClick, playModalOpen, playModalClose } from './sounds'

const SUITS = ['♠', '♥', '♦', '♣']
const VALUES = ['A', 'K', 'Q', 'J', '10', '9', '8', '7', '6', '5', '4', '3', '2']
const FAN_ANGLES = [-24, -12, 0, 12, 24]

function randomHand() {
  const deck = SUITS.flatMap(suit => VALUES.map(value => ({ suit, value })))
  const shuffled = deck.sort(() => Math.random() - 0.5)
  return shuffled.slice(0, 5)
}

function Card({ suit, value, angle, index, dealKey }) {
  const isRed = suit === '♥' || suit === '♦'
  return (
    <div
      key={dealKey}
      className="card"
      style={{
        '--angle': `${angle}deg`,
        '--delay': `${index * 0.08}s`,
        color: isRed ? '#cc0000' : '#111',
      }}
    >
      <span className="card-corner top">{value}<br />{suit}</span>
      <span className="card-suit-center">{suit}</span>
      <span className="card-corner bottom">{value}<br />{suit}</span>
    </div>
  )
}

function ModalInput({ type, placeholder }) {
  return (
    <input
      type={type}
      placeholder={placeholder}
      onKeyDown={playKeyClick}
    />
  )
}

function SignUpModal({ onClose }) {
  const close = () => { playModalClose(); onClose() }
  return (
    <div className="modal-overlay" onClick={close}>
      <div className="modal" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <span className="modal-title">CREATE ACCOUNT</span>
          <div className="modal-controls">
            <button className="modal-close" onClick={close}>✕</button>
          </div>
        </div>
        <div className="modal-body">
          <div className="field">
            <label>USERNAME</label>
            <ModalInput type="text" placeholder="enter username" />
          </div>
          <div className="field">
            <label>PASSWORD</label>
            <ModalInput type="password" placeholder="••••••••" />
          </div>
          <button className="modal-submit">LET'S PLAY</button>
        </div>
      </div>
    </div>
  )
}

function LoginModal({ onClose }) {
  const close = () => { playModalClose(); onClose() }
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
            <ModalInput type="text" placeholder="enter username" />
          </div>
          <div className="field">
            <label>PASSWORD</label>
            <ModalInput type="password" placeholder="••••••••" />
          </div>
          <button className="modal-submit">LOG IN</button>
        </div>
      </div>
    </div>
  )
}

function App() {
  const [hand, setHand] = useState(randomHand)
  const [dealKey, setDealKey] = useState(0)
  const [modal, setModal] = useState(null) // 'signup' | 'login' | null

  useEffect(() => {
    const id = setInterval(() => {
      setHand(randomHand())
      setDealKey(k => k + 1)
    }, 10000)
    return () => clearInterval(id)
  }, [])

  return (
    <div className="homepage">
      <h1 className="title">
        POKER <PixelSuit /> JOKER
      </h1>
      <div className="hand">
        {hand.map((card, i) => (
          <Card key={`${dealKey}-${i}`} {...card} angle={FAN_ANGLES[i]} index={i} dealKey={dealKey} />
        ))}
      </div>
      <div className="btn-group">
        <button className="cta-btn" onClick={() => { playModalOpen(); setModal('signup') }}>Create an Account</button>
        <button className="cta-btn secondary" onClick={() => { playModalOpen(); setModal('login') }}>Log In</button>
      </div>
      {modal === 'signup' && <SignUpModal onClose={() => setModal(null)} />}
      {modal === 'login'  && <LoginModal  onClose={() => setModal(null)} />}
    </div>
  )
}

export default App
