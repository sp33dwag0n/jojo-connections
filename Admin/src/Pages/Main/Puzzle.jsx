import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import ConnectionButton from './ConnectionButton';


function Puzzle() {
  const navigate = useNavigate();
  const puzzle = useRef(null);
  const [puzzleObjects, setPuzzleObjects] = useState(null);
  
  const generatePuzzle = async () => {
    const response = await fetch(`http://localhost:5050/catagory/puzzle`);
    if (!response.ok) {
      const message = `An error occurred: ${response.statusText}`;
      console.error(message);
      return;
    }
    const generatedPuzzle = await response.json();
    console.log(generatedPuzzle);
    puzzle.current = generatedPuzzle;

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

    setPuzzleObjects(puzzleObjectsArray);

  }
  
  return (
    <div>
      <div>Puzzle</div>
      <div>
        <button className="btn" onClick={() => navigate("/admin")}>Admin</button>
      </div>
      <div>
        <button className="btn" onClick={() => generatePuzzle()}>Make Puzzle</button>
      </div>
      {puzzleObjects && (
        puzzleObjects.map((character) => {
          return (
            <ConnectionButton key={character.id} name={character.name} category={character.category} />
          )
        })
      )}
      
    </div>
  )
}

export default Puzzle