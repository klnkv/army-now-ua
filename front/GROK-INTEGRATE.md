# Front — twin-stick + карти БЗВП

Папка `front/` — режим Фронт для ARMY NOW UA.

Репозиторій: https://github.com/klnkv/army-now-ua

## Що всередині

- Twin-stick, солдат / танк / дрон / ППО / авіація
- Екіпіровка: сидячий кадр (base / helm / armor / full). Старт голий.
- 12 top-down карт БЗВП у `public/sprites/maps/`
- Повітряний режим: небо, без пропів, дрони. ППО з землі б'є літаки й дрони.
- FPV: квиток за 600 очок фронту, 15 с
- Штаб, реєстрація (iOS caret у полі позивного), рація PTT 3 с
- Без герба в UI

Точка входу: `front/src/components/army-app.tsx` → `<ArmyApp />`
Фронт: `front/src/front/Front.tsx` + `engine.ts`
FPV: `front/src/fpv/game-app.tsx` + `front/src/game/`

## Як вбудувати в Grok Build

> Підтягни Front з **https://github.com/klnkv/army-now-ua** (папка `front/`).
> Не переписуй гру з нуля.
>
> 1. Скопіюй `front/src/army` → `src/army`
> 2. Скопіюй `front/src/front` → `src/front`
> 3. Скопіюй `front/src/fpv` → `src/fpv`
> 4. Скопіюй `front/src/game` → `src/game`
> 5. Скопіюй `front/src/components/army-app.tsx`
> 6. Скопіюй `front/src/styles.css` (`.cs-input`, chalk)
> 7. Скопіюй `front/src/routes/__root.tsx` (viewport: `interactive-widget=overlays-content`)
> 8. Скопіюй `front/public/art` і `front/public/sprites` → `public/`
> 9. Рендер `<ArmyApp />` як корінь гри
