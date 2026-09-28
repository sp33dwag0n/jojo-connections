export const inputClass =
  'h-10 w-full rounded-lg border border-stone-300 bg-white px-3 text-sm shadow-sm transition ' +
  'placeholder:text-stone-400 focus:border-stone-900 focus:outline-none focus:ring-2 focus:ring-stone-900/10';

function Field({ label, htmlFor, hint, children }) {
  return (
    <div className="flex flex-col gap-1.5">
      <label htmlFor={htmlFor} className="text-sm font-semibold text-stone-800">{label}</label>
      {children}
      {hint && <p className="text-xs text-stone-500">{hint}</p>}
    </div>
  );
}

export function ErrorMessage({ children }) {
  if (!children) return null;
  return (
    <div role="alert" className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700 animate-fade-in">
      {children}
    </div>
  );
}

export default Field;
