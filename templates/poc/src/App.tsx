// Start here. Copy a recipe from node_modules/@kleros/ui-components-library/recipes/ for a whole screen. App's kit Page
// is the page's <main>: a screen that returns its own Page (case-page.tsx) is returned in place of this one, never
// inside it. Parts of a screen (vote-form.tsx, evidence-list.tsx) go inside this Page.
import { Button } from "@kleros/ui-components-library";
import { EmptyState, Inline, Page, Stack, ThemeToggle } from "@kleros/ui-components-library/kit";

export default function App() {
  return (
    <Page title="Kleros PoC" actions={<ThemeToggle />}>
      <Stack gap={4}>
        <EmptyState title="Nothing here yet" description="Ask your agent for the first screen." />
        {/* Page and Stack stretch their children, so the button sits in an Inline row at its own width. */}
        <Inline>
          <Button text="Hello" onPress={() => alert("hi")} />
        </Inline>
      </Stack>
    </Page>
  );
}
