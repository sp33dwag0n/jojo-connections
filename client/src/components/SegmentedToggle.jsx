// Pill-shaped group of buttons where exactly one option is selected.
// options: [[value, label], ...]
function SegmentedToggle({ label, options, value, onChange }) {
  return (
    <div className="flex shrink-0 rounded-full bg-stone-100 p-1" role="group" aria-label={label}>
      {options.map(([optionValue, optionLabel]) => (
        <button
          key={optionValue}
          aria-pressed={value === optionValue}
          onClick={() => value !== optionValue && onChange(optionValue)}
          className={`rounded-full px-3 py-1 text-sm font-semibold transition ${
            value === optionValue
              ? 'bg-white text-stone-900 shadow-sm'
              : 'text-stone-500 hover:text-stone-900'
          }`}
        >
          {optionLabel}
        </button>
      ))}
    </div>
  );
}

export default SegmentedToggle;
