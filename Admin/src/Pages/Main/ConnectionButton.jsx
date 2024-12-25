import React from 'react'

function ConnectionButton({ name, category, isPressed, handleClick }) {
  let style;
  if (isPressed) {
    style = "connectionBtn-pressed";
  } else {
    style = "connectionBtn-unpressed";
  }
  
  return (
    <div className={style} onClick={handleClick}>
      <p>{name}</p>
      <p>{category}</p>
    </div>
  )
}

export default ConnectionButton