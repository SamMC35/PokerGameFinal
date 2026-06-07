import { HAIRS, FACES, SKINS, HAIR_COLORS, SHIRTS, SHIRT_COLORS, EYE_COLORS } from './CharacterCreator'

const PX = 4
const rect = (x, y, w, h, color) => (
  <rect key={`${x}${y}${w}${h}${color}`} x={x*PX} y={y*PX} width={w*PX} height={h*PX} fill={color}/>
)

export default function CharacterAvatar({ state, size = 48 }) {
  const {
    hairIdx = 0, hairColorIdx = 0,
    faceIdx = 0, eyeColorIdx  = 0,
    skinIdx = 0, shirtIdx     = 0, shirtColorIdx = 0,
  } = state

  const skin       = SKINS[skinIdx]
  const hairColor  = HAIR_COLORS[hairColorIdx]
  const eyeColor   = EYE_COLORS[eyeColorIdx]
  const hair       = HAIRS[hairIdx]
  const face       = FACES[faceIdx]
  const shirt      = SHIRTS[shirtIdx]
  const shirtColor = SHIRT_COLORS[shirtColorIdx]

  return (
    <svg
      viewBox="0 0 64 80"
      width={size}
      height={size}
      style={{ imageRendering: 'pixelated', display: 'block', flexShrink: 0 }}
      shapeRendering="crispEdges"
    >
      <defs>
        <filter id={`outline-${size}`}>
          <feMorphology in="SourceAlpha" operator="dilate" radius="2" result="e"/>
          <feFlood floodColor="#000" result="b"/>
          <feComposite in="b" in2="e" operator="in" result="o"/>
          <feMerge><feMergeNode in="o"/><feMergeNode in="SourceGraphic"/></feMerge>
        </filter>
      </defs>
      <g filter={`url(#outline-${size})`}>
        {shirt.render(shirtColor)}
        {rect(6,13,4,2,skin)}
        {rect(3,3,10,10,skin)}
        {rect(3,11,10,1,'rgba(0,0,0,0.06)')}
        {hair.render && hair.render(hairColor)}
        {face.render(eyeColor)}
        {rect(2,6,1,3,skin)}
        {rect(13,6,1,3,skin)}
      </g>
    </svg>
  )
}
