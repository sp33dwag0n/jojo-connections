import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import ConnectionButton from './ConnectionButton';


function Puzzle() {
  const navigate = useNavigate();
  const puzzleInfo = useRef(null);
  const [characters, setCharacters] = useState(null);
  const [pressedCharacters, setPressedCharacters] = useState([]);
  const [submitReady, setSubmitReady] = useState(false);
  const [lives, setLives] = useState(0);
  
  useEffect(() => {
    setPressedCharacters([]);
  }, [characters])

  useEffect(() => {
    if (pressedCharacters.length == 4) {
      setSubmitReady(true);
    } else {
      setSubmitReady(false);
    }
  }, [pressedCharacters])

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

  const connectionButtonPress = (character) => {
    setPressedCharacters((prevPressedCharacters) => {
      const newPressedCharacters = [...prevPressedCharacters];
      let index = newPressedCharacters.indexOf(character);
      if (index > -1) {
        newPressedCharacters.splice(index, 1);
      } else if (newPressedCharacters.length < 4) {
        newPressedCharacters.push(character);
      }
      return newPressedCharacters;
    });
  }

  const submitGuess = () => {
    let isCorrect = true;
    for (let i = 1; i < pressedCharacters.length; i++) {
      if (pressedCharacters[i].category != pressedCharacters[0].category) {
        isCorrect = false;
      }
    }

    if (isCorrect) {
      console.log(pressedCharacters[0].category + " is guessed CORRECT!");
      setCharacters(prev => prev.filter(character => !pressedCharacters.includes(character)));
    } else {
      setLives(prev => prev - 1);
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
          let isPressed = pressedCharacters.includes(character);
          return (
            <ConnectionButton 
              key={character.id} 
              name={character.name} 
              isPressed={isPressed}
              handleClick={() => connectionButtonPress(character)}
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