/**
 * Global Clerk Light Theme Configuration
 * Forces a crisp, clean light aesthetic matching VAYU's meteorological design system.
 */
export const clerkLightTheme = {
  variables: {
    colorPrimary: '#0284c7', // Sky-600
    colorBackground: '#ffffff',
    colorText: '#0f172a', // Slate-900
    colorTextSecondary: '#64748b', // Slate-500
    colorInputBackground: '#ffffff',
    colorInputText: '#0f172a',
    colorNeutral: '#0f172a',
    colorDanger: '#ef4444',
    borderRadius: '0.875rem',
  },
  elements: {
    rootBox: 'w-full',
    card: 'bg-white shadow-xl border border-slate-200/90 rounded-2xl p-6 sm:p-8 text-slate-900',
    headerTitle: 'text-slate-900 font-bold text-xl font-heading text-center tracking-tight',
    headerSubtitle: 'text-slate-500 text-xs text-center mt-1 leading-relaxed',
    socialButtonsBlockButton: 'border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs font-semibold py-2.5 shadow-2xs transition-all',
    socialButtonsBlockButtonText: 'text-slate-700 font-medium text-xs',
    formButtonPrimary: 'bg-sky-600 hover:bg-sky-500 text-white font-semibold text-xs py-2.5 shadow-xs transition-all cursor-pointer',
    formFieldInput: 'bg-white border border-slate-300 text-slate-900 placeholder:text-slate-400 focus:border-sky-500 focus:ring-1 focus:ring-sky-500 rounded-xl text-xs py-2.5 shadow-2xs',
    formFieldLabel: 'text-slate-700 text-xs font-medium mb-1',
    footerActionLink: 'text-sky-600 hover:text-sky-700 text-xs font-semibold transition-colors',
    footerActionText: 'text-slate-500 text-xs',
    identityPreviewText: 'text-slate-800 text-xs font-medium',
    identityPreviewEditButton: 'text-sky-600 hover:text-sky-700 text-xs font-semibold',
    dividerLine: 'bg-slate-200',
    dividerText: 'text-slate-400 text-[11px] font-mono uppercase tracking-wider',
    footer: 'border-t border-slate-100 mt-4 pt-4'
  }
};
