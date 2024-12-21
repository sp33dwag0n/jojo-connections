import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';


function Puzzle() {
  const navigate = useNavigate();
  const [puzzle, setPuzzle] = useState([]);

  useEffect(() => {
    console.log(puzzle);
  }, [puzzle]) 
  
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
    </div>
  )
}

export default Puzzle