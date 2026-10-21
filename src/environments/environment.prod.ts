// TinderApp - Production Environment Configuration
// Credenciales sanitizadas para repositorio publico.

export const environment = {
  production: true,
  enableMockMode: true,
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
