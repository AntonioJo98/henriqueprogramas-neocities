# henriqueprogramas.neocities.org

Local Git working copy for António's interactive programming portfolio on Neocities.

## Status

This repository is bootstrapped from the public starter page at `https://henriqueprogramas.neocities.org/`. The local `site/` directory is the source of truth. Projects will be developed and tested locally before an explicit reviewed deployment.

## Workflow

- Edit files in `site/`.
- Put each browser demo under `site/projects/<project-name>/`.
- Inspect changes with `git diff`.
- Run tests and a local HTTP preview before committing.
- Preview a Neocities deploy with `async-neocities --src site --preview`.
- Deploy only after review with `async-neocities --src site`.
- Do not use `--cleanup` unless remote deletions have been explicitly reviewed and approved.

## Planned interactive projects

1. Snake
2. Turtle Crossing
3. Flash Cards
4. Coffee & WiFi
5. Disappearing Text
6. Breakout
7. Whack-a-Mole
8. Calculator

The course-inspired projects will attribute Angela Yu's *100 Days of Code: The Complete Python Pro Bootcamp*. READMEs must distinguish the tutorial baseline, António's changes, and AI assistance.

## Security

Do not place Neocities credentials, GitHub tokens, API keys, passwords, personal data, or paid course assets in this repository.
