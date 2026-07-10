sed -i 's/interface CallsTableProps {/interface CallsTableProps {\n  forceExpandedCallId?: string | null;/' src/components/CallsTable.tsx
sed -i 's/export function CallsTable({ calls, agents }: CallsTableProps) {/export function CallsTable({ calls, agents, forceExpandedCallId }: CallsTableProps) {/' src/components/CallsTable.tsx
sed -i 's/const isExpanded = expandedRow === call.id;/const isExpanded = expandedRow === call.id || forceExpandedCallId === call.id;/' src/components/CallsTable.tsx
