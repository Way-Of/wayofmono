# Changelog

All notable changes to `@juicesharp/rpiv-site` are documented here.

Format: [Keep a Changelog](https://keepachangelog.com/en/1.1.0/).
Versioning: [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

## [1.3.0] - 2026-05-08

### Added
- GitHub masthead link in the top navigation bar.

### Changed
- Off-scale typography, motion, and radius values consolidated into shared CSS custom properties.
- Skill key parity enforced at compile time; pipeline tokens use `color-mix()` instead of inline `rgba()` literals.

### Fixed
- Muted text color tokens lifted to pass WCAG AA contrast on small monospaced labels.

### Performance
- Critical CSS inlined into HTML to eliminate the render-blocking stylesheet chain.
- Latin woff2 font preloaded to flatten the critical rendering path.
- Scroll-spy offsets cached at layout time to avoid forced reflow during scroll.
- JetBrains Mono self-hosted via Fontsource to remove the third-party CDN render-blocking delay.

## [1.2.1] - 2026-05-07

### Added
- Pipeline section replaced with horizontal emaki disclosure — six scroll-snap panels with a "collects / why / produces" schema per step, plus mouse drag-to-scroll, keyboard navigation, and an IntersectionObserver-driven reveal animation.
- Pipeline section marks `/skill:discover` as optional with a dashed border and muted chip, and expands the ShipLoop section to four skills.

### Fixed
- Pipeline metadata keys are now enforced at compile time — adding a step to the pipeline array without a matching metadata entry fails TypeScript instead of silently omitting the panel's copy at runtime.

## [1.2.0] - 2026-05-07

### Added
- `scope-tracer` agent and `/skill:changelog` skill listed on the agents and skills pages with updated visitor copy.
- Version imprint in the top nav (between brand and section counter) and a quiet “EDITION · vX.Y.Z” line below the colophon rail. Both read from a single `lib/version.ts` that imports the lockstep version from `rpiv-pi/package.json` — the next release bump propagates automatically with zero hand edits. Nav imprint links to the pinned-version page on npm.

### Fixed
- X social card switched to summary + square logo for reliable preview rendering on low-engagement domains.
- Nav version imprint aligned on the same typographic baseline as the brand mark at desktop viewports.

## [1.1.5] - 2026-05-05
