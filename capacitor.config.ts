import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.tsuratsura.pivolink',
  appName: 'Pivolink',
  webDir: 'out',
  server: {
    // 本番: デプロイ済みWebアプリをWebViewで読み込む
    url: 'https://redirect.tsuratsura.com',
    // 開発時はローカルサーバーに接続（コメント解除して使用）
    // url: 'http://localhost:3000',
    // cleartext: true,
    androidScheme: 'https',
  },
  plugins: {
    PushNotifications: {
      presentationOptions: ['badge', 'sound', 'alert'],
    },
    SplashScreen: {
      launchShowDuration: 2000,
      backgroundColor: '#ffffff',
      showSpinner: false,
    },
  },
};

export default config;
