"use client";

import { GraduationCap } from "lucide-react";
import { useEffect, useState } from "react";

import { saveLearningNotes } from "@/actions/worklog";
import { MarkdownEditor } from "@/components/work-log/markdown-editor";
import { useAutosave } from "@/components/work-log/save-status";
import { SectionHeading } from "@/components/work-log/section-heading";

/**
 * Learning & upskilling — independent of tickets, so a day can be tickets only,
 * learning only, or both. Autosaves like meeting notes.
 */
export function LearningSection({ workLogId, initialNotes, onFilledChange }: { workLogId: string; initialNotes: string; onFilledChange?: (filled: boolean) => void }) {
  const [notes, setNotes] = useState(initialNotes);
  const filled = notes.trim().length > 0;
  useEffect(() => onFilledChange?.(filled), [filled, onFilledChange]);
  const { flush } = useAutosave({
    id: `learning:${workLogId}`,
    value: notes,
    initial: initialNotes,
    save: async (value) => {
      const result = await saveLearningNotes({ workLogId, notes: value });
      return result.ok ? { ok: true } : { ok: false, message: result.error.message };
    },
  });

  return (
    <section aria-labelledby="learning-heading" className="wl-card">
      <SectionHeading id="learning-heading" title="Learning & upskilling" />
      <div className="p-4 md:p-5">
        <label htmlFor="learning-notes" className="mb-2 flex items-center gap-2 text-sm text-text-muted">
          <GraduationCap className="size-4 text-accent-text" aria-hidden="true" />
          Courses, reading, practice or anything you learned today — with or without tickets.
        </label>
        <MarkdownEditor
          id="learning-notes"
          value={notes}
          ariaLabel="Learning and upskilling notes"
          minHeight="min-h-32"
          onChange={setNotes}
          onBlur={() => flush()}
        />
      </div>
    </section>
  );
}
