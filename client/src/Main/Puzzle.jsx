import { useState, useRef, useEffect, useCallback } from "react";
import ConnectionButton from "./ConnectionButton";
import CorrectCategory from "./CorrectCategory";
import Notification from "./Notification";
import WinModal from "./WinModal";
import LoseModal from "./LoseModal";
import Button from "../components/Button";
import SegmentedToggle from "../components/SegmentedToggle";
import { fetchDailyPuzzle, fetchRandomPuzzle } from "../api";
import { preloadImages } from "../images";
import { puzzleKey, loadDailyProgress, saveDailyProgress } from "../storage";
import { GROUP_SIZE, MAX_MISTAKES } from "../constants";

// Today's date in the player's timezone as "YYYY-MM-DD" (toISOString would give the UTC date)
function localDate() {
  const now = new Date();
  const pad = (n) => String(n).padStart(2, "0");
  return `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}`;
}

// "2026-10-05" -> "October 5, 2026"
function formatDate(date) {
  const [y, m, d] = date.split("-").map(Number);
  return new Date(y, m - 1, d).toLocaleDateString(undefined, {
    month: "long",
    day: "numeric",
    year: "numeric",
  });
}

function shuffle(arr) {
  // Durstenfeld shuffle
  const ans = [...arr];
  for (let i = ans.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [ans[i], ans[j]] = [ans[j], ans[i]];
  }
  return ans;
}

// { key, ids, difficulties, best } for a guess of character ids, where best is the most tiles it has from one group
function scoreGuess(ids, byId) {
  const difficulties = ids.map((id) => byId.get(id).difficulty);
  const counts = [0, 0, 0, 0];
  difficulties.forEach((d) => counts[d]++);
  return {
    key: [...ids].sort().join(","),
    ids,
    difficulties,
    best: Math.max(...counts),
  };
}

// Play saved guesses back (no animations) to rebuild the board. Returns null if they don't fit this puzzle.
function replayGuesses(tiles, savedGuesses) {
  const byId = new Map(tiles.map((t) => [t._id, t]));
  const solved = [];
  const guesses = [];
  let mistakes = 0;
  for (const ids of savedGuesses) {
    if (solved.length === 4 || mistakes >= MAX_MISTAKES) break;
    if (
      !Array.isArray(ids) ||
      ids.length !== GROUP_SIZE ||
      new Set(ids).size !== GROUP_SIZE ||
      !ids.every((id) => byId.has(id))
    ) {
      return null;
    }
    const guess = scoreGuess(ids, byId);
    guesses.push(guess);
    if (guess.best === GROUP_SIZE) solved.push(guess.difficulties[0]);
    else mistakes++;
  }

  let status = "playing";
  if (solved.length === 4) {
    status = "won";
  } else if (mistakes >= MAX_MISTAKES) {
    status = "lost";
    solved.push(...[0, 1, 2, 3].filter((d) => !solved.includes(d)));
  }
  return {
    solved,
    mistakes,
    guesses,
    status,
    characters: tiles.filter((t) => !solved.includes(t.difficulty)),
  };
}

const BUMP_STAGGER = 70; // ms between each selected tile's bump

// Practice mode (unlimited random puzzles) is hidden from the page for now; flip to re-enable
const PRACTICE_ENABLED = false;

function Puzzle() {
  const [mode, setMode] = useState("daily"); // daily | practice
  const [cardDisplay, setCardDisplay] = useState("name"); // name | image: what each character card shows
  const [puzzleDate, setPuzzleDate] = useState(localDate()); // date of the daily puzzle being shown
  const [puzzleInfo, setPuzzleInfo] = useState(null); // categories, indexed by difficulty
  const [status, setStatus] = useState("loading"); // loading | error | playing | won | lost
  const [error, setError] = useState("");
  const [characters, setCharacters] = useState([]); // tiles still on the board
  const [pressedIds, setPressedIds] = useState([]);
  const [solved, setSolved] = useState([]); // difficulties, in the order solved/revealed
  const [mistakes, setMistakes] = useState(0);
  const [guesses, setGuesses] = useState([]); // { key, difficulties }
  const [toast, setToast] = useState(null);
  const [animation, setAnimation] = useState(null); // 'bump' | 'shake' | null
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
  const dailySave = useRef(null); // { date, key } of the daily puzzle being played, or null in practice mode

  const generatePuzzle = useCallback(async (nextMode) => {
    const thisRequest = ++requestId.current;
    const date = localDate();
    clearTimers();
    setMode(nextMode);
    setPuzzleDate(date);
    setStatus("loading");
    setModalOpen(false);
    setError("");

    try {
      const generatedPuzzle =
        nextMode === "daily"
          ? await fetchDailyPuzzle(date)
          : await fetchRandomPuzzle();
      if (thisRequest !== requestId.current) return; // a newer request superseded this one

      const tiles = generatedPuzzle.flatMap((category) =>
        category.characters.map((character) => ({
          ...character,
          difficulty: category.difficulty,
        })),
      );

      setPuzzleInfo(generatedPuzzle);
      // Warm the browser cache with this puzzle's character images (not awaited, so the board isn't blocked)
      preloadImages(tiles.map((tile) => tile.img));

      // Resume today's saved progress, if any (a save for another day or puzzle is discarded)
      const save =
        nextMode === "daily"
          ? { date, key: puzzleKey(generatedPuzzle) }
          : null;
      dailySave.current = save;
      const progress =
        (save &&
          replayGuesses(tiles, loadDailyProgress(save.date, save.key))) ??
        replayGuesses(tiles, []);

      setCharacters(shuffle(progress.characters));
      setPressedIds([]);
      setSolved(progress.solved);
      setMistakes(progress.mistakes);
      setGuesses(progress.guesses);
      setAnimation(null);
      setBusy(false);
      setStatus(progress.status);
      // A restored finished game opens straight to the results
      setModalOpen(progress.status === "won" || progress.status === "lost");
    } catch (err) {
      if (thisRequest !== requestId.current) return;
      setError(err.message);
      setStatus("error");
    }
  }, [clearTimers]);

  useEffect(() => {
    // Fetching on mount is exactly what this effect is for
    // eslint-disable-next-line react-hooks/set-state-in-effect
    generatePuzzle("daily");
    return clearTimers;
  }, [generatePuzzle, clearTimers]);

  const showToast = (text) => {
    const id = Date.now();
    setToast({ id, text });
    later(() => setToast((t) => (t?.id === id ? null : t)), 2000);
  };

  const connectionButtonPress = (id) => {
    if (busy || status !== "playing") return;
    setPressedIds((prev) => {
      if (prev.includes(id)) return prev.filter((x) => x !== id);
      if (prev.length >= GROUP_SIZE) return prev;
      return [...prev, id];
    });
  };

  // Reveal the unsolved groups one at a time, then show the results
  const revealRemaining = (alreadySolved) => {
    setStatus("lost");
    setPressedIds([]);
    const remaining = [0, 1, 2, 3].filter((d) => !alreadySolved.includes(d));
    remaining.forEach((difficulty, i) => {
      later(
        () => {
          setSolved((prev) => [...prev, difficulty]);
          setCharacters((prev) =>
            prev.filter((c) => c.difficulty !== difficulty),
          );
        },
        600 * (i + 1),
      );
    });
    later(() => setModalOpen(true), 600 * (remaining.length + 1) + 400);
  };

  const submitGuess = () => {
    if (pressedIds.length !== GROUP_SIZE || busy || status !== "playing")
      return;

    const guess = scoreGuess(
      pressedIds,
      new Map(characters.map((c) => [c._id, c])),
    );
    if (guesses.some((g) => g.key === guess.key)) {
      showToast("Already guessed!");
      return;
    }
    const { difficulties, best } = guess;

    const newGuesses = [...guesses, guess];
    setGuesses(newGuesses);
    // Save right away so a reload mid-animation still keeps this guess
    if (dailySave.current) {
      const { date, key } = dailySave.current;
      saveDailyProgress(date, key, newGuesses.map((g) => g.ids));
    }
    setBusy(true);
    setAnimation("bump");

    later(
      () => {
        if (best === GROUP_SIZE) {
          const difficulty = difficulties[0];
          const newSolved = [...solved, difficulty];
          setCharacters((prev) =>
            prev.filter((c) => !pressedIds.includes(c._id)),
          );
          setPressedIds([]);
          setSolved(newSolved);
          setAnimation(null);
          setBusy(false);
          if (newSolved.length === puzzleInfo.length) {
            setStatus("won");
            later(() => setModalOpen(true), 900);
          }
          return;
        }

        const newMistakes = mistakes + 1;
        setAnimation("shake");
        setMistakes(newMistakes);
        if (best === GROUP_SIZE - 1) showToast("One away...");

        later(() => {
          setAnimation(null);
          setBusy(false);
          if (newMistakes >= MAX_MISTAKES) revealRemaining(solved);
        }, 450);
      },
      250 + BUMP_STAGGER * GROUP_SIZE,
    );
  };

  const tileAnimation = (id) => {
    if (!pressedIds.includes(id)) return {};
    if (animation === "bump") {
      return {
        className: "animate-bump",
        style: { animationDelay: `${pressedIds.indexOf(id) * BUMP_STAGGER}ms` },
      };
    }
    if (animation === "shake") return { className: "animate-shake" };
    return {};
  };

  const gameOver = status === "won" || status === "lost";

  return (
    <div className="min-h-svh bg-white">
      <header className="border-b border-stone-200">
        <div className="mx-auto flex max-w-3xl items-center justify-between gap-3 px-4 py-3">
          <div className="flex min-w-0 flex-wrap items-baseline gap-x-3">
            <h1 className="text-xl font-extrabold tracking-tight sm:text-2xl">
              JoJo <span className="text-extreme">Connections</span>
            </h1>
            <p className="border-l border-stone-300 pl-3 text-sm font-medium text-stone-500 sm:text-base">
              {mode === "daily" ? formatDate(puzzleDate) : "Practice"}
            </p>
          </div>
          <div className="flex shrink-0 items-center gap-2">
            {PRACTICE_ENABLED && (
              <SegmentedToggle
                label="Game mode"
                options={[
                  ["daily", "Daily"],
                  ["practice", "Practice"],
                ]}
                value={mode}
                onChange={generatePuzzle}
              />
            )}
            <SegmentedToggle
              label="Card display"
              options={[
                ["name", "Name"],
                ["image", "Image"],
              ]}
              value={cardDisplay}
              onChange={setCardDisplay}
            />
          </div>
        </div>
      </header>

      <Notification message={toast} />

      <main className="mx-auto flex max-w-3xl flex-col items-center px-2 py-4 sm:px-4 sm:py-6">
        <p className="mb-4 text-center text-stone-600 sm:text-lg">
          Create four groups of four!
        </p>

        {status === "loading" && (
          <div className="grid w-full grid-cols-4 gap-2" aria-busy="true">
            {Array.from({ length: 16 }, (_, i) => (
              <div
                key={i}
                className="aspect-[6/5] animate-pulse rounded-lg bg-stone-100 sm:aspect-[3/2]"
              />
            ))}
          </div>
        )}

        {status === "error" && (
          <div className="flex w-full flex-col items-center gap-4 rounded-2xl border border-stone-200 bg-stone-50 px-6 py-10 text-center">
            <p className="font-semibold">Couldn't load a puzzle</p>
            <p className="max-w-sm text-sm text-stone-600">{error}</p>
            <Button
              variant="primary"
              pill
              onClick={() => generatePuzzle(mode)}
            >
              Try again
            </Button>
          </div>
        )}

        {status !== "loading" && status !== "error" && (
          <>
            <div className="flex w-full flex-col gap-2">
              {solved.map((difficulty) => (
                <CorrectCategory
                  key={difficulty}
                  category={puzzleInfo[difficulty]}
                />
              ))}

              {characters.length > 0 && (
                <div className="grid w-full grid-cols-4 gap-2">
                  {characters.map((character) => {
                    const anim = tileAnimation(character._id);
                    return (
                      <div
                        key={character._id}
                        className={`min-w-0 ${anim.className ?? ""}`}
                        style={anim.style}
                      >
                        <ConnectionButton
                          name={character.name}
                          part={character.part}
                          img={character.img}
                          display={cardDisplay}
                          isPressed={pressedIds.includes(character._id)}
                          disabled={gameOver}
                          handleClick={() =>
                            connectionButtonPress(character._id)
                          }
                        />
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            <div className="mt-6 flex items-center gap-3 text-sm text-stone-700 sm:text-base">
              <span>Mistakes remaining:</span>
              <div
                className="flex gap-2"
                aria-label={`${MAX_MISTAKES - mistakes} mistakes remaining`}
              >
                {Array.from({ length: MAX_MISTAKES }, (_, i) => (
                  <span
                    key={i}
                    className={`size-3.5 rounded-full bg-stone-600 transition-all duration-300 ${
                      i < MAX_MISTAKES - mistakes
                        ? "scale-100 opacity-100"
                        : "scale-0 opacity-0"
                    }`}
                  />
                ))}
              </div>
            </div>

            <div className="mt-6 flex flex-wrap justify-center gap-2 sm:gap-3">
              {gameOver ? (
                <>
                  <Button
                    variant="outline"
                    pill
                    size="lg"
                    onClick={() => setModalOpen(true)}
                  >
                    View Results
                  </Button>
                  {PRACTICE_ENABLED && (
                    <Button
                      variant="primary"
                      pill
                      size="lg"
                      onClick={() => generatePuzzle("practice")}
                    >
                      {mode === "daily" ? "Play Practice" : "New Puzzle"}
                    </Button>
                  )}
                </>
              ) : (
                <>
                  <Button
                    pill
                    size="lg"
                    onClick={() => setCharacters((prev) => shuffle(prev))}
                    disabled={busy}
                  >
                    Shuffle
                  </Button>
                  <Button
                    pill
                    size="lg"
                    onClick={() => setPressedIds([])}
                    disabled={busy || pressedIds.length === 0}
                  >
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
        open={modalOpen && status === "won"}
        onClose={() => setModalOpen(false)}
        onPlayAgain={
          PRACTICE_ENABLED ? () => generatePuzzle("practice") : undefined
        }
        playAgainLabel={
          mode === "daily" ? "Play a Practice Puzzle" : "New Puzzle"
        }
        guesses={guesses.map((g) => g.difficulties)}
        mistakes={mistakes}
      />
      <LoseModal
        open={modalOpen && status === "lost"}
        onClose={() => setModalOpen(false)}
        onPlayAgain={
          PRACTICE_ENABLED ? () => generatePuzzle("practice") : undefined
        }
        playAgainLabel={
          mode === "daily" ? "Play a Practice Puzzle" : "Try Another Puzzle"
        }
        puzzleInfo={puzzleInfo}
        guesses={guesses.map((g) => g.difficulties)}
      />
    </div>
  );
}

export default Puzzle;
