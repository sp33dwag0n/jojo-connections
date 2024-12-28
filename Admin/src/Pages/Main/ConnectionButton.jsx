import React from 'react'

function ConnectionButton({ name, isPressed, handleClick }) {
  let style = isPressed ? "connectionBtn connectionBtn-pressed" : "connectionBtn connectionBtn-unpressed";
  
  return (
    <div className={style} onClick={handleClick}>
      <p>{name}</p>
    </div>
  )
}

export default ConnectionButton