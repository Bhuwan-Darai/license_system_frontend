import Hero from "./Hero";
import Services from "@/app/components/LandingPage/Services";
import ServicesCompleted from "@/app/components/LandingPage/ServicesCompled";

export default function Home() {
    return (
        <>
            <Hero />
            <ServicesCompleted />
            <Services />
        </>
    );
}
