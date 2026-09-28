import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router';
import AdminLayout from './AdminLayout';
import Button from '../components/Button';
import Spinner from '../components/Spinner';
import { ErrorMessage, inputClass } from '../components/Field';
import { api } from '../api';

function CharacterList() {
  const navigate = useNavigate();
  const [characterList, setCharacterList] = useState(null);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');

  const getCharacterList = useCallback(async () => {
    try {
      setCharacterList(await api('/character/'));
    } catch (err) {
      setError(err.message);
    }
  }, []);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    getCharacterList();
  }, [getCharacterList]);

  async function deleteCharacter(character) {
    if (!window.confirm(`Delete ${character.name} from Part ${character.part}? They'll also be removed from any categories.`)) return;
    try {
      await api('/character/' + character._id, { method: 'DELETE' });
      setCharacterList((prev) => prev.filter((c) => c._id !== character._id));
    } catch (err) {
      setError(err.message);
    }
  }

  const query = search.trim().toLowerCase();
  const filtered = characterList?.filter((c) => c.name.toLowerCase().includes(query));

  return (
    <AdminLayout
      title="Characters"
      actions={<Button variant="primary" onClick={() => navigate('/admin/characters/add')}>+ Add Character</Button>}
    >
      <ErrorMessage>{error}</ErrorMessage>

      <div className="mt-2 overflow-hidden rounded-2xl border border-stone-200 bg-white shadow-sm">
        <div className="border-b border-stone-200 p-3">
          <input
            type="search"
            placeholder="Search characters…"
            className={`${inputClass} sm:max-w-xs`}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        {!characterList ? (
          <div className="flex justify-center py-12"><Spinner /></div>
        ) : filtered.length === 0 ? (
          <p className="py-12 text-center text-sm text-stone-500">
            {characterList.length === 0 ? 'No characters yet. Add your first one!' : 'No characters match your search.'}
          </p>
        ) : (
          <table className="w-full text-left text-sm">
            <thead className="bg-stone-50 text-xs uppercase tracking-wide text-stone-500">
              <tr>
                <th className="px-4 py-3 font-semibold">Name</th>
                <th className="px-4 py-3 font-semibold">Part</th>
                <th className="px-4 py-3"><span className="sr-only">Actions</span></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100">
              {filtered.map((character) => (
                <tr key={character._id} className="transition hover:bg-stone-50">
                  <td className="px-4 py-3 font-medium">{character.name}</td>
                  <td className="px-4 py-3">
                    <span className="rounded-md bg-stone-100 px-2 py-0.5 text-xs font-semibold text-stone-600">Part {character.part}</span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex justify-end gap-2">
                      <Button variant="subtle" size="sm" onClick={() => navigate('/admin/characters/edit/' + character._id)}>Edit</Button>
                      <Button variant="danger" size="sm" onClick={() => deleteCharacter(character)}>Delete</Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </AdminLayout>
  )
}

export default CharacterList
