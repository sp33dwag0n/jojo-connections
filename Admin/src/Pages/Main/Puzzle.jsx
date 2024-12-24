import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import ConnectionButton from './ConnectionButton';


function Puzzle() {
  const navigate = useNavigate();
  const puzzleInfo = useRef(null);
  const [characters, setCharacters] = useState(null);
  
  const generatePuzzle = async () => {
    const response = await fetch(`http://localhost:5050/catagory/puzzle`);
    if (!response.ok) {
      const message = `An error occurred: ${response.statusText}`;
      console.error(message);
      return;
    }
    const generatedPuzzle = await response.json();
    console.log(generatedPuzzle);
    puzzleInfo.current = generatedPuzzle;

    const categories = ['easy', 'medium', 'hard', 'extreme'];
    const puzzleObjectsArray = [];
    for (let category of categories) {
      const categoryName = generatedPuzzle[category];
      const characters = generatedPuzzle[`${category}Characters`];

      for (let character of characters) {
        puzzleObjectsArray.push({
          id: character._id,
          name: character.name,
          category: categoryName
        })
      }
    }

    setCharacters(puzzleObjectsArray);

  }
  
  return (
    <div>
      <div className='btn-container'>
        <button className="btn" onClick={() => navigate("/admin")}>Admin</button>
        <button className="btn" onClick={() => generatePuzzle()}>Make Puzzle</button>
      </div>
      <div className='connectionBtn-container'>
        {characters && (
          characters.map((character) => {
            return (
              <ConnectionButton key={character.id} name={character.name} category={character.category} />
            )
          })
        )}
      </div>
      
      
    </div>
  )
}

export default Puzzle