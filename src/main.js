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
      md: "8px",
      lg: "12px",
      xl: "18px",
    },
    jade: {
      50: "#edf8f4",
      100: "#d5eee5",
      200: "#adddce",
      300: "#7bc7b0",
      400: "#50ad93",
      500: "#3a947b",
      600: "#30826c",
      700: "#286b5a",
      800: "#225548",
      900: "#1c463c",
      950: "#0d2722",
    },
  },
  semantic: {
    transitionDuration: "160ms",
    primary: {
      50: "{jade.50}",
      100: "{jade.100}",
      200: "{jade.200}",
      300: "{jade.300}",
      400: "{jade.400}",
      500: "{jade.500}",
      600: "{jade.600}",
      700: "{jade.700}",
      800: "{jade.800}",
      900: "{jade.900}",
      950: "{jade.950}",
    },
    focusRing: {
      width: "2px",
      style: "solid",
      color: "{primary.color}",
      offset: "2px",
      shadow: "0 0 0 1px {surface.0}",
    },
    formField: {
      borderRadius: "{border.radius.md}",
      focusRing: {
        width: "2px",
        style: "solid",
        color: "{primary.color}",
        offset: "1px",
        shadow: "none",
      },
    },
    content: {
      borderRadius: "{border.radius.lg}",
    },
    colorScheme: {
      light: {
        surface: {
          0: "#fffdf7",
          50: "#faf7ef",
          100: "#f3efe5",
          200: "#e8e2d5",
          300: "#d6cebd",
          400: "#a99f8e",
          500: "#7b7366",
          600: "#5b554c",
          700: "#403c36",
          800: "#292825",
          900: "#1c1d1b",
          950: "#101312",
        },
        primary: {
          color: "{primary.600}",
          contrastColor: "#ffffff",
          hoverColor: "{primary.700}",
          activeColor: "{primary.800}",
        },
        highlight: {
          background: "{primary.50}",
          focusBackground: "{primary.100}",
          color: "{primary.800}",
          focusColor: "{primary.900}",
        },
        formField: {
          borderColor: "{surface.500}",
          hoverBorderColor: "{surface.600}",
        },
      },
      dark: {
        surface: {
          0: "#f7f3e9",
          50: "#e8e5dc",
          100: "#d6d5ce",
          200: "#b9bfba",
          300: "#97a39d",
          400: "#73817c",
          500: "#53635f",
          600: "#3b4b48",
          700: "#293835",
          800: "#1b2928",
          900: "#111d1d",
          950: "#0a1213",
        },
        primary: {
          color: "{primary.300}",
          contrastColor: "{surface.950}",
          hoverColor: "{primary.200}",
          activeColor: "{primary.100}",
        },
        highlight: {
          background: "color-mix(in srgb, {primary.300}, transparent 84%)",
          focusBackground: "color-mix(in srgb, {primary.300}, transparent 76%)",
          color: "{primary.100}",
          focusColor: "{primary.50}",
        },
        formField: {
          borderColor: "{surface.400}",
          hoverBorderColor: "{surface.300}",
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
