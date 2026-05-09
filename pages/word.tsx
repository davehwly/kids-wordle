import Head from 'next/head';
import Link from 'next/link';
import { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import pkg from '../package.json';
import { TARGET_WORDS_5, VALID_WORDS_5 } from '../data/words5';

type Mode = 'kids' | 'adult';

// Common kid-friendly 3-letter words — used as puzzle targets
const TARGET_WORDS_3: readonly string[] = [
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

// Full 3-letter dictionary — every 3-letter word from /usr/share/dict/words
// plus common everyday words (poo, nah, hmm, shh…)
const VALID_WORDS_3: ReadonlySet<string> = new Set([
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
  ...TARGET_WORDS_3,
]);

const MAX_GUESSES = 6;

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

interface Theme {
  body: { bg: string; text: string };
  page: { titleColor: string; subtitleColor: string; versionColor: string };
  message: { bg: string; color: string };
  tile: {
    emptyBg: string;
    emptyText: string;
    border: string;
    activeBg: string;
    activeBorder: string;
    correctBg: string;
    presentBg: string;
    absentBg: string;
    onTileText: string;
  };
  key: { bg: string; text: string; correctBg: string; presentBg: string; absentBg: string };
  playAgain: { bg: string; text: string; shadow: string };
  toggle: { bg: string; activeBg: string; text: string; activeText: string; border: string };
}

const THEME_KIDS: Theme = {
  // Dulux Sea Urchin 4 (#b9d3d1) — soft mint/teal pastel
  body: { bg: '#dceae9', text: '#274646' },
  page: { titleColor: '#1f5b58', subtitleColor: '#2d706c', versionColor: '#7ba6a3' },
  message: { bg: '#1f5b58', color: '#ffffff' },
  tile: {
    emptyBg: '#eaf3f2',
    emptyText: '#274646',
    border: '#7ba6a3',
    activeBg: '#b9d3d1',
    activeBorder: '#2d706c',
    correctBg: '#3d9e3a',
    presentBg: '#d4920a',
    absentBg: '#6b7f87',
    onTileText: '#ffffff',
  },
  key: {
    bg: '#b9d3d1',
    text: '#274646',
    correctBg: '#3d9e3a',
    presentBg: '#d4920a',
    absentBg: '#6b7f87',
  },
  playAgain: { bg: '#2d706c', text: '#ffffff', shadow: '0 4px 12px rgba(31,91,88,0.35)' },
  toggle: {
    bg: '#eaf3f2',
    activeBg: '#2d706c',
    text: '#274646',
    activeText: '#ffffff',
    border: '#7ba6a3',
  },
};

const THEME_ADULT: Theme = {
  // Dark teal — Wordle dark mode with deep teal accent
  body: { bg: '#0f1e20', text: '#e6edec' },
  page: { titleColor: '#ffffff', subtitleColor: '#9bb5b3', versionColor: '#5b7a78' },
  message: { bg: '#1a3033', color: '#ffffff' },
  tile: {
    emptyBg: '#0f1e20',
    emptyText: '#ffffff',
    border: '#3a5054',
    activeBg: '#0f1e20',
    activeBorder: '#5fb3a8',
    correctBg: '#538d4e',
    presentBg: '#b59f3b',
    absentBg: '#3a3a3c',
    onTileText: '#ffffff',
  },
  key: {
    bg: '#3a5054',
    text: '#ffffff',
    correctBg: '#538d4e',
    presentBg: '#b59f3b',
    absentBg: '#1f2728',
  },
  playAgain: { bg: '#2d8079', text: '#ffffff', shadow: '0 4px 12px rgba(45,128,121,0.45)' },
  toggle: {
    bg: '#1a3033',
    activeBg: '#2d8079',
    text: '#9bb5b3',
    activeText: '#ffffff',
    border: '#3a5054',
  },
};

function getRandomWord(words: readonly string[]): string {
  return words[Math.floor(Math.random() * words.length)];
}

function evaluateGuess(guess: string, target: string): TileStatus[] {
  const len = target.length;
  const result: TileStatus[] = Array(len).fill('absent');
  const targetArr = target.split('');
  const guessArr = guess.split('');
  const targetUsed = Array(len).fill(false);
  const guessUsed = Array(len).fill(false);

  for (let i = 0; i < len; i++) {
    if (guessArr[i] === targetArr[i]) {
      result[i] = 'correct';
      targetUsed[i] = true;
      guessUsed[i] = true;
    }
  }

  for (let i = 0; i < len; i++) {
    if (guessUsed[i]) continue;
    for (let j = 0; j < len; j++) {
      if (!targetUsed[j] && guessArr[i] === targetArr[j]) {
        result[i] = 'present';
        targetUsed[j] = true;
        break;
      }
    }
  }

  return result;
}

const MODE_KEY = 'kw_mode';
const SAVE_KEY_KIDS = 'kw_state_kids';
const SAVE_KEY_ADULT = 'kw_state_adult';
// Legacy key from before mode toggle existed — migrate into the kids slot.
const LEGACY_SAVE_KEY = 'kw_state';

interface SavedState {
  target: string;
  guesses: Tile[][];
  gameOver: boolean;
  won: boolean;
  keyStatuses: Record<string, KeyStatus>;
}

function saveKeyFor(mode: Mode): string {
  return mode === 'adult' ? SAVE_KEY_ADULT : SAVE_KEY_KIDS;
}

function loadSave(mode: Mode): SavedState | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = sessionStorage.getItem(saveKeyFor(mode));
    if (raw) return JSON.parse(raw);
    if (mode === 'kids') {
      const legacy = sessionStorage.getItem(LEGACY_SAVE_KEY);
      if (legacy) {
        sessionStorage.setItem(SAVE_KEY_KIDS, legacy);
        sessionStorage.removeItem(LEGACY_SAVE_KEY);
        return JSON.parse(legacy);
      }
    }
    return null;
  } catch { return null; }
}

function saveState(mode: Mode, state: SavedState) {
  if (typeof window === 'undefined') return;
  try { sessionStorage.setItem(saveKeyFor(mode), JSON.stringify(state)); } catch {}
}

function clearSave(mode: Mode) {
  if (typeof window === 'undefined') return;
  try { sessionStorage.removeItem(saveKeyFor(mode)); } catch {}
}

function loadMode(): Mode {
  if (typeof window === 'undefined') return 'kids';
  try {
    const raw = localStorage.getItem(MODE_KEY);
    return raw === 'adult' ? 'adult' : 'kids';
  } catch { return 'kids'; }
}

function persistMode(mode: Mode) {
  if (typeof window === 'undefined') return;
  try { localStorage.setItem(MODE_KEY, mode); } catch {}
}

export default function Home() {
  const [mode, setMode] = useState<Mode>('kids');
  const [hydrated, setHydrated] = useState(false);
  const [target, setTarget] = useState<string>('');
  const [guesses, setGuesses] = useState<Tile[][]>([]);
  const [currentGuess, setCurrentGuess] = useState<string>('');
  const [gameOver, setGameOver] = useState<boolean>(false);
  const [won, setWon] = useState<boolean>(false);
  const [shake, setShake] = useState(false);
  const [keyStatuses, setKeyStatuses] = useState<Record<string, KeyStatus>>({});
  const [message, setMessage] = useState('');
  const [revealRow, setRevealRow] = useState<number | null>(null);
  const [revealedCount, setRevealedCount] = useState(0);

  const wordLength = mode === 'adult' ? 5 : 3;
  const targets = mode === 'adult' ? TARGET_WORDS_5 : TARGET_WORDS_3;
  const validWords = mode === 'adult' ? VALID_WORDS_5 : VALID_WORDS_3;
  const theme = mode === 'adult' ? THEME_ADULT : THEME_KIDS;

  // Hydrate state from storage on first client render to avoid SSR mismatch
  useEffect(() => {
    const m = loadMode();
    const saved = loadSave(m);
    setMode(m);
    if (saved) {
      setTarget(saved.target);
      setGuesses(saved.guesses);
      setGameOver(saved.gameOver);
      setWon(saved.won);
      setKeyStatuses(saved.keyStatuses);
    } else {
      setTarget(getRandomWord(m === 'adult' ? TARGET_WORDS_5 : TARGET_WORDS_3));
    }
    setHydrated(true);
  }, []);

  // Reflect theme on the document body
  useEffect(() => {
    if (!hydrated || typeof document === 'undefined') return;
    document.body.style.backgroundColor = theme.body.bg;
    document.body.style.color = theme.body.text;
  }, [hydrated, theme]);

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

  useEffect(() => () => cancelAll(), []);

  // Persist game state whenever it changes
  useEffect(() => {
    if (!hydrated || !target) return;
    saveState(mode, { target, guesses, gameOver, won, keyStatuses });
  }, [hydrated, mode, target, guesses, gameOver, won, keyStatuses]);

  const initGameForMode = useCallback((m: Mode) => {
    cancelAll();
    clearSave(m);
    setTarget(getRandomWord(m === 'adult' ? TARGET_WORDS_5 : TARGET_WORDS_3));
    setGuesses([]);
    setCurrentGuess('');
    setGameOver(false);
    setWon(false);
    setKeyStatuses({});
    setMessage('');
    setRevealRow(null);
  }, []);

  const initGame = useCallback(() => initGameForMode(mode), [initGameForMode, mode]);

  const switchMode = useCallback((next: Mode) => {
    if (next === mode) return;
    cancelAll();
    persistMode(next);
    setMode(next);
    setCurrentGuess('');
    setMessage('');
    setRevealRow(null);
    setShake(false);
    const saved = loadSave(next);
    if (saved) {
      setTarget(saved.target);
      setGuesses(saved.guesses);
      setGameOver(saved.gameOver);
      setWon(saved.won);
      setKeyStatuses(saved.keyStatuses);
    } else {
      setTarget(getRandomWord(next === 'adult' ? TARGET_WORDS_5 : TARGET_WORDS_3));
      setGuesses([]);
      setGameOver(false);
      setWon(false);
      setKeyStatuses({});
    }
  }, [mode]);

  const showMessage = (msg: string, duration = 1800) => {
    setMessage(msg);
    if (duration < 99999) after(() => setMessage(''), duration);
  };

  const submitGuess = useCallback(() => {
    if (currentGuess.length !== wordLength) {
      setShake(true);
      showMessage(mode === 'adult' ? 'not enough letters' : 'keep going! 🐾');
      after(() => setShake(false), 500);
      return;
    }

    if (!validWords.has(currentGuess)) {
      setShake(true);
      showMessage(mode === 'adult' ? 'not in word list' : 'not a word i know! 🤔');
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
    setRevealedCount(0);
    for (let c = 0; c < wordLength; c++) {
      const col = c;
      after(() => setRevealedCount(prev => Math.max(prev, col + 1)), col * 350 + 175);
    }

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
    }, wordLength * 350 + 200);

    const isWin = currentGuess === target;
    const isLast = guesses.length + 1 >= MAX_GUESSES;

    if (isWin) {
      after(() => {
        setWon(true);
        setGameOver(true);
        const kidsMsgs = ['amazing! 🌟', 'you got it! 🎉', 'woohoo! 🥳', 'brilliant! ⭐'];
        const adultMsgs = ['genius', 'magnificent', 'impressive', 'splendid', 'great', 'phew'];
        const pool = mode === 'adult' ? adultMsgs : kidsMsgs;
        showMessage(pool[Math.floor(Math.random() * pool.length)], 99999);
      }, wordLength * 350 + 300);
    } else if (isLast) {
      after(() => {
        setGameOver(true);
        const msg = mode === 'adult'
          ? `the word was ${target.toUpperCase()}`
          : `the word was "${target}" 😊`;
        showMessage(msg, 99999);
      }, wordLength * 350 + 300);
    }

    setCurrentGuess('');
  }, [currentGuess, guesses, target, wordLength, mode, validWords]);

  const handleKey = useCallback((key: string) => {
    if (gameOver) return;
    const k = key.toLowerCase();
    if (k === 'enter') {
      submitGuess();
    } else if (k === '⌫' || k === 'backspace') {
      setCurrentGuess(prev => prev.slice(0, -1));
    } else if (/^[a-z]$/.test(k) && currentGuess.length < wordLength) {
      setCurrentGuess(prev => prev + k);
    }
  }, [gameOver, currentGuess, submitGuess, wordLength]);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.ctrlKey || e.altKey || e.metaKey) return;
      handleKey(e.key);
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [handleKey]);

  const boardRows = useMemo<Tile[][]>(() => {
    const rows: Tile[][] = [];
    for (let r = 0; r < MAX_GUESSES; r++) {
      if (r < guesses.length) {
        rows.push(guesses[r]);
      } else if (r === guesses.length && !gameOver) {
        const row: Tile[] = [];
        for (let c = 0; c < wordLength; c++) {
          row.push({
            letter: currentGuess[c] ?? '',
            status: currentGuess[c] ? 'active' : 'empty',
          });
        }
        rows.push(row);
      } else {
        rows.push(Array(wordLength).fill({ letter: '', status: 'empty' }));
      }
    }
    return rows;
  }, [guesses, currentGuess, gameOver, wordLength]);

  const tileStyle = (status: TileStatus): React.CSSProperties => {
    const t = theme.tile;
    switch (status) {
      case 'correct': return { backgroundColor: t.correctBg, color: t.onTileText, borderColor: t.correctBg };
      case 'present': return { backgroundColor: t.presentBg, color: t.onTileText, borderColor: t.presentBg };
      case 'absent':  return { backgroundColor: t.absentBg, color: t.onTileText, borderColor: t.absentBg };
      case 'active':  return { borderColor: t.activeBorder, backgroundColor: t.activeBg, color: t.emptyText };
      default:        return { backgroundColor: t.emptyBg, color: t.emptyText, borderColor: t.border };
    }
  };

  const keyStyle = (status: KeyStatus): React.CSSProperties => {
    const k = theme.key;
    switch (status) {
      case 'correct': return { backgroundColor: k.correctBg, color: '#fff' };
      case 'present': return { backgroundColor: k.presentBg, color: '#fff' };
      case 'absent':  return { backgroundColor: k.absentBg, color: '#fff' };
      default:        return { backgroundColor: k.bg, color: k.text };
    }
  };

  const headerTitle = 'bngo';
  const subtitle = mode === 'adult'
    ? 'guess the 5-letter word'
    : 'guess the 3-letter word!';
  const docTitle = 'bngo';

  return (
    <>
      <Head>
        <title>{docTitle}</title>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </Head>

      <div
        style={{
          ...styles.page,
          color: theme.body.text,
          fontFamily: mode === 'adult'
            ? "'Inter', system-ui, -apple-system, sans-serif"
            : "'Fredoka', sans-serif",
          textTransform: mode === 'adult' ? 'uppercase' : 'none',
          letterSpacing: mode === 'adult' ? '0.04em' : 'normal',
        }}
      >
        <Link
          href="/"
          style={{
            ...styles.homeLink,
            color: theme.page.subtitleColor,
            borderColor: theme.toggle.border,
            backgroundColor: theme.toggle.bg,
          }}
          aria-label="back to home"
        >
          ← home
        </Link>

        <div style={{ ...styles.toggleWrap, borderColor: theme.toggle.border }}>
          <button
            type="button"
            onClick={() => switchMode('kids')}
            style={{
              ...styles.toggleBtn,
              backgroundColor: mode === 'kids' ? theme.toggle.activeBg : theme.toggle.bg,
              color: mode === 'kids' ? theme.toggle.activeText : theme.toggle.text,
            }}
          >
            kids
          </button>
          <button
            type="button"
            onClick={() => switchMode('adult')}
            style={{
              ...styles.toggleBtn,
              backgroundColor: mode === 'adult' ? theme.toggle.activeBg : theme.toggle.bg,
              color: mode === 'adult' ? theme.toggle.activeText : theme.toggle.text,
            }}
          >
            adult
          </button>
        </div>

        <header style={styles.header}>
          <h1 style={{ ...styles.title, color: theme.page.titleColor }}>{headerTitle}</h1>
          <p style={{ ...styles.subtitle, color: theme.page.subtitleColor }}>{subtitle}</p>
          <span style={{ ...styles.version, color: theme.page.versionColor }}>v{pkg.version}</span>
        </header>

        {message && (
          <div style={{ ...styles.message, background: theme.message.bg, color: theme.message.color }}>
            {message}
          </div>
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
                const showStatus = !isRevealing || c < revealedCount;
                const effectiveStatus: TileStatus = showStatus ? tile.status : 'active';
                const delay = isRevealing ? `${c * 350}ms` : '0ms';
                return (
                  <div
                    key={c}
                    style={{
                      ...styles.tile,
                      ...(mode === 'adult' ? styles.tileSizeAdult : styles.tileSizeKids),
                      ...tileStyle(effectiveStatus),
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
              {row.map(k => {
                const isWide = k === 'enter' || k === '⌫';
                const isBackspace = k === '⌫';
                return (
                  <button
                    key={k}
                    onClick={() => handleKey(k)}
                    style={{
                      ...styles.key,
                      ...(mode === 'adult' ? styles.keySizeAdult : styles.keySizeKids),
                      ...(isWide ? (mode === 'adult' ? styles.keyWideAdult : styles.keyWideKids) : {}),
                      ...(isBackspace ? styles.keyBackspace : {}),
                      ...keyStyle(keyStatuses[k] ?? 'unused'),
                    }}
                  >
                    {k}
                  </button>
                );
              })}
            </div>
          ))}
        </div>

        {gameOver && (
          <button
            style={{
              ...styles.playAgain,
              backgroundColor: theme.playAgain.bg,
              color: theme.playAgain.text,
              boxShadow: theme.playAgain.shadow,
            }}
            onClick={initGame}
          >
            {won
              ? (mode === 'adult' ? 'play again' : '🎉 play again!')
              : (mode === 'adult' ? 'try again' : '🔄 try again!')}
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
    position: 'relative',
  },
  toggleWrap: {
    display: 'inline-flex',
    border: '2px solid',
    borderRadius: '999px',
    overflow: 'hidden',
    padding: '2px',
    gap: '2px',
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
  toggleBtn: {
    border: 'none',
    padding: '8px 22px',
    borderRadius: '999px',
    fontFamily: 'inherit',
    fontSize: '1.05rem',
    fontWeight: 500,
    cursor: 'pointer',
    transition: 'background-color 0.2s, color 0.2s',
    minWidth: '72px',
    textTransform: 'inherit',
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
    fontSize: '1.15rem',
    fontWeight: 400,
    marginTop: '4px',
  },
  message: {
    borderRadius: '20px',
    padding: '10px 24px',
    fontSize: '1.15rem',
    fontWeight: 500,
    textAlign: 'center',
    minWidth: '200px',
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
    border: '3px solid',
    borderRadius: '14px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontWeight: 500,
    textTransform: 'inherit',
    transition: 'border-color 0.1s',
    transformStyle: 'preserve-3d',
  },
  tileSizeKids: {
    width: 'clamp(72px, 20vw, 92px)',
    height: 'clamp(72px, 20vw, 92px)',
    fontSize: 'clamp(2.4rem, 8.5vw, 3.2rem)',
  },
  tileSizeAdult: {
    width: 'clamp(56px, 15vw, 76px)',
    height: 'clamp(56px, 15vw, 76px)',
    fontSize: 'clamp(2rem, 6vw, 2.6rem)',
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
    maxWidth: '560px',
    padding: '0 4px',
  },
  keyRow: {
    display: 'flex',
    gap: 'clamp(3px, 1vw, 6px)',
    justifyContent: 'center',
    width: '100%',
  },
  key: {
    border: 'none',
    borderRadius: '10px',
    fontFamily: 'inherit',
    fontWeight: 500,
    cursor: 'pointer',
    transition: 'background-color 0.2s, transform 0.1s',
    touchAction: 'manipulation',
    flex: '1 1 0',
    minWidth: 0,
    padding: 0,
  },
  keySizeKids: {
    height: 'clamp(54px, 14vw, 64px)',
    fontSize: 'clamp(1.3rem, 5.5vw, 1.9rem)',
  },
  keySizeAdult: {
    height: 'clamp(54px, 14vw, 64px)',
    fontSize: 'clamp(1.1rem, 4.5vw, 1.4rem)',
  },
  keyWideKids: {
    flexGrow: 1.5,
    fontSize: 'clamp(1rem, 3.5vw, 1.4rem)',
  },
  keyWideAdult: {
    flexGrow: 1.5,
    fontSize: 'clamp(0.9rem, 3vw, 1.1rem)',
  },
  keyBackspace: {
    fontSize: 'clamp(1.8rem, 6vw, 2.4rem)',
    fontWeight: 600,
  },
  playAgain: {
    marginTop: '8px',
    padding: '16px 36px',
    fontSize: '1.3rem',
    fontFamily: 'inherit',
    fontWeight: 500,
    border: 'none',
    borderRadius: '30px',
    cursor: 'pointer',
    transition: 'transform 0.15s, box-shadow 0.15s',
  },
};
