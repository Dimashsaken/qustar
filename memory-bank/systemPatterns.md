# System Patterns: Architecture & Design Decisions

## Application Architecture

### Navigation Structure
- **Expo Router**: File-based routing for type-safe navigation
- **Tab Layout**: Bottom tabs for main sections (CONFIRMED WORKING)
  - `/app/(tabs)/index.tsx` → AllBirds screen (Home tab)
  - `/app/(tabs)/explore.tsx` → Example content (Explore tab)
  - `/app/bird/[id].tsx` → Bird detail page
- **Route Priority**: Removed conflicting `app/index.tsx` to allow tab navigation

### Data Layer
- **React Query v5**: Primary data fetching and caching strategy
- **No Redux**: Simplified state management using React Query + local state
- **Supabase Client**: Singleton pattern for database connections
- **Cache Strategy**: 1-hour cache for bird data

### Component Patterns

#### Functional Components Only
```typescript
// Standard pattern for all components
export const ComponentName = ({ prop }: Props) => {
  // Component logic
  return <View>...</View>;
};
```

#### File Size Constraint
- Maximum 120 lines of code per file
- Split complex components into smaller pieces
- Use custom hooks for complex logic

#### Documentation Requirement
```typescript
/**
 * Brief description of component/function purpose
 * @param prop - Description of parameter
 * @returns Description of return value
 */
export const functionName = (prop: Type) => {
  // Implementation
};
```

## Performance Patterns

### List Rendering
- **FlashList**: Primary list component for performance
- **Image Optimization**: 64×64 thumbnails for bird cards
- **Infinite Scroll**: Load birds progressively

### Search Implementation
- **Debounced Input**: 300ms delay for search queries
- **Hybrid Strategy**: 
  - Offline: fuse.js for fuzzy search
  - Online: Supabase `ilike` queries
- **Multi-facet Filters**: Combinable filter chips

### Image Display Patterns ✅

#### Image Fitting Strategy
```typescript
// BirdImage component pattern
<Image
  contentFit="contain"  // Show complete image without cropping
  style={{
    backgroundColor: '#ffffff',  // Clean white background
    borderRadius: 8,
    overflow: 'hidden',  // Contain within borders
  }}
/>
```

#### Visual Design Principles
- **Complete Visibility**: Priority on showing entire bird for identification
- **Clean Backgrounds**: White (#ffffff) for professional appearance
- **Proper Containment**: Images stay within rounded border boundaries
- **Aspect Ratio Preservation**: Maintain original proportions for accuracy

#### Image Performance Optimization
- **Caching Strategy**: Disk-based caching with expo-image
- **Memory Management**: Recycling keys and cleanup utilities
- **Preloading**: First 50 images preloaded for smooth experience
- **Multiple Fallbacks**: URL generation without excessive network requests

## Data Flow Patterns

### Bird Data
```
Supabase DB → useBirds hook → React Query cache → Components
```

### Search Flow
```
User Input → Debounce → Search Strategy Decision → Results Update
```

### Navigation Flow
```
Home Tab → Bird List → Navigate to /bird/[id] → Detail Screen
Explore Tab → Example Content
```

### Image Loading Flow
```
BirdImage Component → Image URL Generation → Cache Check → Load/Display → Fallback if Needed
```

## Routing Architecture

### Confirmed Working Structure
```
app/
├── _layout.tsx          # Root layout with React Query provider
├── (tabs)/
│   ├── _layout.tsx      # Tab navigator configuration
│   ├── index.tsx        # Home tab - AllBirds screen
│   └── explore.tsx      # Explore tab - Example content
├── bird/
│   └── [id].tsx         # Dynamic bird detail routes
└── +not-found.tsx       # 404 error page
```

### Navigation Resolution
- **Issue Fixed**: Removed conflicting `app/index.tsx` that overrode tab layout
- **Current State**: Tab navigation working correctly with two bottom tabs
- **Priority**: Tab layout takes precedence, allowing proper navigation

## Error Handling
- React Query built-in error boundaries
- Graceful offline degradation
- Loading states for all async operations
- Empty states for when database has no data
- Image fallback system with placeholder display

## Type Safety
- **TypeScript Strict Mode**: Full type checking enabled
- **Generated Types**: Supabase type generation for database schema
- **Prop Interfaces**: All component props properly typed

## Code Organization
```
/components
  /ui          - Reusable UI components
  BirdCard.tsx - Specific bird components
  BirdImage.tsx - Optimized image component with proper fitting
/hooks
  useBirds.ts  - Data fetching hooks
  useImageCache.ts - Image caching management
/lib
  supabase.ts  - Client configuration
  imageUtils.ts - Image URL generation and utilities
/types
  bird.ts      - Type definitions
/memory-bank   - Documentation (excluded from git)
``` 

## Navigation Best Practices Applied

### Tab Structure
- Clear separation between Home (bird data) and Explore (documentation)
- Bottom tab navigation for easy mobile access
- Proper tab icons and labels

### Route Hierarchy
- Root layout provides app-wide providers (React Query, themes)
- Tab layout handles bottom navigation
- Dynamic routes for individual bird pages
- Error boundaries for graceful failure handling

## Image Display Best Practices Applied ✅

### User-Centric Design
- Prioritize complete bird visibility for identification purposes
- Clean, professional appearance suitable for field guide use
- Consistent visual presentation across different image aspect ratios

### Technical Implementation
- `contentFit="contain"` ensures no cropping while maintaining aspect ratios
- White backgrounds provide clean, modern appearance
- `overflow: 'hidden'` maintains design boundaries
- Performance optimizations preserved through caching system

### Performance Considerations
- Disk-based caching reduces network requests
- Preloading strategy for smooth scrolling experience
- Memory management prevents app slowdown
- Multiple URL fallbacks without performance impact 