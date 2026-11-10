import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import esCalculator from './locales/es/calculator.json';
import esCommon from './locales/es/common.json';
import esCurp from './locales/es/curp.json';
import esHome from './locales/es/home.json';
import esRange from './locales/es/range.json';
import enCalculator from './locales/en/calculator.json';
import enCommon from './locales/en/common.json';
import enCurp from './locales/en/curp.json';
import enHome from './locales/en/home.json';
import enRange from './locales/en/range.json';

export const resources = {
  es: { calculator: esCalculator, common: esCommon, curp: esCurp, home: esHome, range: esRange },
  en: { calculator: enCalculator, common: enCommon, curp: enCurp, home: enHome, range: enRange },
};

// shortcut: idioma del dispositivo vía Intl de Hermes, sin selector manual;
// agregar react-native-localize o un selector si hace falta persistir la elección.
const device = Intl.DateTimeFormat().resolvedOptions().locale.split('-')[0];

i18n.use(initReactI18next).init({
  resources,
  lng: device,
  fallbackLng: 'es',
  supportedLngs: ['es', 'en'],
  defaultNS: 'common',
  initAsync: false, // recursos en el bundle: init síncrono
  interpolation: { escapeValue: false },
});

export default i18n;
