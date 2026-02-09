# Personal Portfolio Website - Implementation Plan

## 1. Recommended Tech Stack

| Layer        | Choice         | Rationale                                                        |
| ------------ | -------------- | ---------------------------------------------------------------- |
| **Markup**   | HTML5          | Semantic, accessible, no build step needed                       |
| **Styling**  | CSS3 (vanilla) | Custom properties for theming, no dependencies                   |
| **Behavior** | Vanilla JS     | Minimal interactivity needed; avoids framework overhead          |
| **Hosting**  | GitHub Pages   | Free, fast CDN, custom domain support, deploys from a git push   |

**Why no framework?** A portfolio is a mostly-static, content-driven site. A framework (React, Next.js, Astro) would add build tooling, dependencies, and complexity with no meaningful benefit here. A single HTML file with linked CSS/JS loads fastest, is easiest to maintain, and demonstrates solid fundamentals - which is itself a good signal on a developer portfolio.

---

## 2. File Structure

```
my-portfolio/
├── index.html          # Single-page layout with all four sections
├── css/
│   └── styles.css      # All styles (custom properties, responsive layout)
├── js/
│   └── main.js         # Smooth scroll, mobile nav toggle, scroll animations
├── assets/
│   └── images/         # Project thumbnails, profile photo (if any)
├── plan.md             # This file
└── README.md           # Project description (optional)
```

---

## 3. Design Considerations

### Layout
- **Single-page scroll** with fixed/sticky navigation linking to each section
- **Mobile-first** responsive design using CSS Grid and Flexbox
- Breakpoints: 480px (mobile), 768px (tablet), 1024px+ (desktop)

### Typography & Color
- System font stack (`-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif`) for zero-latency rendering
- Neutral dark background (`#0f172a`) with light text for a modern developer look
- Accent color (`#3b82f6` blue) for links, buttons, and highlights

### Sections

| Section     | Content                                                        |
| ----------- | -------------------------------------------------------------- |
| **Hero**    | Full-viewport height, name, tagline, CTA button to projects   |
| **Projects**| 2x2 responsive grid of project cards (thumbnail, title, desc, link) |
| **About**   | Two-column layout: bio text + optional profile image           |
| **Contact** | Centered block with Twitter and LinkedIn icon links            |

### Accessibility
- Semantic HTML (`<header>`, `<main>`, `<section>`, `<footer>`, `<nav>`)
- ARIA labels on icon-only links
- Keyboard-navigable focus states
- Sufficient color contrast (WCAG AA minimum)

### Performance
- No external CSS/JS frameworks to load
- Optimized images (WebP format, lazy loading)
- Minimal JS - only progressive enhancement

---

## 4. Step-by-Step Implementation Plan

### Step 1: Scaffold HTML structure
- Create `index.html` with semantic sections: nav, hero, projects, about, contact, footer
- Add placeholder content for each section
- Link CSS and JS files

### Step 2: Build the CSS foundation
- Create `css/styles.css`
- Define CSS custom properties (colors, spacing, fonts)
- Set up CSS reset/normalize
- Implement responsive navigation bar

### Step 3: Style the Hero section
- Full-viewport height with centered content
- Name as `<h1>`, tagline as `<p>`, CTA button
- Subtle background gradient or pattern

### Step 4: Style the Projects section
- Responsive 2x2 grid (stacks to 1 column on mobile)
- Card component: thumbnail, title, short description, link
- Hover effects on cards

### Step 5: Style the About section
- Two-column layout (text + image placeholder)
- Collapses to single column on mobile

### Step 6: Style the Contact section
- Centered layout with social links (Twitter, LinkedIn)
- SVG icons for social platforms
- Hover animation on icons

### Step 7: Add interactivity (JS)
- Smooth scrolling for nav links
- Mobile hamburger menu toggle
- Optional: subtle scroll-triggered fade-in animations

### Step 8: Polish and test
- Test across screen sizes (responsive)
- Verify accessibility (keyboard nav, screen reader)
- Validate HTML/CSS
- Replace placeholder content with real data
