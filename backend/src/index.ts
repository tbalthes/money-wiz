// backend/src/index.ts
import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import admin from 'firebase-admin'; // For Firestore

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Initialize Firebase Admin SDK (replace with your actual config)
// You'll need to get a service account key JSON file from Firebase project settings
// For Codespaces, you might store this as a base64 encoded environment variable
// or ensure it's loaded securely. For now, a placeholder:
const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT_KEY_BASE64 || '{}');

if (Object.keys(serviceAccount).length > 0) {
    admin.initializeApp({
        credential: admin.credential.cert(serviceAccount)
    });
    console.log('Firebase Admin SDK initialized.');
} else {
    console.warn('Firebase Admin SDK not initialized. FIREBASE_SERVICE_ACCOUNT_KEY_BASE64 env var is missing or empty.');
}

const db = admin.firestore();

// Middleware
app.use(cors());
app.use(express.json());

// Basic Route
app.get('/', (req, res) => {
  res.send('Backend API is running!');
});

// Example: Fetching data from Firestore
app.get('/api/transactions', async (req, res) => {
    try {
        const transactionsRef = db.collection('transactions');
        const snapshot = await transactionsRef.get();
        const transactions = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        res.json(transactions);
    } catch (error) {
        console.error('Error fetching transactions:', error);
        res.status(500).send('Error fetching transactions');
    }
});

// AI Integration Placeholder (using Gemini API via backend)
app.post('/api/ai/chat', async (req, res) => {
    const { prompt } = req.body;
    if (!prompt) {
        return res.status(400).send('Prompt is required.');
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
    } catch (error) {
        console.error('Error calling AI:', error);
        res.status(500).send('Error processing AI request.');
    }
});


// Start the server
app.listen(PORT, () => {
  console.log(`Backend server running on http://localhost:${PORT}`);
});