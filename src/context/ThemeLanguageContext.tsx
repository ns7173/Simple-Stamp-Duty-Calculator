import React, { createContext, useContext, useState, useEffect } from 'react';

export type Language = 'hi' | 'en';
export type Theme = 'light' | 'dark';

interface ThemeLanguageContextType {
  language: Language;
  toggleLanguage: () => void;
  setLanguage: (lang: Language) => void;
  theme: Theme;
  toggleTheme: () => void;
  setTheme: (theme: Theme) => void;
  t: (key: string) => string;
}

const DICTIONARY: Record<string, { hi: string; en: string }> = {
  // Header
  appTitle: {
    hi: 'मुद्रांक शुल्क एवं पंजीयन फीस कैलकुलेटर',
    en: 'Stamp Duty & Registration Fees Calculator',
  },
  appTagline: {
    hi: 'कलेक्टर गाइडलाइन दर मूल्यांकन',
    en: 'Circle Rate Valuation',
  },
  appSubtitle: {
    hi: 'भूखंड, भवन, बहुमंजिला फ्लैट एवं लीज डीड हेतु अधिकृत गणना',
    en: 'Official calculations for Open Plots, Buildings, Multi-Storied Flats & Leases',
  },
  unitConverter: {
    hi: 'इकाई परिवर्तक',
    en: 'Unit Converter',
  },
  switchLanguage: {
    hi: 'English',
    en: 'हिंदी',
  },
  darkMode: {
    hi: 'डार्क मोड',
    en: 'Dark Mode',
  },
  lightMode: {
    hi: 'लाइट मोड',
    en: 'Light Mode',
  },

  // Tabs
  tabPlot: {
    hi: 'भूखंड (Plot)',
    en: 'Plot',
  },
  tabPlotSub: {
    hi: 'खुला भूखंड मूल्यांकन',
    en: 'Open Plot Valuation',
  },
  tabBuilding: {
    hi: 'भवन (Building)',
    en: 'Building',
  },
  tabBuildingSub: {
    hi: 'भूमि एवं निर्माण सहित',
    en: 'Land With Construction',
  },
  tabFlat: {
    hi: 'प्रकोष्ठ / फ्लैट (Flat)',
    en: 'Flat',
  },
  tabFlatSub: {
    hi: 'बहुमंजिला कॉम्प्लेक्स',
    en: 'Multi-Storied Complex',
  },
  tabLease: {
    hi: 'लीज डीड (Lease)',
    en: 'Lease Deed',
  },
  tabLeaseSub: {
    hi: 'किरायानामा व वाणिज्यिक',
    en: 'Rent Agreement & Commercial',
  },

  // Common Actions
  loadSample: {
    hi: 'नमूना डेटा लोड करें',
    en: 'Load Sample Data',
  },
  reset: {
    hi: 'रीसेट',
    en: 'Reset',
  },
  copySummary: {
    hi: 'विवरण कॉपी करें',
    en: 'Copy Summary',
  },
  copied: {
    hi: 'कॉपी हो गया',
    en: 'Copied',
  },
  totalDues: {
    hi: 'कुल देय शुल्क (Total Dues)',
    en: 'Total Payable Dues',
  },
  stampDuty: {
    hi: 'मुद्रांक शुल्क (Stamp Duty)',
    en: 'Stamp Duty',
  },
  registrationFee: {
    hi: 'पंजीयन शुल्क (Registration Fee)',
    en: 'Registration Fee',
  },
  footerText: {
    hi: 'स्टाम्प ड्यूटी एवं रजिस्ट्रेशन फीस कैलकुलेटर • भारत में संपत्ति विलेखों के लिए उपयुक्त',
    en: 'Stamp Duty and Registration Fees Calculator • Formatted for Indian Property Deeds',
  },
};

const ThemeLanguageContext = createContext<ThemeLanguageContextType | undefined>(undefined);

export const ThemeLanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Theme state
  const [theme, setThemeState] = useState<Theme>(() => {
    const saved = localStorage.getItem('app_theme') as Theme;
    if (saved === 'dark' || saved === 'light') return saved;
    return window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches
      ? 'dark'
      : 'light';
  });

  // Language state (defaults to Hindi as requested by user)
  const [language, setLanguageState] = useState<Language>(() => {
    const saved = localStorage.getItem('app_lang') as Language;
    if (saved === 'hi' || saved === 'en') return saved;
    return 'hi';
  });

  // Apply dark mode class to <html>
  useEffect(() => {
    const root = document.documentElement;
    if (theme === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
    localStorage.setItem('app_theme', theme);
  }, [theme]);

  // Save language
  useEffect(() => {
    localStorage.setItem('app_lang', language);
  }, [language]);

  const toggleTheme = () => {
    setThemeState((prev) => (prev === 'dark' ? 'light' : 'dark'));
  };

  const toggleLanguage = () => {
    setLanguageState((prev) => (prev === 'hi' ? 'en' : 'hi'));
  };

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
  };

  const setTheme = (t: Theme) => {
    setThemeState(t);
  };

  const t = (key: string): string => {
    const entry = DICTIONARY[key];
    if (!entry) return key;
    return entry[language] || entry.en || key;
  };

  return (
    <ThemeLanguageContext.Provider
      value={{
        language,
        toggleLanguage,
        setLanguage,
        theme,
        toggleTheme,
        setTheme,
        t,
      }}
    >
      {children}
    </ThemeLanguageContext.Provider>
  );
};

export const useThemeLanguage = (): ThemeLanguageContextType => {
  const context = useContext(ThemeLanguageContext);
  if (!context) {
    throw new Error('useThemeLanguage must be used within a ThemeLanguageProvider');
  }
  return context;
};
