import { useState } from 'react'

// Square character image filling the card's height. Renders nothing if there's no image
// or it fails to load, leaving the card blank.
function CardImage({ src }) {
  const [failed, setFailed] = useState(false)
  if (!src || failed) return null

  return (
    <div className="aspect-square h-full max-w-full overflow-hidden rounded-md">
      <img
        src={src}
        alt=""
        draggable={false}
        onError={() => setFailed(true)}
        className="size-full object-cover"
      />
    </div>
  )
}

function ConnectionButton({ name, part, img, display = 'name', isPressed, disabled, animation = '', handleClick }) {
  const showImage = display === 'image'

  return (
    <button
      onClick={handleClick}
      disabled={disabled}
      aria-pressed={isPressed}
      aria-label={showImage ? name : undefined}
      className={`flex aspect-[6/5] w-full min-w-0 select-none flex-col overflow-hidden items-center justify-center rounded-lg text-center
        transition-[background-color,color,transform] duration-150 active:scale-95 sm:aspect-[3/2]
        ${showImage ? 'p-0.5 sm:p-1' : 'px-1'}
        ${isPressed ? 'bg-stone-600 text-white' : 'bg-stone-200 text-stone-900 hover:bg-stone-300'}
        ${animation}`}
    >
      {showImage ? (
        // key resets the failed state if this card is reused for a different image
        <CardImage key={img} src={img} />
      ) : (
        <>
          <span lang="en" className="w-full hyphens-auto break-words text-xs font-bold uppercase leading-tight sm:text-lg">
            {name}
          </span>
          <span className={`mt-1 text-[11px] font-medium sm:mt-1.5 sm:text-sm ${isPressed ? 'text-stone-300' : 'text-stone-500'}`}>
            Part {part}
          </span>
        </>
      )}
    </button>
  )
}

export default ConnectionButton
