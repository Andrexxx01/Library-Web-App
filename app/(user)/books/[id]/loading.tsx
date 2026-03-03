export default function Loading() {
  return (
    <div className="mx-auto w-full max-w-6xl px-4 py-10 md:px-6">
      <div className="h-5 w-56 animate-pulse rounded bg-neutral-200" />
      <div className="mt-6 grid gap-6 md:grid-cols-[360px_1fr]">
        <div className="h-105 w-full animate-pulse rounded-xl bg-neutral-200" />
        <div>
          <div className="h-8 w-3/4 animate-pulse rounded bg-neutral-200" />
          <div className="mt-3 h-5 w-1/2 animate-pulse rounded bg-neutral-200" />
          <div className="mt-5 h-4 w-32 animate-pulse rounded bg-neutral-200" />
          <div className="mt-6 h-20 w-full animate-pulse rounded bg-neutral-200" />
          <div className="mt-6 h-12 w-72 animate-pulse rounded bg-neutral-200" />
        </div>
      </div>
    </div>
  );
}
