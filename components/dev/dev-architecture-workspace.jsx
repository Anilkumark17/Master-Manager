"use client";

import * as React from "react";
import ReactMarkdown from "react-markdown";
import {
  ClipboardCopy,
  Download,
  Loader2,
  PanelLeft,
  Plus,
  Save,
  Sparkles,
  Trash2,
} from "lucide-react";
import {
  Group,
  Panel,
  Separator as PanelSeparator,
} from "react-resizable-panels";

import { AiCallout } from "@/components/projects/ai-callout";
import { WorkspacePanel } from "@/components/projects/workspace-panel";
import { Button } from "@/components/ui/button";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Textarea } from "@/components/ui/textarea";
import {
  defaultDevIntake,
  mergeIntakeFromServer,
} from "@/lib/dev-architecture-intake-defaults";
import {
  loadDevSessionDraft,
  saveDevSessionDraft,
} from "@/lib/dev-session-draft";

const TEAM_FIELDS = [
  ["teamSize", "Team size", "e.g. 3 engineers, fractional DevOps"],
  ["teamStructure", "Team structure", "Roles, reporting, IC vs leads"],
  [
    "engineeringExperienceLevel",
    "Engineering experience level",
    "Junior-heavy, senior-led, etc.",
  ],
  ["frontendExpertise", "Frontend expertise", "React, mobile, design systems…"],
  ["backendExpertise", "Backend expertise", "Node, Go, data modeling…"],
  ["devopsExpertise", "DevOps expertise", "CI/CD, cloud, on-call comfort"],
  ["aiMlExpertise", "AI / ML expertise", "LLM apps, evals, RAG, none"],
  ["hiringCapacity", "Hiring capacity", "Open reqs, time-to-hire expectations"],
  [
    "deliverySpeedExpectations",
    "Delivery speed expectations",
    "Weekly releases, milestone-based…",
  ],
];

const PRODUCT_FIELDS = [
  ["productType", "Product type", "B2B SaaS, consumer, marketplace…"],
  ["userScaleExpectations", "User scale expectations", "DAU, tenants, geography"],
  ["realtimeRequirements", "Real-time requirements", "Chat, live updates, none"],
  ["aiFeatures", "AI features", "Copilots, classification, none"],
  ["integrations", "Integrations", "CRM, auth IdPs, billing, webhooks…"],
  ["securityNeeds", "Security needs", "AuthN/Z, PII, secrets, threat model"],
  ["complianceRequirements", "Compliance", "SOC2, HIPAA, GDPR, none"],
];

const TECH_FIELDS = [
  ["preferredTechStack", "Preferred tech stack", "Languages, frameworks, hosts"],
  [
    "existingInfrastructure",
    "Existing infrastructure",
    "Repos, cloud accounts, legacy systems",
  ],
  ["databasePreferences", "Database preferences", "Postgres, Dynamo, unsure…"],
  ["hostingPreferences", "Hosting preferences", "Vercel, AWS, on-prem…"],
  ["apiRequirements", "API requirements", "REST, GraphQL, public API, webhooks"],
  ["platforms", "Platforms", "Web only, iOS/Android, desktop…"],
];

const NFR_FIELDS = [
  ["scalability", "Scalability", "Orders of magnitude, multi-tenant"],
  ["performance", "Performance", "p95 latency, batch windows"],
  ["reliability", "Reliability", "SLA, RTO/RPO expectations"],
  ["security", "Security (NFR)", "Encryption, audit logs, scanning"],
  ["maintainability", "Maintainability", "Modularity, test bar, docs"],
  ["availability", "Availability", "Uptime target, maintenance windows"],
  ["observability", "Observability", "Logs, metrics, traces, alerts"],
  ["extensibility", "Extensibility", "Plugins, white-label, API surface"],
];

function SectionFields({ sectionKey, fields, intake, onChange }) {
  return (
    <div className="grid gap-4 sm:grid-cols-2">
      {fields.map(([key, label, placeholder]) => (
        <div key={key}>
          <Label className="text-xs font-medium text-foreground">{label}</Label>
          <Textarea
            className="mt-1.5 min-h-[72px] text-sm"
            value={intake[sectionKey][key] || ""}
            onChange={(e) => onChange(sectionKey, key, e.target.value)}
            placeholder={placeholder}
          />
        </div>
      ))}
    </div>
  );
}

function CoreFeaturesEditor({ features, onChange }) {
  const list = Array.isArray(features) ? features : [];

  function updateAt(index, value) {
    const next = [...list];
    next[index] = value;
    onChange(next);
  }

  function removeAt(index) {
    onChange(list.filter((_, i) => i !== index));
  }

  function addRow() {
    onChange([...list, ""]);
  }

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-end justify-between gap-2">
        <div>
          <Label className="text-xs font-medium text-foreground">
            Core features (v1)
          </Label>
          <p className="mt-0.5 text-[11px] text-muted-foreground">
            One row per capability (optional — generation also uses PRD /
            discovery).
          </p>
        </div>
        <Button
          type="button"
          variant="outline"
          size="sm"
          className="shrink-0 gap-1"
          onClick={addRow}
        >
          <Plus className="size-3.5" aria-hidden />
          Add feature
        </Button>
      </div>
      {list.length === 0 ? (
        <p className="rounded-lg border border-dashed border-border/80 bg-muted/15 px-3 py-4 text-center text-xs text-muted-foreground">
          No rows yet — optional for streaming generation.
        </p>
      ) : (
        <ul className="space-y-2">
          {list.map((text, index) => (
            <li
              key={index}
              className="flex items-center gap-2 rounded-lg border border-border/60 bg-background/50 px-2 py-1.5 pr-1"
            >
              <span
                className="flex size-7 shrink-0 items-center justify-center rounded-md bg-muted/60 font-mono text-[10px] text-muted-foreground"
                aria-hidden
              >
                {index + 1}
              </span>
              <Input
                className="h-9 min-w-0 flex-1 border-0 bg-transparent px-2 shadow-none focus-visible:ring-0"
                value={text}
                onChange={(e) => updateAt(index, e.target.value)}
                placeholder="e.g. SSO with Google + Microsoft"
                aria-label={`Core feature ${index + 1}`}
              />
              <Button
                type="button"
                variant="ghost"
                size="icon-sm"
                className="shrink-0 text-muted-foreground hover:text-destructive"
                onClick={() => removeAt(index)}
                aria-label={`Remove feature ${index + 1}`}
              >
                <Trash2 className="size-4" />
              </Button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

function safeFilename(name) {
  return (
    String(name || "tech-requirements")
      .replace(/[^\w\s-]/g, "")
      .trim()
      .replace(/\s+/g, "-")
      .slice(0, 80) || "tech-requirements"
  );
}

function MarkdownDocBody({ markdown }) {
  return (
    <ReactMarkdown
      components={{
        pre({ children }) {
          const arr = React.Children.toArray(children);
          const codeEl = arr[0];
          const cls =
            codeEl &&
            typeof codeEl === "object" &&
            codeEl.props &&
            typeof codeEl.props.className === "string"
              ? codeEl.props.className
              : "";
          const isMermaid = cls.includes("language-mermaid");
          if (isMermaid) {
            return (
              <div className="my-3 space-y-1">
                <p className="text-[10px] font-medium uppercase tracking-wide text-amber-700/90 dark:text-amber-400/90">
                  Mermaid diagram — also renders in Obsidian / GitHub
                </p>
                <pre className="overflow-x-auto rounded-lg border border-amber-500/25 bg-muted/50 p-3 font-mono text-[11px] leading-snug text-foreground/90">
                  {children}
                </pre>
              </div>
            );
          }
          return (
            <pre className="my-2 overflow-x-auto rounded-lg border border-border/60 bg-muted/40 p-3 font-mono text-xs">
              {children}
            </pre>
          );
        },
      }}
    >
      {markdown}
    </ReactMarkdown>
  );
}

async function consumeDevSse(response, { onDelta, onDone, onError }) {
  if (!response.body) {
    onError("No response body");
    return;
  }
  const reader = response.body.getReader();
  const decoder = new TextDecoder();
  let buffer = "";
  while (true) {
    const { done, value } = await reader.read();
    if (value) {
      buffer += decoder.decode(value, { stream: true });
    }
    let sep;
    while ((sep = buffer.indexOf("\n\n")) !== -1) {
      const block = buffer.slice(0, sep);
      buffer = buffer.slice(sep + 2);
      for (const line of block.split("\n")) {
        const t = line.trim();
        if (!t.startsWith("data:")) {
          continue;
        }
        const payload = t.slice(5).trim();
        try {
          const obj = JSON.parse(payload);
          if (obj.type === "delta" && typeof obj.text === "string") {
            onDelta(obj.text);
          } else if (obj.type === "done") {
            onDone(obj);
          } else if (obj.type === "error") {
            onError(obj.message || "Stream error");
          }
        } catch {
          /* partial */
        }
      }
    }
    if (done) {
      break;
    }
  }
}

export function DevArchitectureWorkspace({ projectId, project }) {
  const [intake, setIntake] = React.useState(defaultDevIntake);
  const [clarificationNotes, setClarificationNotes] = React.useState("");
  const [generatedDocument, setGeneratedDocument] = React.useState("");
  const [modelUsed, setModelUsed] = React.useState("");
  const [loading, setLoading] = React.useState(true);
  const [saving, setSaving] = React.useState(false);
  const [generating, setGenerating] = React.useState(false);
  const [error, setError] = React.useState("");
  const [hint, setHint] = React.useState("");
  const [useDiscoveryWorkspace, setUseDiscoveryWorkspace] = React.useState(true);

  const intakeDraftRef = React.useRef(defaultDevIntake());
  const clarificationRef = React.useRef("");
  const documentDraftRef = React.useRef("");
  const useDiscoveryRef = React.useRef(true);
  const loadGen = React.useRef(0);
  const persistTimer = React.useRef(null);

  React.useEffect(() => {
    intakeDraftRef.current = intake;
  }, [intake]);
  React.useEffect(() => {
    clarificationRef.current = clarificationNotes;
  }, [clarificationNotes]);
  React.useEffect(() => {
    documentDraftRef.current = generatedDocument;
  }, [generatedDocument]);
  React.useEffect(() => {
    useDiscoveryRef.current = useDiscoveryWorkspace;
  }, [useDiscoveryWorkspace]);

  React.useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }
    if (persistTimer.current) {
      window.clearTimeout(persistTimer.current);
    }
    persistTimer.current = window.setTimeout(() => {
      saveDevSessionDraft(projectId, {
        intake,
        clarificationNotes,
        generatedDocument,
        useDiscoveryWorkspace,
      });
    }, 500);
    return () => {
      if (persistTimer.current) {
        window.clearTimeout(persistTimer.current);
      }
    };
  }, [
    projectId,
    intake,
    clarificationNotes,
    generatedDocument,
    useDiscoveryWorkspace,
  ]);

  const loadWorkspace = React.useCallback(async () => {
    const gen = ++loadGen.current;
    setLoading(true);
    setError("");
    try {
      const sessionDraft = loadDevSessionDraft(projectId);
      const res = await fetch(`/api/projects/${projectId}/dev/workspace`, {
        cache: "no-store",
      });
      const data = await res.json().catch(() => ({}));
      if (gen !== loadGen.current) {
        return;
      }
      if (!res.ok) {
        setError(data.error || "Failed to load dev workspace");
        return;
      }

      const server = data.workspace;
      if (sessionDraft?.savedAt) {
        setIntake(mergeIntakeFromServer(sessionDraft.intake));
        setClarificationNotes(sessionDraft.clarificationNotes || "");
        setGeneratedDocument(
          typeof sessionDraft.generatedDocument === "string"
            ? sessionDraft.generatedDocument
            : (server?.generatedDocument || "")
        );
        setUseDiscoveryWorkspace(sessionDraft.useDiscoveryWorkspace !== false);
        setModelUsed(server?.modelUsed || "");
      } else if (server) {
        setIntake(mergeIntakeFromServer(server.intake));
        setClarificationNotes(server.clarificationNotes || "");
        setGeneratedDocument(server.generatedDocument || "");
        setModelUsed(server.modelUsed || "");
      }
    } catch (e) {
      if (gen === loadGen.current) {
        setError(e?.message || "Request failed");
      }
    } finally {
      if (gen === loadGen.current) {
        setLoading(false);
      }
    }
  }, [projectId]);

  React.useEffect(() => {
    loadWorkspace();
  }, [loadWorkspace]);

  function updateSectionField(section, key, value) {
    setIntake((prev) => ({
      ...prev,
      [section]: { ...prev[section], [key]: value },
    }));
  }

  async function saveToServer() {
    setSaving(true);
    setError("");
    setHint("");
    try {
      const res = await fetch(`/api/projects/${projectId}/dev/workspace`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          intake,
          clarificationNotes,
          generatedDocument,
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(data.error || "Save failed");
        return;
      }
      if (data.workspace) {
        setIntake(mergeIntakeFromServer(data.workspace.intake));
        setClarificationNotes(data.workspace.clarificationNotes || "");
        setGeneratedDocument(data.workspace.generatedDocument || "");
        setModelUsed(data.workspace.modelUsed || "");
      }
      saveDevSessionDraft(projectId, {
        intake: mergeIntakeFromServer(data.workspace?.intake || intake),
        clarificationNotes:
          data.workspace?.clarificationNotes ?? clarificationNotes,
        generatedDocument:
          data.workspace?.generatedDocument ?? generatedDocument,
        useDiscoveryWorkspace,
      });
      setHint("Saved to server.");
      window.setTimeout(() => setHint(""), 3000);
    } catch (e) {
      setError(e?.message || "Request failed");
    } finally {
      setSaving(false);
    }
  }

  async function generateDocumentStream() {
    setGenerating(true);
    setError("");
    setHint("");
    setGeneratedDocument("");
    documentDraftRef.current = "";
    let acc = "";
    try {
      const res = await fetch(
        `/api/projects/${projectId}/dev/generate-document-stream`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            intake: intakeDraftRef.current,
            clarificationNotes: clarificationRef.current,
            useDiscoveryWorkspace: useDiscoveryRef.current,
          }),
        }
      );

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        setError(data.error || `Generation failed (${res.status})`);
        return;
      }

      await consumeDevSse(res, {
        onDelta: (text) => {
          acc += text;
          setGeneratedDocument(acc);
        },
        onDone: (obj) => {
          if (obj.model) {
            setModelUsed(obj.model);
          }
          setHint("Stream finished — document saved on server.");
          window.setTimeout(() => setHint(""), 5000);
        },
        onError: (msg) => setError(msg || "Stream failed"),
      });
    } catch (e) {
      setError(e?.message || "Request failed");
    } finally {
      setGenerating(false);
    }
  }

  async function copyDoc() {
    setHint("");
    try {
      await navigator.clipboard.writeText(generatedDocument || "");
      setHint("Markdown copied.");
      window.setTimeout(() => setHint(""), 3500);
    } catch {
      setError("Could not copy to clipboard.");
    }
  }

  function downloadMd() {
    const name = safeFilename(`${project?.name || "project"}-tech-requirements`);
    const blob = new Blob([generatedDocument || ""], {
      type: "text/markdown;charset=utf-8",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${name}.md`;
    a.click();
    URL.revokeObjectURL(url);
    setHint("Download started (.md).");
    window.setTimeout(() => setHint(""), 3500);
  }

  if (loading) {
    return (
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <Loader2 className="size-4 animate-spin" aria-hidden />
        Loading dev workspace…
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <AiCallout title="Technical requirements (Obsidian-style)">
        Generation streams token-by-token into the editor. Your draft (team
        context + document) is kept in{" "}
        <span className="font-medium text-foreground">session storage</span> so
        refresh and switching workspace tabs does not wipe local work. Use
        &quot;Save to server&quot; when you want the database copy updated.
      </AiCallout>

      {error ? (
        <p className="text-sm text-destructive" role="alert">
          {error}
        </p>
      ) : null}
      {hint ? (
        <p className="text-sm text-muted-foreground" role="status">
          {hint}
        </p>
      ) : null}

      <div className="flex flex-col gap-3 lg:flex-row lg:flex-wrap lg:items-center">
        <Button
          type="button"
          variant="default"
          size="sm"
          onClick={generateDocumentStream}
          disabled={generating}
        >
          {generating ? (
            <Loader2 className="size-4 animate-spin" aria-hidden />
          ) : (
            <Sparkles className="size-4" aria-hidden />
          )}
          Generate (stream)
        </Button>
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={saveToServer}
          disabled={saving}
        >
          {saving ? (
            <Loader2 className="size-4 animate-spin" aria-hidden />
          ) : (
            <Save className="size-4" aria-hidden />
          )}
          Save to server
        </Button>
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={copyDoc}
          disabled={!generatedDocument?.trim()}
        >
          <ClipboardCopy className="size-4" aria-hidden />
          Copy
        </Button>
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={downloadMd}
          disabled={!generatedDocument?.trim()}
        >
          <Download className="size-4" aria-hidden />
          Download .md
        </Button>
        {modelUsed ? (
          <span className="text-xs text-muted-foreground lg:ml-2">
            Last model: {modelUsed}
          </span>
        ) : null}
        <div className="flex items-center gap-2 rounded-lg border border-border/80 bg-muted/20 px-3 py-2 lg:ml-auto">
          <Checkbox
            id="dev-use-discovery"
            checked={useDiscoveryWorkspace}
            onCheckedChange={(v) => setUseDiscoveryWorkspace(v === true)}
          />
          <Label
            htmlFor="dev-use-discovery"
            className="cursor-pointer text-xs font-normal leading-snug text-muted-foreground"
          >
            Include discovery / journey in generation
          </Label>
        </div>
      </div>

      <WorkspacePanel className="border-border/80 p-0">
        <Group
          orientation="horizontal"
          className="min-h-[min(72vh,820px)] w-full rounded-xl"
        >
          <Panel defaultSize={52} minSize={28}>
            <div className="flex h-full min-h-0 flex-col border-b border-border/60 lg:border-b-0 lg:border-r">
              <div className="flex items-center gap-2 border-b border-border/60 bg-muted/30 px-3 py-2">
                <PanelLeft className="size-3.5 text-muted-foreground" aria-hidden />
                <span className="text-xs font-medium text-foreground">
                  Source (Markdown)
                </span>
                <span className="text-[10px] text-muted-foreground">
                  editable · streams here
                </span>
              </div>
              <Textarea
                className="min-h-0 flex-1 resize-none rounded-none border-0 bg-transparent px-3 py-3 font-mono text-xs leading-relaxed shadow-none focus-visible:ring-0 md:text-sm"
                value={generatedDocument}
                onChange={(e) => setGeneratedDocument(e.target.value)}
                placeholder="# Technical requirements&#10;&#10;Run **Generate (stream)**…"
                spellCheck={false}
                aria-label="Technical requirements markdown source"
              />
            </div>
          </Panel>
          <PanelSeparator className="w-px shrink-0 bg-border focus:outline-none data-[separator=active]:bg-primary lg:w-1.5" />
          <Panel defaultSize={48} minSize={28}>
            <div className="flex h-full min-h-0 flex-col overflow-hidden">
              <div className="border-b border-border/60 bg-muted/30 px-3 py-2">
                <span className="text-xs font-medium text-foreground">
                  Preview
                </span>
              </div>
              <div
                className="markdown-studio-preview flex-1 overflow-auto px-4 py-3 text-sm
                [&_blockquote]:my-2 [&_blockquote]:border-l-2 [&_blockquote]:pl-3 [&_blockquote]:text-muted-foreground
                [&_code]:rounded-md [&_code]:bg-muted [&_code]:px-1.5 [&_code]:py-0.5 [&_code]:font-mono [&_code]:text-[0.85em]
                [&_h1]:mb-3 [&_h1]:mt-0 [&_h1]:border-b [&_h1]:pb-2 [&_h1]:text-xl [&_h1]:font-semibold [&_h1]:tracking-tight
                [&_h2]:mb-2 [&_h2]:mt-5 [&_h2]:text-lg [&_h2]:font-semibold
                [&_h3]:mb-2 [&_h3]:mt-4 [&_h3]:text-base [&_h3]:font-medium
                [&_li]:my-0.5 [&_ol]:my-2 [&_ol]:list-decimal [&_ol]:pl-5
                [&_p]:my-2 [&_p]:leading-relaxed
                [&_pre]:my-3 [&_pre]:overflow-x-auto [&_pre]:rounded-lg [&_pre]:bg-muted [&_pre]:p-3 [&_pre]:font-mono [&_pre]:text-xs
                [&_strong]:font-semibold [&_ul]:my-2 [&_ul]:list-disc [&_ul]:pl-5"
              >
                {generatedDocument?.trim() ? (
                  <MarkdownDocBody markdown={generatedDocument} />
                ) : (
                  <p className="text-sm text-muted-foreground">
                    Preview renders here — same as an Obsidian reading pane.
                  </p>
                )}
              </div>
            </div>
          </Panel>
        </Group>
      </WorkspacePanel>

      <Collapsible className="rounded-xl border border-border/60 bg-card/30">
        <CollapsibleTrigger className="flex w-full items-center justify-between gap-2 px-4 py-3 text-left text-sm font-semibold hover:bg-muted/30">
          <span>Optional context for generation (team, product, NFR…)</span>
          <span className="text-xs font-normal text-muted-foreground">
            Expand to edit · kept in this browser session
          </span>
        </CollapsibleTrigger>
        <CollapsibleContent>
          <div className="space-y-6 border-t border-border/60 px-4 py-4">
            <p className="text-xs text-muted-foreground">
              Refs mirror the latest values for streaming. Session storage keeps
              this block and the document when you leave the Dev tab or refresh.
            </p>
            {[
              {
                id: "team",
                title: "Team context",
                body: (
                  <SectionFields
                    sectionKey="team"
                    fields={TEAM_FIELDS}
                    intake={intake}
                    onChange={updateSectionField}
                  />
                ),
              },
              {
                id: "product",
                title: "Product context",
                body: (
                  <div className="space-y-6">
                    <CoreFeaturesEditor
                      features={intake.product.coreFeatures}
                      onChange={(next) =>
                        setIntake((prev) => ({
                          ...prev,
                          product: { ...prev.product, coreFeatures: next },
                        }))
                      }
                    />
                    <SectionFields
                      sectionKey="product"
                      fields={PRODUCT_FIELDS}
                      intake={intake}
                      onChange={updateSectionField}
                    />
                  </div>
                ),
              },
              {
                id: "technical",
                title: "Technical context",
                body: (
                  <SectionFields
                    sectionKey="technical"
                    fields={TECH_FIELDS}
                    intake={intake}
                    onChange={updateSectionField}
                  />
                ),
              },
              {
                id: "nfr",
                title: "Non-functional requirements",
                body: (
                  <SectionFields
                    sectionKey="nfr"
                    fields={NFR_FIELDS}
                    intake={intake}
                    onChange={updateSectionField}
                  />
                ),
              },
            ].map(({ id, title, body }) => (
              <div key={id} className="space-y-2">
                <h4 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                  {title}
                </h4>
                {body}
              </div>
            ))}

            <div>
              <Label className="text-xs font-semibold">
                Features to build next (freeform)
              </Label>
              <Textarea
                className="mt-1.5 min-h-[100px] text-sm"
                value={intake.featuresToBuild}
                onChange={(e) =>
                  setIntake((prev) => ({
                    ...prev,
                    featuresToBuild: e.target.value,
                  }))
                }
                placeholder="One line per epic or story…"
              />
            </div>

            <div>
              <Label htmlFor="clarification-notes" className="text-xs font-semibold">
                Optional notes for section 19 (clarifications)
              </Label>
              <Textarea
                id="clarification-notes"
                className="mt-1.5 min-h-[72px] text-sm"
                value={clarificationNotes}
                onChange={(e) => setClarificationNotes(e.target.value)}
                placeholder="Questions for the model…"
              />
            </div>
          </div>
        </CollapsibleContent>
      </Collapsible>

      <Separator />

      <p className="text-xs text-muted-foreground">
        Project{" "}
        <span className="font-medium text-foreground">{project?.name}</span>.
        Stream completes with a server save; edit the Markdown above, then
        &quot;Save to server&quot; to persist edits elsewhere.
      </p>
    </div>
  );
}
