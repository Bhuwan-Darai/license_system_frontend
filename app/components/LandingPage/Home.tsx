import Header from "./Header"
import Hero from "./Hero"
import Footer from "@/app/components/LandingPage/Footer";
import Services from "@/app/components/LandingPage/Services";
import ServicesCompleted from "@/app/components/LandingPage/ServicesCompled";

export default function Home() {
    return (
        <>
            <div className="bg-ly-bg">
            <Header/>
            <Hero/>
            <ServicesCompleted/>
            <Services/>
            <Footer/>
        </div>
        </>
    )
}