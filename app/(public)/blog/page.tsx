import type { Metadata } from "next";
import { API_BASE_URL } from "@/app/lib/seo";
import Header from "@/app/components/LandingPage/Header";
import Footer from "@/app/components/LandingPage/Footer";
import Blog from "@/app/components/LandingPage/Blog";

export const metadata: Metadata = {
  title: "Blog",
  description:
    "Guides, tips and updates on getting your driving license in Nepal: registration, written exam, trial and more.",
  alternates: { canonical: "/blog" },
  openGraph: { url: "/blog", title: "Blog" },
};

async function getBlogs() {
  try {
    const res = await fetch(`${API_BASE_URL}/public/blogs/?page=1&limit=100`, {
      cache: "no-store",
    });

    if (!res.ok) return undefined;

    return await res.json();
  } catch {
    return undefined;
  }
}

export default async function Page() {
  const initialBlogs = await getBlogs();

  return (
    <>
      <Header />
      <Blog initialBlogs={initialBlogs} />
      <Footer />
    </>
  );
}
