# Turtle Crossing — JavaScript browser rebuild

A browser adaptation of the Turtle Crossing exercise from Angela Yu's *100 Days of Code: The Complete Python Pro Bootcamp*.

## Current features

- Canvas-rendered road, turtle, and traffic
- Arrow-key, WASD, and touch controls
- Random traffic lanes and colours
- Collision detection and game-over state
- Progressive levels with increasing traffic speed
- Responsive interface and accessible status updates

## Test locally

```bash
python -m http.server 8766 --directory site
node --test tests/turtle-engine.test.mjs tests/turtle-ui.test.mjs
```

## Authorship and assistance

- **Course inspiration:** Angela Yu's Python Turtle Crossing project
- **Portfolio direction and review:** António
- **JavaScript implementation and testing assistance:** Hermes/Kuramon_Python (AI)

This is a new JavaScript implementation, not a copy of the public reference repository used to recover the project outline.
