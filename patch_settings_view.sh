sed -i 's/  onRestartTutorial: () => void;/  onRestartTutorial: () => void;\n  onAgencyKeyUpdated?: () => void;/' src/components/SettingsView.tsx
sed -i 's/export function SettingsView({ user, onRestartTutorial }: SettingsViewProps) {/export function SettingsView({ user, onRestartTutorial, onAgencyKeyUpdated }: SettingsViewProps) {/' src/components/SettingsView.tsx
