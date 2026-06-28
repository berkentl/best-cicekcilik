# Behaviors — ribbonflowers.com

## Scroll Behaviors
- **Header:** sticky, z-index 888. Appears to hide/show on scroll (top: -185px when hidden). No JS shrink detected — stays same size.
- **No smooth scroll library** detected (no .lenis, no locomotive-scroll)
- **No scroll-snap** on body

## Interactive Elements

### Hero Slider
- **Interaction model:** time-driven auto-advance + click arrows
- **Effect:** fade (class: `slider-effect-fade`)
- **Height:** ~712px (50% of 1440px width)
- **Images:** 2800×1400px source, displayed at viewport width
- **Slides:** 6 slides total

### Navigation Mega Menu
- **Interaction model:** hover-driven dropdown
- Top-level items reveal submenu on hover
- Submenu slides down (CSS transition)

### SpotlightBanner Toggle
- **Interaction model:** click-driven tab switching
- Button at ~3008px: toggles between product sets
- Button bg: `#3d7b74`, text white

### Product Cards
- **Hover state:** second image fades in (absolute positioned overlay image)
- **Quick add button** appears on hover at bottom of card image
- Card border-radius: minimal (flat design)

## Responsive Breakpoints
- Desktop: 1440px (3-col product grid)
- Tablet: ~768px (2-col or stacked)
- Mobile: 390px (1-col, hamburger menu)

## Announcement Bar
- Text: "Saat 14'e kadar verilen siparişlerde; Tüm İstanbul'a Aynı Gün Çiçek Teslimat yapıyoruz."
- Position: top of page, above header
- Adapted for Best: keep same messaging style
