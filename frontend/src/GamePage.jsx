import { useState, useRef, useEffect } from 'react'
import { useLocation } from 'react-router-dom'
import { playKeyClick, playModalOpen } from './sounds'
import CharacterAvatar from './CharacterAvatar'
import { HAIRS, HAIR_COLORS, FACES, EYE_COLORS, SKINS, SHIRTS, SHIRT_COLORS } from './CharacterCreator'
import './GamePage.css'

// ── Mock table cards (real cards come from backend later) ──
const MY_HAND = [
  { value: 'A', suit: '♠', red: false },
  { value: 'K', suit: '♥', red: true  },
]

const TABLE_CARDS = [
  { value: '10', suit: '♦', red: true  },
  { value: 'J',  suit: '♣', red: false },
  { value: 'Q',  suit: '♥', red: true  },
  null,
  null,
]

function resolveCharState(c) {
  if (!c) return { hairIdx:0, hairColorIdx:0, faceIdx:0, eyeColorIdx:0, skinIdx:0, shirtIdx:0, shirtColorIdx:0 }
  return {
    hairIdx:       Math.max(0, HAIRS.findIndex(h => h.label === c.hair)),
    hairColorIdx:  Math.max(0, HAIR_COLORS.indexOf(c.hairColor)),
    faceIdx:       Math.max(0, FACES.findIndex(f => f.label === c.face)),
    eyeColorIdx:   Math.max(0, EYE_COLORS.indexOf(c.eyeColor)),
    skinIdx:       Math.max(0, SKINS.indexOf(c.skin)),
    shirtIdx:      Math.max(0, SHIRTS.findIndex(s => s.label === c.shirt)),
    shirtColorIdx: Math.max(0, SHIRT_COLORS.indexOf(c.shirtColor)),
  }
}

const GAME_LOG = []

// icon + colour per event type
const LOG_META = {
  deal:   { icon: '🃏', color: '#ffe0e0' },
  blind:  { icon: '👁',  color: '#ffcc88' },
  raise:  { icon: '▲',  color: '#ff9999' },
  call:   { icon: '→',  color: '#aaddff' },
  check:  { icon: '✓',  color: '#aaffaa' },
  fold:   { icon: '✕',  color: '#888888' },
  flop:   { icon: '♦',  color: '#FFD700' },
  turn:   { icon: '♥',  color: '#FFD700' },
  river:  { icon: '♠',  color: '#FFD700' },
  win:    { icon: '★',  color: '#FFD700' },
}

// ── Playing card ──
function PlayingCard({ value, suit, red, hidden, index }) {
  return (
    <div
      className={`game-card${hidden ? ' hidden' : ''}`}
      style={{ animationDelay: `${index * 0.1}s` }}
    >
      {hidden ? (
        <span className="gc-back">✦</span>
      ) : (
        <>
          <span className="gc-corner"     style={{ color: red ? '#cc0000' : '#111' }}>{value}<br/>{suit}</span>
          <span className="gc-suit"       style={{ color: red ? '#cc0000' : '#111' }}>{suit}</span>
          <span className="gc-corner bot" style={{ color: red ? '#cc0000' : '#111' }}>{value}<br/>{suit}</span>
        </>
      )}
    </div>
  )
}

export default function GamePage({ onBack }) {
  const location    = useLocation()
  const { players: roomPlayers = [], room = {}, user = {} } = location.state || {}

  // Split into me vs others
  const me      = roomPlayers.find(p => p.id === user.id) || user
  const others  = roomPlayers.filter(p => p.id !== user.id)

  const [chatInput, setChatInput] = useState('')
  const [messages,  setMessages]  = useState([])
  const bottomRef                 = useRef(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  function sendChat() {
    if (!chatInput.trim()) return
    setMessages(m => [...m, {
      id:   Date.now(),
      user: me.userName,
      text: chatInput.trim(),
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    }])
    setChatInput('')
  }

  return (
    <div className="game-page">

      {/* ── Top bar ── */}
      <div className="game-topbar">
        <span className="game-topbar-title">POKER JOKER — {room.roomName || 'Room'}</span>
        <button className="game-back-btn" onClick={onBack}>✕ LEAVE</button>
      </div>

      {/* ── Layout ── */}
      <div className="game-layout">

        {/* ══ LEFT ══ */}
        <div className="game-left">

          {/* Table Bet */}
          <div className="game-panel">
            <div className="game-panel-title">
              <span className="game-panel-title-icon">💰</span> TABLE BET
            </div>
            <div className="game-panel-body">
              <div className="stat-row">
                <span className="stat-label">POT</span>
                <span className="stat-value">$1,200</span>
              </div>
              <div className="stat-row">
                <span className="stat-label">BLIND</span>
                <span className="stat-value">$100</span>
              </div>
              <div className="stat-row">
                <span className="stat-label">ROUND</span>
                <span className="stat-value">FLOP</span>
              </div>
            </div>
          </div>

          {/* Players */}
          <div className="game-panel players-panel">
            <div className="game-panel-title">
              <span className="game-panel-title-icon">♣</span> PLAYERS
            </div>
            <div className="players-list">
              {others.map(p => (
                <div key={p.id} className="player-row active">
                  <div className="player-avatar-wrap">
                    <CharacterAvatar state={resolveCharState(p.characterJson)} size={40} />
                    <div className="player-dot"/>
                  </div>
                  <div className="player-info">
                    <span className="player-name">{p.userName}</span>
                    <div className="player-money">
                      <span className="player-cash">${room.startingMoney?.toLocaleString()}</span>
                    </div>
                  </div>
                </div>
              ))}
              {/* Me */}
              <div className="player-row active me">
                <div className="player-avatar-wrap">
                  <CharacterAvatar state={resolveCharState(me.characterJson)} size={40} />
                  <div className="player-dot"/>
                </div>
                <div className="player-info">
                  <span className="player-name">{me.userName} ★</span>
                  <div className="player-money">
                    <span className="player-cash">${room.startingMoney?.toLocaleString()}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

        </div>

        {/* ══ CENTER ══ */}

        <div className="game-center">

          {/* Table */}
          <div className="game-panel table-panel">
            <div className="game-panel-title">
              <span className="game-panel-title-icon">🃏</span> TABLE
            </div>
            <div className="table-body">

              {/* Green felt */}
              <div className="table-felt">
                <span className="felt-label">COMMUNITY CARDS</span>
                <div className="table-cards">
                  {TABLE_CARDS.map((card, i) =>
                    card
                      ? <PlayingCard key={i} {...card} index={i} />
                      : <PlayingCard key={i} hidden index={i} />
                  )}
                </div>
                <span className="felt-pot">POT: $1,200</span>
              </div>

              {/* Your hand */}
              <div className="hand-section">
                <span className="hand-label">YOUR HAND</span>
                <div className="my-hand">
                  {MY_HAND.map((card, i) => <PlayingCard key={i} {...card} index={i} />)}
                </div>
              </div>

            </div>
          </div>

          {/* Action buttons */}
          <div className="action-bar">
            <button className="action-btn fold"  onClick={playKeyClick}>FOLD</button>
            <button className="action-btn check" onClick={playKeyClick}>CHECK</button>
            <button className="action-btn call"  onClick={playKeyClick}>CALL $200</button>
            <button className="action-btn raise" onClick={playKeyClick}>RAISE ▲</button>
          </div>

        </div>

        {/* ══ RIGHT — Log + Chat ══ */}
        <div className="game-right">

          {/* Event log */}
          <div className="game-panel log-panel">
            <div className="game-panel-title">
              <span className="game-panel-title-icon">📋</span> EVENT LOG
            </div>
            <div className="log-list">
              {GAME_LOG.map(entry => {
                const meta = LOG_META[entry.type] || LOG_META.deal
                return (
                  <div key={entry.id} className="log-entry">
                    <span className="log-icon" style={{ color: meta.color }}>{meta.icon}</span>
                    <span className="log-msg"  style={{ color: meta.color }}>{entry.msg}</span>
                    <span className="log-time">{entry.time}</span>
                  </div>
                )
              })}
            </div>
          </div>

          {/* Chat */}
          <div className="game-panel chat-panel">
            <div className="game-panel-title">
              <span className="game-panel-title-icon">💬</span> CHAT
            </div>

            <div className="chat-messages">
              {messages.map(msg => {
                const isSelf  = msg.user === me.userName
                const sender  = roomPlayers.find(p => p.userName === msg.user)
                return (
                  <div key={msg.id} className={`chat-msg${isSelf ? ' self' : ''}`}>
                    <div className="chat-avatar-box">
                      <CharacterAvatar state={resolveCharState(sender?.characterJson)} size={32} />
                    </div>
                    <div className="chat-bubble-col">
                      {!isSelf && <span className="chat-uname">{msg.user}</span>}
                      <div className="chat-bubble">{msg.text}</div>
                    </div>
                  </div>
                )
              })}
              <div ref={bottomRef}/>
            </div>

            <div className="chat-inputbar">
              <input
                className="chat-in"
                placeholder="say something..."
                value={chatInput}
                onChange={e => setChatInput(e.target.value)}
                onKeyDown={e => { playKeyClick(); if (e.key === 'Enter') sendChat() }}
              />
              <button className="chat-send-btn" onClick={() => { playModalOpen(); sendChat() }}>
                SEND ►
              </button>
            </div>

          </div>
        </div>

      </div>

      {/* ── Status bar ── */}
      <div className="game-statusbar">
        <span className="status-cell">{room.roomName || 'Room'}</span>
        <span className="status-cell">{roomPlayers.length} Players</span>
        <span className="status-cell">Your turn</span>
        <span className="status-cell status-time">⏱ 0:28</span>
      </div>

    </div>
  )
}
