import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

function CharacterList() {
  const navigate = useNavigate();
  const [characterList, setCharacterList] = useState([]);

  // This method fetches the records from the database.
  async function getCharacterList() {
    const response = await fetch(`http://localhost:5050/character/`);
    if (!response.ok) {
      const message = `An error occurred: ${response.statusText}`;
      console.error(message);
      return;
    }
    const characters = await response.json();
    characters.sort((a, b) => a.part - b.part);
    setCharacterList(characters);
  }
  
  useEffect(() => {
    getCharacterList();
  }, []);

  const editCharacter = (id) => {
    navigate("/admin/characters/edit/" + id);
  }

  async function deleteCharacter(character) {
    if (!window.confirm("Delete " + character.name + " from Part " + character.part + "?")) return;

    try {
      let response = await fetch("http://localhost:5050/character/" + character._id, {
        method: "DELETE"
      });
    } catch (err) {
      console.error(err);
    }
    getCharacterList();
  }
  
  return (
    <div>
        <div className="list-header">
          <button className="header-button" onClick={() => navigate("/admin/home")}>Home</button>
          <div className="list-title">
            Character List
          </div>
        </div>
        
        <div className="list-body">
          <button onClick={() => navigate("/admin/characters/add")}>Add Character</button>
          <table>
            <thead>
              <tr>
                <th>Name</th>
                <th>Part</th>
              </tr>
            </thead>
            <tbody>
              {characterList.map((character, index) => {
                return (
                  <tr key={index}>
                    <td>{character.name}</td>
                    <td>{character.part}</td>
                    <td><button onClick={() => editCharacter(character._id)}>Edit</button></td>
                    <td><button onClick={() => deleteCharacter(character)}>Delete</button></td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
    </div>
  )
}

export default CharacterList