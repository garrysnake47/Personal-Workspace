import { FileText, Pencil, Star, Trash2 } from "lucide-react";
import Link from "next/link";
import { notFound } from "next/navigation";

import { deleteNote, toggleNoteFavorite } from "@/actions/notes";
import { cn } from "@/components/cn";
import { NoteIcon } from "@/components/notes/NoteIcon";
import {
  NoteTableOfContents,
  type TocSection,
} from "@/components/notes/NoteTableOfContents";
import { NoteViewer } from "@/components/notes/NoteViewer";
import { PageHeader } from "@/components/shell/page-header";
import { Badge } from "@/components/ui/badge";
import { Button, buttonVariants } from "@/components/ui/button";
import { getNote } from "@/lib/note-store";
import { requireUserId } from "@/lib/session";

export const metadata = { title: "Note" };

const sectionAnchor = (id: string) => `section-${id}`;
const pageAnchor = (id: string) => `page-${id}`;

export default async function NotePage({
  params,
}: {
  params: Promise<{ noteId: string }>;
}) {
  const { noteId } = await params;
  const userId = await requireUserId();
  const note = await getNote(userId, noteId);
  if (!note) notFound();

  const toc: TocSection[] = note.sections.map((section) => ({
    id: sectionAnchor(section.id),
    title: section.title,
    pages: section.pages.map((page) => ({
      id: pageAnchor(page.id),
      title: page.title,
    })),
  }));

  // Counted across the whole note, so "the first few pages" means the first few
  // on screen rather than the first few of every section.
  let pageNumber = 0;

  return (
    <div className="flex min-w-0 flex-col">
      <PageHeader
        title={note.title}
        description={note.description ?? undefined}
        action={
          <div className="flex flex-wrap items-center gap-2">
            {/* A form, not a link: favouriting is a write. */}
            <form action={toggleNoteFavorite}>
              <input type="hidden" name="id" value={note.id} />
              <Button type="submit" variant="secondary" aria-pressed={note.favorite}>
                <Star
                  aria-hidden="true"
                  className={cn(note.favorite && "fill-warning text-warning")}
                />
                {note.favorite ? "Favourited" : "Favourite"}
              </Button>
            </form>

            <Link
              href={`/notes/${note.id}/edit`}
              className={buttonVariants({ variant: "secondary" })}
            >
              <Pencil aria-hidden="true" />
              Edit
            </Link>

            {/* Moves to trash; nothing leaves the database here. */}
            <form action={deleteNote}>
              <input type="hidden" name="id" value={note.id} />
              <Button
                type="submit"
                variant="ghost"
                className="text-danger hover:text-danger"
              >
                <Trash2 aria-hidden="true" />
                Delete
              </Button>
            </form>
          </div>
        }
      />

      <div className="flex min-w-0 flex-col gap-6 xl:flex-row xl:items-start">
        <div className="flex min-w-0 flex-1 flex-col gap-3">
          {note.sections.length === 0 ? (
            <p className="rounded-lg border border-dashed border-border-strong bg-card px-6 py-12 text-center text-sm text-text-muted">
              This note has no sections yet.
            </p>
          ) : (
            note.sections.map((section, index) => (
              /*
                A native `<details>`, not a client accordion: no JavaScript, the
                whole note stays in the DOM for find-in-page, and the shared
                `name` makes it exclusive — opening one section closes the other.
              */
              <details
                key={section.id}
                id={sectionAnchor(section.id)}
                name="note-section"
                open={index === 0}
                style={{ "--motion-index": index } as React.CSSProperties}
                className="motion-stagger scroll-reveal-item group min-w-0 scroll-mt-20 overflow-hidden rounded-lg border border-border bg-card"
              >
                <summary className="flex cursor-pointer list-none items-center gap-3 px-4 py-3">
                  <span
                    aria-hidden="true"
                    className="grid size-8 shrink-0 place-items-center rounded-md bg-surface-3 text-text-muted"
                  >
                    <NoteIcon
                      icon={
                        note.iconLibrary && note.iconName
                          ? { library: note.iconLibrary, name: note.iconName }
                          : null
                      }
                      className="size-4"
                      fallback={<FileText className="size-4" />}
                    />
                  </span>
                  <span className="min-w-0 flex-1 truncate text-md font-semibold text-text">
                    {section.title}
                  </span>
                  <Badge tone="neutral">
                    {section.pages.length}{" "}
                    {section.pages.length === 1 ? "page" : "pages"}
                  </Badge>
                </summary>

                {section.pages.length === 0 ? (
                  <p className="border-t border-border px-4 py-6 text-center text-sm text-text-muted">
                    No pages in this section.
                  </p>
                ) : (
                  <div className="motion-disclosure-content flex flex-col gap-3 border-t border-border p-3 md:p-4">
                    {section.pages.map((page) => {
                      // Only what is plausibly on screen at load mounts its
                      // editor eagerly — see NoteViewer.
                      const eager = pageNumber++ < 3;
                      return (
                        <article
                          key={page.id}
                          id={pageAnchor(page.id)}
                          className="min-w-0 scroll-mt-20 overflow-hidden rounded-md border border-border bg-surface"
                        >
                          <h3 className="border-b border-border px-4 py-2.5 text-sm font-semibold text-text">
                            {page.title}
                          </h3>
                          <div className="px-4 py-4">
                            <NoteViewer content={page.content} priority={eager} />
                          </div>
                        </article>
                      );
                    })}
                  </div>
                )}
              </details>
            ))
          )}
        </div>

        {toc.length > 0 ? (
          <div className="w-full shrink-0 xl:w-64 xl:sticky xl:top-20">
            <NoteTableOfContents sections={toc} />
          </div>
        ) : null}
      </div>
    </div>
  );
}
