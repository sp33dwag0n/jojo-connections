import React from 'react'

function WinModal({ open, onClose }) {
  if (!open) return false;

  return (
    <div>
      <p>WinModal</p>
      <button onClick={onClose}> Close </button>
    </div>
  )
}

export default WinModal