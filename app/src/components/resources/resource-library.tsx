"use client";

import {
  AppWindow,
  BookOpenText,
  Check,
  ChevronDown,
  Clipboard,
  Code2,
  ExternalLink,
  FileCode2,
  GraduationCap,
  LibraryBig,
  Link2,
  Plus,
  Search,
  Trash2,
  Wrench,
} from "lucide-react";
import { useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";

import { createResource, deleteResource } from "@/actions/content";
import { cn } from "@/components/cn";
import { PageHeader } from "@/components/shell/page-header";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Field, FormError } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "@/components/ui/toast";
import type { ResourceType } from "@/generated/prisma/enums";

type ResourceItem = {
  id: string;
  title: string;
  description: string;
  type: ResourceType;
  url: string | null;
  content: string;
  tags: string[];
  createdAt: string;
  updatedAt: string;
};

const RESOURCE_TYPES = [
  "Website",
  "App",
  "Link",
  "Tool",
  "Command",
  "Documentation",
  "Snippet",
  "Reference",
  "Learning",
  "Other",
] as const satisfies readonly ResourceType[];

const TYPE_META = {
  Website: { label: "Website", icon: ExternalLink, tone: "bg-info-subtle text-info" },
  App: { label: "App", icon: AppWindow, tone: "bg-primary-subtle text-primary-strong" },
  Link: { label: "Link", icon: Link2, tone: "bg-status-testing-bg text-status-testing" },
  Tool: { label: "Tool", icon: Wrench, tone: "bg-success-subtle text-success" },
  Command: { label: "Command", icon: Code2, tone: "bg-warning-subtle text-warning" },
  Documentation: { label: "Documentation", icon: BookOpenText, tone: "bg-info-subtle text-info" },
  Snippet: { label: "Snippet", icon: FileCode2, tone: "bg-status-progress-bg text-status-progress" },
  Reference: { label: "Reference", icon: LibraryBig, tone: "bg-status-waiting-bg text-status-waiting" },
  Learning: { label: "Learning", icon: GraduationCap, tone: "bg-success-subtle text-success" },
  Other: { label: "Other", icon: LibraryBig, tone: "bg-surface-3 text-text-muted" },
} satisfies Record<ResourceType, { label: string; icon: typeof LibraryBig; tone: string }>;

const URL_TYPES = new Set<ResourceType>(["Website", "App", "Link", "Tool", "Documentation", "Learning"]);

export function ResourceLibrary({ resources, loadError }: { resources: ResourceItem[]; loadError?: string }) {
  const router = useRouter();
  const [showComposer, setShowComposer] = useState(false);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<ResourceType | "All">("All");

  const counts = useMemo(() => {
    const next = Object.fromEntries(RESOURCE_TYPES.map((type) => [type, 0])) as Record<ResourceType, number>;
    resources.forEach((resource) => { next[resource.type] += 1; });
    return next;
  }, [resources]);

  const visibleResources = useMemo(() => {
    const query = search.trim().toLowerCase();
    return resources.filter((resource) => {
      const matchesType = filter === "All" || resource.type === filter;
      const matchesQuery = !query || [resource.title, resource.description, resource.content, resource.url ?? "", ...resource.tags]
        .some((value) => value.toLowerCase().includes(query));
      return matchesType && matchesQuery;
    });
  }, [filter, resources, search]);

  return (
    <div className="motion-page-reveal min-w-0">
      <PageHeader
        title="Resources"
        description="Keep the links, commands, apps, tools, and references you reach for while working."
        action={
          <Button onClick={() => setShowComposer((open) => !open)} aria-expanded={showComposer} aria-controls="resource-composer">
            <Plus aria-hidden="true" />
            Add resource
          </Button>
        }
      />

      {showComposer ? <ResourceComposer onSaved={() => { setShowComposer(false); router.refresh(); }} /> : null}

      <FormError>{loadError}</FormError>

      <section aria-labelledby="resource-index-heading" className="mt-7 min-w-0">
        <div className="flex flex-col gap-3 border-b border-border pb-4 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="text-xs font-semibold tracking-[0.08em] text-text-subtle uppercase">Resource index</p>
            <h2 id="resource-index-heading" className="mt-1 text-xl font-semibold text-text">Your working library</h2>
          </div>
          <div className="flex items-center gap-2 text-sm text-text-muted">
            <LibraryBig className="size-4 text-primary-strong" aria-hidden="true" />
            {resources.length} {resources.length === 1 ? "resource" : "resources"}
          </div>
        </div>

        <div className="grid gap-3 border-b border-border py-4 md:grid-cols-[minmax(0,1fr)_15rem]">
          <label className="relative block">
            <span className="sr-only">Search resources</span>
            <Input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search title, tag, URL, or content…" startIcon={<Search />} />
          </label>
          <label>
            <span className="sr-only">Filter by resource type</span>
            <Select value={filter} onChange={(event) => setFilter(event.target.value as ResourceType | "All")}>
              <option value="All">All types ({resources.length})</option>
              {RESOURCE_TYPES.map((type) => <option key={type} value={type}>{TYPE_META[type].label} ({counts[type]})</option>)}
            </Select>
          </label>
        </div>

        <div className="mt-4 border-y border-border bg-surface">
          {visibleResources.length ? (
            <div className="divide-y divide-border">
              {visibleResources.map((resource, index) => <ResourceRow key={resource.id} resource={resource} index={index} />)}
            </div>
          ) : (
            <div className="grid min-h-64 place-items-center px-5 py-12 text-center">
              <div className="max-w-sm">
                <span className="mx-auto grid size-11 place-items-center rounded-md bg-surface-3 text-text-muted"><LibraryBig className="size-5" aria-hidden="true" /></span>
                <h3 className="mt-4 text-lg font-semibold text-text">No matching resources</h3>
                <p className="mt-1 text-sm text-text-muted">Change the filter or add the first resource to this section.</p>
              </div>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}

function ResourceComposer({ onSaved }: { onSaved: () => void }) {
  const [type, setType] = useState<ResourceType>("Website");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [url, setUrl] = useState("");
  const [content, setContent] = useState("");
  const [tags, setTags] = useState("");
  const [error, setError] = useState<string>();
  const [pending, startTransition] = useTransition();
  const expectsUrl = URL_TYPES.has(type);

  function save() {
    setError(undefined);
    startTransition(async () => {
      const result = await createResource({
        type,
        title,
        description,
        url: url || null,
        content,
        tags: tags.split(",").map((tag) => tag.trim()).filter(Boolean),
      });
      if (!result.ok) {
        setError(result.error.message);
        return;
      }
      toast.success("Resource added");
      onSaved();
    });
  }

  return (
    <section id="resource-composer" aria-labelledby="resource-composer-heading" className="motion-disclosure mb-6 overflow-hidden border-y border-primary/40 bg-primary-subtle/45">
      <div className="grid gap-5 p-4 md:p-5 lg:grid-cols-[14rem_minmax(0,1fr)] lg:gap-7">
        <div>
          <span className="grid size-10 place-items-center rounded-md bg-surface-3 text-text-muted"><Plus className="size-5" aria-hidden="true" /></span>
          <h2 id="resource-composer-heading" className="mt-3 text-xl font-semibold text-text">Add to your library</h2>
          <p className="mt-1 text-sm leading-relaxed text-text-muted">Choose a type first. The saved entry will be formatted for that kind of resource.</p>
        </div>

        <div className="grid min-w-0 gap-4">
          <FormError>{error}</FormError>
          <div className="grid gap-4 md:grid-cols-[13rem_minmax(0,1fr)]">
            <Field label="Resource type" htmlFor="resource-type" required>
              <Select id="resource-type" value={type} onChange={(event) => setType(event.target.value as ResourceType)}>
                {RESOURCE_TYPES.map((resourceType) => <option key={resourceType} value={resourceType}>{TYPE_META[resourceType].label}</option>)}
              </Select>
            </Field>
            <Field label={type === "App" ? "App name" : "Title"} htmlFor="resource-title" required>
              <Input id="resource-title" value={title} onChange={(event) => setTitle(event.target.value)} placeholder={type === "Command" ? "Deploy the web app" : type === "App" ? "Figma" : "Resource name"} />
            </Field>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <Field label="Description" htmlFor="resource-description">
              <Input id="resource-description" value={description} onChange={(event) => setDescription(event.target.value)} placeholder="What is this useful for?" />
            </Field>
            <Field label="Tags" htmlFor="resource-tags" hint="Separate tags with commas.">
              <Input id="resource-tags" value={tags} onChange={(event) => setTags(event.target.value)} placeholder="design, daily, frontend" />
            </Field>
          </div>

          <Field label={expectsUrl ? "URL" : "Related URL (optional)"} htmlFor="resource-url">
            <Input id="resource-url" type="url" inputMode="url" value={url} onChange={(event) => setUrl(event.target.value)} placeholder="https://example.com" />
          </Field>

          <Field label={type === "Command" ? "Command" : type === "Snippet" ? "Code or snippet" : "Notes or details"} htmlFor="resource-content">
            <Textarea id="resource-content" value={content} onChange={(event) => setContent(event.target.value)} rows={type === "Command" ? 3 : 4} placeholder={type === "Command" ? "npm run build" : "Add useful context, setup steps, or reference text…"} className="font-mono" />
          </Field>

          <div className="flex flex-col-reverse gap-2 xs:flex-row xs:justify-end">
            <Button variant="secondary" onClick={onSaved} disabled={pending}>Cancel</Button>
            <Button onClick={save} loading={pending}><Check aria-hidden="true" />Save resource</Button>
          </div>
        </div>
      </div>
    </section>
  );
}

function ResourceRow({ resource, index }: { resource: ResourceItem; index: number }) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const meta = TYPE_META[resource.type];
  const Icon = meta.icon;
  const host = resource.url ? safeHost(resource.url) : undefined;

  function remove() {
    if (!window.confirm(`Delete “${resource.title}”?`)) return;
    startTransition(async () => {
      const result = await deleteResource({ resourceId: resource.id });
      if (!result.ok) {
        toast.error(result.error.message);
        return;
      }
      toast.success("Resource deleted");
      router.refresh();
    });
  }

  return (
    <details className="group motion-stagger scroll-reveal-item bg-surface open:bg-surface-2/45" style={{ "--motion-index": index } as React.CSSProperties}>
      <summary className="flex min-h-18 cursor-pointer list-none items-center gap-3 px-4 py-3 transition-colors duration-150 ease-standard hover:bg-surface-2 marker:content-none md:px-5 [&::-webkit-details-marker]:hidden">
        <span className={cn("grid size-10 shrink-0 place-items-center rounded-md", meta.tone)}><Icon className="size-5" aria-hidden="true" /></span>
        <span className="min-w-0 flex-1">
          <span className="flex min-w-0 flex-wrap items-center gap-x-2 gap-y-1">
            <span className="truncate text-base font-semibold text-text">{resource.title}</span>
            <Badge tone="neutral" outline>{meta.label}</Badge>
          </span>
          <span className="mt-1 block truncate text-sm text-text-muted">{resource.description || host || preview(resource.content) || "No description added"}</span>
        </span>
        <span className="hidden max-w-56 flex-wrap justify-end gap-1.5 lg:flex">
          {resource.tags.slice(0, 3).map((tag) => <Badge key={tag} tone="neutral">{tag}</Badge>)}
        </span>
        <ChevronDown className="size-4 shrink-0 text-text-subtle transition-transform duration-200 ease-standard group-open:rotate-180" aria-hidden="true" />
      </summary>

      <div className="motion-disclosure border-t border-border bg-surface px-4 py-4 md:px-5 md:pl-[4.75rem]">
        <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-start">
          <div className="min-w-0 space-y-3">
            {resource.description ? <p className="max-w-3xl text-sm leading-relaxed text-text-muted">{resource.description}</p> : null}
            {resource.url ? (
              <a href={resource.url} target="_blank" rel="noreferrer" className="inline-flex max-w-full items-center gap-2 text-sm font-semibold text-primary-strong hover:underline">
                <ExternalLink className="size-4 shrink-0" aria-hidden="true" />
                <span className="truncate">{resource.url}</span>
              </a>
            ) : null}
            {resource.content ? (
              <div className="overflow-hidden rounded-lg border border-border bg-bg">
                <div className="flex items-center justify-between gap-3 border-b border-border px-3 py-1.5">
                  <span className="text-xs font-semibold tracking-[0.06em] text-text-subtle uppercase">{resource.type === "Command" ? "Command" : "Saved details"}</span>
                  <CopyButton value={resource.content} />
                </div>
                <pre className="max-h-72 overflow-auto whitespace-pre-wrap break-words p-3 font-mono text-sm leading-relaxed text-text">{resource.content}</pre>
              </div>
            ) : null}
            {resource.tags.length ? <div className="flex flex-wrap gap-1.5 lg:hidden">{resource.tags.map((tag) => <Badge key={tag} tone="neutral">{tag}</Badge>)}</div> : null}
          </div>
          <Button variant="ghost" onClick={remove} loading={pending} className="justify-start text-danger hover:text-danger lg:justify-center" aria-label={`Delete ${resource.title}`}>
            <Trash2 aria-hidden="true" />Delete
          </Button>
        </div>
      </div>
    </details>
  );
}

function CopyButton({ value }: { value: string }) {
  const [copied, setCopied] = useState(false);
  async function copy() {
    await navigator.clipboard.writeText(value);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1600);
  }
  return <Button variant="ghost" size="sm" onClick={copy} aria-label="Copy saved content">{copied ? <Check className="text-success" aria-hidden="true" /> : <Clipboard aria-hidden="true" />}{copied ? "Copied" : "Copy"}</Button>;
}

function safeHost(url: string) {
  try { return new URL(url).hostname.replace(/^www\./, ""); } catch { return url; }
}

function preview(value: string) {
  return value.trim().split("\n")[0]?.slice(0, 120);
}
