import Navbar from "@/components/Navbar";
import HeroSection from "@/components/HeroSection";
import FeaturesGrid from "@/components/FeaturesGrid";
import BikeConfigurator from "@/components/BikeConfigurator";
import B2BSection from "@/components/B2BSection";
import Footer from "@/components/Footer";

const Index = () => {
  return (
    <main>
      <Navbar />
      <HeroSection />
      <FeaturesGrid />
      <BikeConfigurator />
      <B2BSection />
      <Footer />
    </main>
  );
};

export default Index;
