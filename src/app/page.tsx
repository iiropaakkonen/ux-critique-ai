"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabase";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useRouter } from "next/navigation";

export default function Home() {
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [uploadedUrl, setUploadedUrl] = useState<string | null>(null);
  const router = useRouter();
  

  async function handleUpload() {
    if (!file) return;

    setUploading(true);
    setError(null);

    try {
      const fileExt = file.name.split(".").pop();
      const fileName = `${crypto.randomUUID()}.${fileExt}`;

      const { error: uploadError } = await supabase.storage
        .from("screenshots")
        .upload(fileName, file);

      if (uploadError) throw uploadError;

      const { data: publicUrlData } = supabase.storage
        .from("screenshots")
        .getPublicUrl(fileName);

      const analysisRes = await fetch("/api/analyses", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ imageUrl: publicUrlData.publicUrl }),
      });

      if (!analysisRes.ok) throw new Error("Failed to create analysis record");

      const { analysis } = await analysisRes.json();

      const critiqueRes = await fetch(`/api/analyses/${analysis.id}/analyze`, {
        method: "POST",
      });

      if (!critiqueRes.ok) {
        const errorData = await critiqueRes.json();
        throw new Error(errorData.error || "Analysis failed");
      }

      router.push(`/results/${analysis.id}`);

    } catch (err) {
      setError(err instanceof Error ? err.message : "Upload failed");
    } finally {
      setUploading(false);
    }
  }

  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-4 p-8">
      <Card className="w-full max-w-md p-6 flex flex-col gap-4">
        <h1 className="text-xl font-semibold">Upload a UI Screenshot</h1>

        <input
          type="file"
          accept="image/*"
          onChange={(e) => setFile(e.target.files?.[0] ?? null)}
        />

        <Button onClick={handleUpload} disabled={!file || uploading}>
          {uploading ? "Uploading..." : "Upload"}
        </Button>

        {error && <p className="text-red-500 text-sm">{error}</p>}

        {uploadedUrl && (
          <div className="flex flex-col gap-2">
            <p className="text-sm text-green-600">Upload successful:</p>
            <a href={uploadedUrl} target="_blank" rel="noopener noreferrer" className="text-sm underline break-all">
              {uploadedUrl}
            </a>
          </div>
        )}
      </Card>
    </main>
  );
}