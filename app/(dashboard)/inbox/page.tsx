/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { InboxWorkspace } from "@/components/inbox-workspace";

export default function InboxPage() {
  return (
    <InboxWorkspace
      dashboardKey="admin"
      subtitle="Internal NOVYA conversations and email."
      recipientSearchPlaceholder="Search team members..."
      emptyConversationText="No internal conversations yet. Start a chat with a team member."
      taskHref="/tasks/create"
    />
  );
}
