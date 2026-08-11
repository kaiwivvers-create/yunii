'use client';

import Navbar from '@/components/Navbar';
import { useLanguage } from '@/contexts/LanguageContext';
import { useBrand } from '@/contexts/BrandContext';
import { subBrand } from '@/utils/brand';

const sections = [
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

export default function Privacy() {
  const { t } = useLanguage();
  const { appName } = useBrand();

  return (
    <div className="min-h-screen bg-[#E8E8F0] dark:bg-dark-bg">
      <Navbar currentPage="home" />

      <section className="pt-24 pb-12 px-4 sm:px-6 lg:px-8 max-w-3xl mx-auto">
        <h1 className="text-3xl font-bold text-slate-900 dark:text-dark-text mb-2">
          {t('privacyPolicy')}
        </h1>
        <p className="text-sm text-slate-500 dark:text-dark-text-secondary mb-8">
          Last updated: August 2026
        </p>

        <div className="bg-[#C8C8E0] dark:bg-dark-bg-secondary border border-[#A8A8C8] dark:border-dark-border rounded-lg p-6 space-y-6">
          {sections.map((section) => (
            <div key={section.heading}>
              <h2 className="text-lg font-semibold text-slate-900 dark:text-dark-text mb-2">
                {section.heading}
              </h2>
              <p className="text-sm text-slate-700 dark:text-dark-text-secondary leading-relaxed">
                {subBrand(section.body, appName)}
              </p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
