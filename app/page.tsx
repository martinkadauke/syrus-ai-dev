import fs from "node:fs";
import path from "node:path";
import { Nav } from "../components/nav";
import { Hero } from "../components/hero";
import { TeamWorkflow } from "../components/team-workflow";
import { Features } from "../components/features";
import { EntryPoints } from "../components/entry-points";
import { Demo } from "../components/demo";
import { Footer } from "../components/footer";

// Decide on the server whether a real product screenshot has been added, so the
// hero renders the image or the built-in mock deterministically (no client race).
// Drop your image at public/product-screenshot.png and redeploy to swap it in.
const hasShot = fs.existsSync(
  path.join(process.cwd(), "public", "product-screenshot.png"),
);

export default function Home() {
  return (
    <>
      <Nav />
      <main>
        <Hero hasShot={hasShot} />
        <TeamWorkflow />
        <Features />
        <EntryPoints />
        <Demo />
      </main>
      <Footer />
    </>
  );
}
