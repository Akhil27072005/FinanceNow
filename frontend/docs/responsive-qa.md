# Responsive QA Checklist

Manual verification matrix for FinanceNow responsive layouts. Use Chrome DevTools device mode plus at least one real iOS and Android device before release.

## Breakpoints

| Token | Max width | Shell | Notes |
|-------|-----------|-------|-------|
| xs | 479px | Mobile drawer | Single-column content, 12px padding |
| sm | 639px | Mobile drawer | Compact headers (22px titles) |
| md | 767px | Mobile drawer | Filter sheets, full-width drawers |
| lg | 1023px | Desktop sidebar | Tablet grid reflow |
| xl | 1024px+ | Desktop sidebar | Dashboard viewport-fit layout |

## Device matrix

| Device class | Width | Routes to verify |
|--------------|-------|------------------|
| iPhone SE | 375 | Shell drawer, Transactions, Dashboard |
| iPhone 14 Pro | 390 | Marketing hamburger, Contact form |
| iPad Mini | 768 | Sidebar visible, Settings dual layout |
| iPad Pro | 1024 | Dashboard fit layout, Reports grid |
| Desktop | 1440 | Unchanged regression |

## Authenticated app

- [ ] Hamburger opens full nav (Insights + Catalog groups expanded on mobile)
- [ ] Drawer closes on route change, backdrop tap, Escape
- [ ] No permanent sidebar chrome below 768px
- [ ] Dashboard scrolls on tablet/phone; fits viewport on desktop (1024px+)
- [ ] Transactions filters: horizontal type tabs + bottom filter sheet
- [ ] Reports filters: bottom sheet popover on phone
- [ ] Payment methods tables stack as cards on phone
- [ ] Modals use bottom-sheet style below 640px
- [ ] Settings save bar sticky with safe-area padding on phone

## Marketing

- [ ] Hamburger exposes all nav links (including disabled Blog state)
- [ ] No horizontal page scroll at 320px on landing, features, about, pricing, contact
- [ ] Auth cards readable at 480px and below

## Dev tooling

- `/dev/responsive` — viewport width indicator + quick route links (development only)
- `/dev/loading` — loading screen preview (development only)

## Accessibility

- [ ] Tap targets ≥ 44×44px on hamburger, sidebar items, pagination, filter chips
- [ ] `prefers-reduced-motion`: drawer and modal transitions disabled
- [ ] Focus trap / keyboard: modals and drawers dismiss with Escape
