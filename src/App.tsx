import { useState } from 'react';
import Icon from '@/components/ui/icon';

type Screen = 'menu' | 'game' | 'inventory' | 'characters' | 'history' | 'achievements';

interface GameState {
  moralPoints: number;
  chapter: number;
  playerName: string;
  inventory: Item[];
  historyLog: HistoryEvent[];
  metCharacters: string[];
  unlockedAchievements: string[];
  unlockedEndings: number[];
}

interface Item {
  id: string;
  name: string;
  description: string;
  type: 'document' | 'weapon' | 'key' | 'letter';
  icon: string;
}

interface HistoryEvent {
  chapter: number;
  text: string;
  moral: 'good' | 'evil' | 'neutral';
  date: string;
}

interface DialogScene {
  id: string;
  location: string;
  speaker?: string;
  text: string;
  choices: Choice[];
}

interface Choice {
  text: string;
  moral: 'good' | 'evil' | 'neutral';
  moralPoints: number;
  consequence: string;
  nextScene: string;
  givesItem?: Item;
}

const ITEMS: Record<string, Item> = {
  manifesto: { id: 'manifesto', name: 'Манифест', description: 'Листовка с призывами к восстанию. Хранить опасно.', type: 'document', icon: '📜' },
  key: { id: 'key', name: 'Ключ от явки', description: 'Бронзовый ключ. Открывает подпольную квартиру на Выборгской.', type: 'key', icon: '🗝️' },
  letter: { id: 'letter', name: 'Письмо офицера', description: 'Перехваченное письмо царского офицера с секретными сведениями.', type: 'letter', icon: '✉️' },
  revolver: { id: 'revolver', name: 'Наган', description: 'Семизарядный офицерский наган. Холодный и тяжёлый.', type: 'weapon', icon: '🔫' },
};

const SCENES: Record<string, DialogScene> = {
  start: {
    id: 'start',
    location: 'Петроград, февраль 1917',
    speaker: 'Рассказчик',
    text: 'Февральский мороз пронизывает насквозь. На улицах Петрограда — волнение. Очереди за хлебом, гудки заводов, шёпот о забастовках. Вы — молодой человек на распутье. У парадной вас встречает незнакомец в рабочей куртке.',
    choices: [
      {
        text: 'Выслушать незнакомца с интересом',
        moral: 'neutral',
        moralPoints: 0,
        consequence: 'Вы познакомились с Иваном Кузнецовым — агитатором партии большевиков.',
        nextScene: 'ivan_talk',
        givesItem: ITEMS.manifesto,
      },
      {
        text: 'Пройти мимо, не ввязываться',
        moral: 'neutral',
        moralPoints: -5,
        consequence: 'Вы отвернулись. Но тревога осталась внутри.',
        nextScene: 'street',
      },
    ],
  },
  ivan_talk: {
    id: 'ivan_talk',
    location: 'Петроград, подворотня',
    speaker: 'Иван Кузнецов',
    text: '«Товарищ! Рабочие Путиловского завода объявили забастовку. Нам нужны люди с головой, а не с ружьём. Есть поручение — передать пакет на явку. Дело несложное, но важное для революции.»',
    choices: [
      {
        text: 'Согласиться помочь революции',
        moral: 'good',
        moralPoints: 15,
        consequence: 'Вы взяли пакет. Иван пожал руку и назвал адрес явки.',
        nextScene: 'mission',
        givesItem: ITEMS.key,
      },
      {
        text: 'Потребовать деньги за помощь',
        moral: 'evil',
        moralPoints: -20,
        consequence: 'Иван посмотрел с презрением, но заплатил — революция не может ждать.',
        nextScene: 'mission',
      },
      {
        text: 'Донести на Ивана в полицию',
        moral: 'evil',
        moralPoints: -40,
        consequence: 'Ивана арестовали. Вы получили награду от охранки. Совесть молчит... пока.',
        nextScene: 'police_path',
      },
    ],
  },
  street: {
    id: 'street',
    location: 'Невский проспект',
    speaker: 'Рассказчик',
    text: 'Вы идёте по Невскому. Толпа нарастает. У хлебной лавки — давка. Пожилая женщина упала, её затаптывают. Казачий офицер смотрит и не вмешивается.',
    choices: [
      {
        text: 'Помочь женщине подняться',
        moral: 'good',
        moralPoints: 20,
        consequence: 'Женщина оказалась женой подпольного типографщика. Она дала вам адрес.',
        nextScene: 'mission',
        givesItem: ITEMS.letter,
      },
      {
        text: 'Пройти мимо — не ваше дело',
        moral: 'evil',
        moralPoints: -15,
        consequence: 'Вы прошли. Крики за спиной ещё долго звучали в голове.',
        nextScene: 'mission',
      },
    ],
  },
  mission: {
    id: 'mission',
    location: 'Явочная квартира, Выборгская сторона',
    speaker: 'Агент «Северный»',
    text: '«Хорошо, что пришли. Есть задание: у нас перехвачены сведения о передвижении жандармов. Нужно предупредить группу товарищей. Но у нас только один путь — через охраняемый район.»',
    choices: [
      {
        text: 'Взять документы и идти самому',
        moral: 'good',
        moralPoints: 25,
        consequence: 'Вы рискнули. Прошли незамеченным. Группа спасена.',
        nextScene: 'chapter2_intro',
        givesItem: ITEMS.revolver,
      },
      {
        text: 'Послать молодого курьера вместо себя',
        moral: 'evil',
        moralPoints: -30,
        consequence: 'Мальчишку схватили. Вы в безопасности, но что-то сломалось внутри.',
        nextScene: 'chapter2_intro',
      },
    ],
  },
  police_path: {
    id: 'police_path',
    location: 'Охранное отделение',
    speaker: 'Полковник Бехтерев',
    text: '«Превосходно. Вы проявили благоразумие. Революционеры — враги порядка. Продолжайте сотрудничество — будете вознаграждены. Пока — ступайте.»',
    choices: [
      {
        text: 'Принять предложение о сотрудничестве',
        moral: 'evil',
        moralPoints: -35,
        consequence: 'Вы стали осведомителем. Деньги есть. А душа?',
        nextScene: 'chapter2_intro',
      },
      {
        text: 'Передумать и уйти навсегда',
        moral: 'good',
        moralPoints: 20,
        consequence: 'Вы хлопнули дверью. Предательство не для вас.',
        nextScene: 'chapter2_intro',
      },
    ],
  },
  chapter2_intro: {
    id: 'chapter2_intro',
    location: 'Петроград, март 1917',
    speaker: 'Рассказчик',
    text: 'Самодержавие рухнуло. Николай II отрёкся от престола. На улицах ликование, но вопрос остаётся: что будет дальше? Временное правительство или Советы? История делается прямо сейчас — и вы в её эпицентре.',
    choices: [
      {
        text: 'Продолжение следует...',
        moral: 'neutral',
        moralPoints: 0,
        consequence: 'Глава 2 в разработке.',
        nextScene: 'start',
      },
    ],
  },
};

const CHARACTERS = [
  { id: 'ivan', name: 'Иван Кузнецов', role: 'Агитатор большевиков', description: 'Рабочий с Путиловского завода. Горящие глаза, мозолистые руки. Верит в революцию всей душой.', faction: 'Большевики', met: true },
  { id: 'north', name: 'Агент «Северный»', role: 'Подпольщик', description: 'Настоящее имя неизвестно. Хладнокровный, осторожный. Организует явки и переброску документов.', faction: 'Эсеры', met: false },
  { id: 'beh', name: 'Полковник Бехтерев', role: 'Офицер охранки', description: 'Умный и беспощадный. Умеет отличить опасного революционера от глупца. Предлагает сотрудничество.', faction: 'Жандармерия', met: false },
  { id: 'woman', name: 'Аграфена Тихонова', role: 'Вдова типографщика', description: 'Немолодая, но твёрдая духом. Прячет запрещённые листовки под половицами.', faction: 'Меньшевики', met: false },
];

const HISTORICAL_FIGURES = [
  {
    name: 'Николай II',
    title: 'Последний Император',
    years: '1868–1918',
    faction: 'Монархия',
    factionColor: 'border-yellow-700/70 text-yellow-500',
    photo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/a/ab/Nicholas_II_of_Russia.jpg/400px-Nicholas_II_of_Russia.jpg',
    quote: '«Власть — это крест, который несёт избранный Богом»',
  },
  {
    name: 'В. И. Ленин',
    title: 'Вождь большевиков',
    years: '1870–1924',
    faction: 'Большевики',
    factionColor: 'border-red-700/70 text-red-400',
    photo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/a/a5/Vladimir_Lenin.jpg/400px-Vladimir_Lenin.jpg',
    quote: '«Есть такая партия!»',
  },
  {
    name: 'Л. Д. Троцкий',
    title: 'Председатель Совета',
    years: '1879–1940',
    faction: 'Большевики',
    factionColor: 'border-red-700/70 text-red-400',
    photo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/5/58/LevTrotsky.jpg/400px-LevTrotsky.jpg',
    quote: '«Революция требует умения действовать»',
  },
  {
    name: 'А. Ф. Керенский',
    title: 'Глава Временного правительства',
    years: '1881–1970',
    faction: 'Эсеры',
    factionColor: 'border-amber-700/70 text-amber-400',
    photo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/3/37/Kerensky_1917.jpg/400px-Kerensky_1917.jpg',
    quote: '«Россия должна быть свободной республикой»',
  },
];

const ACHIEVEMENTS_LIST = [
  { id: 'first_choice', name: 'Первый шаг', description: 'Сделать первый выбор в игре', icon: '⭐', unlocked: true },
  { id: 'saint', name: 'Праведник', description: 'Набрать 80+ очков совести', icon: '✝️', unlocked: false },
  { id: 'tyrant', name: 'Тиран', description: 'Набрать -80+ очков жестокости', icon: '💀', unlocked: false },
  { id: 'spy', name: 'Провокатор', description: 'Донести на революционера', icon: '🕵️', unlocked: false },
  { id: 'hero', name: 'Герой народа', description: 'Спасти троих людей', icon: '🌟', unlocked: false },
  { id: 'collector', name: 'Архивариус', description: 'Собрать 5 документов', icon: '📚', unlocked: false },
];

const BG_IMAGE = 'https://cdn.poehali.dev/projects/2f491f84-dac4-4019-bf19-60cf05463c76/files/b6b3ad82-b0fa-4eae-a323-bc1e7679f2df.jpg';

const initialState: GameState = {
  moralPoints: 0,
  chapter: 1,
  playerName: 'Алексей',
  inventory: [],
  historyLog: [],
  metCharacters: [],
  unlockedAchievements: ['first_choice'],
  unlockedEndings: [],
};

function GameHeader({
  screen,
  setScreen,
  title,
  moralDisplay,
  gameState,
}: {
  screen: Screen;
  setScreen: (s: Screen) => void;
  title: string;
  moralDisplay: { label: string; color: string; bar: string; pct: number };
  gameState: GameState;
}) {
  return (
    <>
      <div className="flex items-center justify-between px-4 py-3 border-b border-border/50 bg-background/80 backdrop-blur-sm">
        <button onClick={() => setScreen('menu')} className="btn-ghost-vintage text-xs px-3 py-1.5 flex items-center gap-2">
          <Icon name="ChevronLeft" size={14} />
          Меню
        </button>
        <div className="font-propaganda text-sm tracking-widest text-amber-500/80 uppercase">{title}</div>
        <div className="flex items-center gap-2 text-xs">
          <span className={`font-propaganda text-xs ${moralDisplay.color}`}>{moralDisplay.label}</span>
          <div className="w-20 h-2 bg-muted border border-border/50">
            <div className={`h-full transition-all duration-700 ${moralDisplay.bar}`} style={{ width: `${moralDisplay.pct}%` }} />
          </div>
          <span className={`font-propaganda text-xs ${moralDisplay.color}`}>
            {gameState.moralPoints > 0 ? '+' : ''}{gameState.moralPoints}
          </span>
        </div>
      </div>
      <div className="flex border-b border-border/30 bg-background/60 backdrop-blur-sm">
        {[
          { id: 'game', icon: 'BookOpen', label: 'История' },
          { id: 'inventory', icon: 'Package', label: 'Инвентарь' },
          { id: 'characters', icon: 'Users', label: 'Персонажи' },
          { id: 'history', icon: 'Clock', label: 'Журнал' },
          { id: 'achievements', icon: 'Trophy', label: 'Итоги' },
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setScreen(tab.id as Screen)}
            className={`flex-1 flex flex-col items-center gap-1 py-2 text-xs font-propaganda tracking-wider transition-all
              ${screen === tab.id
                ? 'text-amber-400 border-b-2 border-red-700'
                : 'text-foreground/40 hover:text-foreground/70'
              }`}
          >
            <Icon name={tab.icon} fallback="Circle" size={14} />
            <span className="hidden sm:block">{tab.label}</span>
          </button>
        ))}
      </div>
    </>
  );
}

export default function App() {
  const [screen, setScreen] = useState<Screen>('menu');
  const [gameState, setGameState] = useState<GameState>(initialState);
  const [currentScene, setCurrentScene] = useState<string>('start');
  const [lastConsequence, setLastConsequence] = useState<string | null>(null);
  const [showConsequence, setShowConsequence] = useState(false);
  const [animKey, setAnimKey] = useState(0);

  const scene = SCENES[currentScene];
  const moralPercent = Math.max(-100, Math.min(100, gameState.moralPoints));
  const moralDisplay = moralPercent >= 0
    ? { label: 'Совесть', color: 'text-teal-400', bar: 'bg-teal-600', pct: moralPercent }
    : { label: 'Грех', color: 'text-red-400', bar: 'bg-red-700', pct: Math.abs(moralPercent) };

  function handleChoice(choice: Choice) {
    const newPoints = gameState.moralPoints + choice.moralPoints;
    const newLog: HistoryEvent = {
      chapter: gameState.chapter,
      text: choice.text,
      moral: choice.moral,
      date: `Февраль 1917, глава ${gameState.chapter}`,
    };
    const newInventory = choice.givesItem
      ? [...gameState.inventory.filter(i => i.id !== choice.givesItem!.id), choice.givesItem]
      : gameState.inventory;

    setGameState(prev => ({
      ...prev,
      moralPoints: newPoints,
      historyLog: [...prev.historyLog, newLog],
      inventory: newInventory,
    }));
    setLastConsequence(choice.consequence);
    setShowConsequence(true);

    setTimeout(() => {
      setShowConsequence(false);
      setCurrentScene(choice.nextScene);
      setAnimKey(k => k + 1);
    }, 2200);
  }

  function startNewGame() {
    setGameState(initialState);
    setCurrentScene('start');
    setLastConsequence(null);
    setShowConsequence(false);
    setAnimKey(0);
    setScreen('game');
  }

  return (
    <div className="min-h-screen bg-background text-foreground relative overflow-hidden">
      {/* Фоновое изображение */}
      <div
        className="fixed inset-0 pointer-events-none"
        style={{
          backgroundImage: `url(${BG_IMAGE})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          opacity: 0.08,
          filter: 'sepia(1) contrast(1.2)',
        }}
      />
      <div className="fixed inset-0 pointer-events-none bg-gradient-to-b from-background via-transparent to-background opacity-80" />

      {/* ===== ГЛАВНОЕ МЕНЮ ===== */}
      {screen === 'menu' && (
        <div className="relative min-h-screen flex flex-col items-center justify-center px-4">
          <div className="absolute top-6 left-6 w-16 h-16 border-l-2 border-t-2 border-red-700/40" />
          <div className="absolute top-6 right-6 w-16 h-16 border-r-2 border-t-2 border-red-700/40" />
          <div className="absolute bottom-6 left-6 w-16 h-16 border-l-2 border-b-2 border-red-700/40" />
          <div className="absolute bottom-6 right-6 w-16 h-16 border-r-2 border-b-2 border-red-700/40" />

          <div className="text-center mb-12 animate-fade-in">
            <div className="text-amber-500/60 font-propaganda text-sm tracking-[0.4em] mb-4 uppercase">
              Текстовая RPG
            </div>
            <h1
              className="font-propaganda text-6xl md:text-8xl font-bold leading-none mb-2 animate-flicker"
              style={{ color: 'hsl(0 80% 38%)', textShadow: '3px 3px 0 rgba(0,0,0,0.6), 0 0 40px rgba(180,0,0,0.3)' }}
            >
              1917
            </h1>
            <div className="w-full max-w-xs mx-auto h-px bg-gradient-to-r from-transparent via-red-700 to-transparent my-3" />
            <h2 className="font-propaganda text-2xl md:text-3xl tracking-widest text-amber-400/90">
              Красный Рассвет
            </h2>
            <p className="mt-4 font-serif text-lg text-foreground/50 italic max-w-sm mx-auto">
              «История не прощает трусов и предателей»
            </p>
          </div>

          <div className="flex flex-col gap-3 w-full max-w-xs">
            {[
              { label: 'Начать игру', icon: 'Play', action: startNewGame, primary: true, delay: 'stagger-1' },
              { label: 'Загрузить', icon: 'FolderOpen', action: () => {}, primary: false, delay: 'stagger-2' },
              { label: 'Достижения', icon: 'Trophy', action: () => setScreen('achievements'), primary: false, delay: 'stagger-3' },
              { label: 'Настройки', icon: 'Settings', action: () => {}, primary: false, delay: 'stagger-4' },
            ].map(btn => (
              <button
                key={btn.label}
                onClick={btn.action}
                className={`animate-fade-in ${btn.delay} flex items-center justify-center gap-3 py-3 px-6 transition-all duration-200 ${btn.primary ? 'btn-propaganda' : 'btn-ghost-vintage'}`}
              >
                <Icon name={btn.icon} fallback="Circle" size={16} />
                {btn.label}
              </button>
            ))}
          </div>

          <div className="absolute bottom-8 text-center">
            <p className="text-foreground/25 text-xs font-propaganda tracking-widest">
              ПЕТРОГРАД · MCMXVII
            </p>
          </div>
        </div>
      )}

      {/* ===== ИГРОВОЙ ЭКРАН ===== */}
      {screen === 'game' && (
        <div className="relative min-h-screen flex flex-col" key={animKey}>
          <GameHeader screen={screen} setScreen={setScreen} title={`Глава ${gameState.chapter} · ${scene?.location}`} moralDisplay={moralDisplay} gameState={gameState} />

          <div className="flex-1 flex gap-0 relative">
            {/* Боковая панель — исторические правители */}
            <aside className="hidden lg:flex flex-col w-52 shrink-0 border-r border-border/30 py-5 px-3 gap-4 sticky top-0 h-screen overflow-y-auto bg-background/40 backdrop-blur-sm">
              <div className="font-propaganda text-xs tracking-[0.2em] text-foreground/30 uppercase mb-1 text-center">Эпоха · 1917</div>
              {HISTORICAL_FIGURES.map((fig, i) => (
                <div
                  key={fig.name}
                  className="group relative animate-fade-in"
                  style={{ animationDelay: `${i * 0.12}s`, opacity: 0 }}
                >
                  <div className="border border-border/40 hover:border-amber-700/40 transition-all duration-300 overflow-hidden bg-card/40">
                    {/* Фото */}
                    <div className="relative overflow-hidden h-36">
                      <img
                        src={fig.photo}
                        alt={fig.name}
                        className="w-full h-full object-cover object-top grayscale sepia opacity-75 group-hover:opacity-90 group-hover:scale-105 transition-all duration-500"
                        style={{ filter: 'grayscale(0.6) sepia(0.5) contrast(1.1)' }}
                      />
                      {/* Виньетка снизу */}
                      <div className="absolute bottom-0 left-0 right-0 h-12 bg-gradient-to-t from-card/90 to-transparent" />
                    </div>
                    {/* Подпись */}
                    <div className="px-2.5 py-2">
                      <div className="font-propaganda text-xs text-amber-400/90 tracking-wide leading-tight">{fig.name}</div>
                      <div className="font-serif text-xs italic text-foreground/50 leading-tight mt-0.5">{fig.title}</div>
                      <div className="flex items-center justify-between mt-1.5">
                        <span className={`text-xs font-propaganda border px-1 py-0.5 tracking-wider text-[10px] ${fig.factionColor}`}>
                          {fig.faction}
                        </span>
                        <span className="text-foreground/25 text-[10px] font-serif">{fig.years}</span>
                      </div>
                    </div>
                    {/* Цитата при наведении */}
                    <div className="overflow-hidden max-h-0 group-hover:max-h-16 transition-all duration-300 px-2.5 pb-2">
                      <p className="text-[10px] font-serif italic text-foreground/40 leading-tight border-t border-border/30 pt-1.5">
                        {fig.quote}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </aside>

          <div className="flex-1 flex flex-col max-w-2xl mx-auto w-full px-4 py-6 gap-5">
            {scene?.speaker && (
              <div className="flex items-center gap-3 animate-slide-in">
                <div className="w-10 h-10 bg-red-900/40 border border-red-800/50 flex items-center justify-center font-propaganda text-sm text-red-400">
                  {scene.speaker[0]}
                </div>
                <div>
                  <div className="font-propaganda text-sm text-amber-400/80 tracking-widest uppercase">{scene.speaker}</div>
                  <div className="text-xs text-foreground/40">{scene.location}</div>
                </div>
              </div>
            )}

            {showConsequence && lastConsequence && (
              <div className="paper-texture p-4 animate-scale-in border-l-4 border-red-700 relative z-10">
                <div className="font-propaganda text-xs tracking-widest text-red-800 mb-1 uppercase">Последствие:</div>
                <p className="font-serif text-base italic text-ink/90">{lastConsequence}</p>
              </div>
            )}

            {!showConsequence && (
              <div className="dialog-box p-5 animate-fade-in shadow-2xl">
                <p className="font-serif text-lg leading-relaxed">{scene?.text}</p>
              </div>
            )}

            {!showConsequence && (
              <div className="flex flex-col gap-2 animate-fade-in stagger-2">
                <div className="font-propaganda text-xs tracking-widest text-foreground/40 mb-1 uppercase">— Выберите действие —</div>
                {scene?.choices.map((choice, i) => (
                  <button
                    key={i}
                    onClick={() => handleChoice(choice)}
                    className="choice-btn animate-fade-in w-full"
                    style={{ animationDelay: `${i * 0.1 + 0.2}s`, opacity: 0 }}
                  >
                    <span className="text-sm">{choice.text}</span>
                    {choice.moralPoints !== 0 && (
                      <span className={`ml-2 text-xs font-propaganda ${choice.moralPoints > 0 ? 'text-teal-500' : 'text-red-500'}`}>
                        {choice.moralPoints > 0 ? `+${choice.moralPoints} совесть` : `${choice.moralPoints} грех`}
                      </span>
                    )}
                  </button>
                ))}
              </div>
            )}

            {gameState.inventory.length > 0 && !showConsequence && (
              <div className="mt-2">
                <div className="font-propaganda text-xs tracking-widest text-foreground/30 mb-2">Предметы при себе:</div>
                <div className="flex gap-2 flex-wrap">
                  {gameState.inventory.map(item => (
                    <div key={item.id} className="flex items-center gap-1.5 bg-card border border-border px-2.5 py-1.5 text-xs">
                      <span>{item.icon}</span>
                      <span className="text-foreground/70">{item.name}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
          </div>
        </div>
      )}

      {/* ===== ИНВЕНТАРЬ ===== */}
      {screen === 'inventory' && (
        <div className="min-h-screen flex flex-col">
          <GameHeader screen={screen} setScreen={setScreen} title="Инвентарь" moralDisplay={moralDisplay} gameState={gameState} />
          <div className="max-w-2xl mx-auto w-full px-4 py-6">
            <div className="font-propaganda text-2xl tracking-widest text-amber-400 mb-1 animate-fade-in">Инвентарь</div>
            <p className="text-foreground/40 text-sm font-serif italic mb-6 animate-fade-in">Документы и предметы, влияющие на судьбу</p>
            {gameState.inventory.length === 0 ? (
              <div className="text-center py-16 text-foreground/30 animate-fade-in">
                <div className="text-5xl mb-4">🧳</div>
                <p className="font-serif italic">Карманы пусты. Но история ещё впереди.</p>
              </div>
            ) : (
              <div className="flex flex-col gap-3">
                {gameState.inventory.map((item, i) => (
                  <div
                    key={item.id}
                    className="bg-card border border-border p-4 flex gap-4 items-start animate-fade-in"
                    style={{ animationDelay: `${i * 0.1}s`, opacity: 0 }}
                  >
                    <span className="text-3xl">{item.icon}</span>
                    <div>
                      <div className="font-propaganda text-amber-400 tracking-wider">{item.name}</div>
                      <div className="text-xs text-muted-foreground font-propaganda mb-1 uppercase tracking-widest">
                        {item.type === 'document' ? 'Документ' : item.type === 'weapon' ? 'Оружие' : item.type === 'key' ? 'Ключ' : 'Письмо'}
                      </div>
                      <p className="font-serif text-sm text-foreground/70 italic">{item.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* ===== ПЕРСОНАЖИ ===== */}
      {screen === 'characters' && (
        <div className="min-h-screen flex flex-col">
          <GameHeader screen={screen} setScreen={setScreen} title="Персонажи" moralDisplay={moralDisplay} gameState={gameState} />
          <div className="max-w-2xl mx-auto w-full px-4 py-6">
            <div className="font-propaganda text-2xl tracking-widest text-amber-400 mb-1 animate-fade-in">Каталог персонажей</div>
            <p className="text-foreground/40 text-sm font-serif italic mb-6 animate-fade-in">Люди, с которыми пересеклась ваша судьба</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {CHARACTERS.map((char, i) => (
                <div
                  key={char.id}
                  className={`char-card p-4 animate-fade-in`}
                  style={{ animationDelay: `${i * 0.1}s`, opacity: 0 }}
                >
                  {char.met ? (
                    <>
                      <div className="flex items-start justify-between mb-2">
                        <div>
                          <div className="font-propaganda text-amber-400 tracking-wider text-sm">{char.name}</div>
                          <div className="font-serif italic text-foreground/60 text-xs">{char.role}</div>
                        </div>
                        <span className={`text-xs font-propaganda px-2 py-0.5 border tracking-wider ${
                          char.faction === 'Большевики' ? 'border-red-700/60 text-red-400' :
                          char.faction === 'Жандармерия' ? 'border-blue-700/60 text-blue-400' :
                          'border-amber-700/60 text-amber-400'
                        }`}>{char.faction}</span>
                      </div>
                      <p className="text-sm text-foreground/70 font-serif">{char.description}</p>
                    </>
                  ) : (
                    <div className="text-center py-4 opacity-40">
                      <div className="font-propaganda text-sm text-foreground/50 tracking-widest">??? · Неизвестен</div>
                      <p className="text-xs text-foreground/30 mt-1 font-serif italic">Встреча ещё не состоялась</p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ===== ИСТОРИЯ ===== */}
      {screen === 'history' && (
        <div className="min-h-screen flex flex-col">
          <GameHeader screen={screen} setScreen={setScreen} title="Журнал событий" moralDisplay={moralDisplay} gameState={gameState} />
          <div className="max-w-2xl mx-auto w-full px-4 py-6">
            <div className="font-propaganda text-2xl tracking-widest text-amber-400 mb-1 animate-fade-in">Журнал событий</div>
            <p className="text-foreground/40 text-sm font-serif italic mb-6 animate-fade-in">Летопись ваших решений</p>
            {gameState.historyLog.length === 0 ? (
              <div className="text-center py-16 text-foreground/30 animate-fade-in">
                <div className="text-5xl mb-4">📖</div>
                <p className="font-serif italic">Страницы пусты. История только начинается.</p>
              </div>
            ) : (
              <div className="relative">
                <div className="absolute left-3 top-0 bottom-0 w-px bg-red-900/40" />
                <div className="flex flex-col gap-4 pl-8">
                  {gameState.historyLog.map((event, i) => (
                    <div
                      key={i}
                      className="relative animate-fade-in"
                      style={{ animationDelay: `${i * 0.08}s`, opacity: 0 }}
                    >
                      <div className={`absolute -left-5 top-2 w-3 h-3 border-2 ${
                        event.moral === 'good' ? 'bg-teal-600 border-teal-400' :
                        event.moral === 'evil' ? 'bg-red-700 border-red-500' :
                        'bg-muted border-border'
                      }`} />
                      <div className="bg-card border border-border p-3">
                        <div className="font-propaganda text-xs text-foreground/40 tracking-widest mb-1">{event.date}</div>
                        <p className="font-serif text-sm text-foreground/80">{event.text}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ===== ДОСТИЖЕНИЯ ===== */}
      {screen === 'achievements' && (
        <div className="min-h-screen flex flex-col">
          <GameHeader screen={screen} setScreen={setScreen} title="Достижения" moralDisplay={moralDisplay} gameState={gameState} />
          <div className="max-w-2xl mx-auto w-full px-4 py-6">
            <div className="font-propaganda text-2xl tracking-widest text-amber-400 mb-1 animate-fade-in">Достижения</div>
            <p className="text-foreground/40 text-sm font-serif italic mb-2 animate-fade-in">
              Концовки открыты: {gameState.unlockedEndings.length} / 20
            </p>
            <div className="mb-6 animate-fade-in">
              <div className="w-full h-2 bg-muted border border-border overflow-hidden">
                <div
                  className="h-full bg-red-700 transition-all duration-700"
                  style={{ width: `${(gameState.unlockedEndings.length / 20) * 100}%` }}
                />
              </div>
              <div className="text-xs text-foreground/30 font-propaganda tracking-widest mt-1">Прогресс прохождения</div>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {ACHIEVEMENTS_LIST.map((ach, i) => {
                const isUnlocked = gameState.unlockedAchievements.includes(ach.id) || ach.unlocked;
                return (
                  <div
                    key={ach.id}
                    className={`achievement p-3 text-center animate-fade-in ${isUnlocked ? 'unlocked' : ''}`}
                    style={{ animationDelay: `${i * 0.08}s`, opacity: 0 }}
                  >
                    <div className="text-3xl mb-2">{isUnlocked ? ach.icon : '🔒'}</div>
                    <div className={`font-propaganda text-xs tracking-wider mb-1 ${isUnlocked ? 'text-amber-400' : 'text-foreground/30'}`}>
                      {isUnlocked ? ach.name : '???'}
                    </div>
                    <p className={`text-xs font-serif ${isUnlocked ? 'text-foreground/60' : 'text-foreground/20'}`}>
                      {isUnlocked ? ach.description : 'Не открыто'}
                    </p>
                  </div>
                );
              })}
            </div>

            <button
              onClick={() => setScreen('menu')}
              className="mt-8 btn-ghost-vintage px-6 py-2 flex items-center gap-2 mx-auto"
            >
              <Icon name="ChevronLeft" size={14} />
              В главное меню
            </button>
          </div>
        </div>
      )}
    </div>
  );
}