import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router';
import AdminLayout from './AdminLayout';
import CharactersModal from './CharactersModal';
import Button from '../components/Button';
import Spinner from '../components/Spinner';
import Field, { ErrorMessage, inputClass } from '../components/Field';
import { api } from '../api';
import { DIFFICULTIES, GROUP_SIZE } from '../constants';

function AddCatagory() {
  const navigate = useNavigate();
  const { id } = useParams();
  const [form, setForm] = useState({
    name: "",
    characters: [],
    characterNames: [],
    difficulty: "",
  })
  const [modal, setModal] = useState(false);
  const [loading, setLoading] = useState(Boolean(id));
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!id) return;
    api('/catagory/' + id)
      .then((catagory) => setForm({
        name: catagory.name,
        characters: catagory.characters,
        characterNames: catagory.characterNames,
        difficulty: catagory.difficulty,
      }))
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, [id]);

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');

    if (form.difficulty === '') return setError('Pick a difficulty.');
    if (form.characters.length < GROUP_SIZE) return setError(`Pick at least ${GROUP_SIZE} characters.`);

    setSaving(true);
    try {
      const { name, characters, difficulty } = form;
      await api(id ? '/catagory/' + id : '/catagory', {
        method: id ? 'PATCH' : 'POST',
        body: { name, characters, difficulty },
      });
      navigate('/admin/catagories');
    } catch (err) {
      setError(err.message);
      setSaving(false);
    }
  }

  function changeCharacters(newCharacterIds, newCharacterNames) {
    setForm({ ...form, characters: newCharacterIds, characterNames: newCharacterNames });
    setModal(false);
  }

  function removeCharacter(index) {
    setForm({
      ...form,
      characters: form.characters.filter((_, i) => i !== index),
      characterNames: form.characterNames.filter((_, i) => i !== index),
    });
  }

  return (
    <AdminLayout title={id ? 'Edit Category' : 'Add Category'}>
      <form
        onSubmit={handleSubmit}
        className="flex max-w-2xl flex-col gap-6 rounded-2xl border border-stone-200 bg-white p-6 shadow-sm"
      >
        {loading ? (
          <div className="flex justify-center py-8"><Spinner /></div>
        ) : (
          <>
            <Field label="Name" htmlFor="name" hint="Shown to players when they solve this group.">
              <input
                type="text" name="name" id="name" placeholder="e.g. Stand users with time powers" autoFocus required
                className={inputClass} value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })}
              />
            </Field>

            <fieldset className="flex flex-col gap-1.5">
              <legend className="mb-1.5 text-sm font-semibold text-stone-800">Difficulty</legend>
              <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
                {DIFFICULTIES.map((d, i) => {
                  const active = Number(form.difficulty) === i && form.difficulty !== '';
                  return (
                    <label
                      key={d.label}
                      className={`flex cursor-pointer items-center justify-center rounded-lg border-2 px-3 py-2.5 text-sm font-semibold transition
                        ${active ? `${d.bg} border-stone-900` : 'border-stone-200 hover:border-stone-300'}`}
                    >
                      <input
                        type="radio" name="difficulty" value={i} className="sr-only"
                        checked={active} onChange={() => setForm({ ...form, difficulty: i })}
                      />
                      {!active && <span className={`mr-2 size-3 rounded-full ${d.bg}`} />}
                      {d.label}
                    </label>
                  );
                })}
              </div>
            </fieldset>

            <div className="flex flex-col gap-2">
              <div className="flex items-center justify-between">
                <span className="text-sm font-semibold text-stone-800">
                  Characters <span className="font-normal text-stone-500">({form.characters.length} selected, need {GROUP_SIZE}+)</span>
                </span>
                <Button variant="subtle" size="sm" onClick={() => setModal(true)}>Choose Characters</Button>
              </div>
              <div className="flex min-h-14 flex-wrap content-start gap-1.5 rounded-lg border border-dashed border-stone-300 p-3">
                {form.characterNames.length === 0 && (
                  <span className="text-sm text-stone-400">No characters selected yet.</span>
                )}
                {form.characterNames.map((name, i) => (
                  <span key={form.characters[i]} className="inline-flex items-center gap-1 rounded-md bg-stone-100 py-1 pl-2 pr-1 text-xs font-medium text-stone-700">
                    {name}
                    <button
                      type="button"
                      aria-label={`Remove ${name}`}
                      onClick={() => removeCharacter(i)}
                      className="rounded px-1 text-stone-400 hover:bg-stone-200 hover:text-stone-900"
                    >
                      ×
                    </button>
                  </span>
                ))}
              </div>
            </div>
          </>
        )}

        <ErrorMessage>{error}</ErrorMessage>

        <div className="flex justify-end gap-2 border-t border-stone-100 pt-4">
          <Button variant="subtle" onClick={() => navigate('/admin/catagories')}>Cancel</Button>
          <Button type="submit" variant="primary" disabled={saving || loading}>
            {saving ? 'Saving…' : id ? 'Save Changes' : 'Add Category'}
          </Button>
        </div>
      </form>

      <CharactersModal
        open={modal}
        onClose={() => setModal(false)}
        selectedCharacters={form.characters}
        changeCharacters={changeCharacters}
      />
    </AdminLayout>
  )
}

export default AddCatagory
