import HeaderContainer from "@/components/layout/headerContainer";
import PageShell from "@/components/layout/pageShell";
import HeroSection from "@/components/home/heroSection";
import RecommendationSection from "@/components/home/recommendationSection";
import PopularAuthorsSection from "@/components/home/popularAuthorsSection";
import Footer from "@/components/layout/footer";

export default function HomePage() {
  return (
    <>
      <HeaderContainer />

      <PageShell>
        <HeroSection />
        <RecommendationSection />
        <PopularAuthorsSection />
      </PageShell>

      <Footer />
    </>
  );
}
