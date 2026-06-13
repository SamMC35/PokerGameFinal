import { useEffect, useState } from 'react'
import { Client } from '@stomp/stompjs'

export default function useRoomPlayers(roomId, userId) {
  const [players, setPlayers] = useState([])

  useEffect(() => {
    if (!roomId) return
    let client

    try {
      client = new Client({
        brokerURL: `${window.location.protocol === 'https:' ? 'wss' : 'ws'}://${window.location.host}/ws`,
        reconnectDelay: 5000,
        onConnect: () => {
          // Subscribe for live updates when other players join later
          client.subscribe(`/topic/room/${roomId}/players`, (msg) => {
            try { setPlayers(JSON.parse(msg.body)) }
            catch (e) { console.error('Failed to parse player list', e) }
          })

          // Re-add self — the HTTP response now returns the full player list
          // directly, so we don't race the WebSocket broadcast.
          if (userId) {
            fetch(`/addPlayerToRoom?roomId=${roomId}&playerId=${userId}`, { method: 'POST' })
              .then(r => r.ok ? r.json() : null)
              .then(players => { if (Array.isArray(players)) setPlayers(players) })
              .catch(() => {})
          }
        },
        onStompError:     (f) => console.warn('STOMP error', f),
        onWebSocketError: (e) => console.warn('WS error — backend may be offline', e),
      })

      client.activate()
    } catch (e) {
      console.warn('WebSocket init failed', e)
    }

    return () => { try { client?.deactivate() } catch {} }
  }, [roomId, userId])

  return players
}
