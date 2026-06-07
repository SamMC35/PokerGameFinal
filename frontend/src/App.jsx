import { useState, useEffect } from 'react'
import { Routes, Route, Navigate, useNavigate } from 'react-router-dom'
import './App.css'
import PixelSuit from './PixelSuit'
import CharacterAvatar from './CharacterAvatar'
import { HAIRS, HAIR_COLORS, FACES, EYE_COLORS, SKINS, SHIRTS, SHIRT_COLORS } from './CharacterCreator'
import Toast from './Toast'
import SignUpModal from './SignUpModal'
import LoginModal from './LoginModal'
import CreateRoomModal from './CreateRoomModal'
import JoinRoomModal from './JoinRoomModal'
import ChatPage from './ChatPage'
import GamePage from './GamePage'
import RoomPage from './RoomPage'
import { playModalOpen } from './sounds'

// ── Helpers ──────────────────────────────────────
const SUITS      = ['♠', '♥', '♦', '♣']
const VALUES     = ['A', 'K', 'Q', 'J', '10', '9', '8', '7', '6', '5', '4', '3', '2']
const FAN_ANGLES = [-24, -12, 0, 12, 24]

function randomHand() {
  const deck = SUITS.flatMap(suit => VALUES.map(value => ({ suit, value })))
  return deck.sort(() => Math.random() - 0.5).slice(0, 5)
}

function Card({ suit, value, angle, index, dealKey }) {
  const isRed = suit === '♥' || suit === '♦'
  return (
    <div
      key={dealKey}
      className="card"
      style={{ '--angle': `${angle}deg`, '--delay': `${index * 0.08}s`, color: isRed ? '#cc0000' : '#111' }}
    >
      <span className="card-corner top">{value}<br />{suit}</span>
      <span className="card-suit-center">{suit}</span>
      <span className="card-corner bottom">{value}<br />{suit}</span>
    </div>
  )
}

const DEFAULT_CHAR = { hairIdx: 0, hairColorIdx: 0, faceIdx: 0, skinIdx: 0, shirtIdx: 0, eyeColorIdx: 0, shirtColorIdx: 0 }

function resolveCharState(characterJson) {
  if (!characterJson) return DEFAULT_CHAR
  return {
    hairIdx:       Math.max(0, HAIRS.findIndex(h => h.label === characterJson.hair)),
    hairColorIdx:  Math.max(0, HAIR_COLORS.indexOf(characterJson.hairColor)),
    faceIdx:       Math.max(0, FACES.findIndex(f => f.label === characterJson.face)),
    eyeColorIdx:   Math.max(0, EYE_COLORS.indexOf(characterJson.eyeColor)),
    skinIdx:       Math.max(0, SKINS.indexOf(characterJson.skin)),
    shirtIdx:      Math.max(0, SHIRTS.findIndex(s => s.label === characterJson.shirt)),
    shirtColorIdx: Math.max(0, SHIRT_COLORS.indexOf(characterJson.shirtColor)),
  }
}

// ── Session persistence ──────────────────────────
function loadSession() {
  try {
    return {
      user: JSON.parse(sessionStorage.getItem('pj_user')),
      room: JSON.parse(sessionStorage.getItem('pj_room')),
    }
  } catch { return { user: null, room: null } }
}

// ── Homepage ─────────────────────────────────────
function HomePage({ user, setUser, room, setRoom }) {
  const navigate = useNavigate()
  const [hand,    setHand]    = useState(randomHand)
  const [dealKey, setDealKey] = useState(0)
  const [modal,   setModal]   = useState(null)

  useEffect(() => {
    const id = setInterval(() => { setHand(randomHand()); setDealKey(k => k + 1) }, 10000)
    return () => clearInterval(id)
  }, [])

  function handleLogin(u) {
    setUser(u)
    sessionStorage.setItem('pj_user', JSON.stringify(u))
    setModal(null)
  }

  function handleRoomCreated(r) {
    const full = { ...r, adminPlayerId: user.id }
    setRoom(full)
    sessionStorage.setItem('pj_room', JSON.stringify(full))
    setModal(null)
    navigate(`/room/${r.roomId}`)
  }

  function handleRoomJoined(r) {
    setRoom(r)
    sessionStorage.setItem('pj_room', JSON.stringify(r))
    setModal(null)
    navigate(`/room/${r.roomId}`)
  }

  function handleLogout() {
    setUser(null)
    sessionStorage.removeItem('pj_user')
    sessionStorage.removeItem('pj_room')
  }

  return (
    <div className="homepage">
      <h1 className="title">POKER <PixelSuit /> JOKER</h1>

      <div className="hand">
        {hand.map((card, i) => (
          <Card key={`${dealKey}-${i}`} {...card} angle={FAN_ANGLES[i]} index={i} dealKey={dealKey} />
        ))}
      </div>

      {user ? (
        <div className="lobby">
          <div className="profile-card">
            <div className="profile-avatar">
              <CharacterAvatar state={resolveCharState(user.characterJson)} size={64} />
            </div>
            <div className="profile-info">
              <span className="profile-name">{user.userName}</span>
              <span className="profile-status">● online</span>
            </div>
            <button className="profile-logout" onClick={handleLogout}>LOG OUT</button>
          </div>
          <div className="room-actions">
            <button className="cta-btn"           onClick={() => { playModalOpen(); setModal('createRoom') }}>♠ CREATE ROOM</button>
            <button className="cta-btn secondary" onClick={() => { playModalOpen(); setModal('joinRoom') }}>♣ JOIN ROOM</button>
          </div>
        </div>
      ) : (
        <div className="btn-group">
          <button className="cta-btn"           onClick={() => { playModalOpen(); setModal('signup') }}>Create an Account</button>
          <button className="cta-btn secondary" onClick={() => { playModalOpen(); setModal('login') }}>Log In</button>
          <button className="cta-btn secondary" onClick={() => navigate('/chat')}>Chat Demo</button>
          <button className="cta-btn secondary" onClick={() => navigate('/game')}>Game Demo</button>
        </div>
      )}

      {modal === 'signup'     && <SignUpModal     onClose={() => setModal(null)} onLogin={handleLogin} />}
      {modal === 'login'      && <LoginModal      onClose={() => setModal(null)} onLogin={handleLogin} />}
      {modal === 'createRoom' && <CreateRoomModal onClose={() => setModal(null)} user={user} onRoomCreated={handleRoomCreated} />}
      {modal === 'joinRoom'   && <JoinRoomModal   onClose={() => setModal(null)} onRoomJoined={handleRoomJoined} user={user} />}
    </div>
  )
}

// ── Protected room wrapper ────────────────────────
function RoomRoute({ user, room }) {
  const navigate = useNavigate()
  if (!user || !room) return <Navigate to="/" replace />
  return (
    <RoomPage
      room={room}
      user={user}
      isAdmin={room.adminPlayerId === user.id}
      onBack={() => {
        sessionStorage.removeItem('pj_room')
        navigate('/')
      }}
    />
  )
}

// ── App (router) ──────────────────────────────────
export default function App() {
  const session = loadSession()
  const [user, setUser] = useState(session.user)
  const [room, setRoom] = useState(session.room)

  return (
    <>
      <Toast />
      <Routes>
        <Route path="/"           element={<HomePage user={user} setUser={setUser} room={room} setRoom={setRoom} />} />
        <Route path="/room/:id"   element={<RoomRoute user={user} room={room} />} />
        <Route path="/chat"       element={<ChatPage  onBack={() => history.back()} />} />
        <Route path="/game"       element={<GamePage  onBack={() => history.back()} />} />
        <Route path="*"           element={<Navigate to="/" replace />} />
      </Routes>
    </>
  )
}
