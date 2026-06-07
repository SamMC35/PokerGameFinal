import { useState, useRef, useEffect } from 'react'
import { playKeyClick, playModalOpen } from './sounds'
import CharacterAvatar from './CharacterAvatar'
import './ChatPage.css'

// Mock players with character states
const PLAYERS = {
  dealer:  { name: 'dealer',  char: { hairIdx: 0, hairColorIdx: 5, faceIdx: 1, eyeColorIdx: 2, skinIdx: 0, shirtIdx: 2, shirtColorIdx: 5 } },
  ace_99:  { name: 'ace_99',  char: { hairIdx: 1, hairColorIdx: 0, faceIdx: 2, eyeColorIdx: 0, skinIdx: 2, shirtIdx: 0, shirtColorIdx: 0 } },
  queen_b: { name: 'queen_b', char: { hairIdx: 4, hairColorIdx: 3, faceIdx: 3, eyeColorIdx: 3, skinIdx: 4, shirtIdx: 1, shirtColorIdx: 6 } },
  You:     { name: 'You',     char: { hairIdx: 5, hairColorIdx: 2, faceIdx: 0, eyeColorIdx: 1, skinIdx: 1, shirtIdx: 3, shirtColorIdx: 2 } },
}

const MOCK_MESSAGES = [
  { id: 1, user: 'dealer',  text: 'Welcome to the table.',  time: '9:41' },
  { id: 2, user: 'ace_99',  text: 'gl hf everyone 🃏',       time: '9:41' },
  { id: 3, user: 'You',     text: 'thanks, you too!',        time: '9:42' },
  { id: 4, user: 'queen_b', text: 'raise.',                  time: '9:43' },
  { id: 5, user: 'ace_99',  text: 'lol already?',            time: '9:43' },
  { id: 6, user: 'You',     text: 'I call',                  time: '9:44' },
  { id: 7, user: 'dealer',  text: 'Flop: ♥A ♦K ♣7',         time: '9:44' },
  { id: 8, user: 'queen_b', text: 'check.',                  time: '9:45' },
]

export default function ChatPage({ onBack }) {
  const [messages, setMessages] = useState(MOCK_MESSAGES)
  const [input, setInput]       = useState('')
  const inputRef                = useRef(null)
  const bottomRef               = useRef(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  function send() {
    if (!input.trim()) return
    setMessages(m => [...m, {
      id:   Date.now(),
      user: 'You',
      text: input.trim(),
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    }])
    setInput('')
  }

  return (
    <div className="chat-page">
      <div className="chat-window">

        {/* Title bar */}
        <div className="chat-titlebar">
          <span className="chat-title">♠ TABLE CHAT — Room #4</span>
          <div className="chat-controls">
            <button className="chat-ctrl">─</button>
            <button className="chat-ctrl">□</button>
            <button className="chat-ctrl" onClick={onBack}>✕</button>
          </div>
        </div>

        {/* Player list */}
        <div className="chat-players">
          {Object.values(PLAYERS).map(({ name, char }) => (
            <div key={name} className="chat-player-chip">
              <CharacterAvatar state={char} size={32} />
              <span className="chat-player-name">{name}</span>
            </div>
          ))}
        </div>

        {/* Messages */}
        <div className="chat-messages">
          {messages.map(msg => {
            const isSelf = msg.user === 'You'
            const player = PLAYERS[msg.user]
            return (
              <div key={msg.id} className={`chat-msg ${isSelf ? 'self' : ''}`}>
                <div className="chat-avatar-wrap">
                  <CharacterAvatar state={player.char} size={36} />
                </div>
                <div className="chat-bubble-wrap">
                  {!isSelf && <span className="chat-username">{msg.user}</span>}
                  <div className="chat-bubble">
                    {msg.text}
                    <span className="chat-time">{msg.time}</span>
                  </div>
                </div>
              </div>
            )
          })}
          <div ref={bottomRef} />
        </div>

        {/* Input */}
        <div className="chat-inputbar">
          <input
            ref={inputRef}
            className="chat-input"
            type="text"
            placeholder="say something..."
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={e => { playKeyClick(); if (e.key === 'Enter') send() }}
          />
          <button className="chat-send" onClick={() => { playModalOpen(); send() }}>
            SEND ►
          </button>
        </div>

      </div>
    </div>
  )
}
