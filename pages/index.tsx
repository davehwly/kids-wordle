import Head from 'next/head';
import Link from 'next/link';
import { useEffect } from 'react';
import pkg from '../package.json';

const COLORS = {
  bg: '#dceae9',
  text: '#274646',
  titleColor: '#1f5b58',
  subtitleColor: '#2d706c',
  versionColor: '#7ba6a3',
  cardBg: '#ffffff',
  cardBorder: '#7ba6a3',
  cardShadow: '0 6px 20px rgba(31,91,88,0.18)',
  wordTile: '#3d9e3a',
  wordTileText: '#ffffff',
  pathDot: '#3d9e3a',
  pathLine: '#3d9e3a',
  pathBg: '#eaf3f2',
};

export default function Home() {
  useEffect(() => {
    if (typeof document === 'undefined') return;
    document.body.style.backgroundColor = COLORS.bg;
    document.body.style.color = COLORS.text;
  }, []);

  return (
    <>
      <Head>
        <title>bngo</title>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </Head>

      <div style={styles.page}>
        <header style={styles.header}>
          <h1 style={{ ...styles.title, color: COLORS.titleColor }}>bngo</h1>
          <p style={{ ...styles.subtitle, color: COLORS.subtitleColor }}>pick a game!</p>
          <span style={{ ...styles.version, color: COLORS.versionColor }}>v{pkg.version}</span>
        </header>

        <div style={styles.menu}>
          <Link href="/word" style={{ ...styles.card, borderColor: COLORS.cardBorder, backgroundColor: COLORS.cardBg, boxShadow: COLORS.cardShadow }}>
            <div style={styles.previewRow}>
              {['c','a','t'].map((l, i) => (
                <span
                  key={i}
                  style={{
                    ...styles.previewTile,
                    backgroundColor: COLORS.wordTile,
                    color: COLORS.wordTileText,
                  }}
                >
                  {l}
                </span>
              ))}
            </div>
            <div style={{ ...styles.cardName, color: COLORS.titleColor }}>word</div>
            <div style={{ ...styles.cardDesc, color: COLORS.subtitleColor }}>guess the word!</div>
          </Link>

          <Link href="/path" style={{ ...styles.card, borderColor: COLORS.cardBorder, backgroundColor: COLORS.cardBg, boxShadow: COLORS.cardShadow }}>
            <svg
              width="120"
              height="64"
              viewBox="0 0 120 64"
              style={{ marginBottom: 4 }}
              aria-hidden="true"
            >
              <rect x="0"  y="0"  width="32" height="32" rx="8" fill={COLORS.pathBg} />
              <rect x="44" y="0"  width="32" height="32" rx="8" fill={COLORS.pathBg} />
              <rect x="88" y="0"  width="32" height="32" rx="8" fill={COLORS.pathBg} />
              <rect x="0"  y="32" width="32" height="32" rx="8" fill={COLORS.pathBg} />
              <rect x="44" y="32" width="32" height="32" rx="8" fill={COLORS.pathBg} />
              <rect x="88" y="32" width="32" height="32" rx="8" fill={COLORS.pathBg} />
              <path
                d="M16 16 L60 16 L60 48 L16 48 L16 60"
                stroke={COLORS.pathLine}
                strokeWidth="8"
                fill="none"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <circle cx="16"  cy="16" r="9" fill={COLORS.pathDot} />
              <circle cx="104" cy="16" r="9" fill="#ffffff" stroke={COLORS.pathDot} strokeWidth="3" />
              <text x="16"  y="20" textAnchor="middle" fontFamily="Fredoka, sans-serif" fontSize="13" fontWeight="600" fill="#ffffff">1</text>
              <text x="104" y="20" textAnchor="middle" fontFamily="Fredoka, sans-serif" fontSize="13" fontWeight="600" fill={COLORS.pathDot}>2</text>
            </svg>
            <div style={{ ...styles.cardName, color: COLORS.titleColor }}>path</div>
            <div style={{ ...styles.cardDesc, color: COLORS.subtitleColor }}>fill every square!</div>
          </Link>
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
    padding: '32px 16px 24px',
    gap: '32px',
    userSelect: 'none',
    width: '100%',
    maxWidth: '100vw',
    fontFamily: "'Fredoka', sans-serif",
    position: 'relative',
  },
  header: {
    textAlign: 'center',
    position: 'relative',
  },
  version: {
    position: 'absolute',
    top: 0,
    right: -28,
    fontSize: '0.7rem',
    fontWeight: 400,
  },
  title: {
    fontSize: 'clamp(2.4rem, 9vw, 3.8rem)',
    fontWeight: 600,
    letterSpacing: '-0.5px',
  },
  subtitle: {
    fontSize: '1.2rem',
    fontWeight: 400,
    marginTop: '4px',
  },
  menu: {
    display: 'flex',
    flexDirection: 'column',
    gap: '20px',
    width: '100%',
    maxWidth: '320px',
  },
  card: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '6px',
    padding: '24px 20px',
    border: '3px solid',
    borderRadius: '24px',
    textDecoration: 'none',
    fontFamily: 'inherit',
    cursor: 'pointer',
    transition: 'transform 0.15s, box-shadow 0.15s',
  },
  previewRow: {
    display: 'flex',
    gap: '6px',
    marginBottom: '4px',
  },
  previewTile: {
    width: '36px',
    height: '36px',
    borderRadius: '8px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontWeight: 600,
    fontSize: '1.4rem',
  },
  cardName: {
    fontSize: '1.8rem',
    fontWeight: 600,
    marginTop: '8px',
  },
  cardDesc: {
    fontSize: '1rem',
    fontWeight: 400,
  },
};
