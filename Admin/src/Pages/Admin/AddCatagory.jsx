import React, { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom';
import CharactersModal from './CharactersModal';

function AddCatagory() {
  const navigate = useNavigate();
  const { id } = useParams();
  const [form, setForm] = useState({
    name: "",
    characters: [],
    characterNames: [],
    difficulty: "",
  })
  const [modal, setModal] = useState(false);

  useEffect(() => {
    if (id) {
      getCatagory(id);
    }
  }, []);

  async function getCatagory(id) {
    const response = await fetch(`http://localhost:5050/catagory/` + id);
    if (!response.ok) {
      const message = `An error occurred: ${response.statusText}`;
      console.error(message);
      return;
    }
    const catagory = await response.json();
    document.getElementById("name").value = catagory.name;
    document.getElementById("difficulty").value = catagory.difficulty;
    setForm({
      name: catagory.name, 
      characters: catagory.characters, 
      characterNames: catagory.characterNames,
      difficulty: catagory.difficulty
    });
  }

  async function handleSubmit(e) {
    e.preventDefault();
    
    const person = { ...form };

    if (id) {
      try {
        let response = await fetch("http://localhost:5050/catagory/" + id, {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(person),
        });
      } catch (err) {
        console.error(err);
      }
    } else {
      try {
        let response = await fetch("http://localhost:5050/catagory", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(person),
        });
      } catch (err) {
        console.error(err);
      }
    }

    navigate("/admin/catagories/");
  }

  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value
    });
  };

  async function openModal(e) {
    e.preventDefault();
    setModal(true);
  }

  async function closeModal(e) {
    e.preventDefault();
    setModal(false);
  }

  async function changeCharacters(newCharacterIds, newCharacterNames) {
    setForm({
      ...form,
      characters: newCharacterIds,
      characterNames: newCharacterNames
    });
    setModal(false);
  }

  let headerLabel = "Add Catagory";
  if (id) {
    headerLabel = "Edit Catagory";
  }

  return (
    <div className="addCatagory">
      <div>
        <button onClick={() => navigate("/admin/catagories/")}>
          Catagory List
        </button>
      </div>
      <div>
        <h3>{headerLabel}</h3>
      </div>
      <form onSubmit={handleSubmit}>
        <label>Name: </label>
        <input type="text" name="name" id="name" placeholder="Name" onChange={handleChange} required/>
        <br />

        <label>Characters: </label>
        {form.characterNames.map((name, key) => {
          return (
            <div style={{display: 'inline'}} key={key}>
              {name} &nbsp;
            </div>
          );
        })}
        <br />
        <button onClick={openModal}>Change Characters</button>
        <br />

        <label>Difficulty: </label>
        <select name="difficulty" id="difficulty" onChange={handleChange} required>
          <option value="">Select Difficulty</option>
          <option value="1">Easy</option>
          <option value="2">Medium</option>
          <option value="3">Hard</option>
          <option value="4">Extreme</option>
        </select>
        <br />
        
        <button type="submit" onSubmit={handleSubmit}>Submit</button>
      </form>

      <CharactersModal 
        open={modal} 
        onClose={closeModal} 
        selectedCharacters={form.characters} 
        changeCharacters={changeCharacters}
      />
    </div>
  )
}

export default AddCatagory