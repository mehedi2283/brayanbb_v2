import { useEffect, useState } from 'react';
import { Joyride, STATUS } from 'react-joyride';
import type { Step } from 'react-joyride';
import { useLanguage } from '../contexts/LanguageContext';

interface TutorialProps {
  run: boolean;
  onFinish: () => void;
  isClientMode: boolean;
}

export function Tutorial({ run, onFinish, isClientMode }: TutorialProps) {
  const { t } = useLanguage();
  const [steps, setSteps] = useState<Step[]>([]);

  useEffect(() => {
    const baseSteps: Step[] = [
      {
        target: '.tour-subaccount-select',
        content: t('tutorial.subAccountSelect') || 'Select the sub-account you want to view or manage data for.',
        placement: 'right',
      },
      {
        target: '.tour-nav-call-logs',
        content: t('tutorial.callLogs') || 'View detailed analytics and history for your calls.',
        placement: 'right',
      },
    ];

    if (!isClientMode) {
      baseSteps.push(
        {
          target: '.tour-nav-sub-accounts',
          content: t('tutorial.subAccounts') || 'Manage private integration tokens for your sub-accounts.',
          placement: 'right',
        },
        {
          target: '.tour-nav-users',
          content: t('tutorial.users') || 'Manage access and create logins for your clients and team members.',
          placement: 'right',
        }
      );
    }

    baseSteps.push(
      {
        target: '.tour-nav-settings',
        content: t('tutorial.settings') || 'Update your profile, password, or application settings here.',
        placement: 'right',
      },
      {
        target: '.tour-date-picker',
        content: t('tutorial.datePicker') || 'Filter your data by selecting a date range.',
        placement: 'bottom',
      },
      {
        target: '.tour-language-toggle',
        content: t('tutorial.language') || 'Switch between English and Spanish.',
        placement: 'bottom',
      }
    );

    setSteps(baseSteps);
  }, [t, isClientMode]);

  const handleJoyrideCallback = (data: any) => {
    const { status } = data;
    if (([STATUS.FINISHED, STATUS.SKIPPED] as string[]).includes(status)) {
      onFinish();
    }
  };

  return (
    <Joyride
      steps={steps}
      run={run}
      continuous
      onEvent={handleJoyrideCallback}
      options={{ zIndex: 99999, primaryColor: "#2563eb" }}
      
      
      
    />
  );
}
