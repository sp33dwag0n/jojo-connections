import { useState, useRef, useEffect, useCallback } from 'react';
import ConnectionButton from './ConnectionButton';
import CorrectCategory from './CorrectCategory';
import Notification from './Notification';
import WinModal from './WinModal';
import LoseModal from './LoseModal';
import Button from '../components/Button';
import { api } from '../api';
import { GROUP_SIZE, MAX_MISTAKES } from '../constants';

function shuffle(arr) { // Durstenfeld shuffle
  const ans = [...arr];
  for (let i = ans.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [ans[i], ans[j]] = [ans[j], ans[i]];
  }
  return ans;
}

const BUMP_STAGGER = 70; // ms between each selected tile's bump

function Puzzle() {
  const [puzzleInfo, setPuzzleInfo] = useState(null);       // categories, indexed by difficulty
  const [status, setStatus] = useState('loading');          // loading | error | playing | won | lost
  const [error, setError] = useState('');
  const [characters, setCharacters] = useState([]);         // tiles still on the board
  const [pressedIds, setPressedIds] = useState([]);
  const [solved, setSolved] = useState([]);                 // difficulties, in the order solved/revealed
  const [mistakes, setMistakes] = useState(0);
  const [guesses, setGuesses] = useState([]);               // { key, difficulties }
  const [toast, setToast] = useState(null);
  const [animation, setAnimation] = useState(null);         // 'bump' | 'shake' | null
  const [busy, setBusy] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);

  // Track timeouts so they can be cancelled on unmount / new puzzle
  const timers = useRef(new Set());
  const later = useCallback((fn, ms) => {
    const id = setTimeout(() => {
      timers.current.delete(id);
      fn();
    }, ms);
    timers.current.add(id);
  }, []);
  const clearTimers = useCallback(() => {
    timers.current.forEach(clearTimeout);
    timers.current.clear();
  }, []);

  const requestId = useRef(0);

  const generatePuzzle = useCallback(async () => {
    const thisRequest = ++requestId.current;
    clearTimers();
    setStatus('loading');
    setModalOpen(false);
    setError('');

    try {
      const generatedPuzzle = await api('/catagory/puzzle');
      if (thisRequest !== requestId.current) return; // a newer request superseded this one

      const tiles = generatedPuzzle.flatMap((category) =>
        category.characters.map((character) => ({ ...character, difficulty: category.difficulty }))
      );

      setPuzzleInfo(generatedPuzzle);
      setCharacters(shuffle(tiles));
      setPressedIds([]);
      setSolved([]);
      setMistakes(0);
      setGuesses([]);
      setAnimation(null);
      setBusy(false);
      setStatus('playing');
    } catch (err) {
      if (thisRequest !== requestId.current) return;
      setError(err.message);
      setStatus('error');
    }
  }, [clearTimers]);

  useEffect(() => {
    // Fetching on mount is exactly what this effect is for
    // eslint-disable-next-line react-hooks/set-state-in-effect
    generatePuzzle();
    return clearTimers;
  }, [generatePuzzle, clearTimers]);

  const showToast = (text) => {
    const id = Date.now();
    setToast({ id, text });
    later(() => setToast((t) => (t?.id === id ? null : t)), 2000);
  };

  const connectionButtonPress = (id) => {
    if (busy || status !== 'playing') return;
    setPressedIds((prev) => {
      if (prev.includes(id)) return prev.filter((x) => x !== id);
      if (prev.length >= GROUP_SIZE) return prev;
      return [...prev, id];
    });
  };

  // Reveal the unsolved groups one at a time, then show the results
  const revealRemaining = (alreadySolved) => {
    setStatus('lost');
    setPressedIds([]);
    const remaining = [0, 1, 2, 3].filter((d) => !alreadySolved.includes(d));
    remaining.forEach((difficulty, i) => {
      later(() => {
        setSolved((prev) => [...prev, difficulty]);
        setCharacters((prev) => prev.filter((c) => c.difficulty !== difficulty));
      }, 600 * (i + 1));
    });
    later(() => setModalOpen(true), 600 * (remaining.length + 1) + 400);
  };

  const submitGuess = () => {
    if (pressedIds.length !== GROUP_SIZE || busy || status !== 'playing') return;

    const key = [...pressedIds].sort().join(',');
    if (guesses.some((g) => g.key === key)) {
      showToast('Already guessed!');
      return;
    }

    const byId = new Map(characters.map((c) => [c._id, c]));
    const difficulties = pressedIds.map((id) => byId.get(id).difficulty);
    const counts = [0, 0, 0, 0];
    difficulties.forEach((d) => counts[d]++);
    const best = Math.max(...counts);

    setGuesses((prev) => [...prev, { key, difficulties }]);
    setBusy(true);
    setAnimation('bump');

    later(() => {
      if (best === GROUP_SIZE) {
        const difficulty = difficulties[0];
        const newSolved = [...solved, difficulty];
        setCharacters((prev) => prev.filter((c) => !pressedIds.includes(c._id)));
        setPressedIds([]);
        setSolved(newSolved);
        setAnimation(null);
        setBusy(false);
        if (newSolved.length === puzzleInfo.length) {
          setStatus('won');
          later(() => setModalOpen(true), 900);
        }
        return;
      }

      const newMistakes = mistakes + 1;
      setAnimation('shake');
      setMistakes(newMistakes);
      if (best === GROUP_SIZE - 1) showToast('One away...');

      later(() => {
        setAnimation(null);
        setBusy(false);
        if (newMistakes >= MAX_MISTAKES) revealRemaining(solved);
      }, 450);
    }, 250 + BUMP_STAGGER * GROUP_SIZE);
  };

  const tileAnimation = (id) => {
    if (!pressedIds.includes(id)) return {};
    if (animation === 'bump') {
      return { className: 'animate-bump', style: { animationDelay: `${pressedIds.indexOf(id) * BUMP_STAGGER}ms` } };
    }
    if (animation === 'shake') return { className: 'animate-shake' };
    return {};
  };

  const gameOver = status === 'won' || status === 'lost';

  return (
    <div className="min-h-svh bg-white">
      <header className="border-b border-stone-200">
        <div className="mx-auto flex max-w-2xl items-center justify-between px-4 py-3">
          <h1 className="text-xl font-extrabold tracking-tight sm:text-2xl">
            JoJo <span className="text-extreme">Connections</span>
          </h1>
          <div className="flex items-center gap-1">
            <Button variant="ghost" size="sm" onClick={generatePuzzle} disabled={status === 'loading'}>
              New Puzzle
            </Button>
          </div>
        </div>
      </header>

      <Notification message={toast} />

      <main className="mx-auto flex max-w-2xl flex-col items-center px-3 py-6 sm:px-4 sm:py-10">
        <p className="mb-5 text-center text-stone-600 sm:text-lg">Create four groups of four!</p>

        {status === 'loading' && (
          <div className="grid w-full grid-cols-4 gap-2" aria-busy="true">
            {Array.from({ length: 16 }, (_, i) => (
              <div key={i} className="aspect-[4/3] animate-pulse rounded-lg bg-stone-100 sm:aspect-[5/3]" />
            ))}
          </div>
        )}

        {status === 'error' && (
          <div className="flex w-full flex-col items-center gap-4 rounded-2xl border border-stone-200 bg-stone-50 px-6 py-10 text-center">
            <p className="font-semibold">Couldn't load a puzzle</p>
            <p className="max-w-sm text-sm text-stone-600">{error}</p>
            <Button variant="primary" pill onClick={generatePuzzle}>Try again</Button>
          </div>
        )}

        {status !== 'loading' && status !== 'error' && (
          <>
            <div className="flex w-full flex-col gap-2">
              {solved.map((difficulty) => (
                <CorrectCategory key={difficulty} category={puzzleInfo[difficulty]} />
              ))}

              {characters.length > 0 && (
                <div className="grid w-full grid-cols-4 gap-2">
                  {characters.map((character) => {
                    const anim = tileAnimation(character._id);
                    return (
                      <div key={character._id} className={`min-w-0 ${anim.className ?? ''}`} style={anim.style}>
                        <ConnectionButton
                          name={character.name}
                          isPressed={pressedIds.includes(character._id)}
                          disabled={gameOver}
                          handleClick={() => connectionButtonPress(character._id)}
                        />
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            <div className="mt-6 flex items-center gap-3 text-sm text-stone-700 sm:text-base">
              <span>Mistakes remaining:</span>
              <div className="flex gap-2" aria-label={`${MAX_MISTAKES - mistakes} mistakes remaining`}>
                {Array.from({ length: MAX_MISTAKES }, (_, i) => (
                  <span
                    key={i}
                    className={`size-3.5 rounded-full bg-stone-600 transition-all duration-300 ${
                      i < MAX_MISTAKES - mistakes ? 'scale-100 opacity-100' : 'scale-0 opacity-0'
                    }`}
                  />
                ))}
              </div>
            </div>

            <div className="mt-6 flex flex-wrap justify-center gap-2 sm:gap-3">
              {gameOver ? (
                <>
                  <Button variant="outline" pill size="lg" onClick={() => setModalOpen(true)}>View Results</Button>
                  <Button variant="primary" pill size="lg" onClick={generatePuzzle}>New Puzzle</Button>
                </>
              ) : (
                <>
                  <Button pill size="lg" onClick={() => setCharacters((prev) => shuffle(prev))} disabled={busy}>
                    Shuffle
                  </Button>
                  <Button pill size="lg" onClick={() => setPressedIds([])} disabled={busy || pressedIds.length === 0}>
                    Deselect All
                  </Button>
                  <Button
                    variant="primary"
                    pill
                    size="lg"
                    onClick={submitGuess}
                    disabled={busy || pressedIds.length !== GROUP_SIZE}
                  >
                    Submit
                  </Button>
                </>
              )}
            </div>
          </>
        )}
      </main>

      <WinModal
        open={modalOpen && status === 'won'}
        onClose={() => setModalOpen(false)}
        onPlayAgain={generatePuzzle}
        guesses={guesses.map((g) => g.difficulties)}
        mistakes={mistakes}
      />
      <LoseModal
        open={modalOpen && status === 'lost'}
        onClose={() => setModalOpen(false)}
        onPlayAgain={generatePuzzle}
        puzzleInfo={puzzleInfo}
        guesses={guesses.map((g) => g.difficulties)}
      />
    </div>
  )
}

export default Puzzle
