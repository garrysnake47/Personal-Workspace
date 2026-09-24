import { listTickets } from "@/actions/tickets";
import { TicketBoard } from "@/components/tickets/ticket-board";

export const metadata = { title: "Tickets" };

export default async function TicketsPage() {
  const result = await listTickets({ take: 200 });

  return (
    <TicketBoard
      initialTickets={
        result.ok
          ? result.data.items.map((ticket) => ({
              id: ticket.id,
              ticketId: ticket.ticketId,
              title: ticket.title,
              status: ticket.status,
              updatedAt: ticket.updatedAt.toISOString(),
              workLogCount: ticket.workLogCount,
              latestUpdate: ticket.latestUpdate
                ? {
                    description: ticket.latestUpdate.description,
                    createdAt: ticket.latestUpdate.createdAt.toISOString(),
                    workLog: ticket.latestUpdate.workLog
                      ? {
                          id: ticket.latestUpdate.workLog.id,
                          title: ticket.latestUpdate.workLog.title,
                          date: ticket.latestUpdate.workLog.date.toISOString(),
                        }
                      : null,
                  }
                : null,
            }))
          : []
      }
      loadError={result.ok ? undefined : result.error.message}
    />
  );
}
