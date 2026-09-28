function Spinner({ className = '' }) {
  return (
    <div
      role="status"
      aria-label="Loading"
      className={`size-6 animate-spin rounded-full border-2 border-stone-300 border-t-stone-900 ${className}`}
    />
  );
}

export default Spinner;
