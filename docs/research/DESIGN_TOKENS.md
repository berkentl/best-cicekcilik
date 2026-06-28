# Design Tokens — ribbonflowers.com

## Fonts
- **Body:** `KumbhSans-Regular, sans-serif` (self-hosted), fallback `Kumbh Sans` from Google Fonts
  - Google Fonts URL: `https://fonts.googleapis.com/css2?family=Kumbh+Sans:wght@100..900&display=swap`
  - Weights used: 400, 500, 600
- **Headings (h1, h2):** `"Playfair Display", serif`
  - Google Fonts URL: `https://fonts.googleapis.com/css2?family=Playfair+Display:wght@100..900&display=swap`
  - Weights used: 400, 500, 600, 700

## Colors
| Token | Hex | RGB | Usage |
|-------|-----|-----|-------|
| background | `#ffffff` | rgb(255,255,255) | Page background |
| foreground | `#333333` | rgb(51,51,51) | Primary text |
| text-secondary | `#545454` | rgb(84,84,84) | Secondary text, nav links |
| text-muted | `#999999` | rgb(153,153,153) | Muted text, placeholder |
| primary | `#1d3435` | rgb(29,52,53) | Primary buttons, CTA |
| primary-dark | `#063735` | rgb(6,55,53) | Footer background |
| accent | `#3d7b74` | rgb(61,123,116) | Toggle buttons, spotlight |
| border | `#e8e8e8` | — | Card borders |
| white | `#ffffff` | rgb(255,255,255) | Button text on dark |

## Typography Scale
| Element | Size | Weight | Font |
|---------|------|--------|------|
| h1 | varies | 400-700 | Playfair Display |
| h2 | varies | 400-600 | Playfair Display |
| body | 14px | 400 | Kumbh Sans |
| nav links | 13px | 600 | Kumbh Sans |
| menu-link | 14px | 400 | Kumbh Sans |
| caption | 14px | 500 | Kumbh Sans |

## Spacing
- Content max-width: 1258px
- Container margin: 0 auto (33.5px each side at 1440px)
- Product grid gap: 15px
- Grid: 3 columns at 409px each

## Header
- Height: ~111px
- Background: white
- Position: sticky top
- Box-shadow: `0 1px 3px 0 rgba(0,0,0,0.1)`
- z-index: 888

## Buttons
- Primary: bg `#1d3435`, color white, border-radius varies
- Link-style: color `#545454`, underline on hover
- Animate class: `.animate-hover-btn`

## Product Grid
- display: grid
- grid-template-columns: repeat(3, 1fr)
- gap: 15px
- Each card: ~409px wide

## Footer
- Background: `#063735` (dark teal)
- Text color: white
- Height: ~788px
