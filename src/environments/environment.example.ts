// TinderApp - Environment Configuration Template
// Copia este archivo a `environment.ts` y `environment.prod.ts` con tus credenciales

export const environment = {
  production: false,
  enableMockMode: true, // Si es true, activa perfiles y matches interactivos locales
  firebaseConfig: {
    apiKey: "YOUR_FIREBASE_API_KEY",
    authDomain: "your-app.firebaseapp.com",
    projectId: "your-app",
    storageBucket: "your-app.firebasestorage.app",
    messagingSenderId: "1234567890",
    appId: "1:1234567890:web:abcdef123456",
    measurementId: "G-XXXXXXXXXX"
  },
  SUPABASE: {
    URL: 'https://your-project.supabase.co',
    API_KEY: 'your-supabase-anon-key'
  }
};
