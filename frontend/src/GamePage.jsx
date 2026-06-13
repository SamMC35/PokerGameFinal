import { useState, useRef, useEffect, useCallback } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { Client } from '@stomp/stompjs'
import { playKeyClick, playModalOpen, playChipStack, playCardDeal } from './sounds'
import CharacterAvatar from './CharacterAvatar'
import { HAIRS, HAIR_COLORS, FACES, EYE_COLORS, SKINS, SHIRTS, SHIRT_COLORS } from './CharacterCreator'
import './GamePage.css'

// ── Card display helpers ─────────────────────────────────────────────────────

const RANK_DISPLAY = {
  TWO:'2', THREE:'3', FOUR:'4', FIVE:'5', SIX:'6',
  SEVEN:'7', EIGHT:'8', NINE:'9', TEN:'10',
  JACK:'J', QUEEN:'Q', KING:'K', ACE:'A',
}
const SUIT_DISPLAY = { HEARTS:'♥', DIAMONDS:'♦', CLUBS:'♣', SPADES:'♠' }
const RED_SUITS    = new Set(['HEARTS', 'DIAMONDS'])

function toDisplayCard(c) {
  if (!c) return null
  return {
    value: RANK_DISPLAY[c.rank]  ?? c.rank,
    suit:  SUIT_DISPLAY[c.suit]  ?? c.suit,
    red:   RED_SUITS.has(c.suit),
  }
}

// ── Character state resolver ─────────────────────────────────────────────────

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

// ── Log metadata ─────────────────────────────────────────────────────────────

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
  info:   { icon: '·',  color: '#aaaaaa' },
}

// ── Street label ─────────────────────────────────────────────────────────────

const STREET_LABEL = {
  WAITING_FOR_PLAYERS: 'WAITING',
  PRE_FLOP: 'PRE-FLOP',
  FLOP: 'FLOP',
  TURN: 'TURN',
  RIVER: 'RIVER',
  SHOWDOWN: 'SHOWDOWN',
}

// ── Position badge ────────────────────────────────────────────────────────────

const POS_BADGE = { DEALER:'D', SMALL_BLIND:'SB', BIG_BLIND:'BB', NORMAL:'' }

// ── Flying chip ──────────────────────────────────────────────────────────────

function FlyingChip({ startX, startY, endX, endY, delay }) {
  const [arrived, setArrived] = useState(false)
  useEffect(() => {
    const t = setTimeout(() => setArrived(true), delay)
    return () => clearTimeout(t)
  }, [])
  return (
    <div className="flying-chip" style={{
      left:      arrived ? endX : startX,
      top:       arrived ? endY : startY,
      opacity:   arrived ? 0    : 1,
      transform: arrived ? 'translate(-50%,-50%) scale(0.2)' : 'translate(-50%,-50%) scale(1)',
      transitionDelay: `${delay}ms`,
    }}>
      <div className="poker-chip"><div className="poker-chip-inner">$</div></div>
    </div>
  )
}

// ── Playing card ─────────────────────────────────────────────────────────────

function PlayingCard({ value, suit, red, hidden, index }) {
  return (
    <div className={`game-card${hidden ? ' hidden' : ''}`}
         style={{ animationDelay: `${index * 0.1}s` }}>
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

// ── Main component ───────────────────────────────────────────────────────────

export default function GamePage({ onBack }) {
  const location  = useLocation()
  const navigate  = useNavigate()

  // location.state is wiped on hard reload — fall back to sessionStorage so the
  // game page stays usable after a Vite restart or accidental browser refresh.
  const _saved = (() => {
    try {
      return {
        user: JSON.parse(sessionStorage.getItem('pj_user')),
        room: JSON.parse(sessionStorage.getItem('pj_room')),
      }
    } catch { return {} }
  })()

  const { players: roomPlayers = [], room = _saved.room || {}, user = _saved.user || {} } = location.state || {}

  // If we still have no roomId (e.g. someone navigated directly to /game),
  // send them home immediately.
  useEffect(() => {
    if (!room?.roomId) navigate('/', { replace: true })
  }, [])

  // ── Live game state from WebSocket ──
  const [gameState,    setGameState]    = useState(null)
  const [showdown,     setShowdown]     = useState(null)
  const [showShowdown, setShowShowdown] = useState(false)
  const [gameOver,     setGameOver]     = useState(false)
  const [gameWinner,   setGameWinner]   = useState(null)  // { name, characterJson }

  // ── UI state ──
  const [gameLog,      setGameLog]      = useState([])
  const [potPulse,     setPotPulse]     = useState(false)
  const [flyingChips,  setFlyingChips]  = useState([])
  const [chipCounts,   setChipCounts]   = useState({})
  const [raiseInput,   setRaiseInput]   = useState('')
  const [countdown,    setCountdown]    = useState(0)   // seconds left before auto-next
  const countdownRef = useRef(null)

  const logBottomRef    = useRef(null)
  const potRef          = useRef(null)
  const tablePlayerRefs = useRef([])
  const playerRefs      = useRef([])
  const winnerRef       = useRef(null)
  const stompRef        = useRef(null)
  const prevStateRef    = useRef(null)
  const gameOverRef     = useRef(false)   // prevents /closed broadcast from clobbering winner screen

  // ── Derived values ──
  const myPlayer = gameState?.playerList?.find(p => p.userId === user.id)
  const others   = gameState?.playerList?.filter(p => p.userId !== user.id) ?? []
  const isMyTurn = myPlayer?.currentPlayer === true
  const pot      = gameState?.pot ?? 0
  const currentBet = gameState?.currentBet ?? 0
  const toCall   = Math.max(0, currentBet - (myPlayer?.bet ?? 0))
  const tableState = gameState?.tableState ?? 'WAITING_FOR_PLAYERS'

  const communityCards = (gameState?.communityCards ?? []).map(toDisplayCard)
  // Pad to 5 slots for layout
  const communitySlots = [...communityCards, ...Array(5 - communityCards.length).fill(null)]

  const myCards = (myPlayer?.hand ?? []).map(toDisplayCard)

  // ── WebSocket setup ──────────────────────────────────────────────────────

  useEffect(() => {
    if (!room.roomId) return

    const client = new Client({
      brokerURL: `${window.location.protocol === 'https:' ? 'wss' : 'ws'}://${window.location.host}/ws`,
      reconnectDelay: 5000,
      onConnect: () => {
        client.subscribe(`/topic/room/${room.roomId}/gameState`, (msg) => {
          try {
            const state = JSON.parse(msg.body)
            setGameState(state)
          } catch (e) { console.error('gameState parse error', e) }
        })

        client.subscribe(`/topic/room/${room.roomId}/showdown`, (msg) => {
          try {
            const sd = JSON.parse(msg.body)
            setShowdown(sd)
            setShowShowdown(true)
            setCountdown(sd.gameOver ? 10 : 8)
            playModalOpen()
            addLog('win', `SHOWDOWN — ${sd.winnerName} wins $${sd.winAmount}!`)
            if (sd.gameOver) {
              addLog('win', `🏆 GAME OVER — ${sd.gameWinnerName} wins everything!`)
            }
          } catch (e) { console.error('showdown parse error', e) }
        })

        client.subscribe(`/topic/room/${room.roomId}/closed`, () => {
          // If this client is already showing the winner screen, let the user
          // click "BACK TO LOBBY" themselves. Otherwise redirect immediately.
          if (!gameOverRef.current) onBack()
        })

        // Fetch current table state immediately — the initial broadcast from
        // startRoom() fires before GamePage mounts, so we'd miss it otherwise.
        fetch(`/tableState?roomId=${room.roomId}`)
          .then(r => r.ok ? r.json() : null)
          .then(state => { if (state) setGameState(state) })
          .catch(() => {})
      },
      onStompError:     f => console.warn('STOMP error', f),
      onWebSocketError: e => console.warn('WS error', e),
    })

    client.activate()
    stompRef.current = client
    return () => { try { client.deactivate() } catch {} }
  }, [room.roomId])

  // ── Detect state changes → add log entries ───────────────────────────────

  useEffect(() => {
    if (!gameState) return
    const prev = prevStateRef.current

    // Street changed
    if (prev && prev.tableState !== gameState.tableState) {
      const street = gameState.tableState
      if (street === 'FLOP')  { playCardDeal(); addLog('flop',  'FLOP dealt') }
      if (street === 'TURN')  { playCardDeal(); addLog('turn',  'TURN dealt') }
      if (street === 'RIVER') { playCardDeal(); addLog('river', 'RIVER dealt') }
    }

    // Player actions since last state
    if (prev?.playerList && gameState.playerList) {
      gameState.playerList.forEach(p => {
        const was = prev.playerList.find(x => x.userId === p.userId)
        if (!was) return
        if (was.currentState === p.currentState) return
        const name = p.userName ?? p.userId
        if (p.currentState === 'FOLDED')  addLog('fold',  `${name} folded`)
        if (p.currentState === 'CALLED')  { playChipStack(2); triggerChipFromPlayer(p, pot); addLog('call',  `${name} called $${toCall}`) }
        if (p.currentState === 'CHECKED') addLog('check', `${name} checked`)
        if (p.currentState === 'RAISED')  { playChipStack(4); triggerChipFromPlayer(p, pot); addLog('raise', `${name} raised to $${p.bet}`) }
      })
    }

    // Pot pulse on increase
    if (prev && prev.pot !== gameState.pot && gameState.pot > prev.pot) {
      setPotPulse(true)
      setTimeout(() => setPotPulse(false), 600)
    }

    prevStateRef.current = gameState
  }, [gameState])

  // ── Deal log on first gameState ──────────────────────────────────────────

  useEffect(() => {
    if (!gameState || prevStateRef.current) return
    addLog('deal', 'Cards dealt — game started!')
    addLog('blind', `Blinds: $${gameState.smallBlind}/$${gameState.bigBlind}`)
  }, [gameState])

  // ── Raise input default ──────────────────────────────────────────────────

  useEffect(() => {
    if (isMyTurn && currentBet > 0) {
      setRaiseInput(String(currentBet * 2))
    }
  }, [isMyTurn, currentBet])

  // ── Showdown chip animation ──────────────────────────────────────────────

  useEffect(() => {
    if (!showShowdown || !showdown) return

    // Initialise chip counts from final wallets
    const counts = {}
    showdown.playerHands.forEach(p => { counts[p.playerId] = p.finalWallet - (p.winner ? showdown.winAmount : 0) })
    setChipCounts(counts)

    const spawnId = setTimeout(() => {
      const winnerEl = winnerRef.current
      if (!winnerEl) return
      const winRect = winnerEl.getBoundingClientRect()
      const endX = winRect.left + winRect.width  / 2
      const endY = winRect.top  + winRect.height / 2

      const chips = []
      playerRefs.current.forEach((el, i) => {
        if (!el) return
        const p = showdown.playerHands[i]
        if (!p || p.winner || p.folded) return
        const r = el.getBoundingClientRect()
        for (let c = 0; c < 4; c++) {
          chips.push({ id: `sd-${i}-${c}`, startX: r.left + r.width/2, startY: r.top + r.height/2, endX, endY, delay: i * 120 + c * 70 })
        }
      })
      setFlyingChips(chips)

      const winner = showdown.playerHands.find(p => p.winner)
      if (!winner) return
      const start = winner.finalWallet - showdown.winAmount
      const end   = winner.finalWallet
      const steps = 40
      const stepMs = 1400 / steps
      let count = 0
      const countId = setTimeout(() => {
        playChipStack(6)
        const id = setInterval(() => {
          count++
          const val = count >= steps ? end : Math.round(start + ((end - start) / steps) * count)
          setChipCounts(prev => ({ ...prev, [winner.playerId]: val }))
          if (count >= steps) clearInterval(id)
        }, stepMs)
      }, 800)
      return () => clearTimeout(countId)
    }, 80)

    return () => clearTimeout(spawnId)
  }, [showShowdown, showdown])

  // ── Showdown countdown → auto next hand / winner screen ─────────────────

  useEffect(() => {
    if (!showShowdown || countdown <= 0) return
    countdownRef.current = setTimeout(() => {
      setCountdown(c => {
        if (c <= 1) { handleNextHand(); return 0 }
        return c - 1
      })
    }, 1000)
    return () => clearTimeout(countdownRef.current)
  }, [showShowdown, countdown])

  // ── Log helpers ──────────────────────────────────────────────────────────

  function addLog(type, msg) {
    const time = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    setGameLog(prev => [...prev, { id: Date.now() + Math.random(), type, msg, time }])
  }

  useEffect(() => { logBottomRef.current?.scrollIntoView({ behavior: 'smooth' }) }, [gameLog])

  // ── Chip animation helper (player row → pot) ─────────────────────────────

  function triggerChipFromPlayer(player, _pot) {
    const idx = (gameState?.playerList ?? []).findIndex(p => p.userId === player.userId)
    const srcEl = tablePlayerRefs.current[idx]
    if (!srcEl || !potRef.current) return
    const srcRect = srcEl.getBoundingClientRect()
    const potRect = potRef.current.getBoundingClientRect()
    const endX = potRect.left + potRect.width  / 2
    const endY = potRect.top  + potRect.height / 2
    const chips = Array.from({ length: 3 }, (_, c) => ({
      id: `chip-${Date.now()}-${c}`,
      startX: srcRect.left + srcRect.width  / 2,
      startY: srcRect.top  + srcRect.height / 2,
      endX, endY, delay: c * 80,
    }))
    setFlyingChips(prev => [...prev, ...chips])
    setTimeout(() => setFlyingChips(prev => prev.filter(c => !c.id.startsWith('chip-'))), 1200)
  }

  // ── Action handlers ──────────────────────────────────────────────────────

  async function sendAction(action, raiseAmount = 0) {
    if (!isMyTurn) return
    playKeyClick()
    try {
      await fetch('/action', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          roomId:      room.roomId,
          playerId:    user.id,
          action,
          raiseAmount: action === 'RAISE' ? Number(raiseAmount) : 0,
        }),
      })
    } catch (e) {
      addLog('info', 'Action failed — server error')
    }
  }

  async function handleNextHand() {
    clearTimeout(countdownRef.current)
    setCountdown(0)
    setShowShowdown(false)
    setFlyingChips([])
    setChipCounts({})

    if (showdown?.gameOver) {
      // Find winner's character from the playerHands list
      const winnerHand = showdown.playerHands?.find(p => p.playerId === showdown.gameWinnerId)
      setGameWinner({
        name: showdown.gameWinnerName,
        characterJson: winnerHand?.characterJson ?? null,
        finalWallet: winnerHand?.finalWallet ?? 0,
      })
      gameOverRef.current = true
      setGameOver(true)
      setShowdown(null)
      // Close room in DB — idempotent, all clients call this but only first delete fires
      fetch(`/closeRoom?roomId=${room.roomId}`, { method: 'POST' }).catch(() => {})
      return
    }

    setShowdown(null)
    try {
      await fetch(`/nextHand?roomId=${room.roomId}`, { method: 'POST' })
    } catch (e) {
      addLog('info', 'Next hand request failed')
    }
  }

  // ── Player row display (in left panel + showdown) ────────────────────────

  function getPlayerState(p) {
    if (!p) return ''
    switch (p.currentState) {
      case 'FOLDED':           return 'folded'
      case 'CALLED':           return 'called'
      case 'RAISED':           return 'raised'
      case 'CHECKED':          return 'checked'
      case 'WAITING_FOR_RAISE':
      case 'WAITING':          return p.currentPlayer ? 'their-turn' : 'waiting'
      default:                 return ''
    }
  }

  const allPlayersForPanel = gameState?.playerList ?? roomPlayers.map(u => ({
    userId: u.id, userName: u.userName, characterJson: u.characterJson,
    wallet: room.startingMoney, bet: 0, currentState: 'WAITING', currentPlayer: false,
    playerPosition: 'NORMAL',
  }))

  // ── Render ───────────────────────────────────────────────────────────────

  return (
    <div className="game-page">

      {/* ── Top bar ── */}
      <div className="game-topbar">
        <span className="game-topbar-title">POKER JOKER — {room.roomName || 'Room'}</span>
        <button className="game-back-btn" onClick={() => {
          if (user.id === room.adminPlayerId?.toString()) {
            fetch(`/closeRoom?roomId=${room.roomId}`, { method: 'POST' }).catch(() => {})
          }
          onBack()
        }}>✕ LEAVE</button>
      </div>

      {/* ── Layout ── */}
      <div className="game-layout">

        {/* ══ LEFT ══ */}
        <div className="game-left">

          {/* Table info */}
          <div className="game-panel">
            <div className="game-panel-title">
              <span className="game-panel-title-icon">💰</span> TABLE INFO
            </div>
            <div className="game-panel-body">
              <div className="stat-row">
                <span className="stat-label">POT</span>
                <span className="stat-value">${pot.toLocaleString()}</span>
              </div>
              <div className="stat-row">
                <span className="stat-label">BLINDS</span>
                <span className="stat-value">${gameState?.smallBlind ?? 10}/${gameState?.bigBlind ?? 20}</span>
              </div>
              <div className="stat-row">
                <span className="stat-label">BET</span>
                <span className="stat-value">${currentBet.toLocaleString()}</span>
              </div>
              <div className="stat-row">
                <span className="stat-label">ROUND</span>
                <span className="stat-value" style={{ fontSize: '8px' }}>{STREET_LABEL[tableState] ?? tableState}</span>
              </div>
            </div>
          </div>

          {/* Players */}
          <div className="game-panel players-panel">
            <div className="game-panel-title">
              <span className="game-panel-title-icon">♣</span> PLAYERS
            </div>
            <div className="players-list">
              {allPlayersForPanel.map((p, i) => {
                const isMe = p.userId === user.id
                const stateClass = getPlayerState(p)
                return (
                  <div
                    key={p.userId ?? i}
                    ref={el => tablePlayerRefs.current[i] = el}
                    className={`player-row active${isMe ? ' me' : ''}${p.currentPlayer ? ' current-turn' : ''}${p.currentState === 'FOLDED' ? ' folded-player' : ''}`}
                  >
                    <div className="player-avatar-wrap">
                      <CharacterAvatar state={resolveCharState(p.characterJson)} size={40} />
                      {p.currentPlayer && <div className="player-turn-arrow">▶</div>}
                      {!p.currentPlayer && <div className="player-dot"/>}
                    </div>
                    <div className="player-info">
                      <span className="player-name">
                        {p.userName ?? 'Player'}{isMe ? ' ★' : ''}
                        {POS_BADGE[p.playerPosition] ? <span className="pos-badge">{POS_BADGE[p.playerPosition]}</span> : null}
                      </span>
                      <div className="player-money">
                        <span className="player-cash">${(p.wallet ?? 0).toLocaleString()}</span>
                        {p.bet > 0 && <span className="player-bet">BET ${p.bet}</span>}
                      </div>
                      {stateClass && <span className={`player-state-badge ${stateClass}`}>{p.currentState?.replace('_', ' ')}</span>}
                    </div>
                  </div>
                )
              })}
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

              {/* Felt */}
              <div className="table-felt">
                <span className="felt-label">COMMUNITY CARDS</span>
                <div className="table-cards">
                  {communitySlots.map((card, i) =>
                    card
                      ? <PlayingCard key={i} {...card} index={i} />
                      : <PlayingCard key={i} hidden index={i} />
                  )}
                </div>
                <span ref={potRef} className={`felt-pot${potPulse ? ' pot-pulse' : ''}`}>
                  POT: ${pot.toLocaleString()}
                </span>
              </div>

              {/* Your hand */}
              <div className="hand-section">
                <span className="hand-label">YOUR HAND</span>
                <div className="my-hand">
                  {myCards.length > 0
                    ? myCards.map((card, i) => <PlayingCard key={i} {...card} index={i} />)
                    : <>
                        <PlayingCard hidden index={0} />
                        <PlayingCard hidden index={1} />
                      </>
                  }
                </div>
              </div>

            </div>
          </div>

          {/* Action bar */}
          <div className="action-bar">
            <button
              className="action-btn fold"
              disabled={!isMyTurn}
              onClick={() => sendAction('FOLD')}
            >FOLD</button>

            <button
              className="action-btn check"
              disabled={!isMyTurn || toCall > 0}
              onClick={() => sendAction('CHECK')}
            >CHECK</button>

            <button
              className="action-btn call"
              disabled={!isMyTurn || toCall === 0}
              onClick={() => sendAction('CALL')}
            >CALL ${toCall}</button>

            <div className="raise-group">
              <input
                className="raise-input"
                type="number"
                value={raiseInput}
                min={currentBet + 1}
                onChange={e => setRaiseInput(e.target.value)}
                disabled={!isMyTurn}
              />
              <button
                className="action-btn raise"
                disabled={!isMyTurn}
                onClick={() => sendAction('RAISE', raiseInput)}
              >RAISE ▲</button>
            </div>

            {!isMyTurn && (
              <span className="waiting-label">Waiting for {
                gameState?.playerList?.find(p => p.currentPlayer)?.userName ?? '...'
              }...</span>
            )}
          </div>

        </div>

        {/* ══ RIGHT — Log ══ */}
        <div className="game-right">
          <div className="game-panel log-panel">
            <div className="game-panel-title">
              <span className="game-panel-title-icon">📋</span> EVENT LOG
            </div>
            <div className="log-list">
              {gameLog.length === 0 && (
                <div className="log-empty">no events yet</div>
              )}
              {gameLog.map(entry => {
                const meta = LOG_META[entry.type] ?? LOG_META.info
                return (
                  <div key={entry.id} className="log-entry">
                    <span className="log-icon" style={{ color: meta.color }}>{meta.icon}</span>
                    <span className="log-msg"  style={{ color: meta.color }}>{entry.msg}</span>
                    <span className="log-time">{entry.time}</span>
                  </div>
                )
              })}
              <div ref={logBottomRef} />
            </div>
          </div>
        </div>

      </div>

      {/* ── Flying chips ── */}
      {flyingChips.map(c => <FlyingChip key={c.id} {...c} />)}

      {/* ── Showdown Modal ── */}
      {showShowdown && showdown && (
        <div className="showdown-overlay" onClick={() => setShowShowdown(false)}>
          <div className="showdown-modal" onClick={e => e.stopPropagation()}>
            <div className="showdown-header">
              <span>★ SHOWDOWN ★</span>
              <button className="game-back-btn" onClick={() => setShowShowdown(false)}>✕</button>
            </div>
            <div className="showdown-body">

              <div className="showdown-winner-banner">
                🏆 {showdown.winnerName} WINS ${showdown.winAmount.toLocaleString()}!
              </div>

              <div className="showdown-players">
                {showdown.playerHands.map((p, pi) => (
                  <div
                    key={p.playerId}
                    ref={el => p.winner ? (winnerRef.current = el) : (playerRefs.current[pi] = el)}
                    className={`showdown-player${p.winner ? ' winner' : ''}${p.folded ? ' folded' : ''}`}
                  >
                    <div className="showdown-player-info">
                      <CharacterAvatar state={resolveCharState(p.characterJson)} size={36} />
                      <span className="showdown-player-name">
                        {p.playerName}{p.winner ? ' ★' : ''}
                      </span>
                      <span className={`showdown-chips${p.winner ? ' counting' : ''}`}>
                        ${(chipCounts[p.playerId] ?? p.finalWallet).toLocaleString()}
                      </span>
                      {p.finalWallet === 0 && <span className="eliminated-badge">ELIMINATED</span>}
                    </div>
                    <div className="showdown-cards">
                      {p.folded
                        ? <><PlayingCard hidden index={0} /><PlayingCard hidden index={1} /></>
                        : (p.holeCards ?? []).map((c, i) => {
                            const dc = toDisplayCard(c)
                            return dc ? <PlayingCard key={i} {...dc} index={i} /> : <PlayingCard key={i} hidden index={i} />
                          })
                      }
                    </div>
                    <span className={`showdown-hand-name${p.winner ? ' winner-hand' : ''}`}>
                      {p.folded ? 'FOLDED' : (p.bestHand?.replace('_', ' ') ?? '—')}
                    </span>
                  </div>
                ))}
              </div>

              {showdown.gameOver ? (
                <button className="showdown-next-btn game-over-btn" onClick={handleNextHand}>
                  🏆 GAME OVER — SEE WINNER {countdown > 0 ? `(${countdown})` : ''}
                </button>
              ) : (
                <button className="showdown-next-btn" onClick={handleNextHand}>
                  ► NEXT HAND {countdown > 0 ? `(${countdown})` : ''}
                </button>
              )}
              {countdown > 0 && (
                <div className="showdown-timer-bar">
                  <div className="showdown-timer-fill" style={{ width: `${(countdown / (showdown.gameOver ? 10 : 8)) * 100}%` }} />
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ── Game Winner Screen ── */}
      {gameOver && gameWinner && (
        <div className="winner-screen-overlay">
          <div className="winner-screen">
            <div className="winner-screen-trophy">🏆</div>
            <div className="winner-screen-title">GAME OVER</div>
            <div className="winner-screen-subtitle">THE CHAMPION</div>
            <div className="winner-screen-avatar">
              <CharacterAvatar state={resolveCharState(gameWinner.characterJson)} size={96} />
            </div>
            <div className="winner-screen-name">{gameWinner.name}</div>
            <div className="winner-screen-chips">
              Final Stack: ${gameWinner.finalWallet.toLocaleString()}
            </div>
            <div className="winner-screen-suits">♠ ♥ ♦ ♣</div>
            <button className="winner-screen-btn" onClick={onBack}>
              ← BACK TO LOBBY
            </button>
          </div>
        </div>
      )}

      {/* ── Status bar ── */}
      <div className="game-statusbar">
        <span className="status-cell">{room.roomName || 'Room'}</span>
        <span className="status-cell">{allPlayersForPanel.length} Players</span>
        <span className="status-cell" style={{ color: isMyTurn ? '#44ff44' : '#ff9999' }}>
          {isMyTurn ? '★ YOUR TURN' : 'Waiting...'}
        </span>
        <span className="status-cell" style={{ marginLeft: 'auto' }}>
          {STREET_LABEL[tableState] ?? tableState}
        </span>
      </div>

    </div>
  )
}
