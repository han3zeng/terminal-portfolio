import { Terminal } from "@/terminal/Terminal";

import { TITLE } from "./metadata";

export default function Home() {
  return (
    <main>
      <h1 className="sr-only">{TITLE}</h1>
      <Terminal />
    </main>
  );
}
