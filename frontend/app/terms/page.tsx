'use client';

import Navbar from '@/components/Navbar';
import { useLanguage } from '@/contexts/LanguageContext';
import { useBrand } from '@/contexts/BrandContext';
import { subBrand } from '@/utils/brand';

const sections = [
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

export default function Terms() {
  const { t } = useLanguage();
  const { appName } = useBrand();

  return (
    <div className="min-h-screen bg-[#E8E8F0] dark:bg-dark-bg">
      <Navbar currentPage="home" />

      <section className="pt-24 pb-12 px-4 sm:px-6 lg:px-8 max-w-3xl mx-auto">
        <h1 className="text-3xl font-bold text-slate-900 dark:text-dark-text mb-2">
          {t('termsOfService')}
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
