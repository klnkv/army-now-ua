# ARMY NOW UA — FPV-режим

Камикадзе FPV-миссия для основной игры.

Репозиторий: https://github.com/klnkv/army-now-ua

## Что внутри

Папка `fpv/` — готовый режим, не вся игра.

- 15 секунд полёта, удар по цели / срыв
- Мокрый разрушенный город, белые руины, пехота и техника
- HUD ARMY NOW UA (украинский)
- Клавиатура: WASD, A влево / D вправо по рысканью
- Телефон: стик появляется под пальцем — левая половина газ/рискання, правая прицел
- Текст HUD не выделяется (iOS), экран не скроллится
- iOS: Lambert, мало draw call; десктоп: мокрый камень Standard

Точка входа: `fpv/src/components/game-app.tsx` → `<GameApp />`

Зависимости: `three`, `@react-three/fiber`, `@react-three/drei`, `zustand`

## Как встроить в основной проект Grok Build

Открой чат основной игры и вставь:

> Подтяни FPV-режим из репозитория **https://github.com/klnkv/army-now-ua** (папка `fpv/`).
> Встрой как миссию в основной процесс игры. Не переписывай игру с нуля.
>
> 1. Скопируй `fpv/src/game` → `src/game` (или `src/modes/fpv`).
> 2. Скопируй `fpv/src/components` (GameApp, briefing, HUD, стики, canvas).
> 3. Влей стили из `fpv/src/styles-fpv.css` (тема ink/chalk, `.hud-mark`, стики).
> 4. Поставь `three`, `@react-three/fiber`, `@react-three/drei`, `zustand`.
> 5. Импорты `@/game/...` и `@/components/...` сохрани.
> 6. Из основного процесса открывай `<GameApp />` как миссию.
> 7. После удара или срыва — возврат в основную игру (добавь `onExit` на GameApp, если его ещё нет).
>
> Режим: камикадзе FPV 15с, мокрый город, мелкие белые руины, пехота и техника.
> Стик под пальцем. HUD не выделяется. A влево, D вправо. Не ломай основной процесс.

## Файлы

```
fpv/src/game/          симуляция, карта, юниты, качество
fpv/src/components/    GameApp, брифинг, HUD, стики, canvas
fpv/src/styles-fpv.css HUD + iOS no-select + стики
```
