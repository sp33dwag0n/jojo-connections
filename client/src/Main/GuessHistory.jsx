import { DIFFICULTIES } from '../constants';

// NYT-style grid of colored squares, one row per guess
function GuessHistory({ guesses }) {
  return (
    <div className="flex flex-col items-center gap-1" aria-label="Your guesses">
      {guesses.map((guess, i) => (
        <div key={i} className="flex gap-1">
          {guess.map((difficulty, j) => (
            <span key={j} className={`size-6 rounded ${DIFFICULTIES[difficulty].bg}`} />
          ))}
        </div>
      ))}
    </div>
  );
}

export default GuessHistory;
