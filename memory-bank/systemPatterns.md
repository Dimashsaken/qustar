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

## Type Safety
- **TypeScript Strict Mode**: Full type checking enabled
- **Generated Types**: Supabase type generation for database schema
- **Prop Interfaces**: All component props properly typed

## Code Organization
```
/components
  /ui          - Reusable UI components
  BirdCard.tsx - Specific bird components
/hooks
  useBirds.ts  - Data fetching hooks
/lib
  supabase.ts  - Client configuration
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