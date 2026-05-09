import Head from 'next/head';
import Link from 'next/link';
import { useState, useEffect, useCallback, useMemo } from 'react';
import pkg from '../package.json';

interface PuzzleNumber { row: number; col: number; n: number; }
interface Puzzle { rows: number; cols: number; numbers: PuzzleNumber[]; }
interface Cell { row: number; col: number; }

// Hand-crafted puzzles, max 5×5 — verified solvable Hamiltonian paths.
const PUZZLES: readonly Puzzle[] = [
  { rows: 3, cols: 3, numbers: [
    { row: 0, col: 0, n: 1 }, { row: 2, col: 2, n: 2 },
  ]},
  { rows: 3, cols: 3, numbers: [
    { row: 0, col: 0, n: 1 }, { row: 2, col: 1, n: 2 }, { row: 0, col: 2, n: 3 },
  ]},
  { rows: 4, cols: 4, numbers: [
    { row: 0, col: 0, n: 1 }, { row: 3, col: 0, n: 2 },
  ]},
  { rows: 4, cols: 4, numbers: [
    { row: 0, col: 0, n: 1 }, { row: 1, col: 2, n: 2 }, { row: 3, col: 0, n: 3 },
  ]},
  { rows: 5, cols: 5, numbers: [
    { row: 0, col: 0, n: 1 }, { row: 4, col: 4, n: 2 },
  ]},
  { rows: 5, cols: 5, numbers: [
    { row: 0, col: 0, n: 1 }, { row: 2, col: 2, n: 2 }, { row: 4, col: 4, n: 3 },
  ]},
  { rows: 5, cols: 5, numbers: [
    { row: 0, col: 0, n: 1 }, { row: 0, col: 4, n: 2 },
    { row: 4, col: 4, n: 3 }, { row: 4, col: 0, n: 4 },
  ]},
];

const SAVE_KEY = 'kw_path_state';

const COLORS = {
  bg: '#dceae9',
  text: '#274646',
  titleColor: '#1f5b58',
  subtitleColor: '#2d706c',
  versionColor: '#7ba6a3',
  msgBg: '#1f5b58',
  msgText: '#ffffff',
  emptyBg: '#eaf3f2',
  emptyBorder: '#cfe1df',
  pathBg: '#3d9e3a',
  numberBg: '#ffffff',
  numberText: '#1f5b58',
  numberBorder: '#1f5b58',
  buttonBg: '#2d706c',
  buttonText: '#ffffff',
  buttonShadow: '0 4px 12px rgba(31,91,88,0.35)',
  toggleBg: '#eaf3f2',
  toggleBorder: '#7ba6a3',
};

function cellKey(r: number, c: number) { return `${r}-${c}`; }
function isAdjacent(a: Cell, b: Cell) {
  return Math.abs(a.row - b.row) + Math.abs(a.col - b.col) === 1;
}

interface Connections { up: boolean; down: boolean; left: boolean; right: boolean; }

function getConnections(cell: Cell, path: Cell[]): Connections | null {
  const idx = path.findIndex(p => p.row === cell.row && p.col === cell.col);
  if (idx < 0) return null;
  const conns: Connections = { up: false, down: false, left: false, right: false };
  const ns: Cell[] = [];
  if (idx > 0) ns.push(path[idx - 1]);
  if (idx < path.length - 1) ns.push(path[idx + 1]);
  for (const n of ns) {
    if (n.row === cell.row + 1 && n.col === cell.col) conns.down = true;
    else if (n.row === cell.row - 1 && n.col === cell.col) conns.up = true;
    else if (n.col === cell.col + 1 && n.row === cell.row) conns.right = true;
    else if (n.col === cell.col - 1 && n.row === cell.row) conns.left = true;
  }
  return conns;
}

interface SavedState { puzzleIndex: number; path: Cell[]; won: boolean; }

function loadSave(): SavedState | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = sessionStorage.getItem(SAVE_KEY);
    if (!raw) return null;
    const s = JSON.parse(raw);
    if (typeof s.puzzleIndex !== 'number' || s.puzzleIndex < 0 || s.puzzleIndex >= PUZZLES.length) return null;
    return { puzzleIndex: s.puzzleIndex, path: Array.isArray(s.path) ? s.path : [], won: !!s.won };
  } catch { return null; }
}

function saveState(s: SavedState) {
  if (typeof window === 'undefined') return;
  try { sessionStorage.setItem(SAVE_KEY, JSON.stringify(s)); } catch {}
}

export default function PathGame() {
  const [puzzleIndex, setPuzzleIndex] = useState(0);
  const [path, setPath] = useState<Cell[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const [won, setWon] = useState(false);
  const [hydrated, setHydrated] = useState(false);
  const [message, setMessage] = useState('');

  const puzzle = PUZZLES[puzzleIndex];
  const numbers = useMemo(() => {
    const m = new Map<string, number>();
    puzzle.numbers.forEach(n => m.set(cellKey(n.row, n.col), n.n));
    return m;
  }, [puzzle]);
  const startCell = useMemo(() => puzzle.numbers.find(n => n.n === 1)!, [puzzle]);
  const totalCells = puzzle.rows * puzzle.cols;

  useEffect(() => {
    const saved = loadSave();
    if (saved) {
      setPuzzleIndex(saved.puzzleIndex);
      setPath(saved.path);
      setWon(saved.won);
    }
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    saveState({ puzzleIndex, path, won });
  }, [hydrated, puzzleIndex, path, won]);

  useEffect(() => {
    if (typeof document === 'undefined') return;
    document.body.style.backgroundColor = COLORS.bg;
    document.body.style.color = COLORS.text;
  }, []);

  // Win check
  useEffect(() => {
    if (won) return;
    if (path.length !== totalCells) return;
    const sorted = [...puzzle.numbers].sort((a, b) => a.n - b.n);
    let lastIdx = -1;
    for (const n of sorted) {
      const idx = path.findIndex(p => p.row === n.row && p.col === n.col);
      if (idx <= lastIdx) return;
      lastIdx = idx;
    }
    const last = sorted[sorted.length - 1];
    const lastInPath = path.findIndex(p => p.row === last.row && p.col === last.col);
    if (lastInPath !== path.length - 1) return;
    setWon(true);
    const msgs = ['amazing! 🌟', 'you did it! 🎉', 'woohoo! 🥳', 'brilliant! ⭐'];
    setMessage(msgs[Math.floor(Math.random() * msgs.length)]);
  }, [path, won, puzzle, totalCells]);

  const tryAddCell = useCallback((r: number, c: number) => {
    setPath(prev => {
      if (prev.length === 0) {
        if (r === startCell.row && c === startCell.col) return [{ row: r, col: c }];
        return prev;
      }
      const tail = prev[prev.length - 1];
      if (tail.row === r && tail.col === c) return prev;
      const existingIdx = prev.findIndex(p => p.row === r && p.col === c);
      if (existingIdx >= 0) {
        return prev.slice(0, existingIdx + 1);
      }
      if (!isAdjacent(tail, { row: r, col: c })) return prev;
      return [...prev, { row: r, col: c }];
    });
  }, [startCell]);

  const onCellPointerDown = (e: React.PointerEvent, r: number, c: number) => {
    if (won) return;
    e.preventDefault();
    try { (e.target as Element).releasePointerCapture?.(e.pointerId); } catch {}
    setIsDragging(true);
    tryAddCell(r, c);
  };

  useEffect(() => {
    if (!isDragging) return;
    const onMove = (e: PointerEvent) => {
      if (won) return;
      const el = document.elementFromPoint(e.clientX, e.clientY);
      const cellEl = (el as Element | null)?.closest('[data-cell="1"]') as HTMLElement | null;
      if (!cellEl) return;
      const r = parseInt(cellEl.dataset.row || '', 10);
      const c = parseInt(cellEl.dataset.col || '', 10);
      if (Number.isNaN(r) || Number.isNaN(c)) return;
      tryAddCell(r, c);
    };
    const onUp = () => setIsDragging(false);
    window.addEventListener('pointermove', onMove);
    window.addEventListener('pointerup', onUp);
    window.addEventListener('pointercancel', onUp);
    return () => {
      window.removeEventListener('pointermove', onMove);
      window.removeEventListener('pointerup', onUp);
      window.removeEventListener('pointercancel', onUp);
    };
  }, [isDragging, won, tryAddCell]);

  const reset = () => {
    setPath([]);
    setWon(false);
    setMessage('');
  };

  const goToPuzzle = (i: number) => {
    setPuzzleIndex(((i % PUZZLES.length) + PUZZLES.length) % PUZZLES.length);
    setPath([]);
    setWon(false);
    setMessage('');
  };

  const padding = 5;
  const cellSize =
    puzzle.rows >= 5 ? 'min(16vw, 4rem)' :
    puzzle.rows >= 4 ? 'min(19vw, 4.8rem)' :
                       'min(23vw, 5.6rem)';
  const numberSize =
    puzzle.rows >= 5 ? '1.4rem' :
    puzzle.rows >= 4 ? '1.6rem' : '1.8rem';

  const cells: Cell[] = [];
  for (let r = 0; r < puzzle.rows; r++) {
    for (let c = 0; c < puzzle.cols; c++) {
      cells.push({ row: r, col: c });
    }
  }

  return (
    <>
      <Head>
        <title>bngo path</title>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </Head>

      <div style={styles.page}>
        <Link
          href="/"
          style={{
            ...styles.homeLink,
            color: COLORS.subtitleColor,
            borderColor: COLORS.toggleBorder,
            backgroundColor: COLORS.toggleBg,
          }}
          aria-label="back to home"
        >
          ← home
        </Link>

        <header style={styles.header}>
          <h1 style={{ ...styles.title, color: COLORS.titleColor }}>path</h1>
          <p style={{ ...styles.subtitle, color: COLORS.subtitleColor }}>
            fill every square, in number order!
          </p>
          <span style={{ ...styles.version, color: COLORS.versionColor }}>v{pkg.version}</span>
        </header>

        <div style={styles.puzzlePicker}>
          <button
            type="button"
            onClick={() => goToPuzzle(puzzleIndex - 1)}
            style={{ ...styles.pickerBtn, color: COLORS.titleColor, borderColor: COLORS.toggleBorder, backgroundColor: COLORS.toggleBg }}
            aria-label="previous puzzle"
          >
            ‹
          </button>
          <span style={{ ...styles.puzzleLabel, color: COLORS.titleColor }}>
            puzzle {puzzleIndex + 1} of {PUZZLES.length}
          </span>
          <button
            type="button"
            onClick={() => goToPuzzle(puzzleIndex + 1)}
            style={{ ...styles.pickerBtn, color: COLORS.titleColor, borderColor: COLORS.toggleBorder, backgroundColor: COLORS.toggleBg }}
            aria-label="next puzzle"
          >
            ›
          </button>
        </div>

        {message && (
          <div style={{ ...styles.message, background: COLORS.msgBg, color: COLORS.msgText }}>
            {message}
          </div>
        )}

        <div
          style={{
            ...styles.grid,
            gridTemplateColumns: `repeat(${puzzle.cols}, ${cellSize})`,
            gridTemplateRows: `repeat(${puzzle.rows}, ${cellSize})`,
          }}
        >
          {cells.map((cell) => {
            const r = cell.row, c = cell.col;
            const conns = getConnections(cell, path);
            const inPath = !!conns;
            const num = numbers.get(cellKey(r, c));

            const innerBg = inPath ? COLORS.pathBg : COLORS.emptyBg;
            const innerStyle: React.CSSProperties = {
              position: 'absolute',
              top:    inPath && conns!.up    ? 0 : padding,
              bottom: inPath && conns!.down  ? 0 : padding,
              left:   inPath && conns!.left  ? 0 : padding,
              right:  inPath && conns!.right ? 0 : padding,
              borderTopLeftRadius:     inPath && (conns!.up    || conns!.left)  ? 0 : 14,
              borderTopRightRadius:    inPath && (conns!.up    || conns!.right) ? 0 : 14,
              borderBottomLeftRadius:  inPath && (conns!.down  || conns!.left)  ? 0 : 14,
              borderBottomRightRadius: inPath && (conns!.down  || conns!.right) ? 0 : 14,
              backgroundColor: innerBg,
              border: inPath ? 'none' : `2px solid ${COLORS.emptyBorder}`,
              transition: 'background-color 0.12s',
            };

            return (
              <div
                key={cellKey(r, c)}
                data-cell="1"
                data-row={r}
                data-col={c}
                onPointerDown={(e) => onCellPointerDown(e, r, c)}
                style={styles.cell}
              >
                <div style={innerStyle} />
                {num !== undefined && (
                  <div
                    style={{
                      ...styles.numberCircle,
                      fontSize: numberSize,
                      backgroundColor: COLORS.numberBg,
                      color: COLORS.numberText,
                      borderColor: COLORS.numberBorder,
                    }}
                  >
                    {num}
                  </div>
                )}
              </div>
            );
          })}
        </div>

        <div style={styles.actions}>
          <button
            type="button"
            onClick={reset}
            style={{
              ...styles.resetBtn,
              borderColor: COLORS.toggleBorder,
              color: COLORS.titleColor,
              backgroundColor: COLORS.toggleBg,
            }}
          >
            🔄 reset
          </button>
          {won && (
            <button
              type="button"
              onClick={() => goToPuzzle(puzzleIndex + 1)}
              style={{
                ...styles.nextBtn,
                backgroundColor: COLORS.buttonBg,
                color: COLORS.buttonText,
                boxShadow: COLORS.buttonShadow,
              }}
            >
              next puzzle →
            </button>
          )}
        </div>
      </div>
    </>
  );
}

const styles: Record<string, React.CSSProperties> = {
  page: {
    minHeight: '100%',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    padding: '16px 6px 24px',
    gap: '14px',
    userSelect: 'none',
    width: '100%',
    maxWidth: '100vw',
    overflowX: 'hidden',
    fontFamily: "'Fredoka', sans-serif",
    position: 'relative',
  },
  homeLink: {
    position: 'absolute',
    top: 12,
    left: 12,
    padding: '6px 14px',
    border: '2px solid',
    borderRadius: '999px',
    fontSize: '0.95rem',
    fontWeight: 500,
    textDecoration: 'none',
    fontFamily: 'inherit',
  },
  header: {
    textAlign: 'center',
    position: 'relative',
  },
  version: {
    position: 'absolute',
    top: 0,
    right: 0,
    fontSize: '0.7rem',
    fontWeight: 400,
  },
  title: {
    fontSize: 'clamp(2rem, 7vw, 3.2rem)',
    fontWeight: 600,
    letterSpacing: '-0.5px',
  },
  subtitle: {
    fontSize: '1.05rem',
    fontWeight: 400,
    marginTop: '4px',
  },
  puzzlePicker: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '12px',
  },
  pickerBtn: {
    width: '40px',
    height: '40px',
    borderRadius: '50%',
    border: '2px solid',
    fontSize: '1.4rem',
    fontFamily: 'inherit',
    fontWeight: 600,
    cursor: 'pointer',
    lineHeight: 1,
    paddingBottom: 4,
  },
  puzzleLabel: {
    fontSize: '1.1rem',
    fontWeight: 500,
    minWidth: '140px',
    textAlign: 'center',
  },
  message: {
    borderRadius: '20px',
    padding: '10px 24px',
    fontSize: '1.15rem',
    fontWeight: 500,
    textAlign: 'center',
    minWidth: '200px',
  },
  grid: {
    display: 'grid',
    gap: 0,
    touchAction: 'none',
  },
  cell: {
    position: 'relative',
    cursor: 'pointer',
    width: '100%',
    height: '100%',
  },
  numberCircle: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    width: '64%',
    height: '64%',
    borderRadius: '50%',
    border: '3px solid',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontWeight: 600,
    pointerEvents: 'none',
    boxShadow: '0 1px 3px rgba(0,0,0,0.08)',
  },
  actions: {
    display: 'flex',
    gap: '12px',
    marginTop: '4px',
    flexWrap: 'wrap',
    justifyContent: 'center',
  },
  resetBtn: {
    padding: '12px 24px',
    fontSize: '1.1rem',
    fontFamily: 'inherit',
    fontWeight: 500,
    border: '2px solid',
    borderRadius: '24px',
    cursor: 'pointer',
  },
  nextBtn: {
    padding: '14px 30px',
    fontSize: '1.2rem',
    fontFamily: 'inherit',
    fontWeight: 500,
    border: 'none',
    borderRadius: '28px',
    cursor: 'pointer',
  },
};
