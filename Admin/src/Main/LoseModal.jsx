import React from 'react'

function LoseModal({ open, onClose, puzzleInfo }) {
  if (!open) return false;

  return (
    <div>
      <p>LoseModal</p>
      <button onClick={onClose}> Close </button>
    </div>
  )
}

export default LoseModal