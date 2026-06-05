export default function FemaleHand() {
  return (
    <svg
      className="female-hand"
      viewBox="0 0 320 200"
      xmlns="http://www.w3.org/2000/svg"
    >
      {/* ── Wrist / palm coming from the right ── */}
      <rect x="200" y="70" width="130" height="80" rx="20" fill="#f5c5a3" />

      {/* ── Palm body ── */}
      <ellipse cx="210" cy="110" rx="55" ry="42" fill="#f5c5a3" />

      {/* ── Fingers pointing left ── */}

      {/* Index finger (top) */}
      <rect x="80" y="62" width="110" height="26" rx="13" fill="#f5c5a3" />
      <ellipse cx="80" cy="75" rx="13" ry="13" fill="#f5c5a3" />
      {/* nail */}
      <ellipse cx="70" cy="75" rx="10" ry="9" fill="#cc0000" />
      <ellipse cx="67" cy="74" rx="6" ry="5.5" fill="#ff5555" opacity="0.45" />

      {/* Middle finger */}
      <rect x="68" y="90" width="122" height="26" rx="13" fill="#f5c5a3" />
      <ellipse cx="68" cy="103" rx="13" ry="13" fill="#f5c5a3" />
      {/* nail */}
      <ellipse cx="57" cy="103" rx="10" ry="9" fill="#cc0000" />
      <ellipse cx="54" cy="102" rx="6" ry="5.5" fill="#ff5555" opacity="0.45" />

      {/* Ring finger */}
      <rect x="74" y="118" width="116" height="26" rx="13" fill="#f5c5a3" />
      <ellipse cx="74" cy="131" rx="13" ry="13" fill="#f5c5a3" />
      {/* nail */}
      <ellipse cx="63" cy="131" rx="10" ry="9" fill="#cc0000" />
      <ellipse cx="60" cy="130" rx="6" ry="5.5" fill="#ff5555" opacity="0.45" />

      {/* Pinky finger */}
      <rect x="90" y="146" width="100" height="22" rx="11" fill="#f5c5a3" />
      <ellipse cx="90" cy="157" rx="11" ry="11" fill="#f5c5a3" />
      {/* nail */}
      <ellipse cx="80" cy="157" rx="9" ry="8" fill="#cc0000" />
      <ellipse cx="77" cy="156" rx="5.5" ry="5" fill="#ff5555" opacity="0.45" />

      {/* Thumb (coming from below, angled up) */}
      <ellipse cx="198" cy="158" rx="40" ry="16" fill="#f5c5a3" transform="rotate(-30 198 158)" />
      {/* thumb nail */}
      <ellipse cx="172" cy="148" rx="10" ry="8" fill="#cc0000" transform="rotate(-30 172 148)" />
      <ellipse cx="170" cy="146" rx="6" ry="5" fill="#ff5555" opacity="0.45" transform="rotate(-30 170 146)" />

      {/* ── Knuckle shading ── */}
      <ellipse cx="175" cy="75"  rx="4" ry="9" fill="#e0a882" opacity="0.45" />
      <ellipse cx="162" cy="103" rx="4" ry="9" fill="#e0a882" opacity="0.45" />
      <ellipse cx="168" cy="131" rx="4" ry="9" fill="#e0a882" opacity="0.45" />
      <ellipse cx="178" cy="157" rx="4" ry="8" fill="#e0a882" opacity="0.45" />

      {/* ── Wrist crease ── */}
      <path d="M240 80 Q248 110 240 140" stroke="#e0a882" strokeWidth="1.5" fill="none" strokeLinecap="round" />
    </svg>
  )
}
