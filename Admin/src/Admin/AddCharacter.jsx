import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router';
import AdminLayout from './AdminLayout';
import Button from '../components/Button';
import Spinner from '../components/Spinner';
import Field, { ErrorMessage, inputClass } from '../components/Field';
import { api } from '../api';
import { PARTS } from '../constants';

function AddCharacter() {
  const navigate = useNavigate();
  const { id } = useParams();
  const [form, setForm] = useState({ name: "", part: "" });
  const [loading, setLoading] = useState(Boolean(id));
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!id) return;
    api('/character/' + id)
      .then((character) => setForm({ name: character.name, part: String(character.part) }))
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, [id]);

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    setSaving(true);

    try {
      await api(id ? '/character/' + id : '/character', {
        method: id ? 'PATCH' : 'POST',
        body: form,
      });
      navigate('/admin/characters');
    } catch (err) {
      setError(err.message);
      setSaving(false);
    }
  }

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  return (
    <AdminLayout title={id ? 'Edit Character' : 'Add Character'}>
      <form
        onSubmit={handleSubmit}
        className="flex max-w-lg flex-col gap-5 rounded-2xl border border-stone-200 bg-white p-6 shadow-sm"
      >
        {loading ? (
          <div className="flex justify-center py-8"><Spinner /></div>
        ) : (
          <>
            <Field label="Name" htmlFor="name">
              <input
                type="text" name="name" id="name" placeholder="e.g. Jotaro Kujo" autoFocus required
                className={inputClass} value={form.name} onChange={handleChange}
              />
            </Field>

            <Field label="Part" htmlFor="part">
              <select name="part" id="part" required className={inputClass} value={form.part} onChange={handleChange}>
                <option value="">Select part</option>
                {PARTS.map((part) => (
                  <option key={part} value={part}>Part {part}</option>
                ))}
              </select>
            </Field>
          </>
        )}

        <ErrorMessage>{error}</ErrorMessage>

        <div className="flex justify-end gap-2 border-t border-stone-100 pt-4">
          <Button variant="subtle" onClick={() => navigate('/admin/characters')}>Cancel</Button>
          <Button type="submit" variant="primary" disabled={saving || loading}>
            {saving ? 'Saving…' : id ? 'Save Changes' : 'Add Character'}
          </Button>
        </div>
      </form>
    </AdminLayout>
  )
}

export default AddCharacter
