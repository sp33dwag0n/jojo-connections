import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import ConnectionButton from './ConnectionButton';


function Puzzle() {
  const navigate = useNavigate();
  const puzzleInfo = useRef(null);
  const [characters, setCharacters] = useState(null);
  const [pressedIds, setPressedIds] = useState(new Set());
  const [submitReady, setSubmitReady] = useState(false);
  const [lives, setLives] = useState(0);
  
  useEffect(() => {
    setPressedIds(new Set());
  }, [characters])

  useEffect(() => {
    if (pressedIds.size == 4) {
      setSubmitReady(true);
    } else {
      setSubmitReady(false);
    }
  }, [pressedIds])

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
    let puzzleObjectsArray = [];
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
    puzzleObjectsArray = shuffle(puzzleObjectsArray);
    setCharacters(puzzleObjectsArray);
    setLives(4);
  }

  const connectionButtonPress = (id) => {
    setPressedIds((prevPressedIds) => {
      const newPressedIds = new Set(prevPressedIds);
      if (newPressedIds.has(id)) {
        newPressedIds.delete(id);
      } else if (newPressedIds.size < 4) {
        newPressedIds.add(id);
      }
      return newPressedIds;
    });
  }

  const submitGuess = () => {
    const first = characters.find(character => character.id === pressedIds.values().next().value);

    for (let key in puzzleInfo.current) {
      if (puzzleInfo.current[key] === first.category) {
        let keyName = key + "Characters";
        const correctCategory = puzzleInfo.current[keyName];
        let isCorrect = true;
        for (let character of correctCategory) {
          if (!pressedIds.has(character._id)) {
            isCorrect = false;
            break;
          }
        }

        if (isCorrect) {
          console.log(first.category + " is guessed CORRECT!");
          setCharacters(prev => prev.filter(character => !pressedIds.has(character.id)))
        } else {
          setLives(prev => prev - 1);
        }
        
      }
    }
  }

  function shuffle(arr) { // Durstenfeld shuffle
    let ans = [...arr];
    for (var i = ans.length - 1; i >= 0; i--) {
      var j = Math.floor(Math.random() * (i + 1));
      var temp = ans[i];
      ans[i] = ans[j];
      ans[j] = temp;
    }
    return ans;
  }
  
  return (
    <div>
      <div className='btn-container'>
        <button className="btn" onClick={() => navigate("/admin")}>Admin</button>
        <button className="btn" onClick={() => generatePuzzle()}>Make Puzzle</button>
      </div>
      <div className='connectionBtn-container'>
        {characters && characters.map((character) => {
          let isPressed = pressedIds.has(character.id);
          return (
            <ConnectionButton 
              key={character.id} 
              name={character.name} 
              category={character.category} 
              isPressed={isPressed}
              handleClick={() => connectionButtonPress(character.id)}
            />
          )
        })}
      </div>
        {characters && (
        <div className='btn-container'>
          <button className="btn" disabled={!submitReady} onClick={() => submitGuess()}> Submit </button>
          <button className="btn" onClick={() => setCharacters(prev => shuffle(prev))}> Shuffle </button>
          <p>Lives Left: {lives} </p>
        </div>
        )}
      <div>
        
      </div>
    </div>
  )
}

export default Puzzle