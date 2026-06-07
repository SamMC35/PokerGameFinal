import { useEffect, useState } from 'react'
import { Client } from '@stomp/stompjs'

export default function useRoomPlayers(roomId, userId) {
  const [players, setPlayers] = useState([])

  useEffect(() => {
    if (!roomId) return
    let client

    try {
      client = new Client({
        brokerURL: `ws://${window.location.hostname}:8080/ws`,
        reconnectDelay: 5000,
        onConnect: () => {
          // Subscribe first …
          client.subscribe(`/topic/room/${roomId}/players`, (msg) => {
            try { setPlayers(JSON.parse(msg.body)) }
            catch (e) { console.error('Failed to parse player list', e) }
          })

          // … then immediately re-add self so the backend broadcasts the full
          // current playerIds list. This covers the timing gap where the admin's
          // first addPlayerToRoom fired before this WS subscription was ready.
          if (userId) {
            fetch(`/addPlayerToRoom?roomId=${roomId}&playerId=${userId}`, { method: 'POST' })
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
