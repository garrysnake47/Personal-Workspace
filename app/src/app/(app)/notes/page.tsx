import { FileText, Plus, Star } from "lucide-react";
import Link from "next/link";

import { toggleNoteFavorite } from "@/actions/notes";
import { cn } from "@/components/cn";
import { NoteIcon } from "@/components/notes/NoteIcon";
import { PageHeader } from "@/components/shell/page-header";
import { Badge } from "@/components/ui/badge";
import { Button, buttonVariants } from "@/components/ui/button";
import { listNotes } from "@/lib/note-store";
import { requireUserId } from "@/lib/session";

export const metadata = { title: "Notes" };

const dateLabel = (date: Date) =>
  date.toLocaleDateString("en-GB", { day: "numeric", month: "short" });

export default async function NotesPage() {
  const userId = await requireUserId();
  const notes = await listNotes(userId);

  return (
    <div className="flex min-w-0 flex-col">
      <PageHeader
        title="Notes"
        description="A notebook per subject: sections inside a note, pages inside a section. Favourites sort to the top."
        action={
          <Link href="/notes/new" className={buttonVariants()}>
            <Plus aria-hidden="true" />
            New note
          </Link>
        }
      />

      {notes.length === 0 ? (
        <div className="scroll-reveal flex flex-col items-center gap-3 rounded-lg border border-dashed border-border-strong bg-card px-6 py-14 text-center">
          <span
            aria-hidden="true"
            className="grid size-11 place-items-center rounded-md bg-surface text-accent-text"
          >
            <FileText className="size-5" />
          </span>
          <p className="text-md font-semibold text-text">No notes yet</p>
          <p className="max-w-[52ch] text-sm text-text-muted">
            A note holds sections, and each section holds pages. Good for a
            runbook, a service you keep relearning, or anything you look up more
            than once.
          </p>
          <Link href="/notes/new" className={buttonVariants()}>
            <Plus aria-hidden="true" />
            New note
          </Link>
        </div>
      ) : (
        <ul className="grid min-w-0 gap-3 md:grid-cols-2 xl:grid-cols-3">
          {notes.map((note, index) => (
            <li
              key={note.id}
              style={{ "--motion-index": index } as React.CSSProperties}
              className="motion-stagger scroll-reveal-item motion-lift min-w-0"
            >
              <article className="flex h-full min-w-0 flex-col gap-3 rounded-lg border border-border bg-card p-4">
                <div className="flex min-w-0 items-start gap-3">
                  <span
                    aria-hidden="true"
                    className="grid size-9 shrink-0 place-items-center rounded-md bg-surface text-accent-text"
                  >
                    <NoteIcon
                      icon={
                        note.iconLibrary && note.iconName
                          ? { library: note.iconLibrary, name: note.iconName }
                          : null
                      }
                      className="size-5"
                      fallback={<FileText className="size-5" />}
                    />
                  </span>

                  <div className="min-w-0 flex-1">
                    <Link
                      href={`/notes/${note.id}`}
                      className="block truncate text-md font-semibold text-text hover:text-accent-text"
                    >
                      {note.title}
                    </Link>
                    {note.description ? (
                      <p className="mt-0.5 line-clamp-2 text-sm text-text-muted">
                        {note.description}
                      </p>
                    ) : null}
                  </div>

                  {/* A form, not a link: favouriting is a write. */}
                  <form action={toggleNoteFavorite} className="shrink-0">
                    <input type="hidden" name="id" value={note.id} />
                    <Button
                      type="submit"
                      variant="ghost"
                      size="sm"
                      iconOnly
                      aria-label={
                        note.favorite
                          ? `Remove ${note.title} from favourites`
                          : `Add ${note.title} to favourites`
                      }
                      aria-pressed={note.favorite}
                    >
                      <Star
                        aria-hidden="true"
                        className={cn(
                          note.favorite && "fill-warning text-warning",
                        )}
                      />
                    </Button>
                  </form>
                </div>

                {note.sectionTitles.length ? (
                  <div className="flex flex-wrap gap-1.5">
                    {note.sectionTitles.slice(0, 4).map((title) => (
                      <Badge key={title} tone="neutral">
                        {title}
                      </Badge>
                    ))}
                    {note.sectionTitles.length > 4 ? (
                      <Badge tone="neutral">
                        +{note.sectionTitles.length - 4}
                      </Badge>
                    ) : null}
                  </div>
                ) : null}

                <p className="mt-auto text-2xs text-text-subtle">
                  Updated {dateLabel(note.updatedAt)}
                </p>
              </article>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
