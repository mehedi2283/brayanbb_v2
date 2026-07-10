# 1. Add SummaryModal import
sed -i 's/import { CallsTable } from '\''\.\/components\/CallsTable'\'';/import { CallsTable } from '\''\.\/components\/CallsTable'\'';\nimport { SummaryModal } from '\''\.\/components\/SummaryModal'\'';/' src/App.tsx

# 2. Update state declarations
sed -i 's/const \[forceExpandedCallId, setForceExpandedCallId\] = useState<string | null>(null);/const \[selectedCall, setSelectedCall\] = useState<CallLog | null>(null);/' src/App.tsx

# 3. Update CallsTable rendering
sed -i 's/forceExpandedCallId={forceExpandedCallId}/onOpenSummary={(call) => setSelectedCall(call)}/' src/App.tsx

# 4. Render SummaryModal
sed -i '/{isConfigureModalOpen && selectedLocationId && locations.find(l => l.id === selectedLocationId) && (/i \
      <SummaryModal call={selectedCall} onClose={() => setSelectedCall(null)} />\
' src/App.tsx

# 5. Update setForceExpandedCallId usages in Tutorial handling
sed -i 's/setForceExpandedCallId(calls\[0\].id);/setSelectedCall(calls\[0\]);/' src/App.tsx
sed -i 's/setForceExpandedCallId('\''dummy'\'');/setSelectedCall(dummy as any);/' src/App.tsx
sed -i 's/setForceExpandedCallId(null);/setSelectedCall(null);/' src/App.tsx

