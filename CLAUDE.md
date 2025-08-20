# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is an Ionic/Angular mobile application called "asuntos-relevantes-app" that uses Apollo GraphQL for data fetching. The app features authentication and a tab-based navigation system.

## Common Commands

### Development
- `npm start` - Start the development server (serves on Angular dev server)
- `npm run build` - Build the application for production
- `npm run watch` - Build in watch mode for development
- `npm test` - Run unit tests with Karma/Jasmine
- `npm run lint` - Run ESLint for code quality

### Ionic Specific
- Use Ionic CLI commands for mobile development tasks
- The app is configured with Capacitor for native functionality

## Architecture

### Core Stack
- **Framework**: Ionic 8 + Angular 20
- **GraphQL**: Apollo Client with apollo-angular
- **Authentication**: JWT token-based (stored in localStorage)
- **State Management**: Apollo Cache for GraphQL data
- **Mobile**: Capacitor 7 for native capabilities

### Key Architecture Patterns

#### Apollo GraphQL Configuration
- Apollo Client is configured in `app.module.ts:32-76` with:
  - Auth link that adds Bearer token from localStorage
  - Error handling link for GraphQL and network errors
  - Default fetch policies (cache-and-network for queries, network-only for mutations)
  - GraphQL endpoint: `http://localhost:5008/graphql`

#### Routing Structure
- Main routing configured with lazy-loaded modules
- Authentication guards: `LoggedGuard` and `NotLoggedGuard`
- Default route redirects to login page
- Authenticated users access `/home` which loads the tabs module
- Tab structure includes: asuntos-relevantes, profile, and tab3

#### Module Organization
- Feature modules are lazy-loaded for performance
- Each page/feature has its own module with routing
- Shared functionality in `shared.module.ts`
- GraphQL operations centralized in `src/app/operations/queries.ts`

### Key Directories
- `src/app/asuntos-relevantes/` - Main business logic feature
- `src/app/login/` - Authentication pages
- `src/app/profile/` - User profile functionality
- `src/app/operations/` - GraphQL queries and mutations
- `src/app/interfaces/` - TypeScript type definitions
- `src/services/` - Business logic services (outside app module)

### Authentication Flow
- Uses JWT tokens with GraphQL login mutation
- Token stored in localStorage and included in all GraphQL requests
- Route guards prevent access based on authentication state
- Login query structure defined in `src/app/operations/queries.ts:3-24`

## Development Notes

### GraphQL Proxy
- Ionic dev server proxies `/graphql` requests to `http://localhost:5008/graphql`
- Configured in `ionic.config.json:7`

### Build Configuration
- Output directory: `www/`
- Supports both development and production builds
- SCSS styling with global styles in `src/global.scss`

### Testing
- Karma + Jasmine test suite
- Test files follow `*.spec.ts` naming convention
- Test configuration in `karma.conf.js`