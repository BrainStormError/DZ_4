## 1. Лента поздравлений — статичная полоса

- [x] 1.1 В `components/features/WishBoard.tsx` удалить дублирующую `<ul aria-hidden>`, состояния `isOverflowing`/`prefersReducedMotion`, эффекты с `ResizeObserver` и `matchMedia`, вычисление `isLooping`, переменные `containerRef`/`listRef`; оставить один `<ul>` в блоке с `overflow-x-auto` и `tabIndex={0}`. Проверка: в файле нет вхождений `isLooping`, `ResizeObserver`, `wish-marquee`.
- [x] 1.2 Проверить поведение ленты: при малом числе карточек — статичная полоса без дублей, при переполнении — горизонтальная прокрутка вручную, фокус с клавиатуры. Проверка: `npm run typecheck` и визуальный прогон на главной странице.
- [x] 1.3 В `app/globals.css` удалить `@keyframes wish-marquee`, `.wish-marquee-track--looping`, правила `:hover`/`:focus-within`, блок `@media (prefers-reduced-motion)` для ленты. Проверка: grep по `wish-marquee` не находит вхождений в проекте.

## 2. Шапка без размытия

- [x] 2.1 В `components/layout/Header.tsx:84` заменить `bg-background/80 backdrop-blur-md` на `bg-background`. Проверка: в файле нет `backdrop-blur`; прокрутка главной не показывает размытия под шапкой.

## 3. Тени — лёгкая замена

- [x] 3.1 В `app/globals.css` удалить определения `--card-shadow` в трёх темах и класс `.card-shadow`. Проверка: grep по `--card-shadow` и `card-shadow` не находит вхождений.
- [x] 3.2 Удалить класс `card-shadow` из ~15 мест применения в `app/**` и `components/**`, не добавляя новых теней (карточки опираются на `shadow-sm` и `border` из `components/ui/card.tsx`). Проверка: grep по `card-shadow` пуст, `npm run typecheck` проходит.
- [x] 3.3 Проверить разделение карточек в трёх темах (`warm`, `festival`, `premium`). Проверка: визуальный прогон главной, календаря, FAQ, админки, логина без «слипания» границ.

## 4. Микровзаимодействие карточки именинника

- [x] 4.1 В `components/features/BirthdayCard.tsx:37` заменить `transition-all` на `transition-transform`, сохранив `hover:scale-[1.02]`. Проверка: в файле `transition-all` отсутствует, ховер-увеличение работает.

## 5. Удаление недостижимого декоративного CSS

- [x] 5.1 Удалить из `app/globals.css` классы/`@keyframes`: `confetti-fall`/`.confetti-piece`, `gentle-float`/`.gentle-float`, `subtle-shimmer`/`.subtle-shimmer`, `festival-tilt`, `festival-gradient-text`, `festival-card-glow`, `warm-soft-shadow`. `hero-overlay` и `--hero-overlay` сохранить. Проверка: grep по каждому имени класса не находит ссылок в `app/**`, `components/**`, `lib/**`.
- [x] 5.2 Подтвердить, что удалённые классы нигде не используются динамически. Проверка: `npm run lint` и `npm run build` завершаются без ошибок.

## 6. Синхронизация спецификаций

- [x] 6.1 Согласовать незаархивированное изменение `fix-review-round-8` (его дельта `wishes` «Лента поздравлений не зацикливает рендеринг» теряет смысл). Проверка: `openspec list` не показывает конфликтующих активных изменений по `wishes`, либо их дельты согласованы.
- [x] 6.2 Запустить `openspec validate reduce-visual-effects` — изменение валидно; затем применить и заархивировать дельты `wishes` и `performance`. Проверка: `openspec validate reduce-visual-effects` сообщает `is valid`.

## 7. Итоговая проверка

- [x] 7.1 Прогнать `npm run lint`, `npm run typecheck`, `npm run build` без ошибок. Проверка: все три команды завершаются успешно.
- [x] 7.2 Проверить в браузере отсутствие непрерывных анимаций и размытия (вкладка Performance/Rendering, отсутствие постоянных перерисовок в покое). Проверка: при простое страницы нет активных анимаций.
