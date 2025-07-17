"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
// backend/src/index.ts
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const dotenv_1 = __importDefault(require("dotenv"));
const firebase_admin_1 = __importDefault(require("firebase-admin")); // For Firestore
dotenv_1.default.config();
const app = (0, express_1.default)();
const PORT = process.env.PORT || 5000;
// Initialize Firebase Admin SDK (replace with your actual config)
// You'll need to get a service account key JSON file from Firebase project settings
// For Codespaces, you might store this as a base64 encoded environment variable
// or ensure it's loaded securely. For now, a placeholder:
// --- START MODIFIED SECTION ---
const serviceAccountKeyBase64 = process.env.FIREBASE_SERVICE_ACCOUNT_KEY_BASE64;
let serviceAccount;
if (serviceAccountKeyBase64) {
    try {
        const decodedKey = Buffer.from(serviceAccountKeyBase64, "base64").toString("utf8");
        serviceAccount = JSON.parse(decodedKey);
    }
    catch (e) {
        console.error("Error parsing Firebase service account key from Base64:", e);
        serviceAccount = {}; // Fallback to empty object if parsing fails
    }
}
else {
    serviceAccount = {}; // If env var is missing
}
if (Object.keys(serviceAccount).length > 0) {
    firebase_admin_1.default.initializeApp({
        credential: firebase_admin_1.default.credential.cert(serviceAccount),
    });
    console.log("Firebase Admin SDK initialized.");
}
else {
    console.warn("Firebase Admin SDK not initialized. FIREBASE_SERVICE_ACCOUNT_KEY_BASE64 env var is missing, empty, or invalid.");
}
// --- END MODIFIED SECTION ---
const db = firebase_admin_1.default.firestore();
// Middleware
app.use((0, cors_1.default)());
app.use(express_1.default.json());
// Basic Route
app.get("/", (req, res) => {
    res.send("Backend API is running!");
});
// Example: Fetching data from Firestore
app.get("/api/transactions", async (req, res) => {
    try {
        const transactionsRef = db.collection("transactions");
        const snapshot = await transactionsRef.get();
        const transactions = snapshot.docs.map((doc) => ({
            id: doc.id,
            ...doc.data(),
        }));
        res.json(transactions);
    }
    catch (error) {
        console.error("Error fetching transactions:", error);
        res.status(500).send("Error fetching transactions");
    }
});
// AI Integration Placeholder (using Gemini API via backend)
app.post("/api/ai/chat", async (req, res) => {
    const { prompt } = req.body;
    if (!prompt) {
        return res.status(400).send("Prompt is required.");
    }
    try {
        // This is a placeholder for the actual Gemini API call
        // You would use the fetch API as instructed in the prompt
        // const apiKey = process.env.GEMINI_API_KEY || "";
        // const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`;
        // ... actual fetch call ...
        // Mock response for now
        const mockResponse = `AI response for: "${prompt}". This is where Gemini's insights would go!`;
        res.json({ text: mockResponse });
    }
    catch (error) {
        console.error("Error calling AI:", error);
        res.status(500).send("Error processing AI request.");
    }
});
// Start the server
app.listen(PORT, () => {
    console.log(`Backend server running on http://localhost:${PORT}`);
});
