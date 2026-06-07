import { playKeyClick } from './sounds'

export default function ModalInput({ type, placeholder, value, onChange }) {
  return (
    <input
      type={type}
      placeholder={placeholder}
      value={value}
      onChange={onChange}
      onKeyDown={playKeyClick}
    />
  )
}
