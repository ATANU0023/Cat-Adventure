# Cat Adventure

A simple TypeScript browser game: help the cat traverse three stages (River, Jungle, Mountain) by collecting items to remove obstacles.

## Dev Quickstart

Install dependencies and run a local dev server:

```
npm install
npm start
```

The game builds to `dist` via TypeScript then `lite-server` serves from the project root (it will auto-refresh on changes).

## Controls

- Move: Arrow Keys or WASD
- Collect items by touching them.
- When you acquire the required items, the blocking obstacle disappears. Reach the green goal area to complete the stage.

## Structure

- `src/engine` minimal engine (Game loop, Input, Physics, Renderer)
- `src/stages` stage definitions and shared helpers
- `src/main.ts` stage sequencing & UI binding

## Future Ideas

- Add sound & sprite art
- Add animations & better collision
- Add crafting UI instead of auto-removal
- Add timer / score system

## License

MIT
