import { apiFetch } from "./client";
import type { EmailRow } from "./types";

export async function ingestMockEmails() {
  return apiFetch<{ insertedCount: number }>("/emails/ingest", { method: "POST" });
}

export async function fetchEmails(params: { category?: string; q?: string }) {
  const usp = new URLSearchParams();
  if (params.category) usp.set("category", params.category);
  if (params.q) usp.set("q", params.q);

  const qs = usp.toString();
  return apiFetch<{ data: EmailRow[] }>(`/emails${qs ? `?${qs}` : ""}`);
}

export async function fetchCategories() {
  return apiFetch<{ data: string[] }>("/emails/categories");
}

export async function resummarizeEmail(id: number) {
  return apiFetch<{ data: EmailRow }>(`/emails/${id}/resummarize`, { method: "POST" });
}

export async function deleteEmail(id: number) {
  return apiFetch<{ deleted: EmailRow }>(`/emails/${id}`, { method: "DELETE" });
}
