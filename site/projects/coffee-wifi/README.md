# Coffee & WiFi — JavaScript browser rebuild

A browser adaptation of the Coffee & WiFi Flask exercise from Angela Yu's *100 Days of Code: The Complete Python Pro Bootcamp*.

## Current features

- Search cafés by name or area
- Filter by minimum Wi-Fi and usable power sockets
- Friendly visual ratings for coffee, Wi-Fi and power
- Add a personal **local-only** venue using the form
- Suggestions persist only in the visitor's browser through `localStorage`
- Responsive, accessible status messages and filters

## Important data note

The built-in venues are deliberately fictional **demo listings**. This project does not claim to recommend real cafés, nor does it redistribute the course dataset. Visitor-added entries remain in that visitor's browser and are never sent to a server.

## Run locally

```bash
python -m http.server 8770 --directory site
node --test tests/coffee-engine.test.mjs tests/coffee-ui.test.mjs
```

## Authorship and assistance

- **Course inspiration:** Angela Yu's Coffee & WiFi Flask project
- **Portfolio direction and review:** António
- **JavaScript implementation and testing assistance:** Hermes/Kuramon_Python (AI)

This is a new JavaScript/static-host implementation, not a copy of the reference Flask source. It uses no backend because Neocities is static hosting.
