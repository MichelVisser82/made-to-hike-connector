# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

### Development
- `npm run dev` - Start the development server (Vite)
- `npm run build` - Build for production
- `npm run build:dev` - Build for development
- `npm run preview` - Preview production build

### Code Quality
- `npm run lint` - Run ESLint

## Architecture

### Tech Stack
- **Frontend**: React 18 with TypeScript
- **Styling**: Tailwind CSS + shadcn/ui components
- **Backend**: Supabase (Auth + Database)
- **Edge Functions**: Deno-based Supabase functions
- **Build Tool**: Vite
- **Routing**: React Router v6
- **State Management**: React Query (TanStack Query) + Context API

### Project Structure

#### Frontend (`/src`)
- **`/components`**: Reusable UI components built on shadcn/ui
  - `/ui` - Base shadcn components
  - `/layout` - Layout components (Footer, etc.)
  - `/modals` - Modal components (AuthModal, GuideSignupModal, HikerRegistrationModal)
  - `/pages` - Page-level components (LandingPage, SearchPage, etc.)
- **`/pages`**: Route components (Index, Auth, VerifyEmail, NotFound)
- **`/hooks`**: Custom React hooks (useProfile, use-toast)
- **`/contexts`**: React contexts (AuthContext)
- **`/integrations/supabase`**: Supabase client configuration and types
- **`/types`**: TypeScript type definitions

#### Backend (`/supabase/functions`)
Three edge functions handle critical backend operations:
- **`custom-signup`**: User registration with email verification
- **`send-email`**: Email service integration
- **`verify-email`**: Email verification token validation

### Key Patterns

#### Authentication Flow
The app uses a custom authentication flow with email verification:
1. User signs up through `custom-signup` function
2. Verification email sent via `send-email` function
3. User clicks verification link redirecting to `/verify-email` route
4. Token validated and account activated

#### Component Architecture
- Page components in `/components/pages` handle UI logic
- Route components in `/pages` manage routing and page composition
- Modal components handle authentication and registration flows
- All components use TypeScript for type safety

#### State Management
- **AuthContext** provides authentication state globally
- **React Query** handles server state and API calls
- **Local component state** for UI interactions

### Environment Configuration
The app requires these environment variables (in `.env`):
- `SUPABASE_URL` - Supabase project URL
- `SUPABASE_ANON_KEY` - Supabase anonymous key
- Additional keys configured in Supabase dashboard for edge functions

### Deployment
This is a Lovable project deployed at:
https://lovable.dev/projects/ab369f57-f214-4187-b9e3-10bb8b4025d9

Changes pushed to the repository automatically sync with Lovable.