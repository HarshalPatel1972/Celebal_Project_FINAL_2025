# Replit.md - SpotlightNow Movie Booking Platform

## Overview

SpotlightNow is a cinema booking platform that provides users with an immersive movie discovery and ticket booking experience. The application features a modern, cinema-themed UI with real-time seat selection, secure payment processing, and comprehensive booking management.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
- **Framework**: React 18 with TypeScript
- **Build Tool**: Vite for fast development and optimized builds
- **UI Library**: Radix UI components with shadcn/ui styling system
- **Styling**: Tailwind CSS with custom cinema-themed color variables
- **State Management**: React Query (TanStack Query) for server state management
- **Routing**: Wouter for lightweight client-side routing
- **Form Handling**: React Hook Form with Zod validation

### Backend Architecture
- **Runtime**: Node.js with Express.js framework
- **Language**: TypeScript with ES modules
- **Database**: PostgreSQL with Neon serverless database
- **ORM**: Drizzle ORM for type-safe database operations
- **Authentication**: Replit Auth with OpenID Connect
- **Session Management**: Express sessions with PostgreSQL store

### Key Components

#### Authentication System
- **Provider**: Replit Auth with OpenID Connect
- **Session Storage**: PostgreSQL-backed session store using connect-pg-simple
- **User Management**: Automatic user creation/update on login
- **Protection**: Route-level authentication middleware

#### Movie Discovery
- **Data Source**: TMDb (The Movie Database) API integration
- **Categories**: Now showing and coming soon movies
- **Features**: Movie details, trailers, cast information, ratings
- **Search**: Real-time movie search capabilities

#### Booking System
- **Seat Selection**: Interactive 2D seat maps with real-time availability
- **Seat Blocking**: Temporary seat holds during checkout process
- **Theater Management**: Multi-theater, multi-screen support
- **Showtime Management**: Flexible scheduling system

#### Payment Processing
- **Gateway**: Razorpay integration for secure payments
- **Features**: Multiple payment methods, order creation, verification
- **Security**: Server-side payment verification and webhook handling

#### User Experience
- **Responsive Design**: Mobile-first approach with touch-friendly interfaces
- **Progressive Enhancement**: Works on all devices and screen sizes
- **Theme**: Cinema-inspired dark theme with orange/yellow accents
- **Animations**: Smooth transitions and hover effects

### Data Flow

1. **User Authentication**: Users sign in through Replit Auth, creating/updating user records
2. **Movie Discovery**: Frontend fetches movie data from backend, which syncs with TMDb API
3. **Booking Process**: 
   - User selects movie and showtime
   - Interactive seat selection with real-time availability
   - Temporary seat holds during checkout
   - Payment processing through Razorpay
   - Booking confirmation with QR codes
4. **User Management**: Dashboard for viewing booking history and managing account

### External Dependencies

#### APIs and Services
- **TMDb API**: Movie data, posters, trailers, cast information
- **Razorpay**: Payment processing and order management
- **Neon Database**: Serverless PostgreSQL hosting
- **Replit Auth**: Authentication and user management

#### Frontend Libraries
- **React Query**: Server state management and caching
- **Radix UI**: Accessible component primitives
- **Tailwind CSS**: Utility-first styling framework
- **Wouter**: Lightweight routing library
- **React Hook Form**: Form validation and management
- **QR Code React**: QR code generation for tickets

#### Backend Libraries
- **Express.js**: Web framework
- **Drizzle ORM**: Type-safe database operations
- **Passport.js**: Authentication middleware
- **Zod**: Runtime type validation
- **Nanoid**: Unique ID generation

### Deployment Strategy

#### Development
- **Local Development**: Vite dev server with hot module replacement
- **Database**: Neon development database
- **Environment**: Development-specific configurations and debugging tools

#### Production
- **Build Process**: Vite builds frontend assets, esbuild bundles backend
- **Deployment**: Single-server deployment with static file serving
- **Database**: Neon production database with connection pooling
- **Session Storage**: PostgreSQL-backed sessions for scalability

#### Configuration
- **Environment Variables**: Secure configuration for API keys and database URLs
- **TypeScript**: Full type safety across frontend and backend
- **Shared Types**: Common type definitions in shared directory
- **Path Aliases**: Simplified imports using TypeScript path mapping

#### Security Considerations
- **Authentication**: Secure OpenID Connect implementation
- **Payment Security**: Server-side payment verification
- **Data Validation**: Zod schemas for request/response validation
- **Session Security**: Secure session configuration with proper cookies
- **CORS**: Proper cross-origin resource sharing configuration

The architecture prioritizes type safety, developer experience, and user experience while maintaining scalability and security. The system is designed to handle real-time seat booking scenarios with proper concurrency controls and user feedback mechanisms.