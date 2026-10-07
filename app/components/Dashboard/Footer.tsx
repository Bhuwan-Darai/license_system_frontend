import React from "react";

import {useTheme} from '@/app/context/ThemeContext';

interface FooterProps {
  collapsed: boolean;
}

const Footer: React.FC<FooterProps> = ({ collapsed }) => {
  const currentYear = new Date().getFullYear();
  const {theme} = useTheme();

    const isThemeLight = theme === "light";
    const headerBg = isThemeLight ? "#eee8dd" : "#131b2e";
    const textColor = isThemeLight ? "#131b2e" : "#eee8dd";
    const hoverColor = isThemeLight ? "#eee8dd" : "#131b2e";
    const borderColor = isThemeLight ? "#d1d5db" : "#1e3a5f";

  return (
    <footer
      className={`bg-white border-t border-gray-200 py-4 px-6 transition-all duration-300 `}
      style={{
        backgroundColor: headerBg,
        borderBottomColor: borderColor,
        color: textColor,
      }}
    >
      <div className="flex flex-col sm:flex-row justify-between items-center gap-2 text-sm text-gray-500">
        <div>© {currentYear} Dashboard. All rights reserved.</div>
        <div className="flex items-center gap-4">
          <a href="#" className="hover:text-blue-600 transition-colors">
            Privacy Policy
          </a>
          <a href="#" className="hover:text-blue-600 transition-colors">
            Terms of Service
          </a>
          <a href="#" className="hover:text-blue-600 transition-colors">
            Support
          </a>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
