"use client";

import * as React from "react";
import { useRouter } from "next/navigation";

import { Button } from "@/components/ui/button";

export function DeleteProjectButton({ projectId }) {
  const router = useRouter();
  const [loading, setLoading] = React.useState(false);

  async function onDelete() {
    if (!confirm("Delete this project? This cannot be undone.")) return;
    setLoading(true);
    try {
      const res = await fetch(`/api/projects/${projectId}`, {
        method: "DELETE",
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        alert(data.error || "Delete failed");
        return;
      }
      router.replace("/dashboard/projects");
      router.refresh();
    } finally {
      setLoading(false);
    }
  }

  return (
    <Button
      type="button"
      variant="outline"
      size="sm"
      onClick={onDelete}
      disabled={loading}
      className="text-red-600 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-950/30"
    >
      {loading ? "Deleting…" : "Delete project"}
    </Button>
  );
}
