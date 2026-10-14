import { permanentRedirect } from "next/navigation";

// The public site lives at /home; send visitors and crawlers there.
export default function Page() {
  permanentRedirect("/home");
}
