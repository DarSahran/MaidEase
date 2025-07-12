# MaidEasyApp

MaidEasyApp is a cross-platform mobile application for booking and managing maid services, built with Expo, React Native, and TypeScript.

## Features
- User authentication (login, signup, OTP verification)
- Service booking (bathroom, kitchen, dusting, mopping, etc.)
- Real-time booking status and history
- Maid authentication and dashboard
- Payment integration (card, UPI)
- Settings and profile management
- Loyalty and rewards system

## Project Structure
- `app/` — Main application source code (screens, navigation)
- `components/` — Reusable UI components
- `constants/` — App-wide constants (colors, config)
- `hooks/` — Custom React hooks
- `utils/` — Utility functions
- `assets/` — Images, fonts, and other static assets
- `android/` — Android native project files
- `dist/` — Build output (do not edit manually)

## Getting Started
1. **Install dependencies:**
   ```sh
   npm install
   ```
2. **Start the development server:**
   ```sh
   npx expo start
   ```
3. **Run on device:**
   - Use Expo Go for standard features
   - Use a development build for custom native code

## Build & Deployment
- For production builds, use EAS Build:
  ```sh
  npx eas build --platform android
  npx eas build --platform ios
  ```
- The `dist/` folder contains build outputs for deployment.

## Contributing
Pull requests are welcome! For major changes, please open an issue first to discuss what you would like to change.

## License
<<<<<<< HEAD
[MIT](LICENSE)
=======
[MIT](LICENSE)
>>>>>>> a2bc7245063a771948e185d825e382e7c51dcfdd
