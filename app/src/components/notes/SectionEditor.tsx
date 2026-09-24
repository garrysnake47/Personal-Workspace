"use client";

import { AnimatePresence, motion, Reorder, useDragControls, useReducedMotion } from "framer-motion";
import { ChevronDown, Copy, GripVertical, Plus, Trash2 } from "lucide-react";
import { useId } from "react";

import { Field } from "@/components/notes/note-field";
import { Input } from "@/components/ui/input";
import {
  IconAction,
  PageEditor,
  type PageDraft,
  type SectionOption,
} from "@/components/notes/PageEditor";
import { cn } from "@/components/cn";

/** One section as the editor holds it. `id` doubles as the React key. */
export type SectionDraft = {
  id: string;
  title: string;
  pages: PageDraft[];
};

export function SectionEditor({
  section,
  index,
  removable,
  sections,
  collapsed,
  errors,
  onToggleCollapse,
  onChange,
  onDuplicate,
  onRemove,
  onAddPage,
  onMovePage,
}: {
  section: SectionDraft;
  index: number;
  /** false for the note's last section */
  removable: boolean;
  /** every section in the note, in order — for the page move picker */
  sections: SectionOption[];
  collapsed: boolean;
  /** the whole server/client error map, keyed by dotted Zod path */
  errors?: Record<string, string[]>;
  onToggleCollapse: () => void;
  onChange: (next: SectionDraft) => void;
  onDuplicate: () => void;
  onRemove: () => void;
  onAddPage: () => void;
  onMovePage: (pageId: string, targetSectionId: string) => void;
}) {
  const controls = useDragControls();
  const reduceMotion = useReducedMotion() ?? false;
  const fieldId = useId();
  const titleId = `${fieldId}-title`;
  const bodyId = `${fieldId}-body`;

  const path = `sections.${index}`;
  const label = `Section ${index + 1}`;
  const pageCount = section.pages.length;

  const setPages = (pages: PageDraft[]) => onChange({ ...section, pages });

  return (
    <Reorder.Item
      as="div"
      value={section}
      dragListener={false}
      dragControls={controls}
      className={cn(
        "min-w-0 bg-bg",
        "[&:not(:first-child)]:mt-7 [&:not(:first-child)]:border-t [&:not(:first-child)]:border-border-strong [&:not(:first-child)]:pt-7",
        "sm:[&:not(:first-child)]:mt-8 sm:[&:not(:first-child)]:pt-8",
      )}
    >
      <div className="flex min-w-0 flex-wrap items-center gap-x-2 gap-y-1.5">
        <button
          type="button"
          aria-label={`Reorder ${label}`}
          onPointerDown={(event) => controls.start(event)}
          className={cn(
            "inline-flex size-[34px] shrink-0 cursor-grab touch-none items-center justify-center rounded-full sm:size-[28px]",
            "text-text-subtle transition-colors hover:bg-surface-2 hover:text-text-muted active:cursor-grabbing",
            "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring",
          )}
        >
          <GripVertical aria-hidden="true" className="size-4" />
        </button>

        <h2 className="text-2xs font-semibold uppercase tracking-[0.1em] text-text-muted sm:text-xs">
          {label}
        </h2>
        <span className="text-2xs text-text-subtle sm:text-xs">
          {pageCount} page{pageCount === 1 ? "" : "s"}
        </span>

        <div className="ml-auto flex items-center gap-1">
          <IconAction label={`Duplicate ${label}`} onClick={onDuplicate}>
            <Copy aria-hidden="true" className="size-[15px]" />
          </IconAction>
          <IconAction
            label={`Delete ${label}`}
            onClick={onRemove}
            disabled={!removable}
            danger
          >
            <Trash2 aria-hidden="true" className="size-[15px]" />
          </IconAction>
          <button
            type="button"
            aria-expanded={!collapsed}
            aria-controls={bodyId}
            onClick={onToggleCollapse}
            className={cn(
              "inline-flex h-[34px] items-center gap-1.5 rounded-full border border-transparent px-2.5 sm:h-[28px]",
              "text-xs font-medium text-text-muted transition-colors",
              "hover:border-border hover:bg-surface hover:text-text",
              "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring",
            )}
          >
            {collapsed ? "Expand" : "Collapse"}
            <ChevronDown
              aria-hidden="true"
              className={cn(
                "size-[15px] transition-transform duration-200",
                !collapsed && "rotate-180",
              )}
            />
          </button>
        </div>
      </div>

      {/* a title is a short string — it gets a comfortable measure, not the
          whole 1200px the page now offers */}
      <div className="mt-3 min-w-0 lg:max-w-[640px]">
        <Field
          label="Section title"
          htmlFor={titleId}
          errors={errors?.[`${path}.title`]}
        >
          <Input
            id={titleId}
            value={section.title}
            onChange={(event) => onChange({ ...section, title: event.target.value })}
            placeholder="Introduction"
          />
        </Field>
      </div>

      <AnimatePresence initial={false}>
        {collapsed ? null : (
          <motion.div
            id={bodyId}
            key="body"
            initial={reduceMotion ? false : { height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={reduceMotion ? { opacity: 0 } : { height: 0, opacity: 0 }}
            transition={{
              duration: reduceMotion ? 0 : 0.24,
              ease: [0.22, 1, 0.36, 1],
            }}
            className="min-w-0 overflow-hidden"
          >
            {/* A left rail rather than a card — pages read as part of the section. */}
            <div className="mt-4 min-w-0 border-l border-border-strong pl-2.5 sm:mt-5 sm:pl-5">
              <Reorder.Group
                as="div"
                axis="y"
                values={section.pages}
                onReorder={setPages}
                className="min-w-0"
              >
                {section.pages.map((page, pageIndex) => (
                  <PageEditor
                    key={page.id}
                    page={page}
                    index={pageIndex}
                    sectionIndex={index}
                    removable={pageCount > 1}
                    sections={sections}
                    titleErrors={errors?.[`${path}.pages.${pageIndex}.title`]}
                    contentErrors={errors?.[`${path}.pages.${pageIndex}.content`]}
                    onChange={(next) =>
                      setPages(
                        section.pages.map((row) =>
                          row.id === page.id ? next : row,
                        ),
                      )
                    }
                    onDuplicate={() => {
                      const copy: PageDraft = {
                        ...page,
                        id: crypto.randomUUID(),
                        title: page.title ? `${page.title} copy` : "",
                      };
                      const next = [...section.pages];
                      next.splice(pageIndex + 1, 0, copy);
                      setPages(next);
                    }}
                    onRemove={() =>
                      setPages(section.pages.filter((row) => row.id !== page.id))
                    }
                    onMoveToSection={(targetId) => onMovePage(page.id, targetId)}
                  />
                ))}
              </Reorder.Group>

              <button
                type="button"
                onClick={onAddPage}
                className={cn(
                  "mt-5 inline-flex min-h-[40px] items-center gap-1.5 rounded-full border border-border bg-surface px-3 py-1.5 sm:min-h-0",
                  "text-xs font-medium text-text transition-colors",
                  "hover:border-border-strong hover:bg-surface-2",
                  "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring",
                )}
              >
                <Plus aria-hidden="true" className="size-[14px]" />
                Add page
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </Reorder.Item>
  );
}
