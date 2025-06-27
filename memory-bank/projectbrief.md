# Project Brief: QuStar - Kazakhstan Bird Identifier

## Objective
Build the first cut of a Merlin-style bird-identifier for Kazakhstan using modern React Native technologies. This is a focused MVP with two core screens designed for bird enthusiasts and researchers in Kazakhstan.

## Core Requirements

### Screens
1. **AllBirds** – Infinite-scroll list of every species
2. **SearchScreen** – Text search + facet filters (family, colour, size, status)
3. **Bird Detail** – Individual bird information page (placeholder for future development)

### Technical Constraints
- **Platform**: React Native with Expo SDK 53
- **Language**: TypeScript (strict mode)
- **Backend**: Supabase (pre-configured)
- **Code Quality**: Files ≤ 120 LoC, JSDoc for all exported functions

### Deliverables
1. Expo-router structure with proper navigation
2. Supabase client integration
3. React Query hooks for data management
4. Performance-optimized bird listing with FlashList
5. Search functionality with offline/online fallback
6. Internationalization (i18n) support
7. ESLint + Prettier configuration
8. Documentation and setup instructions

## Assumptions
- Supabase project already exists and configured
- Environment variables `SUPABASE_URL` and `SUPABASE_ANON_KEY` available
- Bird images stored in public Supabase storage bucket
- Database schema predefined with specific bird data structure

## Success Criteria
- Fast, responsive bird browsing experience
- Effective search and filtering capabilities
- Multi-language support (English, Kazakh, Russian)
- Clean, maintainable codebase ready for future expansion 