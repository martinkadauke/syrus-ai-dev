import { redirect } from "next/navigation";

// The home network no longer hosts the site — only the API lives here. Anyone
// landing on the root is sent to the GitHub Pages site.
export const dynamic = "force-dynamic";

export default function Home() {
  redirect("https://syrus-ai.dev");
}
