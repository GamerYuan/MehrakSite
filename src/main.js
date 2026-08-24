import { createApp } from "vue";
import PrimeVue from "primevue/config";
import Aura from "@primeuix/themes/aura";
import { definePreset } from "@primeuix/themes";
import ToastService from "primevue/toastservice";
import ConfirmationService from "primevue/confirmationservice";
import "primeicons/primeicons.css";
import "./style.css";
import App from "./App.vue";
import router from "./router";

const MehrakPreset = definePreset(Aura, {
  primitive: {
    borderRadius: {
      none: "0",
      xs: "2px",
      sm: "4px",
      md: "6px",
      lg: "10px",
      xl: "14px",
    },
    command: {
      50: "var(--brand-50)",
      100: "var(--brand-100)",
      200: "var(--brand-200)",
      300: "var(--brand-300)",
      400: "var(--brand-400)",
      500: "var(--brand-500)",
      600: "var(--brand-600)",
      700: "var(--brand-700)",
      800: "var(--brand-800)",
      900: "var(--brand-900)",
      950: "var(--brand-950)",
    },
    green: {
      50: "var(--success-soft)",
      100: "var(--success-soft)",
      200: "color-mix(in oklch, var(--success), white 64%)",
      300: "color-mix(in oklch, var(--success), white 42%)",
      400: "color-mix(in oklch, var(--success), white 20%)",
      500: "var(--success)",
      600: "color-mix(in oklch, var(--success), black 10%)",
      700: "color-mix(in oklch, var(--success), black 20%)",
      800: "color-mix(in oklch, var(--success), black 30%)",
      900: "color-mix(in oklch, var(--success), black 40%)",
      950: "color-mix(in oklch, var(--success), black 54%)",
    },
    yellow: {
      50: "var(--warn-soft)",
      100: "var(--warn-soft)",
      200: "color-mix(in oklch, var(--warn), white 64%)",
      300: "color-mix(in oklch, var(--warn), white 42%)",
      400: "color-mix(in oklch, var(--warn), white 20%)",
      500: "var(--warn)",
      600: "color-mix(in oklch, var(--warn), black 10%)",
      700: "color-mix(in oklch, var(--warn), black 20%)",
      800: "color-mix(in oklch, var(--warn), black 30%)",
      900: "color-mix(in oklch, var(--warn), black 40%)",
      950: "color-mix(in oklch, var(--warn), black 54%)",
    },
    orange: {
      50: "{yellow.50}",
      100: "{yellow.100}",
      200: "{yellow.200}",
      300: "{yellow.300}",
      400: "{yellow.400}",
      500: "{yellow.500}",
      600: "{yellow.600}",
      700: "{yellow.700}",
      800: "{yellow.800}",
      900: "{yellow.900}",
      950: "{yellow.950}",
    },
    red: {
      50: "var(--danger-soft)",
      100: "var(--danger-soft)",
      200: "color-mix(in oklch, var(--danger), white 64%)",
      300: "color-mix(in oklch, var(--danger), white 42%)",
      400: "color-mix(in oklch, var(--danger), white 20%)",
      500: "var(--danger)",
      600: "color-mix(in oklch, var(--danger), black 10%)",
      700: "color-mix(in oklch, var(--danger), black 20%)",
      800: "color-mix(in oklch, var(--danger), black 30%)",
      900: "color-mix(in oklch, var(--danger), black 40%)",
      950: "color-mix(in oklch, var(--danger), black 54%)",
    },
    sky: {
      50: "var(--info-soft)",
      100: "var(--info-soft)",
      200: "color-mix(in oklch, var(--info), white 64%)",
      300: "color-mix(in oklch, var(--info), white 42%)",
      400: "color-mix(in oklch, var(--info), white 20%)",
      500: "var(--info)",
      600: "color-mix(in oklch, var(--info), black 10%)",
      700: "color-mix(in oklch, var(--info), black 20%)",
      800: "color-mix(in oklch, var(--info), black 30%)",
      900: "color-mix(in oklch, var(--info), black 40%)",
      950: "color-mix(in oklch, var(--info), black 54%)",
    },
    blue: {
      50: "{sky.50}",
      100: "{sky.100}",
      200: "{sky.200}",
      300: "{sky.300}",
      400: "{sky.400}",
      500: "{sky.500}",
      600: "{sky.600}",
      700: "{sky.700}",
      800: "{sky.800}",
      900: "{sky.900}",
      950: "{sky.950}",
    },
  },
  semantic: {
    transitionDuration: "var(--motion-base)",
    primary: {
      50: "{command.50}",
      100: "{command.100}",
      200: "{command.200}",
      300: "{command.300}",
      400: "{command.400}",
      500: "{command.500}",
      600: "{command.600}",
      700: "{command.700}",
      800: "{command.800}",
      900: "{command.900}",
      950: "{command.950}",
    },
    focusRing: {
      width: "var(--focus-width)",
      style: "solid",
      color: "var(--focus-color)",
      offset: "var(--focus-offset)",
      shadow: "none",
    },
    formField: {
      borderRadius: "{border.radius.md}",
      focusRing: {
        width: "var(--focus-width)",
        style: "solid",
        color: "var(--focus-color)",
        offset: "2px",
        shadow: "none",
      },
    },
    content: {
      borderRadius: "{border.radius.lg}",
    },
    overlay: {
      select: {
        borderRadius: "{border.radius.lg}",
        shadow: "var(--shadow-lg)",
      },
      popover: {
        borderRadius: "{border.radius.lg}",
        shadow: "var(--shadow-lg)",
      },
      modal: {
        borderRadius: "{border.radius.xl}",
        shadow: "var(--shadow-dialog)",
      },
      navigation: {
        shadow: "var(--shadow-lg)",
      },
    },
    colorScheme: {
      light: {
        surface: {
          0: "var(--surface-0)",
          50: "var(--surface-50)",
          100: "var(--surface-100)",
          200: "var(--surface-200)",
          300: "var(--surface-300)",
          400: "var(--surface-400)",
          500: "var(--surface-500)",
          600: "var(--surface-600)",
          700: "var(--surface-700)",
          800: "var(--surface-800)",
          900: "var(--surface-900)",
          950: "var(--surface-950)",
        },
        primary: {
          color: "var(--accent)",
          contrastColor: "var(--accent-contrast)",
          hoverColor: "var(--accent-strong)",
          activeColor: "{primary.800}",
        },
        highlight: {
          background: "{primary.50}",
          focusBackground: "{primary.100}",
          color: "{primary.800}",
          focusColor: "{primary.900}",
        },
        formField: {
          background: "var(--bg-surface)",
          disabledBackground: "var(--bg-surface-sunken)",
          filledBackground: "var(--bg-surface-raised)",
          filledHoverBackground: "var(--bg-surface-raised)",
          filledFocusBackground: "var(--bg-surface-raised)",
          borderColor: "var(--border-primary)",
          hoverBorderColor: "var(--border-secondary)",
          focusBorderColor: "var(--focus-color)",
          invalidBorderColor: "var(--danger)",
          color: "var(--text-primary)",
          disabledColor: "var(--text-muted)",
          placeholderColor: "var(--text-muted)",
        },
        text: {
          color: "var(--text-primary)",
          hoverColor: "var(--text-primary)",
          mutedColor: "var(--text-muted)",
          hoverMutedColor: "var(--text-secondary)",
        },
        content: {
          background: "var(--bg-surface)",
          hoverBackground: "var(--bg-surface-raised)",
          borderColor: "var(--border-primary)",
          color: "var(--text-primary)",
          hoverColor: "var(--text-primary)",
        },
        overlay: {
          select: {
            background: "var(--bg-surface)",
            borderColor: "var(--border-primary)",
            color: "var(--text-primary)",
          },
          popover: {
            background: "var(--bg-surface)",
            borderColor: "var(--border-primary)",
            color: "var(--text-primary)",
          },
          modal: {
            background: "var(--bg-surface)",
            borderColor: "var(--border-primary)",
            color: "var(--text-primary)",
          },
        },
      },
      dark: {
        surface: {
          0: "var(--surface-0)",
          50: "var(--surface-50)",
          100: "var(--surface-100)",
          200: "var(--surface-200)",
          300: "var(--surface-300)",
          400: "var(--surface-400)",
          500: "var(--surface-500)",
          600: "var(--surface-600)",
          700: "var(--surface-700)",
          800: "var(--surface-800)",
          900: "var(--surface-900)",
          950: "var(--surface-950)",
        },
        primary: {
          color: "var(--accent)",
          contrastColor: "var(--accent-contrast)",
          hoverColor: "var(--accent-strong)",
          activeColor: "{primary.200}",
        },
        highlight: {
          background: "color-mix(in srgb, {primary.300}, transparent 84%)",
          focusBackground: "color-mix(in srgb, {primary.300}, transparent 76%)",
          color: "{primary.100}",
          focusColor: "{primary.50}",
        },
        formField: {
          background: "var(--bg-surface-sunken)",
          disabledBackground: "var(--bg-surface-raised)",
          filledBackground: "var(--bg-surface)",
          filledHoverBackground: "var(--bg-surface)",
          filledFocusBackground: "var(--bg-surface)",
          borderColor: "var(--border-primary)",
          hoverBorderColor: "var(--border-secondary)",
          focusBorderColor: "var(--focus-color)",
          invalidBorderColor: "var(--danger)",
          color: "var(--text-primary)",
          disabledColor: "var(--text-muted)",
          placeholderColor: "var(--text-muted)",
        },
        text: {
          color: "var(--text-primary)",
          hoverColor: "var(--text-primary)",
          mutedColor: "var(--text-muted)",
          hoverMutedColor: "var(--text-secondary)",
        },
        content: {
          background: "var(--bg-surface)",
          hoverBackground: "var(--bg-surface-raised)",
          borderColor: "var(--border-primary)",
          color: "var(--text-primary)",
          hoverColor: "var(--text-primary)",
        },
        overlay: {
          select: {
            background: "var(--bg-surface-raised)",
            borderColor: "var(--border-primary)",
            color: "var(--text-primary)",
          },
          popover: {
            background: "var(--bg-surface-raised)",
            borderColor: "var(--border-primary)",
            color: "var(--text-primary)",
          },
          modal: {
            background: "var(--bg-surface)",
            borderColor: "var(--border-primary)",
            color: "var(--text-primary)",
          },
        },
      },
    },
  },
});

const app = createApp(App);

app.use(PrimeVue, {
  theme: {
    preset: MehrakPreset,
    options: {
      darkModeSelector: ".dark",
    },
  },
});
app.use(ToastService);
app.use(ConfirmationService);
app.use(router);

app.mount("#app");
