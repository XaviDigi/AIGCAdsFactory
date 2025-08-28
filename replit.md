# AI UGC Ads Factory

## Overview

AI UGC Ads Factory is a production-ready single-page web application that generates authentic user-generated content (UGC) style advertisements using AI. The application allows users to create multiple scenes with realistic amateur iPhone aesthetics, featuring diverse actors and natural dialogue. Users can input reference images, configure scene parameters, and generate both images and videos with UGC-style prompts that emphasize authenticity and relatability.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
- **Framework**: React 18 with TypeScript, using Vite for development and build tooling
- **UI Components**: Shadcn/ui component library built on Radix UI primitives with Tailwind CSS for styling
- **Routing**: Wouter for lightweight client-side routing
- **State Management**: Custom global store using React hooks and listeners pattern for UGC generation state
- **Data Fetching**: TanStack Query (React Query) for server state management and caching

### Backend Architecture
- **Runtime**: Node.js with Express.js framework
- **Language**: TypeScript with ESM modules
- **API Structure**: RESTful API with `/api` prefix routing
- **Development Server**: Custom Vite integration with HMR support for seamless development experience
- **Build System**: ESBuild for production bundling with platform-specific optimizations

### Data Storage Solutions
- **Database**: PostgreSQL with Drizzle ORM for type-safe database operations
- **Schema**: User management with username/password authentication
- **Database Provider**: Neon Database (configured via `@neondatabase/serverless`)
- **Session Storage**: In-memory storage with interface for potential database migration
- **Client Storage**: localStorage for optional API key persistence

### Authentication and Authorization
- **API Key Gate**: Session-based API key management for Kie AI service
- **Storage Options**: 
  - Session memory (default)
  - localStorage with user consent
  - Mock mode for development/testing
- **No Traditional Auth**: Application uses API key-based access rather than user accounts

### External Dependencies

#### AI Generation Services
- **Kie AI API**: Primary service for image and video generation
  - Image generation with reference image support
  - Video generation with VEO3/VEO3_fast models
  - Aspect ratio support (2:3, 3:2 for images; 9:16, 16:9 for videos)
  - Mock mode available for development

#### UI and Styling
- **Tailwind CSS**: Utility-first CSS framework with custom design tokens
- **Radix UI**: Unstyled, accessible UI components
- **Lucide React**: Icon library for consistent iconography
- **Embla Carousel**: Carousel component for media display

#### Development Tools
- **TypeScript**: Type safety across frontend and backend
- **Drizzle Kit**: Database schema management and migrations
- **PostCSS**: CSS processing with Autoprefixer
- **Replit Integration**: Development environment optimization with cartographer and error overlay plugins

#### Utilities
- **Google Drive Integration**: Automatic conversion of share links to direct download URLs
- **Date-fns**: Date manipulation and formatting
- **clsx/twMerge**: Conditional className utilities
- **Zod**: Runtime type validation with Drizzle integration

The application follows a monorepo structure with shared types and schemas, enabling type safety across the full stack while maintaining clear separation between client and server concerns.