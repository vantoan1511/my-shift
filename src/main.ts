import './assets/main.css'

import {createApp} from 'vue'
import {createPinia} from 'pinia'
import {definePreset} from '@primeuix/themes';
import App from './App.vue'
import router from './router'
import PrimeVue from 'primevue/config';
import Aura from '@primeuix/themes/aura';
import {Ripple} from "primevue";
import ToastService from 'primevue/toastservice';
import ConfirmationService from 'primevue/confirmationservice';
import i18n from "./i18n";

const Noir = definePreset(Aura, {
  semantic: {
    primary: {
      50: '{zinc.50}',
      100: '{zinc.100}',
      200: '{zinc.200}',
      300: '{zinc.300}',
      400: '{zinc.400}',
      500: '{zinc.500}',
      600: '{zinc.600}',
      700: '{zinc.700}',
      800: '{zinc.800}',
      900: '{zinc.900}',
      950: '{zinc.950}'
    },
    colorScheme: {
      light: {
        primary: {
          color: '{zinc.950}',
          inverseColor: '#ffffff',
          hoverColor: '{zinc.900}',
          activeColor: '{zinc.800}'
        },
        highlight: {
          background: '{zinc.950}',
          focusBackground: '{zinc.700}',
          color: '#ffffff',
          focusColor: '#ffffff'
        }
      },
      dark: {
        primary: {
          color: '{zinc.50}',
          inverseColor: '{zinc.950}',
          hoverColor: '{zinc.100}',
          activeColor: '{zinc.200}'
        },
        highlight: {
          background: 'rgba(250, 250, 250, .16)',
          focusBackground: 'rgba(250, 250, 250, .24)',
          color: 'rgba(255,255,255,.87)',
          focusColor: 'rgba(255,255,255,.87)'
        }
      }
    }
  }
});

const MyPreset = definePreset(Aura, {
  semantic: {
    primary: {
      50: '{indigo.50}',
      100: '{indigo.100}',
      200: '{indigo.200}',
      300: '{indigo.300}',
      400: '{indigo.400}',
      500: '{indigo.500}',
      600: '{indigo.600}',
      700: '{indigo.700}',
      800: '{indigo.800}',
      900: '{indigo.900}',
      950: '{indigo.950}'
    },
    focusRing: {
      width: '2px',
      style: 'dashed',
      color: '{primary.color}',
      offset: '2px'
    },
    colorScheme: {
      light: {
        surface: {
          0: '#ffffff',
          50: '{zinc.50}',
          100: '{zinc.100}',
          200: '{zinc.200}',
          300: '{zinc.300}',
          400: '{zinc.400}',
          500: '{zinc.500}',
          600: '{zinc.600}',
          700: '{zinc.700}',
          800: '{zinc.800}',
          900: '{zinc.900}',
          950: '{zinc.950}'
        },
        formField: {
          hoverBorderColor: '{primary.color}',
        }
      },
      dark: {
        surface: {
          0: '#ffffff',
          50: '{slate.50}',
          100: '{slate.100}',
          200: '{slate.200}',
          300: '{slate.300}',
          400: '{slate.400}',
          500: '{slate.500}',
          600: '{slate.600}',
          700: '{slate.700}',
          800: '{slate.800}',
          900: '{slate.900}',
          950: '{slate.950}'
        },
        formField: {
          hoverBorderColor: '{primary.color}',
        }
      }
    }
  }
});

const app = createApp(App)

app.use(createPinia())

app.use(router)

app.directive('ripple', Ripple);
app.use(PrimeVue, {
  ripple: true,
  theme: {
    preset: MyPreset,
    options: {
      darkModeSelector: false,
      cssLayer: {
        name: 'primevue',
        order: 'theme, base, primevue'
      }
    }
  }
});
app.use(ToastService);
app.use(ConfirmationService);
app.use(i18n);
app.mount('#app')
