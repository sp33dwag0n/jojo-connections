import React from 'react'

function ConnectionButton({ name, category }) {
  return (
    <div className='connectionBtn'>
      <p>{name}</p>
      <p>{category}</p>
    </div>
  )
}

export default ConnectionButton