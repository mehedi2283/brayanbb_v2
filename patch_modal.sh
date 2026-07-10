sed -i 's/body: JSON.stringify({ pitToken: editTokenValue })/body: JSON.stringify({ pitToken: editTokenValue, locationName: location.name })/' src/components/ConfigureTokenModal.tsx
