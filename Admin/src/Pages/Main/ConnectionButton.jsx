import React from 'react'

function ConnectionButton({ name, category, isPressed, handleClick }) {
  return (
    <div className='connectionBtn' onClick={handleClick}>
      <p>{name}</p>
      <p>{category}</p>
      <p>{isPressed ? "pressed" : "unpressed"}</p >
    </div>
  )
}

export default ConnectionButton