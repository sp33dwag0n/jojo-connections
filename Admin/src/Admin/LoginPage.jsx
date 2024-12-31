import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'

function LoginPage() {
  const navigate = useNavigate();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleLogin = async (e) => {
    e.preventDefault();

    try {
      const response = await fetch("http://localhost:5050/admin/login", {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username, password }),
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        setError(errorData.message || 'Login failed');
        return;
      }

      const data = await response.json();

      localStorage.setItem('authToken', data.token);
      navigate("/admin/home")
    } catch (err) {
      setError('Something went wrong. Please try again');
    }
  }

  return (
    <div>
        <form onSubmit={handleLogin}>
          <div>
            <label>Username: </label>
            <input type="text" value={username} onChange={(e) => setUsername(e.target.value)}/>
          </div>
          <div>
            <label>Password: </label>
            <input type="text" value={password} onChange={(e) => setPassword(e.target.value)}/>
          </div>
          {error && <div style={{color: 'red'}}>{error}</div>}
          <div>
            <button type="submit" className="header-btn">Login</button>
          </div>
        </form>
        
        
        
    </div>
  )
}

export default LoginPage