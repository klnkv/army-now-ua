import type { GearId, Lang, Origin, PathId, RoleId, UnitId } from "./types";

type Pack = {
  loading: string;
  tapContinue: string;
  brand: string;
  sub: string;
  register: string;
  callsign: string;
  callsignPh: string;
  profile: string;
  pickLang: string;
  continue: string;
  back: string;
  confirm: string;
  gear: string;
  recv: string;
  roleKit: string;
  startPath: string;
  gearNote: string;
  unitTitle: string;
  unitSub: string;
  founded: string;
  rolesLbl: string;
  bonuses: string;
  daily: string;
  howTitle: string;
  how: [string, string, string][];
  report: string;
  reportBody: string[];
  karmaHidden: string;
  paramsRank: string;
  publicTrail: string;
  show: string;
  statsTitle: string;
  trust: string;
  reputation: string;
  stress: string;
  authority: string;
  statsFoot: string;
  tabs: Record<string, string>;
  radio: string;
  onAir: string;
  members: string;
  openChannel: string;
  toFront: string;
  toHq: string;
  ptt: string;
  listening: string;
  voiceMiss: string;
  mission: string;
  goal: string;
  area: string;
  time: string;
  difficulty: string;
  map: string;
  opsZone: string;
  lz: string;
  safety: string;
  comms: string;
  roster: string;
  state: string;
  kit: string;
  weather: string;
  ready: string;
  stable: string;
  level: string;
  dossier: string;
  you: string;
  othersSee: string;
  youDont: string;
  next: string;
  consequence: string;
  complete: string;
  newOp: string;
  reset: string;
  mute: string;
  unmute: string;
  leave: string;
  github: string;
  langs: Record<Lang, string>;
  roles: Record<RoleId, string>;
  paths: Record<PathId, string>;
  gearItem: Record<GearId, string>;
  gearSpec: Record<GearId, string>;
  origin: Record<Origin, string>;
  units: Record<UnitId, { name: string; blurb: string; extra: string }>;
  unitHint: string;
  airWest: string;
  airEast: string;
  channels: Record<string, string>;
  legendEarn: string;
  legendBuy: string;
  legendBoost: string;
  entryOpen: string;
  entryBuy: string;
  entryBoost: string;
};

const ua: Pack = {
  loading: "Завантаження...",
  tapContinue: "Натисніть для продовження",
  brand: "ARMY NOW UA",
  sub: "Радіочат",
  register: "Реєстрація",
  callsign: "Позивний",
  callsignPh: "ХОРТ",
  profile: "Профіль",
  pickLang: "Обери мову",
  continue: "Продовжити",
  back: "Назад",
  confirm: "Підтвердити",
  gear: "Екіпіровка",
  recv: "Статус отримання",
  roleKit: "Комплект ролі",
  startPath: "Стартовий шлях",
  gearNote: "Екіпіровка визначає роль, допуск і публічний статус.",
  unitTitle: "Вибір підрозділу",
  unitSub: "Обери підрозділ, у якому хочеш служити.",
  founded: "Заснована",
  rolesLbl: "Ролі",
  bonuses: "Бонуси",
  daily: "Інформація оновлюється щодня.",
  howTitle: "Як це працює",
  how: [
    ["Радіозв'язок", "Ти отримуєш повідомлення по рації. В ньому інформація, задача або прохання про допомогу.", "1"],
    ["Вибір", "Ти робиш вибір. Кожне рішення — це ризик, відповідальність і довіра людей.", "2"],
    ["Наслідки", "Рішення змінює хід подій. Хтось виживає. Хтось пропадає. А ти отримуєш слід назавжди.", "3"],
    ["Параметри і репутація", "Твої параметри змінюються. Люди запам'ятовують твої дії. Це твоя карма.", "4"],
  ],
  report: "Рапорт",
  reportBody: [
    "Твої параметри змінюються.",
    "Люди запам'ятовують твої дії.",
    "Це твоя карма.",
  ],
  karmaHidden: "Карма не видна тобі, але її бачать усі.",
  paramsRank: "Параметри бачить тільки старший за званням.",
  publicTrail: "Публічний слід бачать усі.",
  show: "Показати",
  statsTitle: "Параметри і репутація",
  trust: "Довіра",
  reputation: "Репутація",
  stress: "Стрес",
  authority: "Авторитет",
  statsFoot: "Карма не видна тобі, але її бачать усі.",
  tabs: {
    situation: "Ситуація",
    gear: "Спорядження",
    squad: "Загін",
    mission: "Завдання",
    dossier: "Досьє",
    radio: "Радіо",
    front: "Фронт",
  },
  radio: "Радіозв'язок",
  onAir: "ON AIR",
  members: "Учасники",
  openChannel: "Відкрити канал загону",
  toFront: "На фронт",
  toHq: "Штаб",
  ptt: "Натисни і говори · 3 с",
  listening: "Слухаю",
  voiceMiss: "Не розпізнано. Ще раз.",
  mission: "Бойове завдання",
  goal: "Мета",
  area: "Район",
  time: "Час операції",
  difficulty: "Складність",
  map: "Карта операцій",
  opsZone: "Зона операцій",
  lz: "Точка висадки",
  safety: "Безпека",
  comms: "Зв'язок",
  roster: "Склад загону",
  state: "Стан загону",
  kit: "Боєкомплект",
  weather: "Погода",
  ready: "Готовий",
  stable: "Стабільний",
  level: "Рівень",
  dossier: "Досьє",
  you: "Ти",
  othersSee: "Інші бачать твій слід.",
  youDont: "Свої іконки карми ти не бачиш.",
  next: "Далі",
  consequence: "Наслідки",
  complete: "Операцію закрито.",
  newOp: "Нова зміна",
  reset: "Скинути профіль",
  mute: "Без звуку",
  unmute: "Звук",
  leave: "Зійти з посту",
  github: "GitHub",
  langs: { ua: "UA", en: "EN", ru: "RU", pl: "PL" },
  roles: {
    fighter: "Боєць",
    medic: "Медик",
    drone: "Оператор дронів",
    comms: "Зв'язківець",
    officer: "Офіцер",
  },
  paths: {
    volunteer: "Доброволець",
    bought: "Купив",
    verified: "Перевірений",
    mobilized: "Мобілізація",
  },
  gearItem: {
    helm: "Каска",
    armor: "Бронезахист",
    radio: "Рація",
    pack: "Рюкзак",
    roleItem: "Рольовий предмет",
    public: "Публічний вклад",
  },
  gearSpec: {
    helm: "FAST · кавер · ліхтар",
    armor: "плитоноска · 4 підсумки",
    radio: "Harris · гарнітура PTT",
    pack: "рейдовий · бокові кишені",
    roleItem: "медсумка / пульт / планшет",
    public: "ящик · відкритий слід",
  },
  origin: {
    earned: "Зароблено",
    bought: "Куплено",
    boosted: "Прискорено",
    none: "Недоступно",
    lost: "Втрачено",
  },
  units: {
    infantry: {
      name: "Пехота",
      blurb: "Стрілець, штурмовик, гранатометник",
      extra: "Каска. Броня. Автомат.",
    },
    tank: {
      name: "Танкові війська",
      blurb: "Танкіст, навідник, механік-водій",
      extra: "Броня. Гармата. Гусениця.",
    },
    signal: {
      name: "Зв'язок",
      blurb: "Зв'язківець, радист, криптограф",
      extra: "Рація. Ефір. Шифр.",
    },
    air: {
      name: "Повітряні сили",
      blurb: "Пілот, технік, навідник",
      extra: "Борт залежить від шляху.",
    },
    drone: {
      name: "БПЛА",
      blurb: "Оператор дронів, інженер, ретранслятор",
      extra: "Око. Ефір. Рій.",
    },
    mortar: {
      name: "Мінометна батарея",
      blurb: "Мінометник, заряджаючий, корегувальник",
      extra: "Труба. Плита. Розрахунок.",
    },
    artillery: {
      name: "Артилерія",
      blurb: "Навідник, заряджаючий, командир гармати",
      extra: "Дальність. Влучність. Тиск.",
    },
    airdef: {
      name: "ППО",
      blurb: "Оператор ПЗРК, розрахунковий, спостерігач",
      extra: "Небо. Ракета. Тиша.",
    },
    medic: {
      name: "Медичний батальйон",
      blurb: "Медик, парамедик, евакуаційник",
      extra: "Хрест. Пульс. Життя.",
    },
    marine: {
      name: "Морська піхота",
      blurb: "Морпіх, десантник, кулеметник",
      extra: "Якір. Хвиля. Берег.",
    },
    sapper: {
      name: "Інженерні війська",
      blurb: "Сапер, мінер, фортифікатор",
      extra: "Щуп. Лопата. Прохід.",
    },
    recon: {
      name: "Розвідка",
      blurb: "Розвідник, спостерігач, снайпер",
      extra: "Бінокль. Тінь. Координата.",
    },
  },
  unitHint: "Літак ВПС залежить від стартового шляху: доброволець — F-16, мобілізація — MiG-29.",
  airWest: "F-16",
  airEast: "MiG-29",
  channels: { platoon: "Взвод", medic: "Медик", commander: "Командир" },
  legendEarn: "Чесно",
  legendBuy: "Куплено",
  legendBoost: "Прискорено",
  entryOpen: "Чесно / відкрито",
  entryBuy: "Куплено",
  entryBoost: "Прискорено / повернувся після шпиталю",
};

const en: Pack = {
  ...ua,
  loading: "Loading...",
  tapContinue: "Tap to continue",
  sub: "Radio net",
  register: "Registration",
  callsign: "Callsign",
  profile: "Profile",
  pickLang: "Choose language",
  continue: "Continue",
  back: "Back",
  confirm: "Confirm",
  gear: "Kit",
  recv: "Acquisition",
  roleKit: "Role kit",
  startPath: "Starting path",
  gearNote: "Kit defines role, access and public status.",
  unitTitle: "Choose a unit",
  unitSub: "Pick the formation you want to serve in.",
  founded: "Founded",
  rolesLbl: "Roles",
  bonuses: "Bonuses",
  daily: "Information updates daily.",
  howTitle: "How it works",
  how: [
    ["Radio", "A message comes in. Intel, a task, or a call for help.", "1"],
    ["Choice", "You decide. Each call is risk, responsibility, and other people's trust.", "2"],
    ["Consequences", "Someone lives. Someone vanishes. You keep the mark.", "3"],
    ["Stats & reputation", "Your numbers move. People remember. That is karma.", "4"],
  ],
  report: "Report",
  reportBody: ["Your stats change.", "People remember what you did.", "That is your karma."],
  karmaHidden: "You cannot see your karma. Everyone else can.",
  paramsRank: "Only a higher rank sees your parameters.",
  publicTrail: "The public trail is visible to all.",
  show: "Show",
  statsTitle: "Parameters & reputation",
  trust: "Trust",
  reputation: "Reputation",
  stress: "Stress",
  authority: "Authority",
  statsFoot: "You cannot see your karma. Everyone else can.",
  tabs: {
    situation: "Situation",
    gear: "Kit",
    squad: "Squad",
    mission: "Orders",
    dossier: "Dossier",
    radio: "Radio",
    front: "Front",
  },
  radio: "Radio",
  members: "Roster",
  openChannel: "Open squad channel",
  toFront: "To the front",
  toHq: "HQ",
  ptt: "Hold to talk · 3 s",
  listening: "Listening",
  voiceMiss: "Not recognised. Try again.",
  mission: "Combat task",
  goal: "Objective",
  area: "Area",
  time: "Window",
  difficulty: "Difficulty",
  map: "Operations map",
  opsZone: "Operations zone",
  lz: "Landing point",
  safety: "Safety",
  comms: "Comms",
  roster: "Squad",
  state: "Squad state",
  kit: "Loadout",
  weather: "Weather",
  ready: "Ready",
  stable: "Stable",
  level: "Level",
  dossier: "Dossier",
  you: "You",
  othersSee: "Others see your trail.",
  youDont: "You do not see your own karma icons.",
  next: "Next",
  consequence: "Consequences",
  complete: "Operation closed.",
  newOp: "New shift",
  reset: "Reset profile",
  mute: "Mute",
  unmute: "Sound",
  leave: "Leave post",
  github: "GitHub",
  roles: {
    fighter: "Fighter",
    medic: "Medic",
    drone: "Drone operator",
    comms: "Signaller",
    officer: "Officer",
  },
  paths: {
    volunteer: "Volunteer",
    bought: "Purchased",
    verified: "Verified",
    mobilized: "Mobilized",
  },
  gearItem: {
    helm: "Helmet",
    armor: "Armor",
    radio: "Radio",
    pack: "Pack",
    roleItem: "Role item",
    public: "Public contribution",
  },
  gearSpec: {
    helm: "FAST · cover · light",
    armor: "plate carrier · 4 pouches",
    radio: "Harris · PTT headset",
    pack: "raid pack · side pockets",
    roleItem: "med bag / controller / slate",
    public: "crate · public trail",
  },
  origin: {
    earned: "Earned",
    bought: "Bought",
    boosted: "Accelerated",
    none: "Unavailable",
    lost: "Lost",
  },
  units: {
    infantry: { name: "Infantry", blurb: "Rifle, assault, grenadier", extra: "Helmet. Plate. Rifle." },
    tank: { name: "Armour", blurb: "Commander, gunner, driver", extra: "Hull. Cannon. Tracks." },
    signal: { name: "Signals", blurb: "Signaller, radio, crypto", extra: "Handset. Air. Cipher." },
    air: { name: "Air force", blurb: "Pilot, tech, WSO", extra: "Airframe follows your path." },
    drone: { name: "UAV", blurb: "Drone op, engineer, relay", extra: "Eye. Air. Swarm." },
    mortar: { name: "Mortar battery", blurb: "Gunner, loader, spotter", extra: "Tube. Plate. Crew." },
    artillery: { name: "Artillery", blurb: "Gunner, loader, chief", extra: "Range. Hit. Pressure." },
    airdef: { name: "Air defence", blurb: "MANPADS, crew, watcher", extra: "Sky. Missile. Silence." },
    medic: { name: "Medical battalion", blurb: "Medic, paramedic, evac", extra: "Cross. Pulse. Life." },
    marine: { name: "Marines", blurb: "Marine, landing, gunner", extra: "Anchor. Wave. Shore." },
    sapper: { name: "Engineers", blurb: "Sapper, mines, fortification", extra: "Probe. Spade. Lane." },
    recon: { name: "Recon", blurb: "Scout, observer, sniper", extra: "Glass. Shadow. Grid." },
  },
  unitHint: "Air-force airframe follows your starting path: volunteer — F-16, mobilized — MiG-29.",
  airWest: "F-16",
  airEast: "MiG-29",
  channels: { platoon: "Platoon", medic: "Medic", commander: "Commander" },
  legendEarn: "Clean",
  legendBuy: "Bought",
  legendBoost: "Accelerated",
  entryOpen: "Clean / open",
  entryBuy: "Bought",
  entryBoost: "Accelerated / back from hospital",
};

const ru: Pack = {
  ...ua,
  loading: "Загрузка...",
  tapContinue: "Нажмите для продолжения",
  sub: "Радиочат",
  register: "Регистрация",
  callsign: "Позывной",
  profile: "Профиль",
  pickLang: "Выбери язык",
  continue: "Продолжить",
  back: "Назад",
  confirm: "Подтвердить",
  gear: "Экипировка",
  recv: "Статус получения",
  roleKit: "Комплект роли",
  startPath: "Стартовый путь",
  gearNote: "Экипировка определяет роль, допуск и публичный статус.",
  unitTitle: "Выбор подразделения",
  unitSub: "Выбери подразделение, в котором хочешь служить.",
  founded: "Основана",
  rolesLbl: "Роли",
  bonuses: "Бонусы",
  daily: "Информация обновляется ежедневно.",
  howTitle: "Как это работает",
  how: [
    ["Радиосвязь", "Ты получаешь сообщение по рации. В нём информация, задача или просьба о помощи.", "1"],
    ["Выбор", "Ты делаешь выбор. Каждое решение — риск, ответственность и доверие людей.", "2"],
    ["Последствия", "Решение меняет ход событий. Кто-то выживает. Кто-то пропадает. След остаётся.", "3"],
    ["Параметры и репутация", "Твои параметры меняются. Люди запоминают твои действия. Это карма.", "4"],
  ],
  report: "Рапорт",
  reportBody: ["Твои параметры меняются.", "Люди запоминают твои действия.", "Это твоя карма."],
  karmaHidden: "Карма не видна тебе, но её видят все.",
  paramsRank: "Параметры видит только старший по званию.",
  publicTrail: "Публичный след видят все.",
  show: "Показать",
  statsTitle: "Параметры и репутация",
  trust: "Доверие",
  reputation: "Репутация",
  stress: "Стресс",
  authority: "Авторитет",
  statsFoot: "Карма не видна тебе, но её видят все.",
  tabs: {
    situation: "Ситуация",
    gear: "Снаряжение",
    squad: "Отряд",
    mission: "Задание",
    dossier: "Досье",
    radio: "Радио",
    front: "Фронт",
  },
  radio: "Радиосвязь",
  members: "Участники",
  openChannel: "Открыть канал отряда",
  toFront: "На фронт",
  toHq: "Штаб",
  ptt: "Нажми и говори · 3 с",
  listening: "Слушаю",
  voiceMiss: "Не распознано. Ещё раз.",
  mission: "Боевая задача",
  goal: "Цель",
  area: "Район",
  time: "Время операции",
  difficulty: "Сложность",
  map: "Карта операций",
  opsZone: "Зона операций",
  lz: "Точка высадки",
  safety: "Безопасность",
  comms: "Связь",
  roster: "Состав отряда",
  state: "Состояние отряда",
  kit: "Боекомплект",
  weather: "Погода",
  ready: "Готов",
  stable: "Стабильный",
  level: "Уровень",
  dossier: "Досье",
  you: "Ты",
  othersSee: "Другие видят твой след.",
  youDont: "Свои иконки кармы ты не видишь.",
  next: "Дальше",
  consequence: "Последствия",
  complete: "Операция закрыта.",
  newOp: "Новая смена",
  reset: "Сбросить профиль",
  mute: "Без звука",
  unmute: "Звук",
  leave: "Покинуть пост",
  github: "GitHub",
  roles: {
    fighter: "Боец",
    medic: "Медик",
    drone: "Оператор дронов",
    comms: "Связист",
    officer: "Офицер",
  },
  paths: {
    volunteer: "Доброволец",
    bought: "Купил",
    verified: "Проверенный",
    mobilized: "Мобилизация",
  },
  gearItem: {
    helm: "Каска",
    armor: "Броня",
    radio: "Рация",
    pack: "Рюкзак",
    roleItem: "Предмет роли",
    public: "Публичный вклад",
  },
  gearSpec: {
    helm: "FAST · кавер · фонарь",
    armor: "плитоноска · 4 подсумка",
    radio: "Harris · гарнитура PTT",
    pack: "рейдовый · боковые карманы",
    roleItem: "медсумка / пульт / планшет",
    public: "ящик · открытый след",
  },
  origin: {
    earned: "Заработано",
    bought: "Куплено",
    boosted: "Ускорено",
    none: "Недоступно",
    lost: "Утеряно",
  },
  units: {
    infantry: { name: "Пехота", blurb: "Стрелок, штурмовик, гранатомётчик", extra: "Каска. Броня. Автомат." },
    tank: { name: "Танковые войска", blurb: "Танкист, наводчик, механик-водитель", extra: "Броня. Пушка. Гусеница." },
    signal: { name: "Связь", blurb: "Связист, радист, криптограф", extra: "Рация. Эфир. Шифр." },
    air: { name: "Воздушные силы", blurb: "Пилот, техник, оператор", extra: "Борт зависит от пути." },
    drone: { name: "БПЛА", blurb: "Оператор дронов, инженер, ретранслятор", extra: "Глаз. Эфир. Рой." },
    mortar: { name: "Миномётная батарея", blurb: "Миномётчик, заряжающий, корректировщик", extra: "Труба. Плита. Расчёт." },
    artillery: { name: "Артиллерия", blurb: "Наводчик, заряжающий, командир орудия", extra: "Дальность. Точность. Натиск." },
    airdef: { name: "ПВО", blurb: "Оператор ПЗРК, расчёт, наблюдатель", extra: "Небо. Ракета. Тишина." },
    medic: { name: "Медицинский батальон", blurb: "Медик, парамедик, эвакуация", extra: "Крест. Пульс. Жизнь." },
    marine: { name: "Морская пехота", blurb: "Морпех, десантник, пулемётчик", extra: "Якорь. Волна. Берег." },
    sapper: { name: "Инженерные войска", blurb: "Сапёр, минёр, фортификатор", extra: "Щуп. Лопата. Проход." },
    recon: { name: "Разведка", blurb: "Разведчик, наблюдатель, снайпер", extra: "Бинокль. Тень. Координата." },
  },
  unitHint: "Самолёт ВВС зависит от стартового пути: доброволец — F-16, мобилизация — MiG-29.",
  airWest: "F-16",
  airEast: "MiG-29",
  channels: { platoon: "Взвод", medic: "Медик", commander: "Командир" },
  legendEarn: "Честно",
  legendBuy: "Куплено",
  legendBoost: "Ускорено",
  entryOpen: "Честно / открыто",
  entryBuy: "Куплено",
  entryBoost: "Ускорено / вернулся из госпиталя",
};

const pl: Pack = {
  ...ua,
  loading: "Ładowanie...",
  tapContinue: "Dotknij, aby kontynuować",
  sub: "Radioczat",
  register: "Rejestracja",
  callsign: "Znak wywoławczy",
  profile: "Profil",
  pickLang: "Wybierz język",
  continue: "Kontynuuj",
  back: "Wstecz",
  confirm: "Potwierdź",
  gear: "Wyposażenie",
  recv: "Status uzyskania",
  roleKit: "Zestaw roli",
  startPath: "Ścieżka startowa",
  gearNote: "Wyposażenie określa rolę, dostęp i status publiczny.",
  unitTitle: "Wybór pododdziału",
  unitSub: "Wybierz jednostkę, w której chcesz służyć.",
  founded: "Założona",
  rolesLbl: "Role",
  bonuses: "Bonusy",
  daily: "Informacje odświeżane codziennie.",
  howTitle: "Jak to działa",
  how: [
    ["Łączność", "Dostajesz meldunek. Informacja, zadanie albo prośba o pomoc.", "1"],
    ["Wybór", "Decydujesz. Każda decyzja to ryzyko, odpowiedzialność i zaufanie ludzi.", "2"],
    ["Konsekwencje", "Ktoś przeżywa. Ktoś znika. Ślad zostaje.", "3"],
    ["Parametry i reputacja", "Twoje liczby się zmieniają. Ludzie pamiętają. To twoja karma.", "4"],
  ],
  report: "Raport",
  reportBody: ["Twoje parametry się zmieniają.", "Ludzie pamiętają twoje czyny.", "To twoja karma."],
  karmaHidden: "Karmy nie widzisz ty. Widzą ją wszyscy inni.",
  paramsRank: "Parametry widzi tylko starszy stopniem.",
  publicTrail: "Ślad publiczny widzą wszyscy.",
  show: "Pokaż",
  statsTitle: "Parametry i reputacja",
  trust: "Zaufanie",
  reputation: "Reputacja",
  stress: "Stres",
  authority: "Autorytet",
  statsFoot: "Karmy nie widzisz ty. Widzą ją wszyscy inni.",
  tabs: {
    situation: "Sytuacja",
    gear: "Sprzęt",
    squad: "Oddział",
    mission: "Zadanie",
    dossier: "Teczka",
    radio: "Radio",
    front: "Front",
  },
  radio: "Łączność",
  members: "Uczestnicy",
  openChannel: "Otwórz kanał oddziału",
  toFront: "Na front",
  toHq: "Sztab",
  ptt: "Przytrzymaj i mów · 3 s",
  listening: "Słucham",
  voiceMiss: "Nie rozpoznano. Jeszcze raz.",
  mission: "Zadanie bojowe",
  goal: "Cel",
  area: "Rejon",
  time: "Czas operacji",
  difficulty: "Trudność",
  map: "Mapa operacji",
  opsZone: "Strefa operacji",
  lz: "Punkt desantu",
  safety: "Bezpieczeństwo",
  comms: "Łączność",
  roster: "Skład",
  state: "Stan oddziału",
  kit: "Komplet",
  weather: "Pogoda",
  ready: "Gotowy",
  stable: "Stabilny",
  level: "Poziom",
  dossier: "Teczka",
  you: "Ty",
  othersSee: "Inni widzą twój ślad.",
  youDont: "Własnych ikon karmy nie widzisz.",
  next: "Dalej",
  consequence: "Konsekwencje",
  complete: "Operacja zamknięta.",
  newOp: "Nowa zmiana",
  reset: "Reset profilu",
  mute: "Cisza",
  unmute: "Dźwięk",
  leave: "Zejdź z posterunku",
  github: "GitHub",
  roles: {
    fighter: "Żołnierz",
    medic: "Medyk",
    drone: "Operator dronów",
    comms: "Łącznościowiec",
    officer: "Oficer",
  },
  paths: {
    volunteer: "Ochotnik",
    bought: "Kupione",
    verified: "Zweryfikowany",
    mobilized: "Mobilizacja",
  },
  gearItem: {
    helm: "Hełm",
    armor: "Kamizelka",
    radio: "Radio",
    pack: "Plecak",
    roleItem: "Przedmiot roli",
    public: "Wkład publiczny",
  },
  gearSpec: {
    helm: "FAST · pokrowiec · latarka",
    armor: "płyty · 4 ładownice",
    radio: "Harris · zestaw PTT",
    pack: "rajdowy · kieszenie boczne",
    roleItem: "apteczka / pulpit / tablet",
    public: "skrzynia · ślad publiczny",
  },
  origin: {
    earned: "Zdobyte",
    bought: "Kupione",
    boosted: "Przyspieszone",
    none: "Niedostępne",
    lost: "Utracone",
  },
  units: {
    infantry: { name: "Piechota", blurb: "Strzelec, szturm, granatnik", extra: "Hełm. Płyta. Karabin." },
    tank: { name: "Wojska pancerne", blurb: "Dowódca, celowniczy, kierowca", extra: "Pancerz. Armata. Gąsienica." },
    signal: { name: "Łączność", blurb: "Łącznościowiec, radio, crypto", extra: "Słuchawka. Eter. Szyfr." },
    air: { name: "Siły powietrzne", blurb: "Pilot, technik, operator", extra: "Samolot zależy od ścieżki." },
    drone: { name: "BSP", blurb: "Operator, inżynier, przekaźnik", extra: "Oko. Eter. Rój." },
    mortar: { name: "Bateria moździerzy", blurb: "Moździerz, ładowniczy, obserwator", extra: "Lufa. Płyta. Obsługa." },
    artillery: { name: "Artyleria", blurb: "Celowniczy, ładowniczy, dowódca", extra: "Zasięg. Trafienie. Nacisk." },
    airdef: { name: "OPL", blurb: "MANPADS, obsługa, obserwator", extra: "Niebo. Rakieta. Cisza." },
    medic: { name: "Batalion medyczny", blurb: "Medyk, ratownik, ewakuacja", extra: "Krzyż. Puls. Życie." },
    marine: { name: "Piechota morska", blurb: "Marynarz, desant, km", extra: "Kotwica. Fala. Brzeg." },
    sapper: { name: "Wojska inżynieryjne", blurb: "Saper, miny, fortyfikacje", extra: "Sonda. Łopata. Przejście." },
    recon: { name: "Zwiad", blurb: "Zwiadowca, obserwator, snajper", extra: "Lornetka. Cień. Siatka." },
  },
  unitHint: "Samolot sił powietrznych zależy od ścieżki: ochotnik — F-16, mobilizacja — MiG-29.",
  airWest: "F-16",
  airEast: "MiG-29",
  channels: { platoon: "Pluton", medic: "Medyk", commander: "Dowódca" },
  legendEarn: "Czysto",
  legendBuy: "Kupione",
  legendBoost: "Przyspieszone",
  entryOpen: "Czysto / otwarcie",
  entryBuy: "Kupione",
  entryBoost: "Przyspieszone / powrót ze szpitala",
};

export const I18N: Record<Lang, Pack> = { ua, en, ru, pl };
