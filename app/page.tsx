export default function Home() {
  const apiBaseUrl = process.env.NEXT_PUBLIC_API_BASE_URL;

  return (
    <div className="flex min-h-screen items-center justify-center bg-brand-neutral-50 px-6">
      <div className="w-full max-w-xl rounded-xl bg-white p-8 shadow-md">
        <h1 className="text-display-md font-semibold text-brand-neutral-900">
          📚 Library Web App
        </h1>

        <div className="mt-6 rounded-md bg-brand-neutral-100 p-4">
          <p className="text-sm font-medium text-brand-neutral-700">
            NEXT_PUBLIC_API_BASE_URL:
          </p>

          <p className="mt-2 break-all text-sm text-brand-primary-300">
            {apiBaseUrl || "❌ Environment variable not found"}
          </p>
        </div>
      </div>
    </div>
  );
}
