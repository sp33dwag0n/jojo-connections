import React from 'react';
import { useNavigate } from 'react-router-dom';

function AdminHome() {
  const navigate = useNavigate();
  
  return (
    <div className="home">
        <div>
          <p className="title">Welcome to the JojoConnections Admin Page!</p>
        </div>
        <div className="body">
          <button className="btn" onClick={() => navigate("/admin/characters")}>View Characters</button>
          <button className="btn" onClick={() => navigate("/admin/catagories")}>View Catagories</button>
        </div>
    </div>
  )
}

export default AdminHome