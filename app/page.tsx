import Header from "@/components/layout/header";
import PageShell from "@/components/layout/pageShell";
import HeroSection from "@/components/home/heroSection";
import RecommendationSection from "@/components/home/recommendationSection";
import PopularAuthorsSection from "@/components/home/popularAuthorsSection";
import Footer from "@/components/layout/footer";

export default function HomePage() {
  return (
    <>
      <Header cartCount={0} isAuthenticated={false} />

      <PageShell>
        <div id="hero">
          <HeroSection />
        </div>
        <RecommendationSection />
        <PopularAuthorsSection />
      </PageShell>
      <Footer />
    </>
  );
}
