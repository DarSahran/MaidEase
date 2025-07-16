# Razorpay Backend for MaidEasyApp

This backend provides secure endpoints for Razorpay order creation and payment verification, to be used by your React Native app.

## Endpoints

- `POST /api/create-order` — Create a Razorpay order
- `POST /api/verify-payment` — Verify payment signature
- `POST /api/razorpay-webhook` — (Optional) Handle Razorpay webhooks

## Setup

1. Copy `.env.example` to `.env` and fill in your Razorpay credentials.
2. Install dependencies:
   ```sh
   npm install
   ```
3. Start the server:
   ```sh
   npm start
   ```

## Deployment
- You can deploy this folder to Vercel, Render, Railway, or any Node.js host.
- Make sure to set your environment variables securely in production.

## Security
- Never expose your Razorpay secret key in the frontend.
- Always verify payment signatures on the backend.

---

**Contact:** For help, see Razorpay docs or ask your developer.
