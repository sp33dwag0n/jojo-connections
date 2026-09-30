const VARIANTS = {
  primary: 'bg-stone-900 text-white border-stone-900 hover:bg-stone-700 hover:border-stone-700',
  outline: 'bg-white text-stone-900 border-stone-900 hover:bg-stone-100',
  subtle: 'bg-white text-stone-700 border-stone-300 hover:bg-stone-50 hover:border-stone-400',
  danger: 'bg-white text-red-600 border-red-200 hover:bg-red-50 hover:border-red-300',
  ghost: 'bg-transparent text-stone-600 border-transparent hover:bg-stone-100 hover:text-stone-900',
};

const SIZES = {
  sm: 'h-8 px-3 text-sm',
  md: 'h-10 px-4 text-sm',
  lg: 'h-12 px-6 text-base',
};

function Button({ variant = 'outline', size = 'md', pill = false, className = '', ...props }) {
  return (
    <button
      type="button"
      className={`inline-flex items-center justify-center gap-2 border font-semibold transition-all duration-150
        active:scale-[0.97] disabled:cursor-not-allowed disabled:opacity-40 disabled:active:scale-100
        focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-stone-900
        ${pill ? 'rounded-full' : 'rounded-lg'} ${VARIANTS[variant]} ${SIZES[size]} ${className}`}
      {...props}
    />
  );
}

export default Button;
