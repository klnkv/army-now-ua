# Front — isometric twin-stick

Папка `front/` — режим Фронт для ARMY NOW UA.

Репозиторий: https://github.com/klnkv/army-now-ua

## Що всередині

- Twin-stick ізометрія, солдат / танк / дрон
- Екіпіровка: сидячий базовий кадр + шари каски, броні, берців, рації, рюкзака
- Карта-паралакс (верт / горизонт)
- Штаб, реєстрація, вибір підрозділу, рація PTT 3с
- Без герба в UI

Точка входу: `front/src/components/army-app.tsx` → `<ArmyApp />`
Фронт: `front/src/front/Front.tsx` + `engine.ts`

## Як вбудувати в Grok Build

> Підтягни Front з **https://github.com/klnkv/army-now-ua** (папка `front/`).
> Не переписуй гру з нуля.
>
> 1. Скопіюй `front/src/army` → `src/army`
> 2. Скопіюй `front/src/front` → `src/front`
> 3. Скопіюй `front/src/components/army-app.tsx`
> 4. Скопіюй `front/src/styles.css` (або влий `.map-parallax`, `.cs-input`, chalk)
> 5. Скопіюй `front/public/art` і `front/public/sprites` → `public/`
> 6. Рендер `<ArmyApp />` як корінь гри
> 7. FPV лишається окремою місією з папки `fpv/`
