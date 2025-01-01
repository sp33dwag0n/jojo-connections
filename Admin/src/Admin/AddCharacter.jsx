import React, { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom';

function AddCharacter() {
  const navigate = useNavigate();
  const { id } = useParams();
  const [form, setForm] = useState({
    name: "",
    part: ""
  })

  useEffect(() => {
    if (id) {
      getCharacter(id);
    }
  }, []);

  async function getCharacter(id) {
    const token = localStorage.getItem('authToken');
    const response = await fetch(`http://localhost:5050/character/` + id, {
      headers: {
        "Authorization": `Bearer ${token}`
      }
    });
    if (!response.ok) {
      const message = `An error occurred: ${response.statusText}`;
      console.error(message);
      return;
    }
    const character = await response.json();
    document.getElementById("name").value = character.name;
    document.getElementById("part").value = character.part;
    setForm({name: character.name, part: character.part});
  }

  async function handleSubmit(e) {
    e.preventDefault();
    
    const person = { ...form };

    if (id) {
      try {
        const token = localStorage.getItem('authToken');
        let response = await fetch("http://localhost:5050/character/" + id, {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${token}`
          },
          body: JSON.stringify(person),
        });
      } catch (err) {
        console.error(err);
      }
    } else {
      try {
        const token = localStorage.getItem('authToken');
        let response = await fetch("http://localhost:5050/character", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${token}`
          },
          body: JSON.stringify(person),
        });
      } catch (err) {
        console.error(err);
      }
    }

    navigate("/admin/characters/");
  }

  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value
    });
  };

  let headerLabel = "Add Character";
  if (id) {
    headerLabel = "Edit Character";
  }
  
  return (
    <div className="">
      <div>
        <button onClick={() => navigate("/admin/characters/")}>
          Character List
        </button>
      </div>
      <div>
        <h3>{headerLabel}</h3>
      </div>
      <form onSubmit={handleSubmit}>
        <label>Name: </label>
        <input type="text" name="name" id="name" placeholder="Name" onChange={handleChange} required/>
        <br />

        <label>Part: </label>
        <select name="part" id="part" onChange={handleChange} required>
          <option value="">Select Part</option>
          <option value="1">Part 1</option>
          <option value="2">Part 2</option>
          <option value="3">Part 3</option>
          <option value="4">Part 4</option>
          <option value="5">Part 5</option>
          <option value="6">Part 6</option>
          <option value="7">Part 7</option>
          <option value="8">Part 8</option>
          <option value="9">Part 9</option>
        </select>
        <br />
        
        <button type="submit">Submit</button>
      </form>
    </div>
  )
}

export default AddCharacter