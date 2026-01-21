import { useEffect, useMemo, useState } from "react";
import {
  deleteEmail,
  fetchCategories,
  fetchEmails,
  ingestMockEmails,
  resummarizeEmail,
} from "../api/emails";
import type { EmailRow } from "../api/types";
import { EmailCard } from "../components/EmailCard";
import { Loading } from "../components/Loading";
import { FiltersBar } from "../components/FilterBar";
import { useDebouncedValue } from "../hooks/useDebouncedValue";

export function Dashboard() {
  const [emails, setEmails] = useState<EmailRow[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>("All");
  const [search, setSearch] = useState<string>("");

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [busyId, setBusyId] = useState<number | null>(null);
  const [ingesting, setIngesting] = useState(false);

  const debouncedSearch = useDebouncedValue(search, 400);

  const queryParams = useMemo(
    () => ({
      category: selectedCategory !== "All" ? selectedCategory : undefined,
      q: debouncedSearch.trim() || undefined,
    }),
    [selectedCategory, debouncedSearch],
  );

  const loadAll = async () => {
    setLoading(true);
    setError("");
    try {
      const [cats, list] = await Promise.all([
        fetchCategories(),
        fetchEmails(queryParams),
      ]);
      setCategories(cats.data || []);
      setEmails(list.data || []);
    } catch (e: any) {
      setError(e?.message || "Failed to load emails");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAll();
  }, [queryParams.category, queryParams.q]);

  const onIngest = async () => {
    setIngesting(true);
    setError("");
    try {
      await ingestMockEmails();
      await loadAll();
    } catch (e: any) {
      setError(e?.message || "Failed to ingest emails");
    } finally {
      setIngesting(false);
    }
  };

  const onResummarize = async (id: number) => {
    setBusyId(id);
    setError("");
    try {
      const updated = await resummarizeEmail(id);
      setEmails((prev) => prev.map((e) => (e.id === id ? updated.data : e)));
    } catch (e: any) {
      setError(e?.message || "Failed to resummarize email");
    } finally {
      setBusyId(null);
    }
  };

  const onDelete = async (id: number) => {
    setBusyId(id);
    setError("");
    try {
      await deleteEmail(id);
      setEmails((prev) => prev.filter((e) => e.id !== id));
    } catch (e: any) {
      setError(e?.message || "Failed to delete email");
    } finally {
      setBusyId(null);
    }
  };

  return (
    <div className="flex flex-col">
      <FiltersBar
        categories={categories}
        selectedCategory={selectedCategory}
        search={search}
        onChange={(next) => {
          setSelectedCategory(next.category);
          setSearch(next.search);
        }}
        onIngest={onIngest}
        ingestDisabled={ingesting}
      />

      {error && (
        <div className="px-4 py-3 text-sm text-red-700">
          <b>Error:</b> {error}
        </div>
      )}

      {loading ? (
        <div className="p-4">
          <Loading />
        </div>
      ) : emails.length === 0 ? (
        <div className="flex min-h-[60vh] w-full flex-col items-center justify-center gap-2 px-4 text-center">
          <p className="text-sm text-gray-500">No emails found.</p>
          <p className="text-sm text-gray-600">
            Click{" "}
            <span className="font-medium text-gray-900">
              Ingest Mock Emails
            </span>{" "}
            to add data.
          </p>
        </div>
      ) : (
        <div className="flex flex-col gap-4 px-4 xl:px-0 pb-6 mt-4">
          {emails.map((email) => (
            <EmailCard
              key={email.id}
              email={email}
              onResummarize={onResummarize}
              onDelete={onDelete}
              busy={busyId === email.id}
            />
          ))}
        </div>
      )}
    </div>
  );
}
