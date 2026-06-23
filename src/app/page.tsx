import Navbar from "@/components/Navbar";
import Hero from "@/components/Hero";
import Problem from "@/components/Problem";
import HowItWorks from "@/components/HowItWorks";
import SeedlessWallet from "@/components/SeedlessWallet";
import QuoteWidget from "@/components/QuoteWidget";
import ForDevelopers from "@/components/ForDevelopers";
import TrustSecurity from "@/components/TrustSecurity";
import DualCTA from "@/components/DualCTA";
import Footer from "@/components/Footer";

export default function Home() {
  return (
    <>
      <Navbar />
      <Hero />
      <Problem />
      <HowItWorks />
      <SeedlessWallet />
      <QuoteWidget />
      <ForDevelopers />
      <TrustSecurity />
      <DualCTA />
      <Footer />
    </>
  );
}
