import { useState, useEffect } from 'react';
import Modal from '../components/Modal';
import Button from '../components/Button';
import Spinner from '../components/Spinner';
import { ErrorMessage, inputClass } from '../components/Field';
import { api } from '../api';

function CharactersModal({ open, onClose, selectedCharacters, changeCharacters }) {
  const [characterList, setCharacterList] = useState(null);
  const [checked, setChecked] = useState([]);
  const [search, setSearch] = useState('');
  const [error, setError] = useState('');

  // Refresh the list and reset the selection every time the modal opens
  useEffect(() => {
    if (!open) return;
    /* eslint-disable react-hooks/set-state-in-effect */
    setChecked(selectedCharacters);
    setSearch('');
    setError('');
    /* eslint-enable react-hooks/set-state-in-effect */
    api('/character/').then(setCharacterList).catch((err) => setError(err.message));
  }, [open, selectedCharacters]);

  const toggle = (id) => {
    setChecked((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));
  };

  function submitCharacters() {
    const byId = new Map(characterList.map((c) => [c._id, c]));
    const ids = checked.filter((id) => byId.has(id));
    changeCharacters(ids, ids.map((id) => byId.get(id).name));
  }

  const query = search.trim().toLowerCase();
  const grouped = {};
  for (const character of characterList ?? []) {
    if (!character.name.toLowerCase().includes(query)) continue;
    (grouped[character.part] ??= []).push(character);
  }

  return (
    <Modal
      open={open}
      onClose={onClose}
      size="lg"
      title="Choose Characters"
      footer={
        <>
          <span className="mr-auto self-center text-sm text-stone-500">{checked.length} selected</span>
          <Button variant="subtle" onClick={onClose}>Cancel</Button>
          <Button variant="primary" onClick={submitCharacters} disabled={!characterList}>Done</Button>
        </>
      }
    >
      <input
        type="search"
        placeholder="Search characters…"
        autoFocus
        className={`${inputClass} mb-4`}
        value={search}
        onChange={(e) => setSearch(e.target.value)}
      />
      <ErrorMessage>{error}</ErrorMessage>

      {!characterList ? (
        !error && <div className="flex justify-center py-8"><Spinner /></div>
      ) : Object.keys(grouped).length === 0 ? (
        <p className="py-8 text-center text-sm text-stone-500">No characters found.</p>
      ) : (
        <div className="flex flex-col gap-5">
          {Object.entries(grouped).map(([part, characters]) => (
            <section key={part}>
              <h3 className="mb-2 text-xs font-bold uppercase tracking-wide text-stone-500">Part {part}</h3>
              <div className="flex flex-wrap gap-2">
                {characters.map((character) => {
                  const isChecked = checked.includes(character._id);
                  return (
                    <button
                      key={character._id}
                      type="button"
                      aria-pressed={isChecked}
                      onClick={() => toggle(character._id)}
                      className={`rounded-full border px-3 py-1.5 text-sm font-medium transition active:scale-95 ${
                        isChecked
                          ? 'border-stone-900 bg-stone-900 text-white'
                          : 'border-stone-300 bg-white text-stone-700 hover:border-stone-500'
                      }`}
                    >
                      {isChecked && '✓ '}{character.name}
                    </button>
                  );
                })}
              </div>
            </section>
          ))}
        </div>
      )}
    </Modal>
  )
}

export default CharactersModal
