import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.sep.asuntos',
  appName: 'asuntos-relevantes-app',
  webDir: 'www',
  server: {
    allowNavigation: ['168.255.101.230', '168.255.101.230:5008', '10.3.12.168', '10.3.12.168:5008'] // o '192.168.1.50' si usas IP
  }
};

export default config;
