import Header from "@/components/layout/header";
import PageShell from "@/components/layout/pageShell";

export default function HomePage() {
  return (
    <>
      <Header cartCount={0} isAuthenticated={false} />

      <PageShell>
        <section id="hero" className="min-h-[60vh] bg-white">
          <div className="mx-auto max-w-7xl px-4 py-10">
            <h1 className="text-display-lg font-semibold">Hero Section</h1>
            <p className="mt-2 text-zinc-600">
              Placeholder untuk big picture di bawah navbar.
            </p>
          </div>
        </section>

        <section className="mx-auto max-w-7xl px-4 py-10">
          <div className="h-300 rounded-xl border bg-white" />
        </section>
      </PageShell>
    </>
  );
}
