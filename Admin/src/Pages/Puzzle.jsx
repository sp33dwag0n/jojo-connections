import React from 'react';
import { useNavigate } from 'react-router-dom';


function Puzzle() {
  const navigate = useNavigate();
  
  return (
    <div>
      <div>Puzzle</div>
      <div>
        <button className="btn" onClick={() => navigate("/admin")}>Admin</button>
      </div>
    </div>
  )
}

export default Puzzle