import { Link, NavLink, useNavigate } from 'react-router';
import { clearToken } from '../auth';
import Button from '../components/Button';

const navClass = ({ isActive }) =>
  `rounded-lg px-3 py-1.5 text-sm font-semibold transition ${
    isActive ? 'bg-stone-900 text-white' : 'text-stone-600 hover:bg-stone-100 hover:text-stone-900'
  }`;

// Shared chrome for every logged-in admin page
function AdminLayout({ title, actions, children }) {
  const navigate = useNavigate();

  const logout = () => {
    clearToken();
    navigate('/admin');
  };

  return (
    <div className="min-h-svh bg-stone-50">
      <header className="sticky top-0 z-30 border-b border-stone-200 bg-white/90 backdrop-blur">
        <div className="mx-auto flex max-w-5xl flex-wrap items-center gap-x-4 gap-y-2 px-4 py-3">
          <Link to="/admin/home" className="mr-auto text-lg font-extrabold tracking-tight">
            JoJo <span className="text-extreme">Connections</span>
            <span className="ml-2 rounded-md bg-stone-100 px-1.5 py-0.5 align-middle text-xs font-semibold text-stone-500">Admin</span>
          </Link>
          <nav className="flex items-center gap-1">
            <NavLink to="/admin/characters" className={navClass}>Characters</NavLink>
            <NavLink to="/admin/catagories" className={navClass}>Categories</NavLink>
            <Link to="/" className="rounded-lg px-3 py-1.5 text-sm font-semibold text-stone-600 transition hover:bg-stone-100 hover:text-stone-900">
              Play
            </Link>
          </nav>
          <Button variant="subtle" size="sm" onClick={logout}>Log out</Button>
        </div>
      </header>

      <main className="mx-auto max-w-5xl px-4 py-8">
        {(title || actions) && (
          <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
            <h1 className="text-2xl font-bold tracking-tight">{title}</h1>
            <div className="flex items-center gap-2">{actions}</div>
          </div>
        )}
        {children}
      </main>
    </div>
  );
}

export default AdminLayout;
