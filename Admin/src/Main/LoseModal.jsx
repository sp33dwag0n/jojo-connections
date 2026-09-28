import Modal from '../components/Modal';
import Button from '../components/Button';
import GuessHistory from './GuessHistory';
import { DIFFICULTIES } from '../constants';

function LoseModal({ open, onClose, onPlayAgain, puzzleInfo, guesses }) {
  if (!puzzleInfo) return null;

  return (
    <Modal open={open} onClose={onClose}>
      <div className="flex flex-col items-center gap-5 py-2 text-center">
        <div>
          <p className="text-3xl font-extrabold">Nice try...</p>
          <p className="mt-1 text-stone-500">Here were the groups:</p>
        </div>
        <div className="flex w-full flex-col gap-2">
          {puzzleInfo.map((category) => (
            <div key={category.difficulty} className={`rounded-lg px-3 py-2 ${DIFFICULTIES[category.difficulty].bg}`}>
              <p className="text-sm font-bold uppercase">{category.name}</p>
              <p className="text-xs uppercase">{category.characters.map((c) => c.name).join(', ')}</p>
            </div>
          ))}
        </div>
        <GuessHistory guesses={guesses} />
        <Button variant="primary" pill size="lg" onClick={onPlayAgain}>Try Another Puzzle</Button>
        <button onClick={onClose} className="text-sm font-medium text-stone-500 underline-offset-2 hover:underline">
          Back to puzzle
        </button>
      </div>
    </Modal>
  )
}

export default LoseModal
