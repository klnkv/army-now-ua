# ARMY NOW UA

Радіонет, екіпіровка, ізометричний фронт, FPV-місія.

**Репозиторій:** https://github.com/klnkv/army-now-ua

## Папки

| Шлях | Що це |
|---|---|
| `front/` | Основна гра + режим Фронт (twin-stick, екіпіровка, штаб) |
| `fpv/` | Камікадзе FPV 15с (окрема місія) |

## Front

Точка входу: `front/src/components/army-app.tsx`

- Реєстрація / екіпіровка / рід військ
- Фронт: ізометрія, twin-stick
- Паралакс карти
- Рація PTT, 3 секунди

Інтеграція: `front/GROK-INTEGRATE.md`

## FPV

Точка входу: `fpv/src/components/game-app.tsx`

Інтеграція: `fpv/GROK-INTEGRATE.md`

## Grok Build

Новий чат:

> Підтягни ARMY NOW UA з **https://github.com/klnkv/army-now-ua**.
> `front/` — основна гра і Фронт. `fpv/` — місія FPV.
> Не переписуй з нуля. Збери обидва режими в один процес.
