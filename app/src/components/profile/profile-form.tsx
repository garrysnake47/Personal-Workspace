"use client";

import { CalendarRange, Ticket, UserRound } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { addDays, format } from "date-fns";
import type { ReactNode } from "react";

import { updateProfile } from "@/actions/profile";
import { cn } from "@/components/cn";
import { PageHeader } from "@/components/shell/page-header";
import { Button } from "@/components/ui/button";
import { Field } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { toast } from "@/components/ui/toast";
import { getSprint } from "@/lib/sprint";

type ProfileValues = {
  name: string;
  sprintStartDate: string;
  sprintLengthDays: number;
  ticketsEnabled: boolean;
};

const LENGTHS = [
  { days: 7, label: "1 week" },
  { days: 14, label: "2 weeks" },
  { days: 21, label: "3 weeks" },
  { days: 28, label: "4 weeks" },
];

export function ProfileForm({ email, initial }: { email: string; initial: ProfileValues }) {
  const router = useRouter();
  const [values, setValues] = useState(initial);
  const [error, setError] = useState<string>();
  const [pending, startTransition] = useTransition();
  const dirty = JSON.stringify(values) !== JSON.stringify(initial);
  const set = <K extends keyof ProfileValues>(key: K, value: ProfileValues[K]) => setValues((current) => ({ ...current, [key]: value }));

  // Live preview of what the sprint settings mean today.
  const anchor = values.sprintStartDate ? new Date(`${values.sprintStartDate}T00:00:00`) : null;
  const current = anchor ? getSprint(new Date(), { anchor, days: values.sprintLengthDays }) : null;
  const initials = (values.name || email).split(/[\s@.]+/).filter(Boolean).slice(0, 2).map((part) => part[0]?.toUpperCase()).join("");

  function save() {
    setError(undefined);
    startTransition(async () => {
      const result = await updateProfile({
        name: values.name,
        sprintStartDate: values.sprintStartDate || null,
        sprintLengthDays: values.sprintLengthDays,
        ticketsEnabled: values.ticketsEnabled,
      });
      if (!result.ok) { setError(result.error.message); return; }
      toast.success("Profile saved");
      router.refresh();
    });
  }

  return (
    <div className="mx-auto flex w-full max-w-3xl flex-col gap-5">
      <PageHeader title="Profile" description="Your name, your sprint calendar, and what your work logs track." className="mb-4" />

      <Panel icon={<UserRound className="size-4" />} title="Account">
        <div className="flex flex-col gap-5 md:flex-row md:items-center">
          <span className="grid size-16 shrink-0 place-items-center rounded-full bg-sidebar text-xl font-bold text-sidebar-fg" aria-hidden="true">{initials || "?"}</span>
          <div className="grid flex-1 gap-4 md:grid-cols-2">
            <Field label="Name" htmlFor="profile-name">
              <Input id="profile-name" value={values.name} maxLength={80} onChange={(event) => set("name", event.target.value)} />
            </Field>
            <Field label="Email" htmlFor="profile-email" hint="Used to sign in — can't be changed here.">
              <Input id="profile-email" value={email} readOnly disabled />
            </Field>
          </div>
        </div>
      </Panel>

      <Panel icon={<CalendarRange className="size-4" />} title="Sprint calendar" description="Work Logs group your days into sprints counted from this date.">
        <div className="grid gap-5 md:grid-cols-[14rem_minmax(0,1fr)]">
          <Field label="A sprint starts on" htmlFor="profile-sprint-start">
            <Input id="profile-sprint-start" type="date" value={values.sprintStartDate} onChange={(event) => set("sprintStartDate", event.target.value)} />
          </Field>
          <div className="flex flex-col gap-2">
            <span id="profile-sprint-length" className="text-sm font-semibold text-text">Sprint length</span>
            <div role="radiogroup" aria-labelledby="profile-sprint-length" className="grid grid-cols-4 gap-1 rounded-lg border border-border-strong bg-surface-2 p-0.5">
              {LENGTHS.map(({ days, label }) => {
                const active = values.sprintLengthDays === days;
                return (
                  <button
                    key={days}
                    type="button"
                    role="radio"
                    aria-checked={active}
                    onClick={() => set("sprintLengthDays", days)}
                    className={cn("h-9 cursor-pointer rounded-md px-2 text-sm font-semibold transition-colors duration-150", active ? "bg-sidebar text-sidebar-fg shadow-sm" : "text-text-muted hover:bg-surface-3 hover:text-text")}
                  >
                    {label}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
        {current ? (
          <div className="mt-5 grid gap-3 rounded-xl bg-surface-2 p-4 md:grid-cols-2">
            <div>
              <p className="text-xs text-text-subtle">Current sprint</p>
              <p className="mt-0.5 text-base font-semibold text-text">{format(current.start, "EEE d MMM")} – {format(current.end, "EEE d MMM")}</p>
            </div>
            <div>
              <p className="text-xs text-text-subtle">Next sprint starts</p>
              <p className="mt-0.5 text-base font-semibold text-text">{format(addDays(current.end, 1), "EEEE d MMM")}</p>
            </div>
          </div>
        ) : null}
      </Panel>

      <Panel icon={<Ticket className="size-4" />} title="Work logs">
        <label className="flex cursor-pointer items-start justify-between gap-4">
          <span>
            <span className="block text-sm font-semibold text-text">Track tickets in work logs</span>
            <span className="mt-0.5 block text-sm text-text-muted">Shows the Tickets page and the ticket sections in each work log. Turning it off hides them — nothing is deleted.</span>
          </span>
          <button
            type="button"
            role="switch"
            aria-checked={values.ticketsEnabled}
            aria-label="Track tickets in work logs"
            onClick={() => set("ticketsEnabled", !values.ticketsEnabled)}
            className={cn("relative mt-0.5 h-7 w-12 shrink-0 cursor-pointer rounded-full transition-colors duration-150", values.ticketsEnabled ? "bg-sidebar" : "bg-surface-3")}
          >
            <span className={cn("absolute top-1 size-5 rounded-full bg-surface shadow-sm transition-[left] duration-150", values.ticketsEnabled ? "left-6" : "left-1")} aria-hidden="true" />
          </button>
        </label>
      </Panel>

      <div className="flex items-center justify-end gap-3">
        {error ? <p className="mr-auto text-sm font-medium text-danger" role="alert">{error}</p> : null}
        <Button variant="secondary" disabled={!dirty || pending} onClick={() => { setValues(initial); setError(undefined); }}>Reset</Button>
        <Button onClick={save} loading={pending} disabled={!dirty}>Save changes</Button>
      </div>
    </div>
  );
}

function Panel({ icon, title, description, children }: { icon: ReactNode; title: string; description?: string; children: ReactNode }) {
  return (
    <section className="wl-card p-5 md:p-6">
      <div className="mb-5 flex items-start gap-3">
        <span className="grid size-9 shrink-0 place-items-center rounded-lg bg-surface-2 text-accent-text" aria-hidden="true">{icon}</span>
        <div>
          <h2 className="text-lg font-semibold tracking-[-0.015em] text-text">{title}</h2>
          {description ? <p className="text-sm text-text-muted">{description}</p> : null}
        </div>
      </div>
      {children}
    </section>
  );
}
