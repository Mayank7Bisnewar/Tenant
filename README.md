# Rent Manager Pro

A powerful and professional rent management application designed to handle tenants, billing, and WhatsApp messaging with ease.

## Technologies Used

This project is built using:
- **Language**: TypeScript
- **Framework**: React
- **Build Tool**: Vite
- **Styling**: Tailwind CSS & shadcn/ui
- **Mobile Integration**: Capacitor

---

## Getting Started

### 1. Run the Application (Local Dev)
To start the development server and view the app in your browser:
```bash
npm run dev
```
The application will usually be available at `http://localhost:8080`.

### 2. Save Changes & Build Web Assets
To prepare the application for production or native sync:
```bash
npm run build
```

### 3. Update & Build Android APK
Follow these steps to generate a new APK file after making changes:

**Step 1: Sync changes with Android project**
```bash
npx cap sync android
```

**Step 2: Build the APK**
Navigate to the android directory and run the Gradle build.
```bash
cd android
# Note: Requires Java 21
JAVA_HOME=/opt/homebrew/opt/openjdk@21/libexec/openjdk.jdk/Contents/Home ./gradlew assembleDebug
```

The generated APK will be located at:
`android/app/build/outputs/apk/debug/app-debug.apk`

