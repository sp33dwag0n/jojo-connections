import { useEffect, useState, useCallback } from 'react'
import { useNavigate } from 'react-router'
import AdminLayout from './AdminLayout';
import Button from '../components/Button';
import Spinner from '../components/Spinner';
import { ErrorMessage, inputClass } from '../components/Field';
import { api } from '../api';
import { DIFFICULTIES } from '../constants';

function CatagoryList() {
  const navigate = useNavigate();
  const [catagoryList, setCatagoryList] = useState(null);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [difficultyFilter, setDifficultyFilter] = useState(null);

  const getCatagoryList = useCallback(async () => {
    try {
      setCatagoryList(await api('/catagory/'));
    } catch (err) {
      setError(err.message);
    }
  }, []);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    getCatagoryList();
  }, [getCatagoryList]);

  async function deleteCatagory(catagory) {
    if (!window.confirm(`Delete the ${DIFFICULTIES[catagory.difficulty].label} category "${catagory.name}"?`)) return;
    try {
      await api('/catagory/' + catagory._id, { method: 'DELETE' });
      setCatagoryList((prev) => prev.filter((c) => c._id !== catagory._id));
    } catch (err) {
      setError(err.message);
    }
  }

  const query = search.trim().toLowerCase();
  const filtered = catagoryList?.filter((c) =>
    (difficultyFilter === null || c.difficulty === difficultyFilter) &&
    (c.name.toLowerCase().includes(query) || c.characterNames.some((n) => n.toLowerCase().includes(query)))
  );

  const filterClass = (active) =>
    `rounded-full border px-3 py-1 text-xs font-semibold transition ${
      active ? 'border-stone-900 bg-stone-900 text-white' : 'border-stone-300 bg-white text-stone-600 hover:border-stone-400'
    }`;

  return (
    <AdminLayout
      title="Categories"
      actions={<Button variant="primary" onClick={() => navigate('/admin/catagories/add')}>+ Add Category</Button>}
    >
      <ErrorMessage>{error}</ErrorMessage>

      <div className="mb-4 mt-2 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <input
          type="search"
          placeholder="Search categories or characters…"
          className={`${inputClass} sm:max-w-xs`}
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <div className="flex flex-wrap gap-1.5">
          <button className={filterClass(difficultyFilter === null)} onClick={() => setDifficultyFilter(null)}>All</button>
          {DIFFICULTIES.map((d, i) => (
            <button key={d.label} className={filterClass(difficultyFilter === i)} onClick={() => setDifficultyFilter(i)}>
              <span className={`mr-1.5 inline-block size-2 rounded-full ${d.bg}`} />
              {d.label}
            </button>
          ))}
        </div>
      </div>

      {!catagoryList ? (
        <div className="flex justify-center py-12"><Spinner /></div>
      ) : filtered.length === 0 ? (
        <p className="rounded-2xl border border-dashed border-stone-300 py-12 text-center text-sm text-stone-500">
          {catagoryList.length === 0 ? 'No categories yet. Add your first one!' : 'No categories match your filters.'}
        </p>
      ) : (
        <div className="grid gap-3 md:grid-cols-2">
          {filtered.map((catagory) => (
            <div key={catagory._id} className="flex flex-col overflow-hidden rounded-2xl border border-stone-200 bg-white shadow-sm">
              <div className={`flex items-center justify-between gap-2 px-4 py-2.5 ${DIFFICULTIES[catagory.difficulty].bg}`}>
                <h2 className="font-bold uppercase tracking-wide">{catagory.name}</h2>
                <span className="rounded-md bg-white/60 px-2 py-0.5 text-xs font-semibold">
                  {DIFFICULTIES[catagory.difficulty].label}
                </span>
              </div>
              <div className="flex flex-1 flex-wrap content-start gap-1.5 p-4">
                {catagory.characterNames.map((name, i) => (
                  <span key={i} className="rounded-md bg-stone-100 px-2 py-1 text-xs font-medium text-stone-700">{name}</span>
                ))}
                {catagory.characterNames.length < 4 && (
                  <span className="text-xs font-medium text-amber-700">Needs at least 4 characters to be used</span>
                )}
              </div>
              <div className="flex items-center justify-between border-t border-stone-100 px-4 py-2.5">
                <span className="text-xs text-stone-500">{catagory.characterNames.length} characters</span>
                <div className="flex gap-2">
                  <Button variant="subtle" size="sm" onClick={() => navigate('/admin/catagories/edit/' + catagory._id)}>Edit</Button>
                  <Button variant="danger" size="sm" onClick={() => deleteCatagory(catagory)}>Delete</Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </AdminLayout>
  )
}

export default CatagoryList
