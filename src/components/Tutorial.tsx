import { useEffect, useState } from 'react';
import { Joyride, STATUS, EVENTS } from 'react-joyride';
import type { Step, EventData } from 'react-joyride';
import { useLanguage } from '../contexts/LanguageContext';
import { TutorialTooltip } from './TutorialTooltip';

interface TutorialProps {
  run: boolean;
  onFinish: () => void;
  isClientMode: boolean;
  currentView: string;
  onViewChange: (view: any) => void;
  onOpenSampleSummary?: () => void;
  onCloseSummary?: () => void;
}

export function Tutorial({ run, onFinish, isClientMode, currentView, onViewChange, onOpenSampleSummary, onCloseSummary }: TutorialProps) {
  const { t } = useLanguage();
  const [steps, setSteps] = useState<Step[]>([]);

  useEffect(() => {
    const baseSteps: Step[] = [
      {
        target: '.tour-subaccount-select',
        title: t('tutorial.subAccountSelectTitle') || 'Sub-Accounts',
        content: t('tutorial.subAccountSelect') || 'Select the sub-account you want to view or manage data for.',
        placement: 'right',
        skipBeacon: true,
        data: { view: 'call-logs' }
      },
      {
        target: '.tour-nav-call-logs',
        title: t('tutorial.callLogsTitle') || 'Call Analytics',
        content: t('tutorial.callLogs') || 'View detailed analytics and history for your calls.',
        placement: 'right',
        data: { view: 'call-logs' }
      },
      {
        target: '.tour-agent-select',
        title: t('tutorial.agentSelectTitle') || 'Agent Selection',
        content: t('tutorial.agentSelect') || 'Filter calls by a specific agent or view all agents at once.',
        placement: 'bottom',
        data: { view: 'call-logs' }
      },
      {
        target: '.tour-search-field',
        title: t('tutorial.searchFieldTitle') || 'Search Calls',
        content: t('tutorial.searchField') || 'Quickly find specific calls by searching for contact names or numbers.',
        placement: 'bottom',
        data: { view: 'call-logs' }
      },
      {
        target: '.tour-summary-button',
        title: t('tutorial.summaryButtonTitle') || 'Call Summary',
        content: t('tutorial.summaryButton') || 'Click on this summary button to view detailed insights and transcriptions from a call, then click Next.',
        placement: 'left',
        data: { view: 'call-logs' }
      },
      {
        target: '.tour-modal-summary-tab',
        title: 'Summary Tab',
        content: 'View AI-generated summaries and metadata of your calls here.',
        placement: 'bottom',
      },
      {
        target: '.tour-modal-metadata',
        title: 'Call Metadata',
        content: 'Here you can see the duration, agent, and other important metadata for this call.',
        placement: 'bottom',
      },
      {
        target: '.tour-modal-transcript-tab',
        title: 'Transcript Tab',
        content: 'Read the full transcription of the conversation here.',
        placement: 'bottom',
      },
    ];

    if (!isClientMode) {
      baseSteps.push(
        {
          target: '.tour-nav-sub-accounts',
          title: t('tutorial.subAccountsTitle') || 'Manage Tokens',
          content: t('tutorial.subAccounts') || 'Manage private integration tokens for your sub-accounts.',
          placement: 'right',
          data: { view: 'sub-accounts' }
        },
        {
          target: '.tour-add-token',
          title: t('tutorial.addTokenTitle') || 'Manage Tokens',
          content: t('tutorial.addToken') || 'Add or update the Private Integration Token to enable data fetching for this sub-account.',
          placement: 'left',
          data: { view: 'sub-accounts' }
        },
        {
          target: '.tour-configure-token-input',
          title: 'Enter Token',
          content: 'Paste the GoHighLevel Private Integration Token here.',
          placement: 'bottom',
          data: { view: 'sub-accounts' }
        },
        {
          target: '.tour-save-token',
          title: 'Save Token',
          content: 'Save the token to enable integration.',
          placement: 'bottom',
          data: { view: 'sub-accounts' }
        },
        {
          target: '.tour-nav-users',
          title: t('tutorial.usersTitle') || 'Team & Clients',
          content: t('tutorial.users') || 'Manage access and create logins for your clients and team members.',
          placement: 'right',
          data: { view: 'users' }
        },
        {
          target: '.tour-user-email',
          title: t('tutorial.userEmailTitle') || 'User Email',
          content: t('tutorial.userEmail') || 'Enter the email address for the new user.',
          placement: 'bottom',
          data: { view: 'users' }
        },
        {
          target: '.tour-user-password',
          title: t('tutorial.userPasswordTitle') || 'User Password',
          content: t('tutorial.userPassword') || 'Set a secure password for the new user.',
          placement: 'bottom',
          data: { view: 'users' }
        },
        {
          target: '.tour-user-role',
          title: t('tutorial.userRoleTitle') || 'User Role',
          content: t('tutorial.userRole') || 'Choose between Client (restricted access) and Admin (full access).',
          placement: 'bottom',
          data: { view: 'users' }
        },
        {
          target: '.tour-user-location',
          title: t('tutorial.userLocationTitle') || 'Assigned Location',
          content: t('tutorial.userLocation') || 'For clients, assign the specific sub-account they can view.',
          placement: 'bottom',
          data: { view: 'users' }
        },
        {
          target: '.tour-add-user-btn',
          title: t('tutorial.addUserBtnTitle') || 'Add User',
          content: t('tutorial.addUserBtn') || 'Click to create the new user account.',
          placement: 'bottom',
          data: { view: 'users' }
        }
      );
    }

    baseSteps.push(
      {
        target: '.tour-nav-settings',
        title: t('tutorial.settingsTitle') || 'Account Settings',
        content: t('tutorial.settings') || 'Update your profile, password, or application settings here.',
        placement: 'right',
        data: { view: 'settings' }
      },
      ...(isClientMode ? [] : [{
        target: '.tour-settings-api-key',
        title: t('tutorial.settingsApiKeyTitle') || 'Agency API Key',
        content: t('tutorial.settingsApiKey') || 'Update your GoHighLevel Agency API key here to keep sub-accounts synced.',
        placement: 'bottom',
        data: { view: 'settings' }
      } as Step]),
      {
        target: '.tour-settings-password',
        title: t('tutorial.settingsPasswordTitle') || 'Change Password',
        content: t('tutorial.settingsPassword') || 'Update your account password for security.',
        placement: 'bottom',
        data: { view: 'settings' }
      },
      {
        target: '.tour-date-picker',
        title: t('tutorial.datePickerTitle') || 'Time Filters',
        content: t('tutorial.datePicker') || 'Filter your data by selecting a date range.',
        placement: 'bottom',
        data: { view: 'call-logs' }
      },
      {
        target: '.tour-language-toggle',
        title: t('tutorial.languageTitle') || 'Language Preferences',
        content: t('tutorial.language') || 'Switch between English and Spanish seamlessly.',
        placement: 'bottom',
        data: { view: 'call-logs' }
      }
    );

    setSteps(baseSteps.map(step => ({ disableBeacon: true, skipBeacon: true, spotlightPadding: 8, spotlightBorderRadius: 16, ...step })) as Step[]);
  }, [t, isClientMode]);

  const handleJoyrideCallback = (data: EventData) => {
    const { status, type, step, action } = data;
    
    if (([STATUS.FINISHED, STATUS.SKIPPED] as string[]).includes(status) || action === 'close') {
      onFinish();
    }

    if (type === EVENTS.STEP_AFTER) {
      if (step.target === '.tour-summary-button' && action === 'next') {
        if (onOpenSampleSummary) onOpenSampleSummary();
      } else if (step.target === '.tour-modal-metadata' && action === 'prev') {
        if (onCloseSummary) onCloseSummary();
      } else if (step.target === '.tour-modal-transcript-tab' && action === 'next') {
        if (onCloseSummary) onCloseSummary();
      } else if (step.target === '.tour-add-token' && action === 'next') {
        const btn = document.querySelector('.tour-add-token') as HTMLButtonElement;
        if (btn) btn.click();
      } else if (step.target === '.tour-configure-token-input' && action === 'prev') {
        const btn = document.querySelector('.tour-configure-token-close') as HTMLButtonElement;
        if (btn) btn.click();
      } else if (step.target === '.tour-save-token' && action === 'next') {
        const btn = document.querySelector('.tour-configure-token-close') as HTMLButtonElement;
        if (btn) btn.click();
      }
    }

    if (type === EVENTS.STEP_BEFORE) {
      if (step.data && step.data.view) {
        onViewChange(step.data.view);
      }
    }
  };

  return (
    <Joyride
      steps={steps}
      run={run}
      continuous
      onEvent={handleJoyrideCallback}
      options={{ 
        zIndex: 100000,
        overlayColor: 'rgba(0, 0, 0, 0.5)',
        arrowColor: '#ffffff',
        
        width: 340
      }}
      styles={{ 
        tooltip: {
          padding: 0,
          borderRadius: 16,
          filter: 'drop-shadow(0 10px 15px rgba(0, 0, 0, 0.1)) drop-shadow(0 4px 6px rgba(0, 0, 0, 0.05))',
        },
        tooltipContainer: {
          textAlign: 'left'
        }
      }}
      tooltipComponent={TutorialTooltip}
    />
  );
}
