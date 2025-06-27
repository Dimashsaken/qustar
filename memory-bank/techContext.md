# Tech Context: Technologies & Development Setup

## Core Technologies

### React Native Stack
- **Expo SDK 53**: Development platform and build tooling
- **React Native**: Mobile app framework
- **TypeScript**: Primary language (strict mode enabled)
- **Expo Router**: File-based navigation system

### Backend & Data
- **Supabase**: Backend-as-a-Service for database and storage
- **PostgreSQL**: Database (via Supabase) - ✅ Connected with text info
- **Supabase Storage**: Public bucket for bird images

### State Management
- **React Query v5**: Data fetching, caching, and synchronization
- **React Hooks**: Local component state management
- **No Redux**: Simplified state architecture

### Performance Libraries
- **@shopify/flash-list**: High-performance list rendering
- **fuse.js**: Fuzzy search for offline functionality

### Internationalization
- **i18next**: Translation framework
- **expo-localization**: Device locale detection

### Development Tools
- **ESLint**: Code linting (extends @react-native preset)
- **Prettier**: Code formatting
- **TypeScript**: Static type checking

## Environment Setup

### Required Environment Variables
```bash
SUPABASE_URL=your_supabase_project_url
SUPABASE_ANON_KEY=your_supabase_anon_key
```

### Database Schema
Table: `birds` (or `qustar-info`) - ✅ **Connected with text info**
```sql
id              - Primary key
scientific_name - Latin name
name_en         - English name
name_kz         - Kazakh name  
name_ru         - Russian name
family          - Bird family
size            - Size category
primary_colors  - Array of colors (text[])
status          - Conservation status
description_en  - English description
description_ru  - Russian description
description_kz  - Kazakh description
photo_url       - Image reference
```

### Image Storage
- **Location**: Supabase public storage bucket
- **URL Pattern**: `https://<bucket>.supabase.co/storage/v1/object/public/birds/{id}.jpg`
- **Thumbnail Size**: 64×64 pixels for list views
- **Status**: Testing needed to verify image availability

## Development Constraints

### Code Quality Requirements
- **File Size Limit**: Maximum 120 lines per file
- **Documentation**: JSDoc comments for all exported functions
- **Type Safety**: TypeScript strict mode enabled
- **Component Pattern**: Functional components only

### Performance Requirements
- **List Performance**: Use FlashList for bird listings
- **Caching**: 1-hour cache for bird data
- **Search Debounce**: 300ms delay for search inputs
- **Offline Support**: Fuzzy search with cached data

### Project Structure
```
qustar/
├── app/
│   ├── (tabs)/
│   │   ├── index.tsx      # AllBirds screen - ✅ Ready for data display
│   │   └── explore.tsx    # Example content - ✅ Working
│   └── bird/
│       └── [id].tsx       # Bird detail page - Ready for testing
├── components/
│   ├── ui/                # Reusable UI components
│   └── BirdCard.tsx       # Bird-specific components - ✅ Ready
├── hooks/
│   └── useBirds.ts        # Data fetching hooks - ✅ Ready
├── lib/
│   └── supabase.ts        # Supabase client - ✅ Connected
├── types/
│   └── bird.ts            # Type definitions - ✅ Defined
└── memory-bank/           # Documentation (excluded from git)
```

## Technical Dependencies

### Core Dependencies
```json
{
  "expo": "~53.0.0",
  "react": "18.x",
  "react-native": "0.x",
  "@tanstack/react-query": "^5.x",
  "@supabase/supabase-js": "^2.x",
  "@shopify/flash-list": "^1.x",
  "fuse.js": "^7.x",
  "i18next": "^23.x",
  "expo-localization": "~16.x"
}
```

### Development Dependencies
```json
{
  "typescript": "^5.x",
  "eslint": "^8.x",
  "prettier": "^3.x",
  "@types/react": "^18.x",
  "@types/react-native": "^0.x"
}
```

## Current Database Status

### ✅ **Database Connection**
- **Status**: Connected with text info
- **Data Availability**: Bird data should now be accessible
- **Testing Phase**: Ready to verify data display and structure

### 🔄 **Testing Requirements**
- Verify data structure matches TypeScript interfaces
- Test bird data display in Home tab
- Validate image loading capabilities
- Confirm performance with actual dataset

## Known Limitations
- Bird images status needs verification in storage
- Data structure validation needed with TypeScript types
- Performance testing required with actual dataset size
- Limited to Kazakhstan bird species data 

## Development Status: Ready for Testing

The technical setup is complete with:
- ✅ **Infrastructure**: All dependencies and tools configured
- ✅ **Architecture**: Component and data layer implementation complete
- ✅ **Database**: Connected with text info
- ✅ **Navigation**: Tab structure working correctly
- 🔄 **Testing**: Ready to validate functionality with real data 