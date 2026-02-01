# QuStar - Kazakhstan Bird Identifier

<div align="center">

**A modern, multilingual bird identification app built for Kazakhstan's ornithological community**

[![Expo](https://img.shields.io/badge/Expo-53.0.19-000020?style=flat&logo=expo)](https://expo.dev)
[![React Native](https://img.shields.io/badge/React%20Native-0.79.5-61DAFB?style=flat&logo=react)](https://reactnative.dev)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.8.3-3178C6?style=flat&logo=typescript)](https://www.typescriptlang.org)
[![Supabase](https://img.shields.io/badge/Supabase-Backend-3ECF8E?style=flat&logo=supabase)](https://supabase.com)

</div>

---

## 📖 Overview

QuStar is the first comprehensive digital bird identifier specifically designed for Kazakhstan, bridging the gap in Central Asian ornithology tools. Built with modern React Native technologies, it provides birders, researchers, and nature enthusiasts with instant access to Kazakhstan's 500+ bird species, complete with AI-powered audio identification using BirdNET.

### Why QuStar?

Kazakhstan has rich avian biodiversity, but existing apps like Merlin primarily focus on North American and European species. QuStar fills this critical gap by:

- **Serving the underserved**: Focused specifically on Central Asian ornithology
- **Breaking language barriers**: Native support for Kazakh, Russian, and English
- **Enabling field research**: Offline-capable design for remote locations
- **Democratizing science**: Accessible tool for citizen scientists and educators

---

## ✨ Key Features

### 🦅 **Core Identification**
- **Complete Species Database**: 500+ Kazakhstan birds with scientific classification
- **AI Audio Recognition**: Real-time bird song identification using BirdNET neural network
- **Visual Search**: High-quality images with intelligent caching for instant loading
- **Smart Filtering**: Filter by family, size, color, and conservation status

### 🎤 **Audio Recording & Analysis**
- **Mobile-Optimized Recording**: Native iOS (M4A) and Android (3GP/AMR) format support
- **On-Device Processing**: Real-time audio capture with quality monitoring
- **BirdNET Integration**: Deep learning model for accurate species identification
- **Confidence Scoring**: Probability ratings for each detection result
- **Geographic Optimization**: Enhanced accuracy for Kazakhstan's bioregion

### 🌍 **Multilingual Support**
- **Tri-lingual Interface**: Seamless switching between English, Kazakh, and Russian
- **Localized Content**: Bird names, descriptions, and UI elements in all three languages
- **Official Translations**: Russian bird names from Cornell Lab's authoritative database
- **Automatic Fallback**: Intelligent language handling when translations unavailable

### 📱 **User Experience**
- **Offline-First Design**: Browse and search cached data without connectivity
- **Infinite Scroll**: Smooth, performant browsing with FlashList optimization
- **Real-Time Search**: Instant text search across all bird names and families
- **Dark Mode Support**: Automatic theme switching based on system preferences
- **Responsive Layout**: Optimized for various screen sizes and orientations

### 🗺️ **Interactive Maps**
- **Species Distribution**: Visualize bird ranges and observation hotspots
- **Migration Patterns**: Track seasonal movements across Kazakhstan
- **Legend Integration**: Context-aware map information with smooth animations

### 🏆 **Gamification & Engagement**
- **Achievement System**: Track milestones and birding accomplishments
- **Personal Notes**: Document observations and field notes for each species
- **Favorites Collection**: Build custom lists of interesting species
- **Detection History**: Review past audio identifications and results

### 📸 **Rich Media**
- **High-Resolution Images**: Professional photography from trusted sources
- **Audio Samples**: Reference calls and songs via Xeno-Canto integration
- **Smart Caching**: Intelligent image preloading and memory management
- **Optimized Display**: Images fit properly without cropping critical features

---

## 🏗️ Architecture

### Technology Stack

#### **Frontend (Mobile App)**
```
React Native 0.79.5
├── Expo SDK 53          # Development platform & build tooling
├── Expo Router 5        # File-based navigation system
├── TypeScript 5.8       # Type-safe development
├── React Query 5        # Server state & caching management
└── React Native Reanimated # High-performance animations
```

#### **Backend Services**
```
Supabase (PostgreSQL)
├── Database             # Bird species, user data, detections
├── Storage              # Image hosting (public bucket)
├── Authentication       # User auth with email verification
└── Realtime             # Future: Live observation sharing
```

#### **AI Services**
```
BirdNET API Server (Python)
├── TensorFlow Lite      # Neural network inference
├── BirdNET v2.4 Model   # Global species classifier
├── FFmpeg               # Audio format conversion
└── Flask Server         # REST API for mobile clients
```

### System Architecture

```
┌─────────────────────────────────────────────────────────┐
│                    Mobile App (React Native)             │
│  ┌────────────┐  ┌────────────┐  ┌────────────┐        │
│  │   Expo     │  │   React    │  │  Expo      │        │
│  │   Router   │◄─┤   Query    │◄─┤  Audio     │        │
│  └────────────┘  └─────┬──────┘  └─────┬──────┘        │
└────────────────────────┼────────────────┼───────────────┘
                         │                │
                    ┌────▼────────┐  ┌────▼────────┐
                    │  Supabase   │  │  BirdNET    │
                    │  (Backend)  │  │  API Server │
                    │             │  │  (Python)   │
                    │ ┌─────────┐ │  │ ┌─────────┐ │
                    │ │  PostgreSQL│  │ │TensorFlow│ │
                    │ │  Database  │  │ │  Model   │ │
                    │ └─────────┘ │  │ └─────────┘ │
                    │ ┌─────────┐ │  │ ┌─────────┐ │
                    │ │ Storage │ │  │ │  FFmpeg │ │
                    │ │ (Images)│ │  │ │ Convert │ │
                    │ └─────────┘ │  │ └─────────┘ │
                    └─────────────┘  └─────────────┘
```

### Data Flow

#### **Bird Browsing Flow**
1. App launches → React Query fetches cached data
2. User scrolls → FlashList renders visible items only
3. Background → Preload adjacent images into cache
4. User searches → Client-side fuzzy search (offline-capable)
5. Cache expires (1 hour) → Silent background refresh

#### **Audio Identification Flow**
1. User records → Expo Audio captures M4A/3GP file
2. Upload → File sent to BirdNET API server
3. Processing → FFmpeg converts to WAV → BirdNET analyzes
4. Results → Species list with confidence scores returned
5. Storage → Detection saved to Supabase with metadata

---

## 🚀 Getting Started

### Prerequisites

- **Node.js** 18.x or higher
- **npm** or **yarn** package manager
- **Expo CLI** (installed globally): `npm install -g expo-cli`
- **Expo Go** app on your mobile device (iOS/Android)
- **Supabase** account with project created
- **Python 3.9+** (for BirdNET API server)

### Installation

#### 1. Clone Repository
```bash
git clone https://github.com/yourusername/qustar.git
cd qustar
```

#### 2. Install Dependencies
```bash
npm install
```

#### 3. Configure Environment Variables

Create a `.env` file in the root directory:

```env
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=your-anon-key-here
```

Get these values from your Supabase project dashboard at `Settings > API`.

#### 4. Database Setup

Your Supabase database should have a `birds` table with this schema:

```sql
CREATE TABLE birds (
  id SERIAL PRIMARY KEY,
  scientific_name TEXT NOT NULL,
  name_en TEXT,
  name_kz TEXT,
  name_ru TEXT,
  family TEXT,
  size TEXT,
  primary_colors TEXT[],
  status TEXT,
  description_en TEXT,
  description_ru TEXT,
  description_kz TEXT,
  photo_url TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);
```

#### 5. Run the App

```bash
# Start Expo development server
npm start

# Or target specific platforms
npm run ios      # iOS simulator
npm run android  # Android emulator
npm run web      # Web browser
```

Scan the QR code with Expo Go (Android) or Camera app (iOS) to run on your device.

---

## 🧪 BirdNET API Server Setup

The BirdNET API server provides AI-powered audio analysis for bird identification.

### Installation

#### 1. Navigate to API Directory
```bash
cd birdnet-api
```

#### 2. Install Python Dependencies
```bash
pip install -r requirements.txt
```

Required packages:
- `tensorflow-lite-runtime` - Neural network inference
- `flask` - REST API server
- `librosa` - Audio processing
- `pydub` - Audio format handling
- `requests` - HTTP client
- `numpy` - Numerical operations

#### 3. Verify Model File

Ensure the BirdNET model exists at:
```
birdnet-api/models/BirdNET_GLOBAL_6K_V2.4_Model_FP32.tflite
```

#### 4. Run the Server

```bash
python server.py
```

Server starts on `http://localhost:8080`

### Docker Deployment

For production deployment:

```bash
cd birdnet-api
docker build -t qustar-birdnet .
docker run -p 8080:8080 qustar-birdnet
```

### API Usage

**Endpoint**: `POST /analyze`

**Request Body**:
```json
{
  "url": "https://example.com/bird-recording.m4a",
  "min_conf": 0.1,
  "language": "ru"
}
```

**Response**:
```json
{
  "status": "success",
  "language": "ru",
  "results": [
    {
      "species": "Common Raven_Corvus corax",
      "common_name": "Ворон",
      "scientific_name": "Corvus corax",
      "confidence": 0.87,
      "start_time": 0.0,
      "end_time": 3.0
    }
  ]
}
```

---

## 📁 Project Structure

```
qustar/
├── app/                          # Expo Router screens
│   ├── (tabs)/                   # Bottom tab navigation
│   │   ├── index.tsx            # Home (bird list)
│   │   ├── explore.tsx          # Search & filters
│   │   ├── record.tsx           # Audio recording
│   │   └── profile.tsx          # User profile
│   ├── bird/[id].tsx            # Bird detail page
│   ├── auth.tsx                 # Authentication
│   └── settings.tsx             # App settings
│
├── components/                   # Reusable components
│   ├── BirdCard.tsx             # Bird list item
│   ├── BirdImage.tsx            # Optimized image display
│   ├── AudioDetectionGroup.tsx  # Detection results
│   ├── AchievementBadge.tsx     # Gamification UI
│   ├── ExpandableSearchBar.tsx  # Animated search
│   └── ui/                      # UI primitives
│
├── hooks/                        # Custom React hooks
│   ├── useBirds.ts              # Bird data fetching
│   ├── useFilteredBirds.ts      # Search & filter logic
│   ├── useBirdnetRecorder.ts    # Audio recording
│   ├── useAchievements.ts       # Gamification system
│   ├── useImageCache.ts         # Image optimization
│   └── useAuth.ts               # Authentication state
│
├── lib/                          # Core utilities
│   ├── supabaseClient.ts        # Supabase configuration
│   ├── xenoCantoApi.ts          # Bird sound API
│   ├── imageUtils.ts            # Image URL handling
│   └── speciesMapping.ts        # Data transformations
│
├── types/                        # TypeScript definitions
│   ├── bird.ts                  # Bird data models
│   ├── audio.ts                 # Audio types
│   ├── achievement.ts           # Gamification types
│   └── filters.ts               # Filter interfaces
│
├── birdnet-api/                  # Python AI server
│   ├── server.py                # Flask application
│   ├── requirements.txt         # Python dependencies
│   ├── dockerfile               # Container configuration
│   └── models/                  # TensorFlow Lite models
│
├── constants/                    # App constants
│   ├── Colors.ts                # Theme definitions
│   └── FilterOptions.ts         # Filter configurations
│
├── assets/                       # Static assets
│   ├── images/                  # App icons & graphics
│   └── fonts/                   # Custom typography
│
└── memory-bank/                  # Documentation (not in git)
    ├── projectbrief.md          # Project overview
    ├── techContext.md           # Technical details
    └── progress.md              # Development log
```

---

## 🔧 Development Workflow

### Code Quality Standards

- **TypeScript Strict Mode**: All files must pass strict type checking
- **File Size Limit**: Maximum 120 lines per file (excluding types/constants)
- **JSDoc Comments**: All exported functions must have documentation
- **ESLint**: Code must pass linting with `@react-native` preset
- **Functional Components**: Only functional components with hooks

### Performance Optimizations

#### **List Rendering**
```typescript
// Using FlashList for 60 FPS scrolling
import { FlashList } from "@shopify/flash-list";

<FlashList
  data={birds}
  renderItem={({ item }) => <BirdCard bird={item} />}
  estimatedItemSize={240}
  drawDistance={500}
/>
```

#### **Image Caching**
```typescript
// Intelligent preloading and memory management
const { getCachedImageUri, preloadImages } = useImageCache();

// Preload next page of images while user scrolls
useEffect(() => {
  preloadImages(nextPageBirds.map(b => b.photo_url));
}, [currentPage]);
```

#### **Query Caching**
```typescript
// React Query with 1-hour stale time
const { data: birds } = useQuery({
  queryKey: ["birds"],
  queryFn: fetchBirds,
  staleTime: 1000 * 60 * 60, // 1 hour
  gcTime: 1000 * 60 * 60 * 24, // 24 hours
});
```

### Running Tests

```bash
# Run TypeScript type checking
npm run type-check

# Run ESLint
npm run lint

# Test Supabase connection
node test-supabase-integration.js

# Test BirdNET API
node test-birdnet-api.js

# Test achievements system
npx tsx test-achievements.ts
```

---

## 🌐 Internationalization

QuStar uses `i18next` for translations across three languages:

```typescript
// Automatic language detection
import { useTranslation } from "react-i18next";

const { t, i18n } = useTranslation();

// Usage in components
<Text>{t("common.search")}</Text>
<Text>{t("birds.conservationStatus.endangered")}</Text>

// Language switching
i18n.changeLanguage("kz"); // Kazakh
i18n.changeLanguage("ru"); // Russian
i18n.changeLanguage("en"); // English
```

Translation files organized by namespace for code-splitting:
- `common.json` - Shared UI strings
- `birds.json` - Ornithological terms
- `achievements.json` - Gamification content

---

## 🚢 Deployment

### Mobile App Builds

QuStar uses **EAS Build** for production releases:

```bash
# Install EAS CLI
npm install -g eas-cli

# Configure project
eas build:configure

# Build for iOS
eas build --platform ios --profile production

# Build for Android
eas build --platform android --profile production

# Submit to app stores
eas submit --platform ios
eas submit --platform android
```

### BirdNET API Deployment

#### **Railway** (Recommended)
```bash
# Deploy with Railway CLI
railway up

# Or connect GitHub repo for auto-deployment
# Configuration in railway.toml
```

#### **Docker**
```bash
cd birdnet-api
docker build -t qustar-birdnet:latest .
docker push your-registry/qustar-birdnet:latest
```

#### **Environment Variables**
Set these in your deployment platform:
- `PORT` - Server port (default: 8080)
- `ALLOWED_ORIGINS` - CORS configuration
- `LOG_LEVEL` - Logging verbosity

---

## 📊 Database Schema

### Birds Table
```sql
CREATE TABLE birds (
  id SERIAL PRIMARY KEY,
  scientific_name TEXT NOT NULL UNIQUE,
  name_en TEXT,
  name_kz TEXT,
  name_ru TEXT,
  family TEXT,
  size TEXT CHECK (size IN ('small', 'medium', 'large')),
  primary_colors TEXT[],
  status TEXT,
  description_en TEXT,
  description_ru TEXT,
  description_kz TEXT,
  photo_url TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_birds_family ON birds(family);
CREATE INDEX idx_birds_status ON birds(status);
```

### Audio Detections Table
```sql
CREATE TABLE audio_detections (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id),
  audio_url TEXT NOT NULL,
  detected_species TEXT[],
  top_confidence FLOAT,
  location_lat FLOAT,
  location_lng FLOAT,
  recorded_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_detections_user ON audio_detections(user_id);
CREATE INDEX idx_detections_date ON audio_detections(recorded_at);
```

### User Achievements Table
```sql
CREATE TABLE user_achievements (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id),
  achievement_id TEXT NOT NULL,
  unlocked_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(user_id, achievement_id)
);
```

---

## 🤝 Contributing

Contributions are welcome! Please follow these guidelines:

1. **Fork the repository**
2. **Create a feature branch**: `git checkout -b feature/amazing-feature`
3. **Follow code standards**: Maintain file size limits and TypeScript strict mode
4. **Add tests**: Include tests for new functionality
5. **Commit with clear messages**: Use conventional commits format
6. **Push to your fork**: `git push origin feature/amazing-feature`
7. **Open a Pull Request**: Describe changes and link related issues

### Development Guidelines

- Keep files under 120 lines of code
- Add JSDoc comments for all exported functions
- Use functional components with TypeScript
- Test on both iOS and Android
- Ensure offline functionality works
- Maintain translation coverage for all languages

---

## 📝 License

This project is licensed under the **MIT License**. See [LICENSE](LICENSE) file for details.

---

## 🙏 Acknowledgments

- **Cornell Lab of Ornithology** - BirdNET model and Russian translations
- **Xeno-Canto** - Bird sound recordings community
- **Supabase** - Backend infrastructure
- **Expo Team** - React Native development platform
- **Kazakhstan Ornithological Community** - Domain expertise and feedback

---

## 📧 Contact & Support

- **Issues**: [GitHub Issues](https://github.com/yourusername/qustar/issues)
- **Email**: support@qustar.app
- **Documentation**: [Wiki](https://github.com/yourusername/qustar/wiki)

---

<div align="center">

**Built with ❤️ for Kazakhstan's birding community**

[Website](https://qustar.app) • [Documentation](https://docs.qustar.app) • [Community](https://community.qustar.app)

</div>
