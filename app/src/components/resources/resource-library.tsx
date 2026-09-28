"use client";

import {
  AppWindow,
  BookOpenText,
  Check,
  Clipboard,
  ExternalLink,
  FileCode2,
  Globe,
  GraduationCap,
  LibraryBig,
  Link2,
  Pencil,
  Plus,
  Search,
  SquareTerminal,
  Star,
  Trash2,
  Wrench,
} from "lucide-react";
import Autocomplete from "@mui/material/Autocomplete";
import TextField from "@mui/material/TextField";
import { useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";

import { createResource, deleteResource, toggleResourceFavorite, updateResource } from "@/actions/content";
import { cn } from "@/components/cn";
import { PageHeader } from "@/components/shell/page-header";
import { Button } from "@/components/ui/button";
import { Field, FormError } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { ConfirmationDialog } from "@/components/ui/confirmation-dialog";
import { Modal } from "@/components/ui/modal";
import { TagInput } from "@/components/ui/tag-input";
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
  favorite: boolean;
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
  Website: { label: "Website", plural: "Websites", icon: Globe },
  App: { label: "App", plural: "Apps", icon: AppWindow },
  Link: { label: "Link", plural: "Links", icon: Link2 },
  Tool: { label: "Tool", plural: "Tools", icon: Wrench },
  Command: { label: "Command", plural: "Commands", icon: SquareTerminal },
  Documentation: { label: "Documentation", plural: "Documentation", icon: BookOpenText },
  Snippet: { label: "Snippet", plural: "Snippets", icon: FileCode2 },
  Reference: { label: "Reference", plural: "References", icon: LibraryBig },
  Learning: { label: "Learning", plural: "Learning", icon: GraduationCap },
  Other: { label: "Other", plural: "Other", icon: LibraryBig },
} satisfies Record<ResourceType, { label: string; plural: string; icon: typeof LibraryBig }>;

/** Each type's colour: sidebar tile, panel header tint, card border and icon. */
const TYPE_COLOR: Record<ResourceType, string> = {
  Documentation: "#2563EB",
  Learning: "#16A34A",
  Reference: "#D97706",
  Tool: "#0D9488",
  Website: "#0284C7",
  App: "#7C3AED",
  Link: "#DB2777",
  Command: "#EA580C",
  Snippet: "#4F46E5",
  Other: "#64748B",
};

/** Reading order for the sections on the page. */
const GROUP_ORDER: ResourceType[] = ["Documentation", "Learning", "Reference", "Tool", "Website", "App", "Link", "Command", "Snippet", "Other"];

const URL_TYPES = new Set<ResourceType>(["Website", "App", "Link", "Tool", "Documentation", "Learning"]);

export function ResourceLibrary({ resources, loadError }: { resources: ResourceItem[]; loadError?: string }) {
  const router = useRouter();
  // The popup form: adding a new resource of `type`, or editing `resource`.
  const [composer, setComposer] = useState<{ type: ResourceType; resource?: ResourceItem } | null>(null);
  const [search, setSearch] = useState("");
  const [picked, setPicked] = useState<ResourceType | null>(null);

  // Sidebar of types; the panel shows one type. Search narrows every type's count.
  const query = search.trim().toLowerCase();
  const byType = useMemo(() => {
    const matches = (resource: ResourceItem) => !query || [resource.title, resource.description, resource.content, resource.url ?? "", ...resource.tags]
      .some((value) => value.toLowerCase().includes(query));
    return new Map(GROUP_ORDER.map((type) => [type, resources.filter((resource) => resource.type === type && matches(resource))]));
  }, [resources, query]);
  const types = GROUP_ORDER.filter((type) => resources.some((resource) => resource.type === type));
  const selected = picked && types.includes(picked) ? picked : types[0] ?? null;
  // While searching, fall back to the first type with hits if the selected one has none.
  const firstWithHits = types.find((type) => (byType.get(type) ?? []).length > 0) ?? null;
  const active = query && (!selected || !(byType.get(selected) ?? []).length) ? firstWithHits ?? selected : selected;
  const items = active ? byType.get(active) ?? [] : [];
  // Every tag already used, most used first — the tag field's suggestions.
  const knownTags = useMemo(() => {
    const counts = new Map<string, number>();
    for (const tag of resources.flatMap((resource) => resource.tags)) counts.set(tag, (counts.get(tag) ?? 0) + 1);
    return [...counts.keys()].sort((a, b) => (counts.get(b) ?? 0) - (counts.get(a) ?? 0) || a.localeCompare(b));
  }, [resources]);

  return (
    <div className="motion-page-reveal min-w-0">
      <PageHeader
        title="Resources"
        description="Keep the links, commands, apps, tools, and references you reach for while working."
        action={
          <Button onClick={() => setComposer({ type: active ?? "Website" })}>
            <Plus aria-hidden="true" />
            Add resource
          </Button>
        }
      />

      <FormError>{loadError}</FormError>

      {types.length === 0 ? (
        <div className="wl-card mt-7 grid min-h-64 place-items-center px-5 py-12 text-center">
          <div className="max-w-sm">
            <span className="mx-auto grid size-11 place-items-center rounded-lg bg-surface-2 text-text-muted"><LibraryBig className="size-5" aria-hidden="true" /></span>
            <h3 className="mt-4 text-lg font-semibold text-text">No resources yet</h3>
            <p className="mt-1 text-sm text-text-muted">Add the links, commands and references you reach for.</p>
          </div>
        </div>
      ) : (
        <div className="grid min-w-0 items-start gap-6 lg:grid-cols-[17rem_minmax(0,1fr)]">
          {/* Sidebar: search + every type. Becomes a scrolling chip row on small screens. */}
          <aside className="flex min-w-0 flex-col gap-3 lg:sticky lg:top-20">
            <label className="relative block">
              <span className="sr-only">Search resources</span>
              <Input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search all resources" startIcon={<Search />} />
            </label>
            <nav aria-label="Resource types" className="-mx-1 flex gap-2 overflow-x-auto px-1 pb-1 [scrollbar-width:none] lg:mx-0 lg:flex-col lg:gap-1 lg:overflow-visible lg:rounded-2xl lg:border lg:border-border lg:bg-card lg:p-2 lg:pb-2">
              {types.map((type) => {
                const meta = TYPE_META[type];
                const count = (byType.get(type) ?? []).length;
                const current = active === type;
                return (
                  <button
                    key={type}
                    type="button"
                    aria-current={current ? "page" : undefined}
                    onClick={() => setPicked(type)}
                    style={{ "--type": TYPE_COLOR[type] } as React.CSSProperties}
                    className={cn(
                      "flex shrink-0 cursor-pointer items-center gap-3 rounded-xl border px-2.5 py-2 text-left transition-colors duration-150",
                      current
                        ? "border-[color-mix(in_srgb,var(--type)_45%,var(--c-surface))] bg-[color-mix(in_srgb,var(--type)_12%,var(--c-surface))]"
                        : "border-border bg-surface hover:bg-surface-2 lg:border-transparent lg:bg-transparent",
                      query && count === 0 && "opacity-50",
                    )}
                  >
                    <span className="grid size-8 shrink-0 place-items-center rounded-lg bg-[var(--type)] text-white shadow-sm" aria-hidden="true">
                      <meta.icon className="size-4" />
                    </span>
                    <span className="whitespace-nowrap text-sm font-semibold text-text lg:flex-1">{meta.plural}</span>
                    <span className={cn("grid h-6 min-w-6 place-items-center rounded-full px-1.5 text-xs font-bold tabular-nums", current ? "bg-[var(--type)] text-white" : "bg-surface-3 text-text")}>{count}</span>
                  </button>
                );
              })}
            </nav>
          </aside>

          {/* Panel: the selected type. */}
          {active ? (
            <section
              aria-labelledby="resources-panel-title"
              style={{ "--type": TYPE_COLOR[active] } as React.CSSProperties}
              className="wl-card min-w-0 overflow-hidden border-[color-mix(in_srgb,var(--type)_40%,var(--c-card))]"
            >
              <header className="flex items-center gap-3 border-b border-[color-mix(in_srgb,var(--type)_30%,var(--c-card))] bg-[color-mix(in_srgb,var(--type)_10%,var(--c-card))] px-4 py-4 md:px-5">
                {(() => { const Icon = TYPE_META[active].icon; return (
                  <span className="grid size-10 shrink-0 place-items-center rounded-lg bg-[var(--type)] text-white shadow-sm" aria-hidden="true"><Icon className="size-5" /></span>
                ); })()}
                <div className="min-w-0 flex-1">
                  <h2 id="resources-panel-title" className="text-xl font-bold leading-tight text-text">{TYPE_META[active].plural}</h2>
                  <p className="text-sm text-text-muted">{items.length} {items.length === 1 ? "resource" : "resources"}{query ? " match" : ""}</p>
                </div>
                <Button size="sm" variant="secondary" onClick={() => setComposer({ type: active })}>
                  <Plus aria-hidden="true" />
                  <span className="max-md:sr-only">Add {TYPE_META[active].label.toLowerCase()}</span>
                </Button>
              </header>
              <div className="p-4 md:p-5">
                {items.length === 0 ? (
                  <p className="py-8 text-center text-sm text-text-muted">Nothing matches that search.</p>
                ) : active === "Command" || active === "Snippet" ? (
                  <ul className="flex flex-col gap-4">
                    {items.map((resource) => <CodeLine key={resource.id} resource={resource} onEdit={() => setComposer({ type: resource.type, resource })} />)}
                  </ul>
                ) : (
                  <ul className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
                    {items.map((resource) => <ResourceCard key={resource.id} resource={resource} onEdit={() => setComposer({ type: resource.type, resource })} />)}
                  </ul>
                )}
              </div>
            </section>
          ) : null}
        </div>
      )}

      {composer ? (
        <ResourceComposer
          key={composer.resource?.id ?? "new"}
          initialType={composer.type}
          resource={composer.resource}
          knownTags={knownTags}
          onClose={() => setComposer(null)}
          onSaved={() => { setComposer(null); router.refresh(); }}
        />
      ) : null}
    </div>
  );
}

/** Add a resource, or edit one when `resource` is given — in a popup. */
function ResourceComposer({ initialType, resource, knownTags, onClose, onSaved }: { initialType: ResourceType; resource?: ResourceItem; knownTags: string[]; onClose: () => void; onSaved: () => void }) {
  const [type, setType] = useState<ResourceType>(resource?.type ?? initialType);
  const [title, setTitle] = useState(resource?.title ?? "");
  const [description, setDescription] = useState(resource?.description ?? "");
  const [url, setUrl] = useState(resource?.url ?? "");
  const [content, setContent] = useState(resource?.content ?? "");
  const [tags, setTags] = useState<string[]>(resource?.tags ?? []);
  const [error, setError] = useState<string>();
  const [pending, startTransition] = useTransition();
  const expectsUrl = URL_TYPES.has(type);

  function save() {
    setError(undefined);
    startTransition(async () => {
      const values = { type, title, description, url: url || null, content, tags };
      const result = resource
        ? await updateResource({ resourceId: resource.id, ...values })
        : await createResource(values);
      if (!result.ok) {
        setError(result.error.message);
        return;
      }
      toast.success(resource ? "Resource updated" : "Resource added");
      onSaved();
    });
  }

  return (
    <Modal
      open
      onClose={onClose}
      title={resource ? "Edit resource" : "Add to your library"}
      footer={
        <>
          <Button variant="secondary" onClick={onClose} disabled={pending}>Cancel</Button>
          <Button onClick={save} loading={pending}><Check aria-hidden="true" />{resource ? "Save changes" : "Save resource"}</Button>
        </>
      }
    >
      <div className="grid min-w-0 gap-4">
        <FormError>{error}</FormError>
        <div className="grid gap-4 md:grid-cols-[12rem_minmax(0,1fr)]">
          <Field label="Resource type" htmlFor="resource-type" required>
            <TypePicker id="resource-type" value={type} onChange={setType} />
          </Field>
          <Field label={type === "App" ? "App name" : "Title"} htmlFor="resource-title" required>
            <Input id="resource-title" autoFocus value={title} onChange={(event) => setTitle(event.target.value)} placeholder={type === "Command" ? "Deploy the web app" : type === "App" ? "Figma" : "Resource name"} />
          </Field>
        </div>

        <Field label={expectsUrl ? "URL" : "Related URL (optional)"} htmlFor="resource-url">
          <Input id="resource-url" type="url" inputMode="url" value={url} onChange={(event) => setUrl(event.target.value)} placeholder="https://example.com" />
        </Field>

        <div className="grid gap-4 md:grid-cols-2">
          <Field label="Description" htmlFor="resource-description">
            <Input id="resource-description" value={description} onChange={(event) => setDescription(event.target.value)} placeholder="What is this useful for?" />
          </Field>
          <Field label="Tags" htmlFor="resource-tags" hint="Pick a saved tag, or type a new one and press Enter or comma.">
            <TagInput id="resource-tags" value={tags} onChange={setTags} suggestions={knownTags} />
          </Field>
        </div>

        <Field label={type === "Command" ? "Command" : type === "Snippet" ? "Code or snippet" : "Notes or details"} htmlFor="resource-content">
          <Textarea id="resource-content" value={content} onChange={(event) => setContent(event.target.value)} rows={type === "Command" ? 3 : 4} className="font-mono" />
        </Field>
      </div>
    </Modal>
  );
}

/**
 * Resource type as a searchable dropdown — type "doc" to jump to
 * Documentation. MUI Autocomplete limited to the ten types (no free text);
 * each option carries its type icon and colour.
 */
function TypePicker({ id, value, onChange }: { id: string; value: ResourceType; onChange: (next: ResourceType) => void }) {
  const Icon = TYPE_META[value].icon;
  return (
    <Autocomplete<ResourceType, false, true, false>
      id={id}
      disableClearable
      autoHighlight
      openOnFocus
      value={value}
      options={RESOURCE_TYPES}
      getOptionLabel={(option) => TYPE_META[option].label}
      onChange={(_event, next) => onChange(next)}
      noOptionsText="No type matches"
      renderOption={({ key, ...props }, option) => {
        const OptionIcon = TYPE_META[option].icon;
        return (
          <li key={key} {...props} style={{ "--type": TYPE_COLOR[option] } as React.CSSProperties}>
            <span className="mr-2.5 grid size-7 shrink-0 place-items-center rounded-md bg-[color-mix(in_srgb,var(--type)_14%,var(--c-surface))] text-[var(--type)]" aria-hidden="true">
              <OptionIcon className="size-4" />
            </span>
            {TYPE_META[option].label}
          </li>
        );
      }}
      renderInput={(params) => (
        <TextField
          {...params}
          slotProps={{
            ...params.slotProps,
            input: {
              ...params.slotProps.input,
              startAdornment: <Icon aria-hidden="true" className="ml-1 size-4 shrink-0" style={{ color: TYPE_COLOR[value] }} />,
            },
          }}
        />
      )}
    />
  );
}

/** Shared delete handler for both card kinds. */
function useRemove(resource: ResourceItem) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [asking, setAsking] = useState(false);
  function confirmRemove() {
    setAsking(false);
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
  const dialog = (
    <ConfirmationDialog
      open={asking}
      title={`Delete “${resource.title}”?`}
      description="It's removed from your library and favourites. This can't be undone."
      confirmLabel="Delete resource"
      destructive
      onConfirm={confirmRemove}
      onCancel={() => setAsking(false)}
    />
  );
  return { remove: () => setAsking(true), pending, dialog };
}

function FavoriteButton({ resource, className }: { resource: ResourceItem; className?: string }) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  return (
    <Button
      variant="ghost"
      size="sm"
      iconOnly
      disabled={pending}
      aria-pressed={resource.favorite}
      aria-label={resource.favorite ? `Remove ${resource.title} from favourites` : `Add ${resource.title} to favourites`}
      title={resource.favorite ? "Remove from favourites" : "Add to favourites"}
      onClick={() => startTransition(async () => {
        const result = await toggleResourceFavorite({ resourceId: resource.id, favorite: !resource.favorite });
        if (!result.ok) { toast.error(result.error.message); return; }
        router.refresh();
      })}
      className={cn("relative z-10", resource.favorite ? "text-warning" : "text-text-subtle hover:text-text", className)}
    >
      <Star aria-hidden="true" className={cn(resource.favorite && "fill-current")} />
    </Button>
  );
}

function EditButton({ resource, onClick, className }: { resource: ResourceItem; onClick: () => void; className?: string }) {
  return (
    <Button variant="ghost" size="sm" iconOnly onClick={onClick} aria-label={`Edit ${resource.title}`} title="Edit" className={cn("relative z-10 text-text-subtle hover:text-text", className)}>
      <Pencil aria-hidden="true" />
    </Button>
  );
}

function DeleteButton({ resource, onClick, pending, className }: { resource: ResourceItem; onClick: () => void; pending: boolean; className?: string }) {
  return (
    <Button variant="ghost" size="sm" iconOnly loading={pending} onClick={onClick} aria-label={`Delete ${resource.title}`} title="Delete" className={cn("relative z-10 text-text-subtle hover:text-danger", className)}>
      <Trash2 aria-hidden="true" />
    </Button>
  );
}

/** A link as a card: icon, name, site, description and tags. The card opens the URL. */
function ResourceCard({ resource, onEdit }: { resource: ResourceItem; onEdit: () => void }) {
  const { remove, pending, dialog } = useRemove(resource);
  const meta = TYPE_META[resource.type];
  const host = resource.url ? safeHost(resource.url) : undefined;
  return (
    <li className="group relative flex min-w-0 flex-col gap-2.5 rounded-xl border border-[color-mix(in_srgb,var(--type)_35%,var(--c-surface))] bg-surface p-4 transition-[border-color,box-shadow] duration-150 hover:border-[var(--type)] hover:shadow-md">
      <div className="flex min-w-0 items-start gap-3">
        <span className="grid size-9 shrink-0 place-items-center rounded-lg bg-[color-mix(in_srgb,var(--type)_14%,var(--c-surface))] text-[var(--type)]" aria-hidden="true">
          <meta.icon className="size-[18px]" />
        </span>
        <div className="min-w-0 flex-1">
          {resource.url ? (
            <a href={resource.url} target="_blank" rel="noreferrer" className="block truncate text-md font-semibold text-text after:absolute after:inset-0 after:rounded-[inherit] group-hover:text-[var(--type)]">
              {resource.title}
            </a>
          ) : (
            <p className="truncate text-md font-semibold text-text">{resource.title}</p>
          )}
          {host ? (
            <p className="mt-0.5 flex min-w-0 items-center gap-1 text-xs text-text-subtle">
              <ExternalLink className="size-3 shrink-0" aria-hidden="true" />
              <span className="truncate">{host}</span>
            </p>
          ) : null}
        </div>
        <span className="-mr-1.5 -mt-1 flex shrink-0 items-center">
          <FavoriteButton resource={resource} className={cn("size-7", !resource.favorite && "md:opacity-0 md:group-focus-within:opacity-100 md:group-hover:opacity-100")} />
          <EditButton resource={resource} onClick={onEdit} className="size-7 md:opacity-0 md:group-focus-within:opacity-100 md:group-hover:opacity-100" />
          <DeleteButton resource={resource} onClick={remove} pending={pending} className="size-7 md:opacity-0 md:group-focus-within:opacity-100 md:group-hover:opacity-100" />
        </span>
      </div>
      {resource.description ? <p className="line-clamp-2 text-sm leading-relaxed text-text-muted">{resource.description}</p> : null}
      {resource.tags.length ? (
        <div className="flex flex-wrap gap-1.5">
          {resource.tags.map((tag) => (
            <span key={tag} className="rounded-full bg-[color-mix(in_srgb,var(--type)_10%,var(--c-surface))] px-2 py-0.5 text-xs font-semibold text-text-muted">#{tag}</span>
          ))}
        </div>
      ) : null}
      {dialog}
    </li>
  );
}

/** Commands and snippets: name, then the code line with Copy. */
function CodeLine({ resource, onEdit }: { resource: ResourceItem; onEdit: () => void }) {
  const { remove, pending, dialog } = useRemove(resource);
  const value = resource.content || resource.url || "";
  return (
    <li className="group min-w-0">
      <div className="mb-1.5 flex items-center gap-2">
        <p className="truncate text-sm font-semibold text-text">{resource.title}</p>
        {resource.description ? <p className="hidden truncate text-sm text-text-muted md:block">— {resource.description}</p> : null}
        <span className="ml-auto flex items-center">
          <FavoriteButton resource={resource} className="size-7" />
          <EditButton resource={resource} onClick={onEdit} className="size-7" />
          <DeleteButton resource={resource} onClick={remove} pending={pending} className="size-7" />
        </span>
      </div>
      <div className="flex min-w-0 items-start gap-2 rounded-lg border border-[color-mix(in_srgb,var(--type)_40%,var(--c-surface))] bg-[color-mix(in_srgb,var(--type)_6%,var(--c-surface))] py-2 pl-3 pr-2">
        <pre className="min-w-0 flex-1 whitespace-pre-wrap break-words py-0.5 font-mono text-sm leading-relaxed text-text">{value}</pre>
        <CopyButton value={value} />
      </div>
      {dialog}
    </li>
  );
}

function CopyButton({ value }: { value: string }) {
  const [copied, setCopied] = useState(false);
  async function copy() {
    await navigator.clipboard.writeText(value);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1600);
  }
  return (
    <button type="button" onClick={copy} aria-label="Copy to clipboard" className="inline-flex h-7 shrink-0 cursor-pointer items-center gap-1.5 rounded-md border border-border bg-surface px-2 text-xs font-semibold text-text-muted transition-colors duration-150 hover:border-border-strong hover:text-text">
      {copied ? <Check className="size-3.5" aria-hidden="true" /> : <Clipboard className="size-3.5" aria-hidden="true" />}
      {copied ? "Copied" : "Copy"}
    </button>
  );
}

function safeHost(url: string) {
  try { return new URL(url).hostname.replace(/^www\./, ""); } catch { return url; }
}
