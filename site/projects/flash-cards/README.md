# Flash Cards — JavaScript browser rebuild

A browser adaptation of the Flash Card App exercise from Angela Yu's *100 Days of Code: The Complete Python Pro Bootcamp*.

## Current features

- Locally curated French-to-English vocabulary deck
- Reveal button plus keyboard/card activation
- Mark words as known or keep practising them
- Progress stored only in this browser using `localStorage`
- Reset button to restart the deck
- Responsive, keyboard-accessible interface and live status updates

## Run locally

```bash
python -m http.server 8767 --directory site
node --test tests/flash-cards-engine.test.mjs tests/flash-cards-ui.test.mjs
```

## Authorship and assistance

- **Course inspiration:** Angela Yu's Python Flash Card App
- **Portfolio direction and review:** António
- **JavaScript implementation and testing assistance:** Hermes/Kuramon_Python (AI)
- **Vocabulary:** a small locally curated sample; the course CSV is not redistributed here.

This is a new JavaScript implementation rather than a copy of the course or public reference-repository source.
