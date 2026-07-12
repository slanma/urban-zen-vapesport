import Navbar from "@/components/Navbar";
import HeroSection from "@/components/HeroSection";
import CategoryRozcestnik from "@/components/CategoryRozcestnik";
import FeaturesGrid from "@/components/FeaturesGrid";
import B2BSection from "@/components/B2BSection";
import Footer from "@/components/Footer";

const Index = () => {
  return (
    <main>
      <Navbar />
      <HeroSection />
      <CategoryRozcestnik />
      <FeaturesGrid />
      <B2BSection />
      <Footer />
    </main>
  );
};

export default Index;
