"use client";

import { Reorder } from "framer-motion";
import { Loader2, Plus } from "lucide-react";
import Link from "next/link";
import {
  useActionState,
  useEffect,
  useId,
  useMemo,
  useState,
} from "react";

import type { NoteFormState } from "@/actions/notes";
import { Field } from "@/components/notes/note-field";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { EMPTY_NOTE_DOC } from "@/components/notes/editor-extensions";
import { NoteIconPicker } from "@/components/notes/NoteIconPicker";
import type { PageDraft } from "@/components/notes/PageEditor";
import {
  SectionEditor,
  type SectionDraft,
} from "@/components/notes/SectionEditor";
import type { NoteIconRef } from "@/lib/note-icons";
import { noteSchema, type NoteDetail, type NoteInput } from "@/lib/notes";
import { cn } from "@/components/cn";

const initialState: NoteFormState = {};

/** Everything the editor needs from a saved note. */
export type NoteFormDefaults = Pick<
  NoteDetail,
  "id" | "title" | "description" | "iconName" | "iconLibrary" | "sections"
>;

/**
 * Ids for rows added at runtime. New ids never match a row in the database, so
 * `updateNote` treats them as inserts — which is exactly what they are.
 */
const newId = () => crypto.randomUUID();

const emptyPage = (id: string): PageDraft => ({
  id,
  title: "",
  content: EMPTY_NOTE_DOC,
});

/**
 * The starting tree: one section, one page. Ids are derived from `useId` rather
 * than `crypto.randomUUID` so the server and client render the same hidden
 * payload — a random id here is a hydration mismatch.
 */
function seedSections(base: string): SectionDraft[] {
  return [{ id: `${base}s`, title: "", pages: [emptyPage(`${base}p`)] }];
}

function fromDefaults(defaults: NoteFormDefaults): SectionDraft[] {
  return defaults.sections.map((section) => ({
    id: section.id,
    title: section.title,
    pages: section.pages.map((page) => ({
      id: page.id,
      title: page.title,
      content: page.content,
    })),
  }));
}

export function NoteForm({
  action,
  defaults,
  heading,
  submitLabel,
}: {
  action: (prev: NoteFormState, formData: FormData) => Promise<NoteFormState>;
  defaults?: NoteFormDefaults;
  heading: string;
  submitLabel: string;
}) {
  const [state, formAction, isPending] = useActionState(action, initialState);
  const base = useId();

  const [title, setTitle] = useState(defaults?.title ?? "");
  const [description, setDescription] = useState(defaults?.description ?? "");
  const [icon, setIcon] = useState<NoteIconRef | null>(
    defaults?.iconName && defaults?.iconLibrary
      ? { library: defaults.iconLibrary, name: defaults.iconName }
      : null,
  );
  const [sections, setSections] = useState<SectionDraft[]>(() =>
    defaults && defaults.sections.length > 0
      ? fromDefaults(defaults)
      : seedSections(base),
  );
  const [collapsed, setCollapsed] = useState<string[]>([]);
  /**
   * Client validation runs the very same Zod schema as the action, so its
   * error keys already line up with `state.errors`. When it has an opinion it
   * is the fresher one, so it wins outright rather than merging.
   */
  const [clientErrors, setClientErrors] = useState<Record<
    string,
    string[]
  > | null>(null);

  const payload: NoteInput = useMemo(
    () => ({
      title,
      description,
      iconName: icon?.name ?? "",
      iconLibrary: icon
        ? (icon.library as NoteInput["iconLibrary"])
        : undefined,
      // order is never stored on the draft — array position is the truth
      sections: sections.map((section, sectionIndex) => ({
        id: section.id,
        title: section.title,
        order: sectionIndex,
        pages: section.pages.map((page, pageIndex) => ({
          id: page.id,
          title: page.title,
          content: page.content,
          order: pageIndex,
        })),
      })),
    }),
    [title, description, icon, sections],
  );

  const serialised = useMemo(() => JSON.stringify(payload), [payload]);
  // the payload as it stood when the editor opened, for the dirty indicator
  const [pristine] = useState(serialised);
  const dirty = serialised !== pristine;

  const errors = clientErrors ?? state.errors;
  const message = clientErrors
    ? "Please fix the highlighted fields."
    : state.message;

  /**
   * Sections carrying an error, by index. A folded section would hide its own
   * error message, so being flagged simply overrides the fold — derived here
   * rather than by writing back into `collapsed`.
   */
  const flagged = useMemo(() => {
    const found = new Set<number>();
    for (const key of Object.keys(errors ?? {})) {
      const match = /^sections\.(\d+)\./.exec(key);
      if (match) found.add(Number(match[1]));
    }
    return found;
  }, [errors]);

  useEffect(() => {
    if (!dirty || isPending) return;
    const warn = (event: BeforeUnloadEvent) => event.preventDefault();
    window.addEventListener("beforeunload", warn);
    return () => window.removeEventListener("beforeunload", warn);
  }, [dirty, isPending]);

  const pageCount = sections.reduce(
    (total, section) => total + section.pages.length,
    0,
  );

  const updateSection = (id: string, next: SectionDraft) =>
    setSections((rows) => rows.map((row) => (row.id === id ? next : row)));

  const addSection = () => {
    const section: SectionDraft = {
      id: newId(),
      title: "",
      pages: [emptyPage(newId())],
    };
    setSections((rows) => [...rows, section]);
  };

  const duplicateSection = (index: number) => {
    setSections((rows) => {
      const source = rows[index];
      const copy: SectionDraft = {
        id: newId(),
        title: source.title ? `${source.title} copy` : "",
        pages: source.pages.map((page) => ({ ...page, id: newId() })),
      };
      const next = [...rows];
      next.splice(index + 1, 0, copy);
      return next;
    });
  };

  /** Lift a page out of one section and drop it at the end of another. */
  const movePage = (pageId: string, targetSectionId: string) => {
    setSections((rows) => {
      const moved = rows
        .flatMap((section) => section.pages)
        .find((page) => page.id === pageId);
      if (!moved) return rows;

      return rows.map((section) => {
        if (section.id === targetSectionId) {
          return { ...section, pages: [...section.pages, moved] };
        }
        if (!section.pages.some((page) => page.id === pageId)) return section;
        return {
          ...section,
          pages: section.pages.filter((page) => page.id !== pageId),
        };
      });
    });
    setCollapsed((open) => open.filter((id) => id !== targetSectionId));
  };

  const sectionOptions = useMemo(
    () => sections.map((section) => ({ id: section.id, title: section.title })),
    [sections],
  );

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    const parsed = noteSchema.safeParse(payload);
    if (parsed.success) {
      setClientErrors(null);
      return;
    }

    event.preventDefault();
    const found: Record<string, string[]> = {};
    for (const issue of parsed.error.issues) {
      const key = issue.path.join(".") || "form";
      found[key] = [...(found[key] ?? []), issue.message];
    }
    setClientErrors(found);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <form action={formAction} onSubmit={handleSubmit}>
      <input type="hidden" name="notes" value={serialised} />
      {defaults?.id ? (
        <input type="hidden" name="id" value={defaults.id} />
      ) : null}

      <div className="sticky -top-6 z-30 -mx-5 -mt-6 mb-5 flex flex-wrap items-center justify-between gap-x-3 gap-y-2 border-b border-border bg-bg/95 px-5 pb-3 pt-6 backdrop-blur-[12px] sm:mb-6 sm:pb-3.5 md:-top-8 md:-mx-8 md:-mt-8 md:px-8 md:pt-8">
        <div className="min-w-0 flex-1">
          <h1 className="truncate text-md font-semibold tracking-[-0.03em] text-text sm:text-text md:text-text">
            {heading}
          </h1>
          <p className="text-xs text-text-muted sm:text-sm">
            {sections.length} section{sections.length === 1 ? "" : "s"} ·{" "}
            {pageCount} page{pageCount === 1 ? "" : "s"}
            <span aria-live="polite" className="text-text-subtle">
              {" · "}
              {dirty ? "Unsaved changes" : "All changes saved"}
            </span>
          </p>
        </div>

        <div className="flex shrink-0 items-center gap-1.5 sm:gap-2">
          <Link
            href={
              defaults?.id ? `/notes/${defaults.id}` : "/notes"
            }
            className="inline-flex h-[44px] items-center justify-center rounded-full px-3 text-sm font-medium text-text-muted transition-colors hover:text-text sm:h-[40px] sm:px-4"
          >
            Cancel
          </Link>
          <button
            type="submit"
            disabled={isPending}
            className="inline-flex h-[44px] items-center justify-center gap-2 rounded-full bg-sidebar px-4 text-sm font-medium text-sidebar-fg transition-colors hover:bg-sidebar-2 disabled:pointer-events-none disabled:opacity-70 sm:h-[40px] sm:px-5 sm:text-base"
          >
            {isPending ? (
              <>
                <Loader2 aria-hidden="true" className="size-4 animate-spin" />
                Saving
              </>
            ) : (
              submitLabel
            )}
          </button>
        </div>
      </div>

      {message ? (
        <p
          role="alert"
          className="mb-6 rounded-[10px] bg-danger-subtle px-4 py-3 text-sm text-danger"
        >
          {message}
        </p>
      ) : null}

      {/*
        One flowing document: the note's own details, a rule, then the sections.
        Deliberately not a stack of cards — the hierarchy is carried by
        headings, indentation and hairlines.
      */}
      <div className="w-full min-w-0">
        <section className="min-w-0">
          <div className="grid min-w-0 gap-5 md:grid-cols-[minmax(0,1fr)_auto] md:items-start md:gap-6">
            {/*
              Title and description share a row from `lg` up — the page is far
              wider than either field needs on its own.
            */}
            <div className="grid min-w-0 gap-5 lg:grid-cols-2 lg:items-start lg:gap-6">
              <Field label="Title" htmlFor="note-title" errors={errors?.title}>
                <Input
                  id="note-title"
                  value={title}
                  onChange={(event) => setTitle(event.target.value)}
                  placeholder="Java Fundamentals"
                />
              </Field>

              <Field
                label="Note description"
                htmlFor="note-description"
                hint="A short summary"
                optional
                errors={errors?.description}
              >
                <Textarea
                  id="note-description"
                  value={description}
                  onChange={(event) => setDescription(event.target.value)}
                  rows={3}
                  placeholder="What this note covers, in a sentence or two."
                />
              </Field>
            </div>

            <div className="min-w-0 md:w-[220px] lg:w-[240px]">
              <NoteIconPicker
                value={icon}
                onChange={setIcon}
                label="Note icon"
              />
            </div>
          </div>
        </section>

        <div className="mt-7 flex flex-wrap items-baseline justify-between gap-x-3 gap-y-1 border-t border-border-strong pt-6 sm:mt-8 sm:pt-7">
          <h2 className="text-base font-semibold tracking-[-0.01em] text-text sm:text-base">
            Sections
          </h2>
          <p className="text-xs text-text-muted sm:text-sm">
            Drag a section or page by its handle to reorder it.
          </p>
        </div>

        <div className="mt-5 min-w-0 sm:mt-6">
          <Reorder.Group
            as="div"
            axis="y"
            values={sections}
            onReorder={setSections}
            className="min-w-0"
          >
            {sections.map((section, index) => (
              <SectionEditor
                key={section.id}
                section={section}
                index={index}
                removable={sections.length > 1}
                sections={sectionOptions}
                collapsed={
                  collapsed.includes(section.id) && !flagged.has(index)
                }
                errors={errors}
                onToggleCollapse={() =>
                  setCollapsed((open) =>
                    open.includes(section.id)
                      ? open.filter((id) => id !== section.id)
                      : [...open, section.id],
                  )
                }
                onChange={(next) => updateSection(section.id, next)}
                onDuplicate={() => duplicateSection(index)}
                onRemove={() =>
                  setSections((rows) =>
                    rows.filter((row) => row.id !== section.id),
                  )
                }
                onAddPage={() =>
                  updateSection(section.id, {
                    ...section,
                    pages: [...section.pages, emptyPage(newId())],
                  })
                }
                onMovePage={movePage}
              />
            ))}
          </Reorder.Group>
        </div>

        <button
          type="button"
          onClick={addSection}
          className={cn(
            "mt-7 inline-flex min-h-[44px] items-center gap-1.5 rounded-full border border-border bg-surface px-4 py-2 sm:mt-8 sm:min-h-0",
            "text-sm font-medium text-text transition-colors",
            "hover:border-border-strong hover:bg-surface-2",
            "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring",
          )}
        >
          <Plus aria-hidden="true" className="size-[15px]" />
          Add section
        </button>
      </div>
    </form>
  );
}

export default NoteForm;
