import { useEffect, useState } from 'react';
import { Link } from 'react-router';
import AdminLayout from './AdminLayout';
import { api } from '../api';
import { DIFFICULTIES } from '../constants';

function StatCard({ to, title, count, description, children }) {
  return (
    <Link
      to={to}
      className="group flex flex-col gap-3 rounded-2xl border border-stone-200 bg-white p-6 shadow-sm transition
        hover:-translate-y-0.5 hover:border-stone-300 hover:shadow-md"
    >
      <div className="flex items-baseline justify-between">
        <h2 className="text-lg font-bold">{title}</h2>
        <span className="text-sm font-semibold text-stone-400 transition group-hover:translate-x-0.5 group-hover:text-stone-900">
          Manage →
        </span>
      </div>
      <p className="text-4xl font-extrabold tabular-nums">{count ?? '–'}</p>
      <p className="text-sm text-stone-500">{description}</p>
      {children}
    </Link>
  );
}

function AdminHome() {
  const [characters, setCharacters] = useState(null);
  const [catagories, setCatagories] = useState(null);

  useEffect(() => {
    api('/character/').then(setCharacters).catch(() => {});
    api('/catagory/').then(setCatagories).catch(() => {});
  }, []);

  const perDifficulty = DIFFICULTIES.map((_, d) => catagories?.filter((c) => c.difficulty === d).length ?? 0);
  const missing = catagories && DIFFICULTIES.filter((_, d) => perDifficulty[d] === 0);

  return (
    <AdminLayout title="Dashboard">
      {missing?.length > 0 && (
        <div className="mb-6 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
          Puzzles need at least one category of every difficulty. Missing: <b>{missing.map((d) => d.label).join(', ')}</b>.
        </div>
      )}
      <div className="grid gap-4 sm:grid-cols-2">
        <StatCard
          to="/admin/characters"
          title="Characters"
          count={characters?.length}
          description="Every character that can appear on the board."
        />
        <StatCard
          to="/admin/catagories"
          title="Categories"
          count={catagories?.length}
          description="Groups of characters, one per difficulty in each puzzle."
        >
          <div className="flex gap-2">
            {DIFFICULTIES.map((d, i) => (
              <span key={d.label} className={`rounded-md px-2 py-0.5 text-xs font-semibold ${d.bg}`}>
                {d.label} · {perDifficulty[i]}
              </span>
            ))}
          </div>
        </StatCard>
      </div>
    </AdminLayout>
  )
}

export default AdminHome
