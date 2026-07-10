sed -i 's/forceExpandedCallId?: string | null;/onOpenSummary: (call: CallLog) => void;/' src/components/CallsTable.tsx
sed -i 's/export function CallsTable({ forceExpandedCallId, calls, agents }: CallsTableProps) {/export function CallsTable({ onOpenSummary, calls, agents }: CallsTableProps) {/' src/components/CallsTable.tsx
