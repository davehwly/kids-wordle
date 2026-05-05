import Head from 'next/head';
import { useState, useEffect, useCallback, useRef } from 'react';
import pkg from '../package.json';

// Common kid-friendly words — used as puzzle targets
const TARGET_WORDS = [
  'ace','act','age','ago','aid','aim','air','ale','ant','ape',
  'arc','arm','art','ash','ask','axe','aye','bad','bag','ban',
  'bar','bat','bay','bed','bee','beg','big','bin','bit','boa',
  'bob','bog','bow','box','boy','bud','bug','bun','bus','but',
  'buy','bye','cab','can','cap','car','cat','cod','cot','cow',
  'cry','cub','cup','cut','dab','dad','dam','day','den','dew',
  'did','dig','dim','dip','dog','doe','dot','dry','dub','dug',
  'dye','ear','eat','eel','egg','elk','elm','emu','end','era',
  'eve','ewe','eye','fad','fan','far','fat','fee','fen','few',
  'fib','fig','fin','fir','fit','fix','fly','foe','fog','fox',
  'fry','fun','fur','gap','gas','gel','gem','gin','gnu','got',
  'gum','gun','gut','gym','had','ham','has','hat','hay','hem',
  'hen','her','hid','him','hip','hit','hoe','hog','hop','hot',
  'how','hub','hug','hut','ice','ilk','ill','imp','ink','inn',
  'ion','ire','ivy','jab','jam','jar','jaw','jay','jet','jig',
  'job','jog','jot','joy','jug','jut','keg','key','kid','kin',
  'kit','lab','lad','lag','lap','law','lay','led','leg','let',
  'lid','lip','lit','log','lot','low','lug','mad','man','map',
  'mat','maw','men','mob','mod','mop','mud','mug','mum','nab',
  'nag','nap','nod','nor','not','now','nun','nut','oak','oar',
  'oat','odd','ode','off','oil','old','one','opt','orb','ore',
  'our','out','owl','own','pad','pal','pan','pat','paw','pea',
  'peg','pen','pet','pie','pig','pin','pit','pod','pop','pot',
  'pub','pug','pun','pup','put','rag','ram','ran','rat','raw',
  'ray','red','rib','rid','rig','rim','rip','rob','rod','rot',
  'row','rub','rug','rum','run','rut','rye','sad','sap','sat',
  'saw','say','sea','set','sew','shy','sin','sip','sit','six',
  'ski','sky','sob','sod','son','sow','soy','spa','spy','sub',
  'sue','sum','sun','tab','tag','tan','tap','tar','tea','ten',
  'tie','tin','tip','toe','ton','too','top','tow','toy','tub',
  'tug','two','van','vat','vet','via','vim','vow','wad','wag',
  'war','wax','web','wed','wee','wet','who','why','wig','win',
  'wit','woe','wok','won','woo','wry','yak','yam','yap','yew',
  'yin','yip','you','zed','zip','zoo',
];

// Full dictionary — every 3-letter word from /usr/share/dict/words plus
// common everyday words the Mac dictionary omits (poo, nah, hmm, shh…)
const VALID_WORDS = new Set([
  'aal','aam','aba','abb','abe','abo','abu','aby','ace','ach','act','ada','add','ade','ado','ady',
  'adz','aer','aes','aft','aga','age','ago','agy','aha','aho','aht','ahu','aid','ail','aim','air',
  'ait','aix','aka','ake','ako','aku','ala','alb','ale','alf','alk','all','aln','alo','alp','alt',
  'aly','ama','ame','ami','amp','amt','amy','ana','and','ani','ann','ant','any','apa','ape','apt',
  'ara','arc','are','ark','arm','arn','aro','art','aru','arx','ary','asa','ase','ash','ask','asp',
  'ass','ast','ata','ate','ati','auh','auk','aum','aus','ava','ave','avo','awa','awd','awe','awl',
  'awn','axe','aye','ayu','azo','baa','bab','bac','bad','bae','bag','bah','bal','bam','ban','bap',
  'bar','bas','bat','baw','bay','bea','bed','bee','beg','bel','ben','ber','bes','bet','bey','bib',
  'bid','big','bim','bin','bis','bit','biz','blo','boa','bob','bod','bog','bom','bon','boo','bop',
  'bor','bos','bot','bow','boy','bra','bub','bud','bug','bum','bun','bur','bus','but','buy','bye',
  'cab','cad','cag','cal','cam','can','cap','car','cat','caw','cay','cee','cel','cep','cha','che',
  'chi','cho','cid','cig','cit','cly','cob','cod','coe','cog','col','con','coo','cop','cor','cos',
  'cot','cow','cox','coy','coz','cro','cry','cub','cud','cue','cum','cup','cur','cut','cwm','cyp',
  'dab','dad','dae','dag','dah','dak','dal','dam','dan','dao','dap','dar','das','daw','day','deb',
  'dee','deg','del','den','dev','dew','dey','dha','dhu','dib','did','die','dig','dim','din','dip',
  'dis','dit','div','dob','doc','dod','doe','dog','dol','dom','don','dop','dor','dos','dot','dow',
  'dry','dub','dud','due','dug','dum','dun','duo','dup','dux','dye','ean','ear','eat','ebb','edh',
  'edo','eel','eer','eft','egg','ego','eke','elb','eld','elf','eli','elk','ell','elm','els','elt',
  'eme','emm','emu','end','ens','eon','era','erd','ere','erg','err','ers','ess','eta','eva','eve',
  'ewe','eye','eyn','fad','fae','fag','fam','fan','far','fat','fay','fed','fee','fei','fen','fet',
  'feu','few','fey','fez','fib','fid','fie','fig','fin','fip','fir','fit','fix','flo','flu','fly',
  'fob','fod','foe','fog','fon','foo','fop','for','fot','fou','fow','fox','foy','fra','fro','fry',
  'fub','fud','fug','fum','fun','fur','fut','gab','gad','gag','gaj','gal','gam','gan','gap','gar',
  'gas','gat','gau','gaw','gay','gaz','ged','gee','gel','gem','gen','geo','ger','ges','get','gey',
  'gez','gib','gid','gie','gif','gig','gil','gim','gin','gio','gip','git','gnu','goa','gob','god',
  'gog','goi','gol','gon','goo','gor','gos','got','goy','gra','grr','gud','gue','gul','gum','gun',
  'gup','gur','gus','gut','guy','guz','gym','gyn','gyp','had','hag','hah','hak','hal','ham','han',
  'hao','hap','hat','hau','haw','hay','hei','hem','hen','hep','her','het','hew','hex','hey','hia',
  'hic','hid','hie','him','hin','hip','his','hit','hmm','hob','hod','hoe','hog','hoi','hon','hop',
  'hot','how','hox','hoy','hsi','hub','hud','hue','hug','huh','hui','huk','hum','hun','hup','hut',
  'hwa','hyp','ian','iao','iba','ibo','ice','ich','icy','ida','ide','ido','ife','ihi','ijo','ike',
  'ila','ilk','ill','ima','imi','imp','imu','ind','ing','ink','inn','ino','ion','ira','ire','irk',
  'ism','iso','ist','ita','ito','its','iva','ivy','iwa','iyo','jab','jag','jam','jan','jap','jar',
  'jat','jaw','jay','jed','jef','jem','jet','jew','jib','jig','jim','jin','job','joe','jog','jon',
  'jos','jot','jow','joy','jud','jug','jun','jur','jut','kaf','kai','kaj','kan','kat','kaw','kay',
  'kea','keb','ked','kee','kef','keg','ken','kep','ker','ket','kex','key','kha','khu','kid','kil',
  'kim','kin','kip','kit','koa','kob','koi','kol','kon','kop','kor','kos','kou','kra','kru','kua',
  'kui','kyl','kyu','lab','lac','lad','lag','lai','lak','lam','lan','lao','lap','lar','las','lat',
  'law','lax','lay','laz','lea','led','lee','leg','lei','lek','len','leo','ler','les','let','leu',
  'lev','lew','lex','ley','lid','lie','lif','lim','lin','lip','lis','lit','liv','liz','loa','lob',
  'lod','lof','log','loo','lop','lot','lou','low','lox','loy','luc','lue','lug','lui','lum','luo',
  'lur','lut','lux','lwo','lye','lys','mab','mac','mad','mae','mag','mah','mal','mam','man','mao',
  'map','mar','mas','mat','mau','maw','max','may','meg','mel','mem','men','meo','mer','mes','met',
  'mev','mew','mho','mib','mid','mig','mil','mim','min','mir','mix','mob','mod','moe','mog','moi',
  'mon','moo','mop','mor','mot','mou','mow','moy','mrs','mru','mud','mug','mum','mun','mus','mux',
  'mwa','mya','naa','nab','nae','nag','nah','nak','nam','nan','nap','nar','nat','naw','nay','nea',
  'neb','ned','nee','nef','nei','neo','nep','net','new','nib','nid','nig','nil','nim','nip','nit',
  'nix','noa','nob','nod','nog','non','nor','not','nou','now','noy','nth','nub','nul','nun','nut',
  'nye','oaf','oak','oam','oar','oat','obe','obi','och','ock','oda','odd','ode','ods','odz','oer',
  'oes','off','ofo','oft','ohm','oho','oii','oil','oka','oki','old','ole','olm','ona','one','ons',
  'ope','opt','ora','orb','orc','ore','orf','ort','ory','osc','ose','oto','ouf','our','out','ova',
  'owd','owe','owk','owl','own','oxy','pac','pad','pah','pal','pam','pan','pap','par','pat','pau',
  'paw','pax','pay','pea','ped','pee','peg','pen','pep','per','pes','pet','pew','phi','pho','phu',
  'pia','pic','pie','pig','pik','pim','pin','pip','pir','pit','pix','ply','poa','pob','pod','poe',
  'poh','poi','pol','pom','pon','poo','pop','pot','pow','pox','poy','pro','pry','psi','pst','pua',
  'pub','pud','pug','pul','pun','pup','pur','pus','put','pya','pyr','pyx','qua','quo','rab','rad',
  'rag','rah','raj','ram','ran','rap','ras','rat','raw','rax','ray','rea','reb','red','ree','ref',
  'reg','reh','rel','rep','ret','rev','rex','rhe','rho','ria','rib','ric','rid','rie','rig','rik',
  'rim','rio','rip','rit','rix','rob','roc','rod','roe','rog','roi','rok','ron','rot','row','rox',
  'roy','rua','rub','rud','rue','rug','rum','run','rus','rut','rux','rye','saa','sab','sac','sad',
  'sag','sah','sai','saj','sak','sal','sam','san','sao','sap','sar','sat','saw','sax','say','sea',
  'sec','see','seg','sen','ser','set','sew','sex','sey','sha','she','shh','shi','sho','shu','shy',
  'sia','sib','sic','sid','sie','sig','sil','sim','sin','sip','sir','sis','sit','six','ski','sky',
  'sla','sly','sma','sny','sob','soc','sod','soe','sog','soh','sok','sol','son','sop','sot','sou',
  'sov','sow','soy','spa','spy','sri','ssi','ssu','stu','sty','sub','sud','sue','sui','suk','sum',
  'sun','sup','sur','sus','suu','suz','swa','syd','sye','taa','tab','tad','tae','tag','tai','taj',
  'tal','tam','tan','tao','tap','tar','tat','tau','tav','taw','tax','tay','tch','tck','tea','tec',
  'ted','tee','teg','ten','tew','tez','tha','the','tho','thy','tib','tic','tid','tie','tig','til',
  'tim','tin','tip','tit','tji','toa','tod','toe','tog','toi','tol','tom','ton','too','top','tor',
  'tot','tou','tow','tox','toy','tra','tri','try','tst','tua','tub','tue','tug','tui','tum','tun',
  'tup','tur','tut','tux','twa','twi','two','tye','tyg','tyt','ubi','uca','udi','udo','uds','ugh',
  'uji','uke','ula','ule','ull','ulu','ume','ump','umu','una','upo','ura','urd','ure','urf','uri',
  'urn','uro','urs','uru','use','ush','ust','uta','ute','utu','uva','vag','vai','val','van','vas',
  'vat','vau','vee','vei','vet','vex','via','vic','vie','vim','vip','vis','vod','voe','vog','vol',
  'vow','vug','vum','wab','wac','wad','wae','waf','wag','wah','wan','wap','war','was','wat','waw',
  'wax','way','wea','web','wed','wee','wei','wem','wen','wer','wes','wet','wey','wha','who','why',
  'wid','wig','wim','win','wir','wis','wit','wiz','wob','wod','woe','wog','wok','won','woo','wop',
  'wot','wow','woy','wro','wry','wud','wun','wup','wur','wut','wye','wyn','yad','yah','yak','yam',
  'yan','yao','yap','yar','yas','yat','yaw','yea','yed','yee','yen','yeo','yep','yer','yes','yet',
  'yew','yex','yez','yid','yin','yip','yis','yoe','yoi','yok','yom','yon','yor','yot','you','yow',
  'yox','yoy','yuh','yun','yus','zac','zad','zag','zak','zan','zar','zat','zax','zea','zed','zee',
  'zel','zen','zep','zer','zig','zip','zoa','zoo',
  // also accept all target words and any targets not already covered
  ...TARGET_WORDS,
]);

const MAX_GUESSES = 6;
const WORD_LENGTH = 3;

type TileStatus = 'correct' | 'present' | 'absent' | 'empty' | 'active';

interface Tile {
  letter: string;
  status: TileStatus;
}

type KeyStatus = 'correct' | 'present' | 'absent' | 'unused';

const KEYBOARD_ROWS = [
  ['q','w','e','r','t','y','u','i','o','p'],
  ['a','s','d','f','g','h','j','k','l'],
  ['enter','z','x','c','v','b','n','m','⌫'],
];

function getRandomWord(): string {
  return TARGET_WORDS[Math.floor(Math.random() * TARGET_WORDS.length)];
}

function evaluateGuess(guess: string, target: string): TileStatus[] {
  const result: TileStatus[] = Array(WORD_LENGTH).fill('absent');
  const targetArr = target.split('');
  const guessArr = guess.split('');
  const targetUsed = Array(WORD_LENGTH).fill(false);
  const guessUsed = Array(WORD_LENGTH).fill(false);

  // First pass: correct positions
  for (let i = 0; i < WORD_LENGTH; i++) {
    if (guessArr[i] === targetArr[i]) {
      result[i] = 'correct';
      targetUsed[i] = true;
      guessUsed[i] = true;
    }
  }

  // Second pass: present but wrong position
  for (let i = 0; i < WORD_LENGTH; i++) {
    if (guessUsed[i]) continue;
    for (let j = 0; j < WORD_LENGTH; j++) {
      if (!targetUsed[j] && guessArr[i] === targetArr[j]) {
        result[i] = 'present';
        targetUsed[j] = true;
        break;
      }
    }
  }

  return result;
}

const SAVE_KEY = 'kw_state';

function loadSave(): { target: string; guesses: Tile[][]; gameOver: boolean; won: boolean; keyStatuses: Record<string, KeyStatus> } | null {
  try {
    const raw = sessionStorage.getItem(SAVE_KEY);
    if (!raw) return null;
    return JSON.parse(raw);
  } catch { return null; }
}

function saveState(state: { target: string; guesses: Tile[][]; gameOver: boolean; won: boolean; keyStatuses: Record<string, KeyStatus> }) {
  try { sessionStorage.setItem(SAVE_KEY, JSON.stringify(state)); } catch {}
}

function clearSave() {
  try { sessionStorage.removeItem(SAVE_KEY); } catch {}
}

export default function Home() {
  const [target, setTarget] = useState<string>(() => loadSave()?.target ?? getRandomWord());
  const [guesses, setGuesses] = useState<Tile[][]>(() => loadSave()?.guesses ?? []);
  const [currentGuess, setCurrentGuess] = useState<string>('');
  const [gameOver, setGameOver] = useState<boolean>(() => loadSave()?.gameOver ?? false);
  const [won, setWon] = useState<boolean>(() => loadSave()?.won ?? false);
  const [shake, setShake] = useState(false);
  const [keyStatuses, setKeyStatuses] = useState<Record<string, KeyStatus>>(() => loadSave()?.keyStatuses ?? {});
  const [message, setMessage] = useState('');
  const [revealRow, setRevealRow] = useState<number | null>(null);

  // Track every timer so we can cancel them all on reset or unmount
  const timers = useRef<ReturnType<typeof setTimeout>[]>([]);
  const after = (fn: () => void, ms: number) => {
    const id = setTimeout(fn, ms);
    timers.current.push(id);
    return id;
  };
  const cancelAll = () => {
    timers.current.forEach(clearTimeout);
    timers.current = [];
  };

  // Cancel timers when the component unmounts
  useEffect(() => () => cancelAll(), []);

  // Persist game state whenever it changes
  useEffect(() => {
    saveState({ target, guesses, gameOver, won, keyStatuses });
  }, [target, guesses, gameOver, won, keyStatuses]);

  const initGame = useCallback(() => {
    cancelAll();
    clearSave();
    setTarget(getRandomWord());
    setGuesses([]);
    setCurrentGuess('');
    setGameOver(false);
    setWon(false);
    setKeyStatuses({});
    setMessage('');
    setRevealRow(null);
  }, []);

  const showMessage = (msg: string, duration = 1800) => {
    setMessage(msg);
    if (duration < 99999) after(() => setMessage(''), duration);
  };

  const submitGuess = useCallback(() => {
    if (currentGuess.length !== WORD_LENGTH) {
      setShake(true);
      showMessage('keep going! 🐾');
      after(() => setShake(false), 500);
      return;
    }

    if (!VALID_WORDS.has(currentGuess)) {
      setShake(true);
      showMessage('not a word i know! 🤔');
      after(() => setShake(false), 500);
      return;
    }

    const statuses = evaluateGuess(currentGuess, target);
    const newTiles: Tile[] = currentGuess.split('').map((letter, i) => ({
      letter,
      status: statuses[i],
    }));

    const rowIndex = guesses.length;
    setGuesses(prev => [...prev, newTiles]);
    setRevealRow(rowIndex);

    // Update key statuses after reveal animation
    after(() => {
      setKeyStatuses(prev => {
        const updated = { ...prev };
        currentGuess.split('').forEach((letter, i) => {
          const current = updated[letter];
          const next = statuses[i];
          if (current === 'correct') return;
          if (next === 'correct') { updated[letter] = 'correct'; return; }
          if (current === 'present') return;
          if (next === 'present') { updated[letter] = 'present'; return; }
          updated[letter] = 'absent';
        });
        return updated;
      });
      setRevealRow(null);
    }, WORD_LENGTH * 350 + 200);

    const isWin = currentGuess === target;
    const isLast = guesses.length + 1 >= MAX_GUESSES;

    if (isWin) {
      after(() => {
        setWon(true);
        setGameOver(true);
        const msgs = ['amazing! 🌟', 'you got it! 🎉', 'woohoo! 🥳', 'brilliant! ⭐'];
        showMessage(msgs[Math.floor(Math.random() * msgs.length)], 99999);
      }, WORD_LENGTH * 350 + 300);
    } else if (isLast) {
      after(() => {
        setGameOver(true);
        showMessage(`the word was "${target}" 😊`, 99999);
      }, WORD_LENGTH * 350 + 300);
    }

    setCurrentGuess('');
  }, [currentGuess, guesses, target]);

  const handleKey = useCallback((key: string) => {
    if (gameOver) return;
    const k = key.toLowerCase();
    if (k === 'enter') {
      submitGuess();
    } else if (k === '⌫' || k === 'backspace') {
      setCurrentGuess(prev => prev.slice(0, -1));
    } else if (/^[a-z]$/.test(k) && currentGuess.length < WORD_LENGTH) {
      setCurrentGuess(prev => prev + k);
    }
  }, [gameOver, currentGuess, submitGuess]);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.ctrlKey || e.altKey || e.metaKey) return;
      handleKey(e.key);
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [handleKey]);

  // Build board rows
  const boardRows: Tile[][] = [];
  for (let r = 0; r < MAX_GUESSES; r++) {
    if (r < guesses.length) {
      boardRows.push(guesses[r]);
    } else if (r === guesses.length && !gameOver) {
      // Active row
      const row: Tile[] = [];
      for (let c = 0; c < WORD_LENGTH; c++) {
        row.push({
          letter: currentGuess[c] ?? '',
          status: currentGuess[c] ? 'active' : 'empty',
        });
      }
      boardRows.push(row);
    } else {
      boardRows.push(Array(WORD_LENGTH).fill({ letter: '', status: 'empty' }));
    }
  }

  return (
    <>
      <Head>
        <title>kids wordle 🌈</title>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </Head>

      <div style={styles.page}>
        <header style={styles.header}>
          <h1 style={styles.title}>kids wordle 🌈</h1>
          <p style={styles.subtitle}>guess the 3-letter word!</p>
          <span style={styles.version}>v{pkg.version}</span>
        </header>

        {message && (
          <div style={styles.message}>{message}</div>
        )}

        <div style={styles.board}>
          {boardRows.map((row, r) => (
            <div
              key={r}
              style={{
                ...styles.row,
                ...(shake && r === guesses.length ? styles.shake : {}),
              }}
            >
              {row.map((tile, c) => {
                const isRevealing = revealRow === r;
                const delay = isRevealing ? `${c * 350}ms` : '0ms';
                return (
                  <div
                    key={c}
                    style={{
                      ...styles.tile,
                      ...tileStyle(tile.status),
                      ...(isRevealing ? { animationDelay: delay, animationName: 'flip', animationDuration: '350ms', animationFillMode: 'forwards' } : {}),
                      ...(tile.letter && tile.status === 'active' ? styles.tilePop : {}),
                    }}
                  >
                    {tile.letter}
                  </div>
                );
              })}
            </div>
          ))}
        </div>

        <div style={styles.keyboard}>
          {KEYBOARD_ROWS.map((row, r) => (
            <div key={r} style={styles.keyRow}>
              {row.map(k => (
                <button
                  key={k}
                  onClick={() => handleKey(k)}
                  style={{
                    ...styles.key,
                    ...(k === 'enter' || k === '⌫' ? styles.keyWide : {}),
                    ...keyStyle(keyStatuses[k] ?? 'unused'),
                  }}
                >
                  {k}
                </button>
              ))}
            </div>
          ))}
        </div>

        {gameOver && (
          <button style={styles.playAgain} onClick={initGame}>
            {won ? '🎉 play again!' : '🔄 try again!'}
          </button>
        )}
      </div>

      <style>{`
        @keyframes flip {
          0%   { transform: rotateX(0deg); }
          50%  { transform: rotateX(-90deg); }
          100% { transform: rotateX(0deg); }
        }
        @keyframes pop {
          0%   { transform: scale(1); }
          50%  { transform: scale(1.12); }
          100% { transform: scale(1); }
        }
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          20%       { transform: translateX(-6px); }
          40%       { transform: translateX(6px); }
          60%       { transform: translateX(-4px); }
          80%       { transform: translateX(4px); }
        }
        @keyframes bounce {
          0%, 100% { transform: translateY(0); }
          50%       { transform: translateY(-8px); }
        }
      `}</style>
    </>
  );
}

function tileStyle(status: TileStatus): React.CSSProperties {
  switch (status) {
    case 'correct': return { backgroundColor: '#3d9e3a', color: '#fff', borderColor: '#3d9e3a' };
    case 'present': return { backgroundColor: '#d4920a', color: '#fff', borderColor: '#d4920a' };
    case 'absent':  return { backgroundColor: '#6b7f87', color: '#fff', borderColor: '#6b7f87' };
    case 'active':  return { borderColor: '#5a7880', backgroundColor: '#fff' };
    default:        return {};
  }
}

function keyStyle(status: KeyStatus): React.CSSProperties {
  switch (status) {
    case 'correct': return { backgroundColor: '#3d9e3a', color: '#fff' };
    case 'present': return { backgroundColor: '#d4920a', color: '#fff' };
    case 'absent':  return { backgroundColor: '#6b7f87', color: '#fff' };
    default:        return {};
  }
}

const styles: Record<string, React.CSSProperties> = {
  page: {
    minHeight: '100%',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    padding: '16px 12px 24px',
    gap: '16px',
    userSelect: 'none',
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
    color: '#7a8a95',
    fontWeight: 400,
  },
  title: {
    fontSize: 'clamp(1.6rem, 5vw, 2.4rem)',
    fontWeight: 400,
    color: '#c06010',
    letterSpacing: '-0.5px',
  },
  subtitle: {
    fontSize: '1rem',
    fontWeight: 400,
    color: '#7a5535',
    marginTop: '2px',
  },
  message: {
    background: '#241609',
    color: '#fff',
    borderRadius: '20px',
    padding: '8px 20px',
    fontSize: '1rem',
    fontWeight: 400,
    textAlign: 'center',
    minWidth: '180px',
  },
  board: {
    display: 'flex',
    flexDirection: 'column',
    gap: '8px',
  },
  row: {
    display: 'flex',
    gap: '8px',
  },
  shake: {
    animation: 'shake 0.45s ease',
  },
  tile: {
    width: 'clamp(64px, 18vw, 80px)',
    height: 'clamp(64px, 18vw, 80px)',
    border: '3px solid #b8a490',
    borderRadius: '14px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: 'clamp(2rem, 7vw, 2.6rem)',
    fontWeight: 400,
    textTransform: 'lowercase',
    color: '#241609',
    backgroundColor: '#fff',
    transition: 'border-color 0.1s',
    transformStyle: 'preserve-3d',
  },
  tilePop: {
    animation: 'pop 0.15s ease',
  },
  keyboard: {
    display: 'flex',
    flexDirection: 'column',
    gap: '6px',
    alignItems: 'center',
    width: '100%',
    maxWidth: '420px',
  },
  keyRow: {
    display: 'flex',
    gap: '5px',
    justifyContent: 'center',
  },
  key: {
    height: '52px',
    minWidth: '34px',
    padding: '0 6px',
    borderRadius: '10px',
    border: 'none',
    backgroundColor: '#f8bbd0',
    color: '#241609',
    fontSize: '0.95rem',
    fontFamily: 'Fredoka, sans-serif',
    fontWeight: 400,
    cursor: 'pointer',
    transition: 'background-color 0.2s, transform 0.1s',
    touchAction: 'manipulation',
  },
  keyWide: {
    minWidth: '52px',
    fontSize: '0.75rem',
  },
  playAgain: {
    marginTop: '8px',
    padding: '14px 32px',
    fontSize: '1.1rem',
    fontFamily: 'Fredoka, sans-serif',
    fontWeight: 400,
    backgroundColor: '#c06010',
    color: '#fff',
    border: 'none',
    borderRadius: '30px',
    cursor: 'pointer',
    boxShadow: '0 4px 12px rgba(192,96,16,0.35)',
    transition: 'transform 0.15s, box-shadow 0.15s',
  },
};
