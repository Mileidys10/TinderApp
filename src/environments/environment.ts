// TinderApp - Environment Configuration
// Credenciales sanitizadas para repositorio publico.
// Para ejecucion local con backend real, reemplaza con tus credenciales privadas.

export const environment = {
  production: false,
  enableMockMode: true, // Modo autonomo 100% interactivo y seguro sin dependencia de backend remoto
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
