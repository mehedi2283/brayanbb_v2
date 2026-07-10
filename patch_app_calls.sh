sed -i 's/const \[selectedCall, setSelectedCall\] = useState<CallLog | null>(null);/const [forceExpandedCallId, setForceExpandedCallId] = useState<string | null>(null);\n  const [dummyCall, setDummyCall] = useState<CallLog | null>(null);/' src/App.tsx

sed -i 's/<SummaryModal call={selectedCall} onClose={() => setSelectedCall(null)} \/>//' src/App.tsx

sed -i 's/calls={filteredCalls}/calls={dummyCall ? [dummyCall, ...filteredCalls] : filteredCalls}/' src/App.tsx
sed -i 's/onOpenSummary={setSelectedCall}/forceExpandedCallId={forceExpandedCallId}/' src/App.tsx

cat << 'INNER_EOF' > app_tut.js
          onOpenSampleSummary={() => {
            if (calls.length > 0) {
              setForceExpandedCallId(calls[0].id);
            } else {
              const dummy = {
                id: 'dummy',
                locationId: 'dummy_location',
                contactId: '+1234567890',
                contactName: 'Demo Contact',
                fromNumber: '+0987654321',
                toNumber: '+1987654321',
                status: 'Human Answered',
                duration: 185,
                createdAt: new Date().toISOString(),
                summary: 'This is a sample AI-generated summary of the call. The customer was asking about pricing and features.',
                transcript: [
                  { role: 'user', text: 'Hello, I want to know about your product.', timestamp: '00:00' },
                  { role: 'bot', text: 'Hi! I would be happy to help. Our product costs $99/mo.', timestamp: '00:05' }
                ],
                recordingUrl: '',
                extractedData: { intent: 'Pricing Inquiry', sentiment: 'Positive' },
                agentId: 'agent_1',
                trialCall: false,
                callDirection: 'inbound',
                workflowName: 'Inbound Support',
                actionsTriggered: 0
              };
              setDummyCall(dummy);
              setForceExpandedCallId('dummy');
            }
          }}
          onCloseSummary={() => {
            setForceExpandedCallId(null);
            setDummyCall(null);
          }}
INNER_EOF

# Now replace the onOpenSampleSummary and onCloseSummary in App.tsx
sed -i '/onOpenSampleSummary={() => {/,/onCloseSummary={() => setSelectedCall(null)}/c\          onOpenSampleSummary={() => {\n            if (calls.length > 0) {\n              setForceExpandedCallId(calls[0].id);\n            } else {\n              const dummy = {\n                id: '\''dummy'\'',\n                locationId: '\''dummy_location'\'',\n                contactId: '\''+1234567890'\'',\n                contactName: '\''Demo Contact'\'',\n                fromNumber: '\''+0987654321'\'',\n                toNumber: '\''+1987654321'\'',\n                status: '\''Human Answered'\'',\n                duration: 185,\n                createdAt: new Date().toISOString(),\n                summary: '\''This is a sample AI-generated summary of the call. The customer was asking about pricing and features.'\'',\n                transcript: [\n                  { role: '\''user'\'', text: '\''Hello, I want to know about your product.'\'', timestamp: '\''00:00'\'' },\n                  { role: '\''bot'\'', text: '\''Hi! I would be happy to help. Our product costs $99/mo.'\'', timestamp: '\''00:05'\'' }\n                ],\n                recordingUrl: '\'''\'',\n                extractedData: { intent: '\''Pricing Inquiry'\'', sentiment: '\''Positive'\'' },\n                agentId: '\''agent_1'\'',\n                trialCall: false,\n                callDirection: '\''inbound'\'',\n                workflowName: '\''Inbound Support'\'',\n                actionsTriggered: 0\n              };\n              setDummyCall(dummy as any);\n              setForceExpandedCallId('\''dummy'\'');\n            }\n          }}\n          onCloseSummary={() => {\n            setForceExpandedCallId(null);\n            setDummyCall(null);\n          }}' src/App.tsx

