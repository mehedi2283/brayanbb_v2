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
