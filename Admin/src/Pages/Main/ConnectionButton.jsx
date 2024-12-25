import React from 'react'

function ConnectionButton({ name, category, isPressed }) {
  return (
    <div className='connectionBtn'>
      <p>{name}</p>
      <p>{category}</p>
      <p>{isPressed ? "pressed" : "unpressed"}</p >
    </div>
  )
}

export default ConnectionButton