
# Rappin' Lounge Radio - Project Documentation

## Overview

Rappin' Lounge Radio is a modern web application for an online radio station, featuring music streaming, news articles, show schedules, personality profiles, and artist showcases. The application includes both a public-facing frontend and a staff-only administration panel.

## Table of Contents

- [Technology Stack](#technology-stack)
- [Project Structure](#project-structure)
- [Key Features](#key-features)
- [Authentication System](#authentication-system)
- [Database Schema](#database-schema)
- [Audio Streaming](#audio-streaming)
- [Component Architecture](#component-architecture)
- [State Management](#state-management)
- [Responsive Design](#responsive-design)
- [Theme Support](#theme-support)
- [Deployment](#deployment)

## Technology Stack

The application is built with the following technologies:

### Frontend
- **React** (v18) with **TypeScript** - Core framework
- **Vite** - Build tool and development server
- **React Router** (v6) - Navigation and routing
- **Tailwind CSS** - Utility-first CSS framework
- **Shadcn/UI** - Component library based on Radix UI
- **Lucide React** - Icon library
- **date-fns** - Date manipulation library
- **Recharts** - Charting library

### Backend & Data Management
- **Supabase** - Backend-as-a-Service providing:
  - PostgreSQL database
  - Authentication
  - Storage
  - Edge Functions
- **TanStack Query** (React Query) - Data fetching and caching

### Development Tools
- **TypeScript** - Static type checking
- **ESLint** - Code linting
- **Vitest** - Testing framework

## Project Structure

The application follows a feature-based structure with the following main directories:

```
src/
├── components/         # Reusable UI components
│   ├── ui/             # Base UI components from shadcn
│   ├── news/           # News-related components
│   ├── player/         # Audio player components
│   ├── navbar/         # Navigation components
│   ├── staff/          # Staff admin components
│   └── providers/      # Context providers
├── pages/              # Page components
├── hooks/              # Custom React hooks
├── services/           # Service modules
├── integrations/       # External integrations
│   └── supabase/       # Supabase integration
├── constants/          # Application constants
├── types/              # TypeScript type definitions
├── lib/                # Utility libraries
└── main.tsx            # Application entry point
```

## Key Features

### Public Features

1. **Homepage**
   - Dynamic hero section with video backgrounds
   - Featured artists showcase
   - News section
   - Personalities slider
   - Video gallery

2. **Live Radio Streaming**
   - Real-time audio streaming
   - Current track metadata display
   - Volume control
   - Mobile notifications

3. **News System**
   - Article listings with filter by category
   - Full article view
   - Related posts

4. **Radio Personalities**
   - Profile pages
   - Show schedules
   - Social media links

5. **Featured Artists**
   - Artist profiles
   - Archive section
   - Artist detail pages

6. **Schedule**
   - Weekly show schedule
   - Host information

### Administrative Features

1. **Staff Panel**
   - Dashboard with statistics
   - Content management

2. **News Management**
   - Article creation and editing
   - Rich text editor
   - Category and tag management
   - Image uploads

3. **Home Page Configuration**
   - Section visibility controls
   - Featured video management

4. **Sponsor Management**
   - Add/edit sponsors and affiliates
   - Logo uploads

5. **System Settings**
   - Site information
   - Contact details
   - Social media links

6. **Activity Logging**
   - Staff action tracking
   - Audit trail

## Authentication System

The application uses Supabase Authentication with the following features:

- Email/password authentication
- Role-based access control
- Session management
- Protected routes

Staff roles include:
- Admin
- Staff
- Super Admin

## Database Schema

The application uses several key tables in the Supabase PostgreSQL database:

1. **posts** - News articles and content
2. **personalities** - Radio hosts and DJs
3. **shows** - Radio show schedules
4. **featured_artists** - Artist profiles
5. **featured_videos** - Video content
6. **staff** - Staff user information
7. **staff_activity_logs** - Audit logs for staff actions
8. **system_settings** - Application configuration
9. **home_settings** - Homepage configuration
10. **sponsors_affiliates** - Sponsor information

## Audio Streaming

The audio streaming system uses the following components:

- **AudioService** - Core singleton service that manages audio playback
- Custom hooks:
  - **useAudioPlayer** - Controls playback state
  - **useStreamMetadata** - Fetches current track information
  - **useVolumeControl** - Handles volume adjustments

The player supports:
- Primary and backup stream URLs
- Metadata display (artist, title)
- Volume control with mute function
- Mobile notifications

## Component Architecture

The application uses a composable component approach:

1. **Base Components** (from shadcn/ui)
   - Button, Card, Dialog, Tabs, etc.

2. **Composite Components**
   - News cards
   - Player controls
   - Navigation items

3. **Page Components**
   - Assemble composite components into full pages

4. **Layout Components**
   - Navbar
   - Footer
   - Page containers

## State Management

The application uses several approaches to state management:

1. **Local Component State** - useState for component-specific state
2. **Context APIs** - For shared state like theme
3. **TanStack Query** - For server state and data fetching
4. **Custom Hooks** - Encapsulate and share stateful logic

## Responsive Design

The application is fully responsive with:

- Mobile-first design approach
- Tailwind breakpoints for different screen sizes
- Adaptive components (desktop/mobile variants)
- Touch-friendly controls

## Theme Support

The application supports light and dark themes:

- Theme toggle in navigation
- System preference detection
- Persistent theme selection

## Deployment

The application can be deployed using:

- Lovable's built-in deployment
- Custom domain configuration
- Supabase project connection

## Getting Started for Developers

1. Clone the repository
2. Install dependencies with `npm install`
3. Set up environment variables
4. Run the development server with `npm run dev`

## Additional Documentation

- [Supabase Documentation](https://supabase.com/docs)
- [React Router Documentation](https://reactrouter.com/docs/en/v6)
- [Shadcn/UI Documentation](https://ui.shadcn.com)
- [TanStack Query Documentation](https://tanstack.com/query/latest)
