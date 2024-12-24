import React from 'react'

function ConnectionButton({ name, catagory }) {
  return (
    <div className='connectionBtn'>
      <p>{name}</p>
      <p>{catagory}</p>
    </div>
  )
}

export default ConnectionButton