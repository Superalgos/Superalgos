import i18n from './i18n';
import {createPinia} from 'pinia';
/**
 * plugins/index.ts
 *
 * Automatically included in `./src/main.ts`
 */

// Types
import type { App } from 'vue'

// Plugins
import vuetify from './vuetify'

export function registerPlugins (app: App) {
 app.use(vuetify)
 app.use(createPinia());
 app.use(i18n);
}