import { ProfileForm } from "@/components/profile/profile-form";
import { requireUser } from "@/lib/session";
import { SPRINT_CYCLE_ANCHOR } from "@/lib/sprint";
import { getUserSettings } from "@/lib/user-settings";
import { format } from "date-fns";

export const metadata = { title: "Profile" };

export default async function ProfilePage() {
  const user = await requireUser();
  const settings = await getUserSettings(user.id);

  return (
    <ProfileForm
      email={user.email ?? ""}
      initial={{
        name: settings.name ?? "",
        sprintStartDate: settings.sprintStartKey ?? format(SPRINT_CYCLE_ANCHOR, "yyyy-MM-dd"),
        sprintLengthDays: settings.sprint.days,
        ticketsEnabled: settings.ticketsEnabled,
      }}
    />
  );
}
