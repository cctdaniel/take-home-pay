import { redirect } from "next/navigation";

// Redirect root to US calculator (default country)
export default function Home() {
  redirect("/us");
}
