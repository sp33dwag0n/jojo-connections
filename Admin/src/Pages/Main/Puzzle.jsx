import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import ConnectionButton from './ConnectionButton';


function Puzzle() {
  const navigate = useNavigate();
  const [puzzle, setPuzzle] = useState(null);
  
  const generatePuzzle = async () => {
    const response = await fetch(`http://localhost:5050/catagory/puzzle`);
    if (!response.ok) {
      const message = `An error occurred: ${response.statusText}`;
      console.error(message);
      return;
    }
    const generatedPuzzle = await response.json();
    setPuzzle(generatedPuzzle); 
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
      {puzzle && (
        <div>
          <p>{puzzle.easy}: {puzzle.easyCharacters[0].name} {puzzle.easyCharacters[1].name} {puzzle.easyCharacters[2].name} {puzzle.easyCharacters[3].name} </p>
          <p>{puzzle.medium}: {puzzle.mediumCharacters[0].name} {puzzle.mediumCharacters[1].name} {puzzle.mediumCharacters[2].name} {puzzle.mediumCharacters[3].name} </p>
          <p>{puzzle.hard}: {puzzle.hardCharacters[0].name} {puzzle.hardCharacters[1].name} {puzzle.hardCharacters[2].name} {puzzle.hardCharacters[3].name} </p>
          <p>{puzzle.extreme}: {puzzle.extremeCharacters[0].name} {puzzle.extremeCharacters[1].name} {puzzle.extremeCharacters[2].name} {puzzle.extremeCharacters[3].name} </p>
        </div>
      )}
      <ConnectionButton name="name" catagory="catagory" />
    </div>
  )
}

export default Puzzle