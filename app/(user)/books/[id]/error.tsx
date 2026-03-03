"use client";

export default function Error({
  error,
  reset,
}: {
  error: Error;
  reset: () => void;
}) {
  return (
    <div className="mx-auto w-full max-w-6xl px-4 py-10 md:px-6">
      <h1 className="text-xl font-semibold text-neutral-900">
        Something went wrong
      </h1>
      <p className="mt-2 text-sm text-neutral-600">{error.message}</p>

      <button
        onClick={reset}
        className="mt-6 rounded-xl border border-neutral-200 bg-white px-4 py-2 text-sm font-medium hover:scale-[1.02] active:scale-[0.98]"
      >
        Try again
      </button>
    </div>
  );
}
