// Firebase configuration helper
// Paste your Firebase Web SDK config values (from Firebase Console -> Project settings -> Your apps)
// Example:
// window.__firebase_config = JSON.stringify({ apiKey: "...", authDomain: "...", projectId: "...", ... });
// window.__app_id = 'default-app-id';

// --- EDIT THESE VALUES ---
window.__firebase_config = JSON.stringify({
  apiKey: "REPLACE_WITH_API_KEY",
  authDomain: "REPLACE_WITH_PROJECT.firebaseapp.com",
  projectId: "REPLACE_WITH_PROJECT_ID",
  storageBucket: "REPLACE_WITH_PROJECT.appspot.com",
  messagingSenderId: "REPLACE_WITH_SENDER_ID",
  appId: "REPLACE_WITH_APP_ID",
  measurementId: "REPLACE_WITH_MEASUREMENT_ID"
});

// Application identifier used by the app files. Keep as-is or change to your preferred namespace.
window.__app_id = 'default-app-id';

// End of firebase_config.js
/**
 * Firebase Configuration for Local Development.
 *
 * NOTE: When running locally (e.g., in VS Code), you MUST replace these
 * placeholder values with the actual configuration details from your
 * Firebase project settings.
 *
 * This file is imported by the HTML files.
 */
export const firebaseConfig = {
        apiKey: "AIzaSyBJJYUOM8EBEuT39DX2F_HtxhEbHDRH-Zc",
        authDomain: "deanzahacks11-21-2025.firebaseapp.com",
        projectId: "deanzahacks11-21-2025",
        storageBucket: "deanzahacks11-21-2025.firebasestorage.app",
        messagingSenderId: "253702257130",
        appId: "1:253702257130:web:9ea8e3ee1bd291f1801a93",
        measurementId: "G-5B84R81S31"
    };

// When running locally, the custom authentication token is not available,
// so we set it to null and sign in anonymously.
export const initialAuthToken = null;