sed -i '/setAgencyKey('"''"');/a \        if (onAgencyKeyUpdated) onAgencyKeyUpdated();' src/components/SettingsView.tsx
