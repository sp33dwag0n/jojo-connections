import { useState } from 'react'
import { Link, Navigate, useNavigate } from 'react-router'
import { api } from '../api';
import { isLoggedIn, setToken } from '../auth';
import Button from '../components/Button';
import Field, { ErrorMessage, inputClass } from '../components/Field';

function LoginPage() {
  const navigate = useNavigate();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  if (isLoggedIn()) {
    return <Navigate to="/admin/home" replace />;
  }

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const data = await api('/admin/login', {
        method: 'POST',
        body: { username, password },
        auth: false,
      });
      setToken(data.token);
      navigate('/admin/home');
    } catch (err) {
      setError(err.message || 'Login failed');
      setLoading(false);
    }
  }

  return (
    <div className="flex min-h-svh flex-col items-center justify-center bg-stone-50 px-4">
      <div className="w-full max-w-sm animate-slide-up">
        <div className="mb-6 text-center">
          <h1 className="text-2xl font-extrabold tracking-tight">
            JoJo <span className="text-extreme">Connections</span>
          </h1>
          <p className="mt-1 text-sm text-stone-500">Sign in to manage characters and categories</p>
        </div>

        <form onSubmit={handleLogin} className="flex flex-col gap-4 rounded-2xl border border-stone-200 bg-white p-6 shadow-sm">
          <Field label="Username" htmlFor="username">
            <input
              id="username"
              type="text"
              autoComplete="username"
              autoFocus
              required
              className={inputClass}
              value={username}
              onChange={(e) => setUsername(e.target.value)}
            />
          </Field>
          <Field label="Password" htmlFor="password">
            <input
              id="password"
              type="password"
              autoComplete="current-password"
              required
              className={inputClass}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </Field>

          <ErrorMessage>{error}</ErrorMessage>

          <Button type="submit" variant="primary" size="lg" disabled={loading} className="mt-1 w-full">
            {loading ? 'Signing in…' : 'Sign in'}
          </Button>
        </form>

        <p className="mt-6 text-center text-sm">
          <Link to="/" className="font-medium text-stone-500 hover:text-stone-900">← Back to the game</Link>
        </p>
      </div>
    </div>
  )
}

export default LoginPage
