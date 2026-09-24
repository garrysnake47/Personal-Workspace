import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "@/generated/prisma/client";

/**
 * Prisma singleton.
 *
 * Next.js dev mode hot-reloads modules on every edit. Without stashing the
 * client on globalThis each reload would open a brand new pool and leak
 * Postgres connections until the DB refuses new ones.
 */

const globalForPrisma = globalThis as unknown as {
  prisma?: PrismaClient;
};

function createPrismaClient() {
  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) {
    throw new Error("DATABASE_URL is not set");
  }

  return new PrismaClient({
    adapter: new PrismaPg({ connectionString }),
    log:
      process.env.NODE_ENV === "development"
        ? ["warn", "error"]
        : ["error"],
  });
}

export const prisma: PrismaClient =
  globalForPrisma.prisma ?? createPrismaClient();

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}

export default prisma;

// Re-exported so the rest of the app has a single import site for Prisma
// types and enums and never needs to reach into src/generated.
export * from "@/generated/prisma/enums";
export type {
  UserModel as User,
  WorkLogModel as WorkLog,
  MeetingModel as Meeting,
  TicketModel as Ticket,
  TicketWorkUpdateModel as TicketWorkUpdate,
  TicketHistoryEntryModel as TicketHistoryEntry,
  TaskModel as Task,
  NoteModel as Note,
  LinkModel as Link,
  ResourceModel as Resource,
} from "@/generated/prisma/models";
