import Header from "@/app/components/LandingPage/Header";
import Footer from "@/app/components/LandingPage/Footer";
import Blog from "@/app/components/LandingPage/Blog";

const API_BASE_URL =
  process.env.NEXT_PUBLIC_NODE_ENV === "production"
    ? process.env.NEXT_PUBLIC_API_URL
    : "http://localhost:3030/api/v1";

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
  console.log("initial blogs", initialBlogs);

  return (
    <>
      <Header />
      <Blog initialBlogs={initialBlogs} />
      <Footer />
    </>
  );
}
