import { useState } from 'react';
import Modal from '../components/Modal';
import Button from '../components/Button';
import GuessHistory from './GuessHistory';
import { DIFFICULTIES } from '../constants';

const guessesToText = (guesses) =>
  guesses.map((guess) => guess.map((d) => DIFFICULTIES[d].dot).join('')).join('\n');

const PRAISE = ['Perfect!', 'Great!', 'Solid!', 'Phew!'];

function WinModal({ open, onClose, onPlayAgain, playAgainLabel = 'New Puzzle', guesses, mistakes }) {
  const [copied, setCopied] = useState(false);

  const copyResult = async () => {
    try {
      await navigator.clipboard.writeText(`JoJo Connections\n${guessesToText(guesses)}`);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      // Clipboard can be blocked (e.g. non-https); nothing useful to do
    }
  };

  return (
    <Modal open={open} onClose={onClose}>
      <div className="flex flex-col items-center gap-5 py-2 text-center">
        <div>
          <p className="text-3xl font-extrabold">{PRAISE[mistakes] ?? 'You win!'}</p>
          <p className="mt-1 text-stone-500">
            Solved with {mistakes} {mistakes === 1 ? 'mistake' : 'mistakes'}.
          </p>
        </div>
        <GuessHistory guesses={guesses} />
        <div className="flex w-full flex-col gap-2 sm:flex-row sm:justify-center">
          <Button variant="primary" pill size="lg" onClick={onPlayAgain}>{playAgainLabel}</Button>
          <Button variant="outline" pill size="lg" onClick={copyResult}>{copied ? 'Copied!' : 'Share Results'}</Button>
        </div>
        <button onClick={onClose} className="text-sm font-medium text-stone-500 underline-offset-2 hover:underline">
          Back to puzzle
        </button>
      </div>
    </Modal>
  )
}

export default WinModal
