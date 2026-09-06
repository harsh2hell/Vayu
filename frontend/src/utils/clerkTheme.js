/**
 * Global Clerk Light Theme Configuration
 * Tuned for the split-screen VAYU Portal Login —
 * clean, borderless cards that merge into the white left panel.
 */
export const clerkLightTheme = {
  variables: {
    colorPrimary: '#0284c7', // Sky-600
    colorBackground: '#ffffff',
    colorText: '#0f172a', // Slate-900
    colorTextSecondary: '#64748b', // Slate-500
    colorInputBackground: '#f8fafc',
    colorInputText: '#0f172a',
    colorNeutral: '#0f172a',
    colorDanger: '#ef4444',
    borderRadius: '0.875rem',
  },
  elements: {
    rootBox: 'w-full',
    logoBox: '!hidden hidden',
    logoImage: '!hidden hidden',
    card: 'bg-transparent shadow-none border-none p-0 text-slate-900',
    headerTitle: '!hidden hidden',
    headerSubtitle: '!hidden hidden',
    socialButtonsBlockButton: 'border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs font-semibold py-2.5 shadow-2xs transition-all rounded-xl',
    socialButtonsBlockButtonText: 'text-slate-700 font-medium text-xs',
    formButtonPrimary: 'bg-sky-600 hover:bg-sky-500 text-white font-semibold text-sm py-2.5 shadow-sm hover:shadow-md transition-all cursor-pointer rounded-xl',
    formFieldInput: 'bg-white border border-slate-200 text-slate-900 placeholder:text-slate-400 focus:border-sky-500 focus:ring-2 focus:ring-sky-100 rounded-xl text-sm py-2.5 shadow-2xs transition-all',
    formFieldLabel: 'text-slate-600 text-xs font-medium mb-1',
    footerActionLink: 'text-sky-600 hover:text-sky-700 text-xs font-semibold transition-colors',
    footerActionText: 'text-slate-500 text-xs',
    identityPreviewText: 'text-slate-800 text-xs font-medium',
    identityPreviewEditButton: 'text-sky-600 hover:text-sky-700 text-xs font-semibold',
    dividerLine: 'bg-slate-200',
    dividerText: 'text-slate-400 text-[11px] font-mono uppercase tracking-wider',
    footer: 'border-t border-slate-100 mt-4 pt-4'
  }
};
