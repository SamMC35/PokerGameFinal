import { useEffect, useState } from 'react'
import { Client } from '@stomp/stompjs'

export default function useRoomState(roomId) {
  const [gameStarted, setGameStarted] = useState(false)

  // ── Initial check via REST ────────────────────────
  useEffect(() => {
    if (!roomId) return
    fetch(`/state?roomId=${roomId}`)
      .then(r => r.ok ? r.json() : null)
      .then(data => { if (data?.isGameOn) setGameStarted(true) })
      .catch(() => {})
  }, [roomId])

  // ── Live update via WebSocket ─────────────────────
  useEffect(() => {
    if (!roomId) return
    let client

    try {
      client = new Client({
        brokerURL: `ws://${window.location.hostname}:8080/ws`,
        reconnectDelay: 5000,
        onConnect: () => {
          client.subscribe(`/topic/room/${roomId}/state`, (msg) => {
            try {
              const data = JSON.parse(msg.body)
              if (data?.isGameOn) setGameStarted(true)
            } catch (e) { console.error('Failed to parse room state', e) }
          })
        },
        onStompError:     (f) => console.warn('STOMP error', f),
        onWebSocketError: (e) => console.warn('WS error', e),
      })
      client.activate()
    } catch (e) { console.warn('WebSocket init failed', e) }

    return () => { try { client?.deactivate() } catch {} }
  }, [roomId])

  return gameStarted
}
