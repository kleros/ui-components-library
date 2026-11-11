# Adding a component the library doesn't have

1. Look it up first: `agent/CATALOG.md` (core, kit and known gaps) and your app's `kleros-ui.json`. A piece that is
   missing, or that you show in two or more places (a COMPOSE included), becomes one named component (step 2), used
   in each place. Don't copy the markup.
2. `npx kleros-ui new <Name> --kind ui|data|form --intent "words"` (PascalCase). It refuses names the library exports.
   `--intent` takes what someone would search for, comma-separated (`--intent "period badge, status chip"`).
   It writes `src/components/<Name>/<Name>.tsx`, `index.ts` and a `kleros-ui.json` entry with those intent words,
   and `<Name>.stories.tsx` only when the app has Storybook (`storybook` or an `@storybook/*` package in its
   dependencies or devDependencies, or a `.storybook` folder at its root). Without the CLI, make the same things by
   hand:
   - `src/components/<Name>/<Name>.tsx` exporting `<Name>` and `interface <Name>Props`;
   - `src/components/<Name>/index.ts`: `export * from "./<Name>";`
   - an entry in `kleros-ui.json` `components`: `{ "name": "<Name>", "status": "local", "kind": "ui",
     "intent": ["period badge", "status chip"], "importPath": "./components/<Name>" }`;
   - with Storybook only: `src/components/<Name>/<Name>.stories.tsx` with Default, Dark and each state (types from
     `@kleros/ui-components-library/story-types`, so it compiles without Storybook installed), copied from
     `agent/templates/<kind>/__NAME__.stories.tsx.tmpl` for its Dark story (step 4). Without Storybook, no stories
     file.
3. Fill in `<Name>.tsx`:
   - keep `export interface <Name>Props` with JSDoc on every prop; accept `className` and merge it last with `cn`
     (`import { cn } from "@kleros/ui-components-library/kit"`), so the caller's classes win;
   - Tailwind classes only (AGENTS.md, "Styling: Tailwind only"): build from library parts (`LinearProgress`,
     `CircularProgress` with a `tone`, `StatusBadge`, `Stack`, `Inline`, `Skeleton`, `EmptyState` …) and the rules in
     `LOOK.md`; react-aria for any new interaction;
   - `--kind data`: keep `QueryState` so loading, empty and error are handled (mock data passes `isLoading={false}`).
4. With Storybook: fill in the stories, Default, Dark and each state the component has. Keep the Dark story's
   `render`: it wraps the component in `DarkHtml`, which puts the `dark` class on `<html>` while the story is shown
   and puts the class back as it was after, so the story is dark with no setting in the app's preview. The theme
   tokens switch on that class on `<html>`: a wrapping element with `dark` is not enough. A preview decorator that
   sets the class on `<html>` in an effect (a theme-switcher decorator) runs after `DarkHtml` and wins: have it leave
   the class alone for this story, or set the theme in the preview's `beforeEach` instead. Without Storybook, skip
   this step.
5. Check the intent words in the component's `kleros-ui.json` entry (what someone would search for), so the next
   lookup finds it; add more to its `intent` array as the component grows. `ui:check` notes an entry with none.
6. `npm run ui:check` must pass. When a second app needs the same component, it is proposed for the library kit.
