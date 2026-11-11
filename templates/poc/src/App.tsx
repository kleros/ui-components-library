// Start here. Copy a recipe from node_modules/@kleros/ui-components-library/recipes/ for a whole screen.
import { Button } from "@kleros/ui-components-library";
import { EmptyState, ThemeToggle } from "@kleros/ui-components-library/kit";

export default function App() {
  return (
    <main className="bg-klerosUIComponentsLightBackground min-h-screen p-6">
      <header className="mb-6 flex items-center justify-between">
        <h1 className="text-klerosUIComponentsPrimaryText text-2xl font-semibold">Kleros PoC</h1>
        <ThemeToggle />
      </header>
      <EmptyState title="Nothing here yet" description="Ask your agent for the first screen." />
      <Button text="Hello" onPress={() => alert("hi")} />
    </main>
  );
}
