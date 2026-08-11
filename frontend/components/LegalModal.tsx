'use client';

import { useEffect, useRef } from 'react';
import { ScrollText, ShieldCheck, X } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import { useBrand } from '@/contexts/BrandContext';
import { subBrand } from '@/utils/brand';

interface LegalModalProps {
  open: boolean;
  onClose: () => void;
  type: 'terms' | 'privacy';
}

const TERMS_SECTIONS = [
  {
    heading: '1. Introduction',
    body: 'Welcome to {appName}, a university discovery platform that helps students find and explore universities worldwide. By accessing or using {appName}, you agree to be bound by these Terms of Service.',
  },
  {
    heading: '2. Use of the Service',
    body: '{appName} is provided for personal, non-commercial use. You agree not to misuse the service, attempt to access it with automated tools, or interfere with its normal operation. You are responsible for the accuracy of the information you provide.',
  },
  {
    heading: '3. User Accounts',
    body: 'When you create an account, you must provide accurate and complete information. You are responsible for safeguarding your password and for all activity that occurs under your account. Notify us if you suspect unauthorized access.',
  },
  {
    heading: '4. Content',
    body: 'University information displayed on {appName} is provided for general guidance only and may not always be up to date. Always confirm admission requirements, deadlines, and costs with the official university sources before making decisions.',
  },
  {
    heading: '5. Third-Party Services',
    body: '{appName} may link to third-party websites and services. We are not responsible for the content, policies, or practices of any third-party services you visit.',
  },
  {
    heading: '6. Limitation of Liability',
    body: '{appName} is provided "as is" without warranties of any kind. To the fullest extent permitted by law, we are not liable for any indirect, incidental, or consequential damages arising from your use of the service.',
  },
  {
    heading: '7. Changes to These Terms',
    body: 'We may update these Terms from time to time. Continued use of {appName} after changes are posted constitutes acceptance of the revised Terms.',
  },
  {
    heading: '8. Contact',
    body: 'If you have questions about these Terms, please contact our support team via the app.',
  },
];

const PRIVACY_SECTIONS = [
  {
    heading: '1. Information We Collect',
    body: 'We collect information you provide directly, such as your name, email address, and study preferences when you create an account or complete the preferences survey. We also collect information about how you use the service, such as the universities you view or save.',
  },
  {
    heading: '2. How We Use Your Information',
    body: 'We use your information to provide and improve the service, personalize university recommendations based on your preferences, respond to your requests, and send you updates you have opted into, such as email notifications.',
  },
  {
    heading: '3. Cookies and Local Storage',
    body: '{appName} uses browser local storage to remember your session, preferences, theme, and language settings. This data stays in your browser and is not transmitted to third parties.',
  },
  {
    heading: '4. Data Sharing',
    body: 'We do not sell your personal information. Your data is only shared with service providers we use to operate the platform, and only as necessary to provide the service.',
  },
  {
    heading: '5. Data Security',
    body: 'We take reasonable measures to protect your information from unauthorized access, alteration, or destruction. No method of transmission over the internet is 100% secure, so we cannot guarantee absolute security.',
  },
  {
    heading: '6. Your Rights',
    body: 'You may access, correct, or delete your personal information at any time from your profile and settings. You can also disable email notifications or delete your account at any time.',
  },
  {
    heading: '7. Changes to This Policy',
    body: 'We may update this Privacy Policy from time to time. We will notify you of material changes by posting the updated policy on this page.',
  },
  {
    heading: '8. Contact',
    body: 'If you have questions about this Privacy Policy or how your data is handled, please contact our support team via the app.',
  },
];

/** Modal showing the Terms of Service or Privacy Policy instead of a full page. */
export default function LegalModal({ open, onClose, type }: LegalModalProps) {
  const { t } = useLanguage();
  const { appName } = useBrand();
  const isTerms = type === 'terms';
  const sections = isTerms ? TERMS_SECTIONS : PRIVACY_SECTIONS;
  const Icon = isTerms ? ScrollText : ShieldCheck;
  const closeBtnRef = useRef<HTMLButtonElement>(null);

  // Keep the latest onClose without re-running the effect below
  const onCloseRef = useRef(onClose);
  useEffect(() => {
    onCloseRef.current = onClose;
  }, [onClose]);

  // Close on Escape + lock background scrolling + focus the modal while open
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onCloseRef.current();
    };
    document.addEventListener('keydown', onKey);
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    closeBtnRef.current?.focus();
    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = prevOverflow;
    };
  }, [open]);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-[70] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-label={isTerms ? t('termsOfService') : t('privacyPolicy')}
    >
      <div
        className="bg-[#C8C8E0] dark:bg-dark-bg-secondary border border-[#A8A8C8] dark:border-dark-border rounded-2xl w-full max-w-2xl max-h-[85vh] flex flex-col shadow-2xl animate-scale-in overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center gap-3 px-6 py-4 border-b border-[#A8A8C8] dark:border-dark-border shrink-0">
          <div className="w-10 h-10 rounded-xl bg-[#9370DB]/10 text-[#9370DB] dark:bg-dark-violet/20 dark:text-dark-violet flex items-center justify-center">
            <Icon className="w-5 h-5" />
          </div>
          <div className="flex-1 min-w-0">
            <h2 className="text-lg font-bold text-slate-900 dark:text-dark-text leading-tight">
              {isTerms ? t('termsOfService') : t('privacyPolicy')}
            </h2>
            <p className="text-xs text-slate-500 dark:text-dark-text-secondary">Last updated: August 2026</p>
          </div>
          <button
            ref={closeBtnRef}
            onClick={onClose}
            className="p-2 rounded-lg text-slate-500 dark:text-dark-text-secondary hover:text-slate-900 dark:hover:text-dark-text hover:bg-[#B8B8D4] dark:hover:bg-dark-bg-tertiary transition-colors"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable body */}
        <div className="overflow-y-auto px-6 py-5 space-y-6 grow">
          {sections.map((section) => (
            <div key={section.heading}>
              <h3 className="text-sm font-semibold text-slate-900 dark:text-dark-text mb-1.5">
                {section.heading}
              </h3>
              <p className="text-sm text-slate-700 dark:text-dark-text-secondary leading-relaxed">
                {subBrand(section.body, appName)}
              </p>
            </div>
          ))}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-[#A8A8C8] dark:border-dark-border shrink-0 flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2.5 bg-[#9370DB] dark:bg-dark-violet text-white rounded-lg font-medium hover:bg-[#7B68EE] dark:hover:bg-dark-violet-hover transition-colors shadow-sm shadow-[#9370DB]/30"
          >
            {isTerms ? t('iAgree') : t('gotIt')}
          </button>
        </div>
      </div>
    </div>
  );
}
