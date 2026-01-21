import { apiUrl } from "../api/client";

export function Header() {
  return (
    <header className="border-b border-gray-200 bg-white px-5 py-4">
      <div className="max-w-5xl flex items-center justify-between gap-3 m-auto">
        <div>
          <h1 className="text-lg font-bold text-gray-900">
            AI Email Summarizer
          </h1>
          <p className="mt-0.5 text-xs text-gray-500">
            Dashboard: summaries + categories + export
          </p>
        </div>

        <div className="flex items-center gap-2">
          <a
            href={apiUrl("/summaries/export")}
            className="rounded-xl border border-gray-200 bg-white px-4 py-2 text-sm font-medium text-gray-900 transition hover:bg-gray-50 active:scale-[0.99]"
          >
            Export CSV
          </a>
        </div>
      </div>
    </header>
  );
}
