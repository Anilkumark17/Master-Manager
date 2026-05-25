"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { NativeSelect, NativeSelectOption } from "@/components/ui/native-select";
import { Textarea } from "@/components/ui/textarea";
import { PROJECT_TYPES } from "@/lib/project-types";

const empty = {
  name: "",
  type: PROJECT_TYPES[0],
  shortDescription: "",
  visionStatement: "",
  problemStatement: "",
  targetUsers: "",
  industryDomain: "",
};

export function NewProjectForm() {
  const router = useRouter();
  const [form, setForm] = React.useState(empty);
  const [error, setError] = React.useState("");
  const [loading, setLoading] = React.useState(false);

  function set(field, value) {
    setForm((f) => ({ ...f, [field]: value }));
  }

  async function onSubmit(e) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const res = await fetch("/api/projects", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(data.error || "Could not create project");
        return;
      }
      if (data.project?.id) {
        router.replace(`/dashboard/projects/${data.project.id}`);
        router.refresh();
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={onSubmit} className="mx-auto max-w-2xl space-y-6">
      {error ? (
        <p className="text-sm text-red-600 dark:text-red-400" role="alert">
          {error}
        </p>
      ) : null}

      <div className="grid gap-2">
        <Label htmlFor="name">Project name</Label>
        <Input
          id="name"
          required
          value={form.name}
          onChange={(e) => set("name", e.target.value)}
          placeholder="Northstar Analytics"
          className="h-10"
        />
      </div>

      <div className="grid gap-2">
        <Label htmlFor="type">Project type</Label>
        <NativeSelect
          id="type"
          required
          value={form.type}
          onChange={(e) => set("type", e.target.value)}
          className="w-full"
        >
          {PROJECT_TYPES.map((t) => (
            <NativeSelectOption key={t} value={t}>
              {t}
            </NativeSelectOption>
          ))}
        </NativeSelect>
      </div>

      <div className="grid gap-2">
        <Label htmlFor="shortDescription">Short description</Label>
        <Textarea
          id="shortDescription"
          required
          rows={3}
          value={form.shortDescription}
          onChange={(e) => set("shortDescription", e.target.value)}
          placeholder="One or two sentences on what this product is."
        />
      </div>

      <div className="grid gap-2">
        <Label htmlFor="visionStatement">Vision statement</Label>
        <Textarea
          id="visionStatement"
          required
          rows={4}
          value={form.visionStatement}
          onChange={(e) => set("visionStatement", e.target.value)}
          placeholder="Where this should be in 12–24 months."
        />
      </div>

      <div className="grid gap-2">
        <Label htmlFor="problemStatement">Problem statement</Label>
        <Textarea
          id="problemStatement"
          required
          rows={4}
          value={form.problemStatement}
          onChange={(e) => set("problemStatement", e.target.value)}
          placeholder="What pain exists today without this solution?"
        />
      </div>

      <div className="grid gap-2">
        <Label htmlFor="targetUsers">Target users</Label>
        <Textarea
          id="targetUsers"
          required
          rows={3}
          value={form.targetUsers}
          onChange={(e) => set("targetUsers", e.target.value)}
          placeholder="Roles, company size, geography, or segments."
        />
      </div>

      <div className="grid gap-2">
        <Label htmlFor="industryDomain">Industry / domain</Label>
        <Input
          id="industryDomain"
          required
          value={form.industryDomain}
          onChange={(e) => set("industryDomain", e.target.value)}
          placeholder="e.g. B2B fintech, healthcare ops, developer tools"
          className="h-10"
        />
      </div>

      <div className="flex flex-col gap-3 sm:flex-row sm:justify-end">
        <Button type="button" variant="outline" asChild>
          <Link href="/dashboard/projects">Cancel</Link>
        </Button>
        <Button type="submit" disabled={loading} className="sm:min-w-40">
          {loading ? "Creating…" : "Create project"}
        </Button>
      </div>
    </form>
  );
}
