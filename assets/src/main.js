import App from './components/App.js';
import ZDClient from './services/ZDClient.js';
import i18n from './i18n/index.js';

let app = {};
const initVueApp = async () => {
  app = Vue.createApp(App);

  app.use(i18n);
  app.use(VsLoader.plugin);
  app.use(VsSelect.plugin);
  app.use(VsButton.plugin);

  app.config.globalProperties.$currentUser = await ZDClient.get('currentUser');
  app.mount('#app');
};

ZDClient.init();
ZDClient.events['ON_APP_REGISTERED'](initVueApp);

export { app };
