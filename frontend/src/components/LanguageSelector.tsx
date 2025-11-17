import { Fragment } from 'react';
import { Menu, Transition } from '@headlessui/react';
import { useTranslation } from 'react-i18next';
import { GlobeAltIcon } from '@heroicons/react/24/outline';
import { ChevronDownIcon } from '@heroicons/react/20/solid';

const languages = [
  { code: 'ko', name: '한국어', flag: '🇰🇷' },
  { code: 'en', name: 'English', flag: '🇺🇸' },
  { code: 'zh-TW', name: '繁體中文', flag: '🇹🇼' },
  { code: 'zh-CN', name: '简体中文', flag: '🇨🇳' },
];

export default function LanguageSelector() {
  const { i18n } = useTranslation();

  const currentLanguage = languages.find((lang) => lang.code === i18n.language) || languages[0];

  const changeLanguage = (languageCode: string) => {
    i18n.changeLanguage(languageCode);
  };

  return (
    <Menu as="div" className="relative inline-block text-left">
      <div>
        <Menu.Button className="inline-flex items-center gap-2 rounded-full bg-white dark:bg-gray-800 px-3 py-2 text-sm font-medium text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors border border-gray-300 dark:border-gray-600">
          <GlobeAltIcon className="h-5 w-5" />
          <span>{currentLanguage.flag}</span>
          <span className="hidden sm:inline">{currentLanguage.name}</span>
          <ChevronDownIcon className="h-4 w-4" />
        </Menu.Button>
      </div>

      <Transition
        as={Fragment}
        enter="transition ease-out duration-100"
        enterFrom="transform opacity-0 scale-95"
        enterTo="transform opacity-100 scale-100"
        leave="transition ease-in duration-75"
        leaveFrom="transform opacity-100 scale-100"
        leaveTo="transform opacity-0 scale-95"
      >
        <Menu.Items className="absolute right-0 z-10 mt-2 w-48 origin-top-right rounded-lg bg-white dark:bg-gray-800 shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none">
          <div className="py-1">
            {languages.map((language) => (
              <Menu.Item key={language.code}>
                {({ active }) => (
                  <button
                    onClick={() => changeLanguage(language.code)}
                    className={`${
                      active ? 'bg-gray-100 dark:bg-gray-700' : ''
                    } ${
                      i18n.language === language.code
                        ? 'bg-primary-50 dark:bg-primary-900/20 text-primary-600 dark:text-primary-400'
                        : 'text-gray-700 dark:text-gray-200'
                    } group flex w-full items-center gap-3 px-4 py-2 text-sm`}
                  >
                    <span className="text-lg">{language.flag}</span>
                    <span>{language.name}</span>
                    {i18n.language === language.code && (
                      <span className="ml-auto text-primary-600 dark:text-primary-400">✓</span>
                    )}
                  </button>
                )}
              </Menu.Item>
            ))}
          </div>
        </Menu.Items>
      </Transition>
    </Menu>
  );
}
