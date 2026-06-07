// Each emoji is an 8x8 pixel grid, each cell = 4px
const S = 4
const p = (x, y, c) => <rect key={`${x}${y}`} x={x*S} y={y*S} width={S} height={S} fill={c}/>

const Emoji = ({ pixels, size = 28 }) => (
  <svg viewBox="0 0 32 32" width={size} height={size} shapeRendering="crispEdges"
    style={{ imageRendering: 'pixelated', display: 'block' }}>
    {pixels}
  </svg>
)

// ── Faces ──
const Laugh = () => <Emoji pixels={[
  p(2,1,4,'#FFD700'),p(3,1,2,'#FFD700'),p(1,2,6,'#FFD700'),p(0,3,8,'#FFD700'),
  p(0,4,8,'#FFD700'),p(1,5,6,'#FFD700'),p(2,6,4,'#FFD700'),
  p(2,3,1,'#111'),p(5,3,1,'#111'),   // eyes — closed happy
  p(1,3,1,'#FFD700'),p(6,3,1,'#FFD700'),
  p(2,3,1,'#333'),p(5,3,1,'#333'),
  p(1,4,6,'#fff'),p(2,5,4,'#ff4444'), // big laugh mouth
  p(1,5,1,'#111'),p(6,5,1,'#111'),
]} />

const Cool = () => <Emoji pixels={[
  p(2,1,4,'#FFD700'),p(1,2,6,'#FFD700'),p(0,3,8,'#FFD700'),
  p(0,4,8,'#FFD700'),p(1,5,6,'#FFD700'),p(2,6,4,'#FFD700'),
  p(1,3,3,'#111'),p(4,3,3,'#111'),p(3,3,2,'#111'), // shades
  p(1,2,3,'rgba(255,255,255,0.3)'),p(4,2,3,'rgba(255,255,255,0.3)'),
  p(2,5,4,'#111'),p(3,4,2,'#fff'), // smirk
]} />

const Angry = () => <Emoji pixels={[
  p(2,1,4,'#FF4444'),p(1,2,6,'#FF4444'),p(0,3,8,'#FF4444'),
  p(0,4,8,'#FF4444'),p(1,5,6,'#FF4444'),p(2,6,4,'#FF4444'),
  p(1,3,2,'#111'),p(5,3,2,'#111'),
  p(1,2,2,'#111'),p(5,2,2,'#111'), // angry brows
  p(2,5,4,'#111'),p(3,5,4,'#000'), // frown
  p(2,6,1,'#111'),p(5,6,1,'#111'),
]} />

const Money = () => <Emoji pixels={[
  p(2,1,4,'#FFD700'),p(1,2,6,'#FFD700'),p(0,3,8,'#FFD700'),
  p(0,4,8,'#FFD700'),p(1,5,6,'#FFD700'),p(2,6,4,'#FFD700'),
  p(2,3,1,'#111'),p(5,3,1,'#111'),
  p(1,2,2,'#FFD700'),p(5,2,2,'#FFD700'),
  p(3,1,2,'#2ecc40'),   // dollar sign top
  p(3,2,2,'#2ecc40'),p(2,3,1,'#2ecc40'),p(5,3,1,'#2ecc40'),
  p(3,4,2,'#2ecc40'),p(2,5,1,'#2ecc40'),p(5,5,1,'#2ecc40'),
  p(3,5,2,'#2ecc40'),
  p(2,5,4,'#FFD700'), // mouth
]} />

const Wink = () => <Emoji pixels={[
  p(2,1,4,'#FFD700'),p(1,2,6,'#FFD700'),p(0,3,8,'#FFD700'),
  p(0,4,8,'#FFD700'),p(1,5,6,'#FFD700'),p(2,6,4,'#FFD700'),
  p(2,3,2,'#111'),        // open eye
  p(5,3,2,'#FFD700'),p(5,3,2,'#111'), // wink line
  p(5,3,3,'#111'),
  p(3,5,3,'#111'),p(2,5,1,'#FFD700'),p(6,4,1,'#111'), // smirk
]} />

const Sweat = () => <Emoji pixels={[
  p(2,1,4,'#FFD700'),p(1,2,6,'#FFD700'),p(0,3,8,'#FFD700'),
  p(0,4,8,'#FFD700'),p(1,5,6,'#FFD700'),p(2,6,4,'#FFD700'),
  p(2,3,2,'#111'),p(5,3,2,'#111'),
  p(3,5,2,'#111'),
  p(7,1,1,'#4fc3f7'),p(7,2,1,'#4fc3f7'),p(6,3,1,'#4fc3f7'), // sweat drop
]} />

// ── Poker ──
const Spade = () => <Emoji pixels={[
  p(3,1,2,'#111'),
  p(2,2,4,'#111'),p(1,3,6,'#111'),p(0,4,8,'#111'),p(1,5,6,'#111'),
  p(2,6,1,'#111'),p(3,5,2,'#111'),p(5,6,1,'#111'),
  p(3,6,2,'#111'),p(3,7,2,'#111'),
]} />

const Heart = () => <Emoji pixels={[
  p(1,1,2,'#ff4444'),p(5,1,2,'#ff4444'),
  p(0,2,8,'#ff4444'),p(0,3,8,'#ff4444'),p(0,4,8,'#ff4444'),
  p(1,5,6,'#ff4444'),p(2,6,4,'#ff4444'),p(3,7,2,'#ff4444'),
  p(1,2,1,'#ff8888'),p(2,1,1,'#ff8888'), // shine
]} />

const Diamond = () => <Emoji pixels={[
  p(3,0,2,'#ff4444'),p(2,1,4,'#ff4444'),p(1,2,6,'#ff4444'),
  p(0,3,8,'#ff4444'),p(1,4,6,'#ff4444'),p(2,5,4,'#ff4444'),
  p(3,6,2,'#ff4444'),
  p(3,1,1,'#ff8888'),p(4,2,1,'#ff8888'),
]} />

const Club = () => <Emoji pixels={[
  p(3,1,2,'#111'),p(2,2,4,'#111'),p(3,3,2,'#111'),
  p(1,3,2,'#111'),p(0,4,4,'#111'),p(1,5,2,'#111'),
  p(5,3,2,'#111'),p(4,4,4,'#111'),p(5,5,2,'#111'),
  p(2,5,4,'#111'),p(3,6,2,'#111'),p(3,7,2,'#111'),
  p(2,7,4,'#111'),
]} />

// ── Actions ──
const Fire = () => <Emoji pixels={[
  p(4,0,1,'#ff9900'),p(3,1,3,'#ff6600'),p(5,1,1,'#ff9900'),
  p(2,2,5,'#ff6600'),p(1,2,1,'#ff9900'),p(6,2,1,'#ff9900'),
  p(1,3,6,'#ff4400'),p(0,4,8,'#ff4400'),p(0,5,8,'#ff6600'),
  p(1,6,6,'#ff9900'),p(2,7,4,'#ffcc00'),
  p(3,3,2,'#ffcc00'),p(4,4,1,'#fff'),
]} />

const Skull = () => <Emoji pixels={[
  p(2,0,4,'#eee'),p(1,1,6,'#eee'),p(0,2,8,'#eee'),
  p(0,3,8,'#eee'),p(0,4,8,'#eee'),p(1,5,6,'#eee'),
  p(1,3,2,'#333'),p(5,3,2,'#333'), // eyes
  p(3,4,2,'#333'),                  // nose
  p(1,6,2,'#eee'),p(3,6,2,'#333'),p(5,6,2,'#eee'),p(7,6,1,'#eee'), // teeth
  p(2,7,1,'#333'),p(4,7,1,'#333'),p(6,7,1,'#333'),
]} />

const Crown = () => <Emoji pixels={[
  p(0,2,1,'#FFD700'),p(3,0,2,'#FFD700'),p(7,2,1,'#FFD700'),
  p(0,3,8,'#FFD700'),p(0,4,8,'#FFD700'),p(0,5,8,'#FFD700'),
  p(1,2,2,'#FFD700'),p(5,2,2,'#FFD700'),
  p(0,1,1,'#FFD700'),p(7,1,1,'#FFD700'),
  p(1,3,1,'#ff4444'),p(3,3,1,'#ff4444'),p(5,3,1,'#ff4444'), // gems
]} />

const Chip = () => <Emoji pixels={[
  p(2,0,4,'#2255cc'),p(1,1,6,'#2255cc'),p(0,2,8,'#2255cc'),
  p(0,3,8,'#2255cc'),p(0,4,8,'#2255cc'),p(0,5,8,'#2255cc'),
  p(1,6,6,'#2255cc'),p(2,7,4,'#2255cc'),
  p(2,1,4,'#fff'),p(1,2,1,'#fff'),p(6,2,1,'#fff'),
  p(1,5,1,'#fff'),p(6,5,1,'#fff'),p(2,6,4,'#fff'),
  p(3,3,2,'#FFD700'),p(2,4,4,'#FFD700'),p(3,2,2,'#FFD700'), // center
]} />

const ThumbUp = () => <Emoji pixels={[
  p(3,0,2,'#FFD700'),p(3,1,2,'#FFD700'),p(2,2,3,'#FFD700'),
  p(1,3,5,'#FFD700'),p(0,4,6,'#FFD700'),p(0,5,6,'#FFD700'),
  p(0,6,6,'#FFD700'),p(0,7,6,'#FFD700'),
  p(2,3,1,'#cc9900'),
]} />

const ThumbDown = () => <Emoji pixels={[
  p(0,0,6,'#FFD700'),p(0,1,6,'#FFD700'),p(0,2,6,'#FFD700'),
  p(0,3,6,'#FFD700'),p(1,4,5,'#FFD700'),p(2,5,3,'#FFD700'),
  p(3,6,2,'#FFD700'),p(3,7,2,'#FFD700'),
  p(2,4,1,'#cc9900'),
]} />

export const PIXEL_EMOJIS = [
  { label: 'Faces',  items: [
    { key: 'laugh',  char: '😂', node: <Laugh/> },
    { key: 'cool',   char: '😎', node: <Cool/> },
    { key: 'angry',  char: '😤', node: <Angry/> },
    { key: 'wink',   char: '😉', node: <Wink/> },
    { key: 'money',  char: '🤑', node: <Money/> },
    { key: 'sweat',  char: '😅', node: <Sweat/> },
  ]},
  { label: 'Suits',  items: [
    { key: 'spade',   char: '♠', node: <Spade/> },
    { key: 'heart',   char: '♥', node: <Heart/> },
    { key: 'diamond', char: '♦', node: <Diamond/> },
    { key: 'club',    char: '♣', node: <Club/> },
    { key: 'chip',    char: '🎰', node: <Chip/> },
  ]},
  { label: 'Hype',  items: [
    { key: 'fire',      char: '🔥', node: <Fire/> },
    { key: 'skull',     char: '💀', node: <Skull/> },
    { key: 'crown',     char: '👑', node: <Crown/> },
    { key: 'thumbup',   char: '👍', node: <ThumbUp/> },
    { key: 'thumbdown', char: '👎', node: <ThumbDown/> },
  ]},
]
