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
