import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import ConnectionButton from './ConnectionButton';
import CorrectCategory from './CorrectCategory';
import Notification from './Notification';


function Puzzle() {
  const navigate = useNavigate();
  const puzzleInfo = useRef(null);
  const [characters, setCharacters] = useState(null);
  const [pressedCharacters, setPressedCharacters] = useState([]);
  const [submitReady, setSubmitReady] = useState(false);
  const [lives, setLives] = useState(0);
  const [correctGuess, setCorrectGuess] = useState([]);
  const [oneAway, setOneAway] = useState(false);
  const difficulty = ['easy', 'medium', 'hard', 'extreme'];
  
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
    puzzleInfo.current = generatedPuzzle;
    console.log(generatedPuzzle);

    let puzzleObjectsArray = [];
    for (let category of generatedPuzzle) {
      for (let character of category.characters) {
        character.difficulty = category.difficulty;
        puzzleObjectsArray.push(character);
      }
    }
    puzzleObjectsArray = shuffle(puzzleObjectsArray);
    setCharacters(puzzleObjectsArray);
    setLives(4);
    setCorrectGuess([false, false, false, false])
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
    let isCorrect = false;
    let selectedArray = [0, 0, 0, 0]
    for (let character of pressedCharacters) {
      selectedArray[character.difficulty]++;
    }

    for (let count of selectedArray) {
      if (count === 4) {
        isCorrect = true;
        break;
      } else if (count === 3) {
        setOneAway(true);
        setTimeout(() => setOneAway(false), 5000)
        break;
      } else if (count == 2) {
        break;
      }
    }

    if (isCorrect) {
      const index = pressedCharacters[0].difficulty;
      console.log("The " + difficulty[index] + " category of " + puzzleInfo.current[index].name + " is guessed CORRECT!");
      setCharacters(prev => prev.filter(character => !pressedCharacters.includes(character)));
      setCorrectGuess((prev) => {
        let updated = [...prev];
        updated[index] = true;
        return updated;
      })
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
        <button className="puzzle-btn" onClick={() => navigate("/admin")}>Admin</button>
        <button className="puzzle-btn" onClick={() => generatePuzzle()}>Make Puzzle</button>
      </div>
      
      {oneAway && <Notification />}

      {characters && puzzleInfo.current.map((category, index) => {
        if (correctGuess[index]) {
          return <CorrectCategory key={index} category={category}/>
        } else {
          return null
        }
      })}
      
      <div className='connectionBtn-container'>
        {characters && characters.map((character) => {
          let isPressed = pressedCharacters.includes(character);
          return (
            <ConnectionButton 
              key={character._id}
              name={character.name}
              part={character.part}
              isPressed={isPressed}
              handleClick={() => connectionButtonPress(character)}
            />
          )
        })}
      </div>
        {characters && (
        <div className='btn-container'>
          <button className="puzzle-btn" disabled={!submitReady} onClick={() => submitGuess()}> Submit </button>
          <button className="puzzle-btn" onClick={() => setCharacters(prev => shuffle(prev))}> Shuffle </button>
          <p>Lives Left: {lives} </p>
        </div>
        )}
      <div>
        
      </div>
    </div>
  )
}

export default Puzzle