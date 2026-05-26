export function syncNuvem(key: string, data: unknown) {
  if (typeof window === "undefined") return;
  fetch("/api/storage", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ key, data }),
  }).catch(() => {});
}
