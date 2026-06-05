import { useRef, useEffect, useState } from 'react'

const SUITS = ['♠', '♥', '♦', '♣']
const COLORS = ['#fff', '#ff4444', '#ff4444', '#fff']

export default function PixelSuit() {
  const canvasRef = useRef(null)
  const suitIndex = useRef(0)
  const pixelSize = useRef(1)
  const direction = useRef(1) // 1 = pixelating, -1 = depixelating
  const frameRef = useRef(null)

  useEffect(() => {
    const canvas = canvasRef.current
    const ctx = canvas.getContext('2d')
    const W = canvas.width
    const H = canvas.height

    function draw() {
      const ps = Math.round(pixelSize.current)
      const suit = SUITS[suitIndex.current]
      const color = COLORS[suitIndex.current]

      // draw suit to a tiny offscreen canvas
      const small = document.createElement('canvas')
      const sw = Math.max(1, Math.floor(W / ps))
      const sh = Math.max(1, Math.floor(H / ps))
      small.width = sw
      small.height = sh
      const sCtx = small.getContext('2d')
      sCtx.clearRect(0, 0, sw, sh)
      sCtx.fillStyle = color
      sCtx.font = `bold ${sh * 0.85}px serif`
      sCtx.textAlign = 'center'
      sCtx.textBaseline = 'middle'
      sCtx.fillText(suit, sw / 2, sh / 2)

      // scale up without smoothing = pixel blocks
      ctx.clearRect(0, 0, W, H)
      ctx.imageSmoothingEnabled = false
      ctx.drawImage(small, 0, 0, W, H)
    }

    function tick() {
      // update pixel size
      pixelSize.current += direction.current * 1.6

      if (pixelSize.current >= 32) {
        pixelSize.current = 32
        direction.current = -1
        // swap suit at peak pixelation
        suitIndex.current = (suitIndex.current + 1) % SUITS.length
      } else if (pixelSize.current <= 1) {
        pixelSize.current = 1
        direction.current = 1
      }

      draw()
      frameRef.current = requestAnimationFrame(tick)
    }

    // slow it down with a setTimeout wrapper
    let last = 0
    let holdFrames = 0
    const HOLD_DURATION = 333 // ~10 seconds at 33fps

    function slowTick(ts) {
      if (ts - last > 30) { // ~33fps
        last = ts

        if (direction.current === 1 && pixelSize.current >= 32) {
          // at peak — swap suit and start coming back
          pixelSize.current = 32
          direction.current = -1
          suitIndex.current = (suitIndex.current + 1) % SUITS.length
        } else if (direction.current === -1 && pixelSize.current <= 1) {
          // fully clear — hold here
          pixelSize.current = 1
          holdFrames++
          if (holdFrames >= HOLD_DURATION) {
            holdFrames = 0
            direction.current = 1
          }
        } else {
          // fast transition — bigger step
          pixelSize.current += direction.current * 3.5
        }

        draw()
      }
      frameRef.current = requestAnimationFrame(slowTick)
    }

    frameRef.current = requestAnimationFrame(slowTick)
    return () => cancelAnimationFrame(frameRef.current)
  }, [])

  return (
    <canvas
      ref={canvasRef}
      width={110}
      height={110}
      className="pixel-suit"
    />
  )
}
