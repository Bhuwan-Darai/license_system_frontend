import Header from "./Header"
import Hero from "./Hero"
import Footer from "@/app/components/LandingPage/Footer";
import Services from "@/app/components/LandingPage/Services";

export default function Home() {
    return (
        <><div className="bg-[#EEE8DD]">
            <Header/>
            <Hero/>
            <Services/>
            <Footer/>
        </div>
        </>
    )
}