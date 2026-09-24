"use client";

import { Reorder, useDragControls } from "framer-motion";
import { CornerUpRight, Copy, GripVertical, Trash2 } from "lucide-react";
import { useId } from "react";

import { Field } from "@/components/notes/note-field";
import { Input } from "@/components/ui/input";
import { RichTextEditor } from "@/components/notes/RichTextEditor";
import { cn } from "@/components/cn";

/** One page as the editor holds it. `id` doubles as the React key. */
export type PageDraft = {
  /** A database id for a saved page, a fresh uuid for one just added. */
  id: string;
  title: string;
  /** TipTap JSON — opaque here, it belongs to the editor. */
  content: unknown;
};

/** The bare shape the "move to section" picker needs from its siblings. */
export type SectionOption = { id: string; title: string };

/**
 * A page is a *document*, not a form row: the title sits above a full-width
 * body, never beside it. Long prose needs the whole column.
 */
export function PageEditor({
  page,
  index,
  sectionIndex,
  removable,
  sections,
  titleErrors,
  contentErrors,
  onChange,
  onDuplicate,
  onRemove,
  onMoveToSection,
}: {
  page: PageDraft;
  index: number;
  sectionIndex: number;
  /** false for a section's last page — a section with no pages reads as broken */
  removable: boolean;
  /** every section in the note, for the move picker */
  sections: SectionOption[];
  titleErrors?: string[];
  contentErrors?: string[];
  onChange: (next: PageDraft) => void;
  onDuplicate: () => void;
  onRemove: () => void;
  onMoveToSection: (targetSectionId: string) => void;
}) {
  const controls = useDragControls();
  const fieldId = useId();
  const titleId = `${fieldId}-title`;
  const moveId = `${fieldId}-move`;

  const label = `Page ${index + 1}`;

  return (
    <Reorder.Item
      as="div"
      value={page}
      dragListener={false}
      dragControls={controls}
      className={cn(
        "min-w-0 bg-bg",
        // pages are separated by a hairline, not boxed in cards
        "[&:not(:first-child)]:mt-5 [&:not(:first-child)]:border-t [&:not(:first-child)]:border-border [&:not(:first-child)]:pt-5",
        "sm:[&:not(:first-child)]:mt-6 sm:[&:not(:first-child)]:pt-6",
      )}
    >
      <div className="flex min-w-0 flex-wrap items-center gap-x-2 gap-y-1.5">
        <button
          type="button"
          aria-label={`Reorder ${label}`}
          onPointerDown={(event) => controls.start(event)}
          className={cn(
            "inline-flex size-[32px] shrink-0 cursor-grab touch-none items-center justify-center rounded-full sm:size-[26px]",
            "text-text-subtle transition-colors hover:bg-surface-2 hover:text-text-muted active:cursor-grabbing",
            "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring",
          )}
        >
          <GripVertical aria-hidden="true" className="size-[15px]" />
        </button>

        <span className="text-2xs font-medium uppercase tracking-[0.08em] text-text-subtle">
          {label}
        </span>

        <div className="ml-auto flex items-center gap-1">
          {sections.length > 1 ? (
            <>
              <label htmlFor={moveId} className="sr-only">
                Move {label} to another section
              </label>
              <div className="relative flex items-center">
                <CornerUpRight
                  aria-hidden="true"
                  className="pointer-events-none absolute left-2 size-[13px] text-text-subtle"
                />
                <select
                  id={moveId}
                  value={sections[sectionIndex]?.id ?? ""}
                  onChange={(event) => {
                    const target = event.target.value;
                    if (target && target !== sections[sectionIndex]?.id) {
                      onMoveToSection(target);
                    }
                  }}
                  className={cn(
                    "max-w-[110px] cursor-pointer appearance-none rounded-full border border-transparent bg-transparent sm:max-w-[160px]",
                    "h-[32px] py-1 pl-7 pr-2 text-xs text-text-muted outline-none transition-colors sm:h-auto",
                    "hover:border-border hover:bg-surface hover:text-text",
                    "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring",
                  )}
                >
                  {sections.map((section, order) => (
                    <option key={section.id} value={section.id}>
                      {section.title.trim() || `Section ${order + 1}`}
                    </option>
                  ))}
                </select>
              </div>
            </>
          ) : null}

          <IconAction label={`Duplicate ${label}`} onClick={onDuplicate}>
            <Copy aria-hidden="true" className="size-[14px]" />
          </IconAction>
          <IconAction
            label={`Delete ${label}`}
            onClick={onRemove}
            disabled={!removable}
            danger
          >
            <Trash2 aria-hidden="true" className="size-[14px]" />
          </IconAction>
        </div>
      </div>

      {/* Title, then body. The body takes the whole column; the title is a
          short string and keeps a readable measure on very wide screens. */}
      <div className="mt-3 min-w-0 lg:max-w-[640px]">
        <Field label="Page title" htmlFor={titleId} errors={titleErrors}>
          <Input
            id={titleId}
            value={page.title}
            onChange={(event) => onChange({ ...page, title: event.target.value })}
            placeholder="Variables and data types"
          />
        </Field>
      </div>

      <div className="mt-4 min-w-0">
        <p className="mb-2 text-sm font-medium leading-[1.3] text-text">
          Page content
        </p>
        <RichTextEditor
          value={page.content}
          onChange={(content) => onChange({ ...page, content })}
        />
        {contentErrors?.length ? (
          <p role="alert" className="mt-1.5 text-xs text-danger">
            {contentErrors[0]}
          </p>
        ) : null}
      </div>
    </Reorder.Item>
  );
}

/** A small round icon button — shared by the page and section headers. */
export function IconAction({
  label,
  onClick,
  disabled,
  danger,
  children,
}: {
  label: string;
  onClick: () => void;
  disabled?: boolean;
  danger?: boolean;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      title={label}
      aria-label={label}
      disabled={disabled}
      onClick={onClick}
      className={cn(
        "inline-flex size-[34px] shrink-0 items-center justify-center rounded-full border border-transparent sm:size-[28px]",
        "text-text-subtle transition-colors",
        "hover:border-border hover:bg-surface",
        danger ? "hover:text-danger" : "hover:text-text",
        "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring",
        "disabled:pointer-events-none disabled:opacity-35",
      )}
    >
      {children}
    </button>
  );
}
