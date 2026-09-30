import { DIFFICULTIES } from '../constants';

function CorrectCategory({ category }) {
  return (
    <div
      className={`flex aspect-[16/3] flex-col items-center justify-center rounded-lg px-3 text-center animate-pop sm:aspect-[20/3]
        ${DIFFICULTIES[category.difficulty].bg}`}
    >
      <p className="text-sm font-bold uppercase sm:text-base">{category.name}</p>
      <p className="text-xs uppercase sm:text-sm">
        {category.characters.map((character) => character.name).join(', ')}
      </p>
    </div>
  )
}

export default CorrectCategory
