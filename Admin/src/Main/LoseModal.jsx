import React from 'react'

function LoseModal({ open, onClose, puzzleInfo }) {
  if (!open) return false;

  return (
    <div>
      <p>Nice Try...</p>
      <p>The Correct Answer Was: </p>
      <p>{puzzleInfo[0].name}: {puzzleInfo[0].characters}</p>
      <button onClick={onClose}> Close </button>
    </div>
  )
}

export default LoseModal