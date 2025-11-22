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
    apiKey: "YOUR_API_KEY", // <<< REPLACE WITH YOUR API KEY
    authDomain: "your-project-id.firebaseapp.com",
    projectId: "your-project-id",
    storageBucket: "your-project-id.appspot.com",
    messagingSenderId: "YOUR_SENDER_ID",
    appId: "YOUR_APP_ID"
};

// When running locally, the custom authentication token is not available,
// so we set it to null and sign in anonymously.
export const initialAuthToken = null;