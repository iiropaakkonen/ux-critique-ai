"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";

type FeedbackAction = "ACCEPTED" | "DISMISSED" | "FLAGGED_WRONG";

export function FeedbackButtons({ findingId }: { findingId: string }) {
  const [selected, setSelected] = useState<FeedbackAction | null>(null);
  const [submitting, setSubmitting] = useState(false);

  async function submitFeedback(action: FeedbackAction) {
    setSubmitting(true);
    try {
      const res = await fetch(`/api/findings/${findingId}/feedback`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action }),
      });

      if (!res.ok) throw new Error("Failed to save feedback");

      setSelected(action);
    } catch (err) {
      console.error(err);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="flex gap-2 mt-3">
      <Button
        size="sm"
        variant={selected === "ACCEPTED" ? "default" : "outline"}
        disabled={submitting}
        onClick={() => submitFeedback("ACCEPTED")}
      >
        Accept
      </Button>
      <Button
        size="sm"
        variant={selected === "DISMISSED" ? "default" : "outline"}
        disabled={submitting}
        onClick={() => submitFeedback("DISMISSED")}
      >
        Dismiss
      </Button>
      <Button
        size="sm"
        variant={selected === "FLAGGED_WRONG" ? "default" : "outline"}
        disabled={submitting}
        onClick={() => submitFeedback("FLAGGED_WRONG")}
      >
        Flag as wrong
      </Button>
    </div>
  );
}