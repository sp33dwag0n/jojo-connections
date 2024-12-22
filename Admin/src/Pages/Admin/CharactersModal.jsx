import React, { useState, useEffect } from 'react';

function CharactersModal({ open, onClose, selectedCharacters, changeCharacters }) {

  const [characterList, setCharacterList] = useState([]);
  const [characterChecked, setCharacterChecked] = useState([]);
  const [groupedCharacterList, setGroupedCharacterList] = useState([]);

  async function getCharacterList() {
    const response = await fetch(`http://localhost:5050/character/`);
    if (!response.ok) {
      const message = `An error occurred: ${response.statusText}`;
      console.error(message);
      return;
    }
    const characters = await response.json();
    characters.sort((a, b) => a.part - b.part || a.name.localeCompare(b.name));
    setCharacterList(characters);
  }

  useEffect(() => {
    getCharacterList();
  }, [open]);

  useEffect(() => {
    const newCharacterChecked = {};
    const groupedCharacters = {};

    characterList.forEach((character) => {
      newCharacterChecked[character._id] = selectedCharacters.includes(character._id);
      
      if (!groupedCharacters[character.part]) {
        groupedCharacters[character.part] = [];
      }
      groupedCharacters[character.part].push(character);
    });
    setCharacterChecked(newCharacterChecked);
    setGroupedCharacterList(groupedCharacters);
  }, [characterList, open]);

  const handleChange = (id) => {
    setCharacterChecked(prevState => ({
      ...prevState,
      [id]: !prevState[id],
    }));
  };

  async function submitCharacters(e) {
    e.preventDefault();
    let newCharacterIds = Object.keys(characterChecked).filter(id => characterChecked[id]);
    let newCharacterNames = characterList.filter(character => newCharacterIds.includes(character._id)).map(character => character.name);
    changeCharacters(newCharacterIds, newCharacterNames);
  }

  if (!open) return null;

  return (
    <div className="modal-background">
        <div className="modal-container">
            <div className="modal-header">
              <button onClick={onClose}>Back</button>
              <button onClick={submitCharacters}>Submit</button>
            </div>
            <div>
              {Object.entries(groupedCharacterList).map(([part, characters]) => (
                <div key={part}>
                  <h3>Part {part}</h3>
                  {characters.map((character) => (
                    <div key={character._id}>
                      <input
                        type="checkbox"
                        id={character._id}
                        checked={characterChecked[character._id] || false}
                        onChange={() => handleChange(character._id)}
                      />
                      {character.name}
                    </div>
                  ))}
                </div>
              ))}
            </div>
        </div>
    </div>
  )
}

export default CharactersModal