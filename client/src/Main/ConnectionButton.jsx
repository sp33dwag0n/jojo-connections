function ConnectionButton({ name, part, isPressed, disabled, animation = '', handleClick }) {
  return (
    <button
      onClick={handleClick}
      disabled={disabled}
      aria-pressed={isPressed}
      className={`flex aspect-[4/3] w-full min-w-0 select-none flex-col overflow-hidden items-center justify-center rounded-lg px-1 text-center
        transition-[background-color,color,transform] duration-150 active:scale-95 sm:aspect-[5/3]
        ${isPressed ? 'bg-stone-600 text-white' : 'bg-stone-200 text-stone-900 hover:bg-stone-300'}
        ${animation}`}
    >
      <span lang="en" className="w-full hyphens-auto break-words text-[11px] font-bold uppercase leading-tight sm:text-base">
        {name}
      </span>
      <span className={`mt-0.5 text-[10px] font-medium sm:text-xs ${isPressed ? 'text-stone-300' : 'text-stone-500'}`}>
        Part {part}
      </span>
    </button>
  )
}

export default ConnectionButton
