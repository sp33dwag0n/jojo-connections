import React from 'react'

function ConnectionButton({ name, part, isPressed, handleClick }) {
  let style = isPressed ? "connectionBtn connectionBtn-pressed" : "connectionBtn connectionBtn-unpressed";
  
  return (
    <div className={style} onClick={handleClick}>
      <p>{name}</p>
      <p>Part {part}</p>
    </div>
  )
}

export default ConnectionButton