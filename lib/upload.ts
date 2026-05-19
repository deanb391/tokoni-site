// lib/upload.ts
export async function uploadToServer(file: File, folder: string, type: string) {
  const form = new FormData();
  form.append("file", file);
  form.append("folder", folder);
  form.append("type", type);

  const res = await fetch("/api/upload", {
    method: "POST",
    body: form,
  });

  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.error || "Upload failed");
  }

  const data = await res.json();
  return data.url as string;
}
