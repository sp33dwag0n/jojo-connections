import React from 'react'

function ConnectionButton({ name, category, isPressed, handleClick }) {
  let style = isPressed ? "connectionBtn connectionBtn-pressed" : "connectionBtn connectionBtn-unpressed";
  
  return (
    <div className={style} onClick={handleClick}>
      <p>{name}</p>
      <p>{category}</p>
    </div>
  )
}

export default ConnectionButton