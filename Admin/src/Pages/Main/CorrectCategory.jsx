import React from 'react'

function CorrectCategory({ category }) {
    const style = "correctCategory d" + category.difficulty;
  
    return (
        <div className={style}>
            <p>{category.name}</p>
            <p>{category.characters[0].name}, {category.characters[1].name}, {category.characters[2].name}, {category.characters[3].name}</p>
        </div>
    )
}

export default CorrectCategory