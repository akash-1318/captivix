import type { EmailRow } from "../api/types";

type Props = {
  email: EmailRow;
  onResummarize: (id: number) => void;
  onDelete: (id: number) => void;
  busy?: boolean;
};

export function EmailCard({ email, onResummarize, onDelete, busy }: Props) {
  return (
    <div className="flex flex-col gap-3 rounded-2xl border border-gray-200 bg-white p-4 shadow-sm transition-all duration-200 ease-out hover:-translate-y-0.5 hover:shadow-md cursor-pointer">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="truncate text-[15px] font-semibold text-gray-900">
            {email.subject}
          </div>

          <div className="mt-1 text-xs text-gray-500">
            From: <span className="text-gray-700">{email.sender}</span> •
            Category:{" "}
            <span className="font-bold text-gray-950">
              {email.category || "—"}
            </span>
          </div>
        </div>

        <div className="flex shrink-0 gap-2">
          <button
            disabled={busy}
            onClick={() => onResummarize(email.id)}
            className="rounded-xl border cursor-pointer border-gray-200 bg-white px-3 py-2 text-sm text-gray-900 transition hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {busy ? "Working..." : "Re-summarize"}
          </button>

          <button
            disabled={busy}
            onClick={() => onDelete(email.id)}
            className="rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700 transition hover:bg-red-100 disabled:cursor-not-allowed disabled:opacity-60 cursor-pointer"
          >
            Delete
          </button>
        </div>
      </div>

      <div className="text-sm leading-relaxed text-gray-800">
        <div className="mb-1 font-semibold text-gray-900">Summary</div>
        {email.summary ? (
          <div className="text-gray-800">{email.summary}</div>
        ) : (
          <span className="text-gray-500">No summary yet.</span>
        )}
      </div>

      <details className="rounded-xl border border-gray-200 bg-gray-50 p-3">
        <summary className="cursor-pointer text-sm text-gray-600 hover:text-gray-900">
          View original email
        </summary>
        <div className="mt-3 whitespace-pre-wrap text-sm text-gray-800">
          {email.body}
        </div>
      </details>

      {email.extracted ? (
        <details className="rounded-xl border border-gray-200 bg-gray-50 p-3">
          <summary className="cursor-pointer text-sm text-gray-600 hover:text-gray-900">
            Extracted data
          </summary>
          <pre className="mt-3 overflow-x-auto rounded-xl bg-white p-3 text-xs text-gray-800">
            {JSON.stringify(email.extracted, null, 2)}
          </pre>
        </details>
      ) : null}
    </div>
  );
}
