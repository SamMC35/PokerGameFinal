export function playKeyClick() {
  const ctx = new (window.AudioContext || window.webkitAudioContext)()
  const now = ctx.currentTime

  // short noise tick — mechanical key feel
  const bufferSize = ctx.sampleRate * 0.03
  const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate)
  const data = buffer.getChannelData(0)
  for (let i = 0; i < bufferSize; i++) {
    data[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / bufferSize, 4)
  }

  const noise = ctx.createBufferSource()
  noise.buffer = buffer

  const filter = ctx.createBiquadFilter()
  filter.type = 'bandpass'
  filter.frequency.value = 3200
  filter.Q.value = 1.2

  // tiny square tone underneath for that retro clicky feel
  const osc = ctx.createOscillator()
  osc.type = 'square'
  osc.frequency.value = 1200
  const oscGain = ctx.createGain()
  oscGain.gain.setValueAtTime(0.06, now)
  oscGain.gain.exponentialRampToValueAtTime(0.001, now + 0.025)

  const noiseGain = ctx.createGain()
  noiseGain.gain.setValueAtTime(0.3, now)
  noiseGain.gain.exponentialRampToValueAtTime(0.001, now + 0.03)

  noise.connect(filter)
  filter.connect(noiseGain)
  noiseGain.connect(ctx.destination)

  osc.connect(oscGain)
  oscGain.connect(ctx.destination)

  noise.start(now)
  noise.stop(now + 0.03)
  osc.start(now)
  osc.stop(now + 0.025)
}

function playTones(freqs) {
  const ctx = new (window.AudioContext || window.webkitAudioContext)()
  const now = ctx.currentTime

  freqs.forEach((freq, i) => {
    const osc = ctx.createOscillator()
    const gain = ctx.createGain()

    osc.type = 'square'
    osc.frequency.setValueAtTime(freq, now + i * 0.055)

    gain.gain.setValueAtTime(0, now + i * 0.055)
    gain.gain.linearRampToValueAtTime(0.15, now + i * 0.055 + 0.005)
    gain.gain.exponentialRampToValueAtTime(0.001, now + i * 0.055 + 0.07)

    osc.connect(gain)
    gain.connect(ctx.destination)

    osc.start(now + i * 0.055)
    osc.stop(now + i * 0.055 + 0.07)
  })
}

export function playModalOpen() {
  // ascending: low → mid → high
  playTones([440, 660, 880])
}

export function playModalClose() {
  // descending: high → mid → low
  playTones([880, 660, 440])
}

export function playCardDeal() {
  playTones([880, 660])
}

export function playChipStack(numChips = 4) {
  const ctx = new (window.AudioContext || window.webkitAudioContext)()

  for (let i = 0; i < numChips; i++) {
    const now = ctx.currentTime + i * 0.1

    // Short filtered noise burst — the "click" of a chip landing
    const bufSize = ctx.sampleRate * 0.04
    const buffer  = ctx.createBuffer(1, bufSize, ctx.sampleRate)
    const data    = buffer.getChannelData(0)
    for (let j = 0; j < bufSize; j++) {
      data[j] = (Math.random() * 2 - 1) * Math.pow(1 - j / bufSize, 3)
    }

    const noise = ctx.createBufferSource()
    noise.buffer = buffer

    // High bandpass for that sharp plastic click
    const hpf = ctx.createBiquadFilter()
    hpf.type = 'bandpass'
    hpf.frequency.value = 2400 + Math.random() * 400  // slight variation per chip
    hpf.Q.value = 2.5

    // Pitched "ping" underneath — gives it the ceramic ring
    const osc  = ctx.createOscillator()
    const ping = ctx.createGain()
    osc.type = 'sine'
    osc.frequency.setValueAtTime(900 + i * 40, now)   // slightly rising pitch as stack grows
    ping.gain.setValueAtTime(0.18, now)
    ping.gain.exponentialRampToValueAtTime(0.001, now + 0.18)

    const noiseGain = ctx.createGain()
    noiseGain.gain.setValueAtTime(0.35, now)
    noiseGain.gain.exponentialRampToValueAtTime(0.001, now + 0.04)

    noise.connect(hpf)
    hpf.connect(noiseGain)
    noiseGain.connect(ctx.destination)

    osc.connect(ping)
    ping.connect(ctx.destination)

    noise.start(now); noise.stop(now + 0.04)
    osc.start(now);   osc.stop(now + 0.18)
  }
}
