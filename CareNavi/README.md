# CareNavi

A React Native health companion app with AI-powered features and gamification elements.

## Features

- **Health Tracking**: Track daily health metrics including sleep, steps, and medication
- **AI Health Coach**: Personalized health advice powered by Gemini AI
- **Daily Missions**: Gamified health tasks with progress tracking
- **Weekly Reports**: Comprehensive health summaries with insights
- **Character Companion**: Interactive mascot that grows with your health journey

## Tech Stack

- React Native 0.83+
- TypeScript 5.x
- React Navigation 6
- Zustand (State Management)
- Supabase (Backend & Auth)
- Google Gemini AI
- Apple HealthKit / Health Connect

## Getting Started

### Prerequisites

- Node.js 18+
- Xcode 15+ (for iOS)
- Android Studio (for Android)
- CocoaPods

### Installation

1. Clone the repository
```bash
git clone https://github.com/care-navi-team/care_navi_front06.git
cd care_navi_front06
```

2. Install dependencies
```bash
npm install
```

3. Configure environment variables
```bash
cp src/config/env.example.ts src/config/env.ts
# Edit src/config/env.ts with your API keys
```

4. Install iOS dependencies
```bash
cd ios && pod install && cd ..
```

### Running the App

**iOS:**
```bash
npx react-native run-ios
```

**Android:**
```bash
npx react-native run-android
```

## Project Structure

```
src/
├── components/     # Reusable UI components
├── screens/        # Screen components
├── navigation/     # Navigation configuration
├── stores/         # Zustand state stores
├── services/       # API and business logic
├── types/          # TypeScript type definitions
├── theme/          # Design tokens and styling
└── utils/          # Helper functions
```

## Environment Variables

Create `src/config/env.ts` with the following:

```typescript
export const ENV = {
  SUPABASE_URL: 'your-supabase-url',
  SUPABASE_ANON_KEY: 'your-anon-key',
  GEMINI_API_KEY: 'your-gemini-api-key',
};
```

## License

Private - All rights reserved
