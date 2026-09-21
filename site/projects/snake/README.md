# Snake — JavaScript browser rebuild

A playable browser version of Snake for António's programming portfolio.

## Project context

This project revisits the Snake exercise from Angela Yu's *100 Days of Code: The Complete Python Pro Bootcamp*. The course project used Python and Turtle. This version is a new JavaScript implementation for direct browser play; it is not copied from the public reference repositories used during recovery.

## Current features

- Canvas-based 20 × 20 board
- Arrow-key and WASD controls
- Touch/click direction pad
- Food, growth, score, wall collision, and self-collision
- High score saved in browser `localStorage`
- Responsive interface and accessible status updates

## Run locally

From the repository root:

```bash
python -m http.server 8765 --directory site
```

Then open:

```text
http://127.0.0.1:8765/projects/snake/
```

## Tests

```bash
node --test tests/*.test.mjs
node --check site/projects/snake/game.mjs
node --check site/projects/snake/game-engine.mjs
```

The game rules are isolated in `game-engine.mjs`, allowing them to be tested without a browser.

## Authorship and assistance

- **Course inspiration:** Angela Yu's Python bootcamp Snake project
- **Rebuild and portfolio direction:** António
- **Implementation and testing assistance:** Hermes/Kuramon_Python (AI)

This README will be updated as António reviews, understands, and modifies the project.
