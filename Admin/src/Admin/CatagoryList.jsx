import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'

function CatagoryList() {
  const navigate = useNavigate();
  const [catagoryList, setCatagoryList] = useState([]);
  const diff = ["Easy", "Medium", "Hard", "Extreme"];

  async function getCatagoryList() {
    const token = localStorage.getItem('authToken');
    const response = await fetch(`http://localhost:5050/catagory/`, {
      headers: {
        "Authorization": `Bearer ${token}`
      }
    });
    if (!response.ok) {
      const message = `An error occurred: ${response.statusText}`;
      console.error(message);
      return;
    }
    const catagories = await response.json();
    catagories.sort((a, b) => a.difficulty - b.difficulty);
    setCatagoryList(catagories);
  }

  useEffect(() => {
    getCatagoryList();
  }, []);

  const editCatagory = (id) => {
    navigate("/admin/catagories/edit/" + id);
  }

  async function deleteCatagory(catagory) {
    if (!window.confirm("Delete the " + diff[catagory.difficulty] + " catagory \"" + catagory.name + "\"?")) return;

    try {
      const token = localStorage.getItem('authToken');
      let response = await fetch("http://localhost:5050/catagory/" + catagory._id, {
        method: "DELETE",
        headers: {
          "Authorization": `Bearer ${token}`
        }
      });
    } catch (err) {
      console.error(err);
    }
    getCatagoryList();
  }

    
  return (
    <div>
        <div className="list-header">
          <button className="header-button" onClick={() => navigate("/admin/home")}>Home</button>
          <div className="list-title">
            Catagory List
          </div>
        </div>

        <div className="list-body">
          <button onClick={() => navigate("/admin/catagories/add")}>Add Catagory</button>
          <table>
            <thead>
              <tr>
                <th>Name</th>
                <th>Characters</th>
                <th>Difficulty</th>
              </tr>
            </thead>
            <tbody>
              {catagoryList.map((catagory, index) => {
                return (
                  <tr key={index}>
                    <td>{catagory.name}</td>
                    <td>
                      {catagory.characterNames.map((name, key) => {
                        return (
                          <div key={key}>
                            {name}
                            <br />
                          </div>
                        );
                      })}
                    </td>
                    <td>{diff[catagory.difficulty]}</td>
                    <td><button onClick={() => editCatagory(catagory._id)}>Edit</button></td>
                    <td><button onClick={() => deleteCatagory(catagory)}>Delete</button></td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
    </div>
  )
}

export default CatagoryList