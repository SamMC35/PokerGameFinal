import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { playKeyClick } from './sounds'
import { showToast } from './Toast'
import CharacterAvatar from './CharacterAvatar'
import useRoomPlayers from './useRoomPlayers'
import useRoomState from './useRoomState'
import { HAIRS, HAIR_COLORS, FACES, EYE_COLORS, SKINS, SHIRTS, SHIRT_COLORS } from './CharacterCreator'
import './RoomPage.css'

const DEFAULT_CHAR = { hairIdx:0, hairColorIdx:0, faceIdx:0, eyeColorIdx:0, skinIdx:0, shirtIdx:0, shirtColorIdx:0 }

function resolveCharState(c) {
  if (!c) return DEFAULT_CHAR
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

const HAND_RANKINGS = [
  { name: 'Royal Flush',     desc: 'A K Q J 10 same suit',     cards: [{v:'A',s:'♠'},{v:'K',s:'♠'},{v:'Q',s:'♠'},{v:'J',s:'♠'},{v:'10',s:'♠'}] },
  { name: 'Straight Flush',  desc: '5 in sequence, same suit', cards: [{v:'9',s:'♥'},{v:'8',s:'♥'},{v:'7',s:'♥'},{v:'6',s:'♥'},{v:'5',s:'♥'}] },
  { name: 'Four of a Kind',  desc: '4 cards of same rank',     cards: [{v:'K',s:'♠'},{v:'K',s:'♥'},{v:'K',s:'♦'},{v:'K',s:'♣'},{v:'2',s:'♠'}] },
  { name: 'Full House',      desc: '3 of a kind + a pair',     cards: [{v:'J',s:'♠'},{v:'J',s:'♥'},{v:'J',s:'♦'},{v:'4',s:'♣'},{v:'4',s:'♥'}] },
  { name: 'Flush',           desc: '5 cards same suit',        cards: [{v:'A',s:'♦'},{v:'J',s:'♦'},{v:'8',s:'♦'},{v:'5',s:'♦'},{v:'2',s:'♦'}] },
  { name: 'Straight',        desc: '5 cards in sequence',      cards: [{v:'8',s:'♠'},{v:'7',s:'♥'},{v:'6',s:'♦'},{v:'5',s:'♣'},{v:'4',s:'♠'}] },
  { name: 'Three of a Kind', desc: '3 cards of same rank',     cards: [{v:'7',s:'♠'},{v:'7',s:'♥'},{v:'7',s:'♦'},{v:'K',s:'♣'},{v:'2',s:'♠'}] },
  { name: 'Two Pair',        desc: 'Two different pairs',      cards: [{v:'Q',s:'♠'},{v:'Q',s:'♦'},{v:'9',s:'♥'},{v:'9',s:'♣'},{v:'A',s:'♠'}] },
  { name: 'One Pair',        desc: 'Two cards of same rank',   cards: [{v:'10',s:'♠'},{v:'10',s:'♥'},{v:'A',s:'♦'},{v:'6',s:'♣'},{v:'3',s:'♠'}] },
  { name: 'High Card',       desc: 'Highest card wins',        cards: [{v:'A',s:'♠'},{v:'J',s:'♦'},{v:'8',s:'♣'},{v:'5',s:'♥'},{v:'2',s:'♠'}] },
]

const RED_SUITS = new Set(['♥','♦'])

function MiniCard({ v, s }) {
  const red = RED_SUITS.has(s)
  const color = red ? '#cc0000' : '#111'
  return (
    <div className="mini-card">
      <span className="mc-top" style={{ color }}>{v}<br/>{s}</span>
      <span className="mc-suit" style={{ color }}>{s}</span>
      <span className="mc-bot" style={{ color }}>{v}<br/>{s}</span>
    </div>
  )
}

export default function RoomPage({ room, user, isAdmin, onBack }) {
  const navigate    = useNavigate()
  const players     = useRoomPlayers(room.roomId, user.id)
  const gameStarted = useRoomState(room.roomId)

  useEffect(() => {
    if (gameStarted) navigate('/game', { state: { players, room, user } })
  }, [gameStarted])

  async function handleStart() {
    playKeyClick()
    try {
      const res = await fetch(`/startRoom?roomId=${room.roomId}`, { method: 'POST' })
      if (!res.ok) showToast('could not start game')
    } catch {
      showToast('could not reach server')
    }
  }

  return (
    <div className="room-page">

      {/* ── Top bar ── */}
      <div className="room-topbar">
        <span className="room-topbar-title">♠ {room.roomName}</span>
        <div className="room-topbar-right">
          <span className="room-id-badge">ROOM #{room.roomId}</span>
          <button className="room-back-btn" onClick={onBack}>✕ LEAVE</button>
        </div>
      </div>

      {/* ── Main layout ── */}
      <div className="room-layout">

        {/* ══ LEFT — Room details + Players ══ */}
        <div className="room-left">

          {/* Room info panel */}
          <div className="room-panel">
            <div className="room-panel-title">
              <span className="rpt-icon">🎰</span> ROOM INFO
            </div>
            <div className="room-panel-body">
              <div className="info-row">
                <span className="info-label">ROOM ID</span>
                <span className="info-value gold">{room.roomId}</span>
              </div>
              <div className="info-row">
                <span className="info-label">ROOM NAME</span>
                <span className="info-value">{room.roomName}</span>
              </div>
              <div className="info-row">
                <span className="info-label">STARTING $</span>
                <span className="info-value gold">${room.startingMoney.toLocaleString()}</span>
              </div>
              <div className="info-row">
                <span className="info-label">STATUS</span>
                <span className={`info-value ${room.isGameOn ? 'green' : 'dim'}`}>
                  {room.isGameOn ? '● IN GAME' : '○ WAITING'}
                </span>
              </div>
            </div>
          </div>

          {/* Players panel */}
          <div className="room-panel room-players-panel">
            <div className="room-panel-title">
              <span className="rpt-icon">♣</span> PLAYERS
            </div>
            <div className="room-players-list">
              {players.length === 0 && (
                <div className="rp-empty">waiting for players...</div>
              )}

              {players.map(p => {
                const isHost = p.id === room.adminPlayerId
                const isMe   = p.id === user.id
                return (
                  <div key={p.id} className={`room-player-row${isMe ? ' me' : ''}`}>
                    <div className="rp-avatar-wrap">
                      <CharacterAvatar state={resolveCharState(p.characterJson)} size={40} />
                      <div className="rp-dot"/>
                    </div>
                    <div className="rp-info">
                      <span className="rp-name">
                        {p.userName}{isMe ? ' (you)' : ''}
                        {isHost && <span className="rp-crown"> ♛</span>}
                      </span>
                      <span className="rp-tag">{isHost ? 'HOST' : 'PLAYER'}</span>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>

        </div>

        {/* ══ RIGHT — Chat + Cheat Sheet ══ */}
        <div className="room-right">

          {/* Chat WIP */}
          <div className="room-panel room-chat-panel">
            <div className="room-panel-title">
              <span className="rpt-icon">💬</span> CHAT
            </div>
            <div className="chat-wip">
              <span className="chat-wip-icon">🚧</span>
              <span className="chat-wip-title">CHAT IN DEVELOPMENT</span>
              <span className="chat-wip-sub">sorry for the inconvenience</span>
            </div>
          </div>

          {/* Cheat sheet */}
          <div className="room-panel cheat-panel">
            <div className="room-panel-title">
              <span className="rpt-icon">📖</span> HAND RANKINGS
            </div>
            <div className="cheat-list">
              {HAND_RANKINGS.map((h, i) => (
                <div key={h.name} className="cheat-row">
                  <span className="cheat-rank">#{i + 1}</span>
                  <div className="cheat-cards">
                    {h.cards.map((c, j) => <MiniCard key={j} v={c.v} s={c.s} />)}
                  </div>
                  <div className="cheat-info">
                    <span className="cheat-name">{h.name}</span>
                    <span className="cheat-desc">{h.desc}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

        </div>

      </div>

      {/* ── Bottom bar: start / waiting ── */}
      <div className="room-bottombar">
        {isAdmin ? (
          <button className="start-btn" onClick={() => handleStart()}>
            ▶ START GAME
          </button>
        ) : (
          <span className="waiting-text">⏳ waiting for host to start the game...</span>
        )}
      </div>

    </div>
  )
}

