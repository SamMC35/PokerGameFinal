import { playKeyClick } from './sounds'
import CharacterAvatar from './CharacterAvatar'

const PX = 4
const rect = (x, y, w, h, color) => (
  <rect key={`${x}${y}${w}${h}${color}`} x={x*PX} y={y*PX} width={w*PX} height={h*PX} fill={color}/>
)

export const HAIRS = [
  { label: 'Short',    render: c => <g>{rect(3,1,10,2,c)}{rect(2,2,1,4,c)}{rect(13,2,1,4,c)}</g> },
  { label: 'Long',     render: c => <g>{rect(3,1,10,2,c)}{rect(2,2,1,10,c)}{rect(13,2,1,10,c)}{rect(3,12,2,2,c)}{rect(11,12,2,2,c)}</g> },
  { label: 'Bun',      render: c => <g>{rect(5,0,6,3,c)}{rect(3,2,10,1,c)}{rect(2,3,1,3,c)}{rect(13,3,1,3,c)}</g> },
  { label: 'Ponytail', render: c => <g>{rect(3,1,10,2,c)}{rect(2,2,1,4,c)}{rect(13,2,1,4,c)}{rect(12,0,3,2,c)}{rect(13,2,2,7,c)}</g> },
  { label: 'Wavy',     render: c => <g>{rect(3,1,10,2,c)}{rect(2,2,1,2,c)}{rect(1,4,2,2,c)}{rect(2,6,1,2,c)}{rect(1,8,2,2,c)}{rect(13,2,1,2,c)}{rect(13,4,2,2,c)}{rect(13,6,1,2,c)}{rect(13,8,2,2,c)}</g> },
  { label: 'Pixie',    render: c => <g>{rect(3,0,10,3,c)}{rect(2,2,2,3,c)}{rect(12,2,2,3,c)}{rect(3,1,3,1,c)}</g> },
  { label: 'Bald',     render: () => null },
]

export const FACES = [
  { label: 'Happy',
    render: c => <g>
      {rect(4,6,2,2,c)}{rect(10,6,2,2,c)}
      {rect(4,10,1,1,'#cc5577')}{rect(5,11,6,1,'#cc5577')}{rect(11,10,1,1,'#cc5577')}
      {rect(3,9,2,1,'rgba(255,150,150,0.5)')}{rect(11,9,2,1,'rgba(255,150,150,0.5)')}
    </g>
  },
  { label: 'Cool',
    render: c => <g>
      {rect(3,5,4,3,'#111')}{rect(9,5,4,3,'#111')}{rect(7,6,2,1,'#111')}
      {rect(4,6,1,1,'rgba(255,255,255,0.35)')}{rect(10,6,1,1,'rgba(255,255,255,0.35)')}
      {rect(5,11,6,1,'#cc5577')}{rect(4,10,1,1,'#cc5577')}{rect(11,10,1,1,'#cc5577')}
    </g>
  },
  { label: 'Cute',
    render: c => <g>
      {rect(3,5,4,3,c)}{rect(9,5,4,3,c)}
      {rect(4,6,2,2,'#111')}{rect(10,6,2,2,'#111')}
      {rect(4,6,1,1,'rgba(255,255,255,0.7)')}{rect(10,6,1,1,'rgba(255,255,255,0.7)')}
      {rect(3,4,1,1,'#111')}{rect(5,4,1,1,'#111')}{rect(9,4,1,1,'#111')}{rect(13,4,1,1,'#111')}
      {rect(6,11,1,1,'#ee4477')}{rect(9,11,1,1,'#ee4477')}{rect(7,12,2,1,'#ee4477')}
      {rect(2,9,3,2,'rgba(255,140,170,0.5)')}{rect(11,9,3,2,'rgba(255,140,170,0.5)')}
    </g>
  },
  { label: 'Glam',
    render: c => <g>
      {rect(3,5,3,1,'#111')}{rect(10,5,3,1,'#111')}{rect(3,6,1,1,'#111')}{rect(12,6,1,1,'#111')}
      {rect(4,6,2,2,c)}{rect(10,6,2,2,c)}
      {rect(5,10,6,1,'#dd3366')}{rect(4,11,8,1,'#ff4488')}{rect(5,12,6,1,'#dd3366')}
      {rect(6,11,2,1,'rgba(255,255,255,0.35)')}
      {rect(3,9,2,1,'rgba(255,130,160,0.6)')}{rect(11,9,2,1,'rgba(255,130,160,0.6)')}
    </g>
  },
  { label: 'Fierce',
    render: c => <g>
      {rect(3,6,4,2,c)}{rect(9,6,4,2,c)}
      {rect(3,5,5,1,'#111')}{rect(8,5,5,1,'#111')}
      {rect(4,3,4,1,'#111')}{rect(8,3,4,1,'#111')}
      {rect(5,11,6,1,'#cc2255')}{rect(4,12,8,1,'#dd3366')}{rect(5,13,6,1,'#cc2255')}
    </g>
  },
  { label: 'Wink',
    render: c => <g>
      {rect(4,6,2,2,c)}
      {rect(10,7,3,1,c)}{rect(10,5,3,1,'#111')}{rect(13,6,1,1,'#111')}
      {rect(5,11,6,1,'#cc5577')}{rect(4,10,1,1,'#cc5577')}{rect(11,10,1,1,'#cc5577')}
      {rect(3,9,2,1,'rgba(255,150,150,0.5)')}
    </g>
  },
]

export const SKINS       = ['#FDDBB4', '#F1C27D', '#C68642', '#8D5524', '#FFCBA4']
export const HAIR_COLORS = ['#111111', '#5C3317', '#FFD700', '#ff4488', '#4488ff', '#eeeeee']
export const SHIRT_COLORS = ['#1a3a6a', '#cc2222', '#226622', '#553388', '#cc7700', '#222222', '#cc4488', '#338899']
export const SHIRTS = [
  { label: 'Plain',   render: c => <g>{rect(3,14,10,6,c)}{rect(1,14,2,4,c)}{rect(13,14,2,4,c)}{rect(6,14,2,1,'rgba(255,255,255,0.4)')}{rect(8,14,2,1,'rgba(255,255,255,0.4)')}</g> },
  { label: 'Stripe',  render: c => <g>{rect(3,14,10,6,c)}{rect(1,14,2,4,c)}{rect(13,14,2,4,c)}{rect(3,15,10,1,'rgba(255,255,255,0.3)')}{rect(3,17,10,1,'rgba(255,255,255,0.3)')}</g> },
  { label: 'Suit',    render: c => <g>{rect(3,14,10,6,'#222')}{rect(1,14,2,4,'#222')}{rect(13,14,2,4,'#222')}{rect(6,14,2,4,'#aaa')}{rect(8,14,2,4,'#aaa')}{rect(7,14,2,5,c)}</g> },
  { label: 'Hoodie',  render: c => <g>{rect(3,14,10,6,c)}{rect(1,14,2,4,c)}{rect(13,14,2,4,c)}{rect(5,19,6,1,'rgba(0,0,0,0.2)')}{rect(6,14,1,2,'rgba(255,255,255,0.15)')}{rect(9,14,1,2,'rgba(255,255,255,0.15)')}</g> },
]

// Eye colors exposed but not shown as a separate control — derived from face
export const EYE_COLORS = ['#2244cc', '#228833', '#993311', '#663399', '#116688']

function Arrow({ dir, onClick }) {
  return (
    <button className="cc-arrow" onClick={() => { playKeyClick(); onClick() }}>
      {dir === 'left' ? '◄' : '►'}
    </button>
  )
}

function cycle(idx, arr, dir) {
  return (idx + dir + arr.length) % arr.length
}

function Row({ label, children }) {
  return (
    <div className="cc-row">
      <span className="cc-label">{label}</span>
      {children}
    </div>
  )
}

function Selector({ value, onLeft, onRight }) {
  return (
    <div className="cc-selector">
      <Arrow dir="left"  onClick={onLeft} />
      <span className="cc-value">{value}</span>
      <Arrow dir="right" onClick={onRight} />
    </div>
  )
}

function Swatch({ color, onLeft, onRight }) {
  return (
    <div className="cc-selector">
      <Arrow dir="left"  onClick={onLeft} />
      <div className="cc-swatch" style={{ background: color }} />
      <Arrow dir="right" onClick={onRight} />
    </div>
  )
}

export default function CharacterCreator({ state, onChange }) {
  const {
    hairIdx = 0, hairColorIdx = 0,
    faceIdx = 0, eyeColorIdx  = 0,
    skinIdx = 0, shirtIdx     = 0, shirtColorIdx = 0,
  } = state

  const s = (key, val) => onChange({ ...state, [key]: val })
  const c = (idx, arr, dir) => cycle(idx, arr, dir)

  const skin      = SKINS[skinIdx]
  const hairColor = HAIR_COLORS[hairColorIdx]
  const eyeColor  = EYE_COLORS[eyeColorIdx]
  const hair      = HAIRS[hairIdx]
  const face      = FACES[faceIdx]
  const shirt     = SHIRTS[shirtIdx]
  const shirtColor = SHIRT_COLORS[shirtColorIdx]

  return (
    <div className="cc-body">

      {/* Preview */}
      <div className="cc-preview">
        <CharacterAvatar state={state} size={96} />
      </div>

      {/* Controls */}
      <div className="cc-controls">
        <Row label="HAIR">
          <Selector value={hair.label}
            onLeft={()  => s('hairIdx', c(hairIdx, HAIRS, -1))}
            onRight={() => s('hairIdx', c(hairIdx, HAIRS,  1))} />
        </Row>
        <Row label="CLR">
          <Swatch color={hairColor}
            onLeft={()  => s('hairColorIdx', c(hairColorIdx, HAIR_COLORS, -1))}
            onRight={() => s('hairColorIdx', c(hairColorIdx, HAIR_COLORS,  1))} />
        </Row>
        <Row label="FACE">
          <Selector value={face.label}
            onLeft={()  => s('faceIdx', c(faceIdx, FACES, -1))}
            onRight={() => s('faceIdx', c(faceIdx, FACES,  1))} />
        </Row>
        <Row label="SKIN">
          <Swatch color={skin}
            onLeft={()  => s('skinIdx', c(skinIdx, SKINS, -1))}
            onRight={() => s('skinIdx', c(skinIdx, SKINS,  1))} />
        </Row>
        <Row label="SHIRT">
          <Selector value={shirt.label}
            onLeft={()  => s('shirtIdx', c(shirtIdx, SHIRTS, -1))}
            onRight={() => s('shirtIdx', c(shirtIdx, SHIRTS,  1))} />
        </Row>
        <Row label="CLR">
          <Swatch color={shirtColor}
            onLeft={()  => s('shirtColorIdx', c(shirtColorIdx, SHIRT_COLORS, -1))}
            onRight={() => s('shirtColorIdx', c(shirtColorIdx, SHIRT_COLORS,  1))} />
        </Row>
      </div>

    </div>
  )
}
