# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

XOCO Coffee is a Next.js 15 web application for an artisan coffee shop in Eugene, Oregon. It features online ordering with Square payment processing, menu management fetched from Square catalog, and business information pages.

**Tech Stack:** Next.js 15.3.1, React 18, Tailwind CSS 4, Square SDK, Supabase (credentials storage), Framer Motion, Resend (email)

## Commands

```bash
npm run dev      # Start development server (localhost:3000)
npm run build    # Build for production
npm start        # Start production server
npm run lint     # Run Next.js linting
```

## Architecture

### Directory Structure
- `app/` - Next.js App Router pages and API routes
- `Components/` - React client components (Header, Cart, MenuModal, MenuCard, etc.)
- `lib/` - Utilities (square-auth.js, businessHours.js, cartUtils.js, fonts.js)
- `public/` - Static assets (images, fonts)

### Key Patterns

**Server-Client Split:**
- Pages are server components by default
- Interactive UI components use `'use client'` directive
- API routes use Node.js runtime (`runtime: 'nodejs'`)

**Cart State Management:**
- Cart persisted in browser localStorage
- Cross-component sync via custom `cartUpdated` window event
- Components listen with `window.addEventListener("cartUpdated", handler)`

**Payment Flow:**
1. User adds items to cart (localStorage)
2. Checkout page collects customer info and payment method
3. Square Web Payments SDK tokenizes card → sourceId
4. POST to `/api/submit-payment` with order details
5. Backend creates Square Order + Payment
6. Redirect to `/square/success` or `/square/error`

**Menu Data:**
- Fetched from Square catalog via `/api/square-items`
- Returns items with categories, modifiers, variations, and images
- Menu automatically updates when Square dashboard changes

### API Routes
- `/api/square-items` - GET menu items from Square catalog
- `/api/submit-payment` - POST payment processing
- `/api/submit-order` - POST order creation
- `/api/send-contact-email` - POST contact form emails
- `/api/square/callback` - Square OAuth callback

### Square Integration
- Credentials stored in Supabase, retrieved via `lib/square-auth.js`
- Token expiry checking before API calls
- Tips added as separate line item in orders
- Idempotency keys (UUID) prevent duplicate charges
- **Terminal API notifications**: Orders trigger alerts on Square Terminal/Register
  - In-store orders: Creates Terminal Checkout that rings the device
  - Online orders: Sends confirmation action notification to the device

### Business Hours
- Defined in `lib/businessHours.js` (also duplicated in API routes for server-side checks)
- `isShopOpen()` and `getShopStatus()` functions gate order submissions
- Mon-Fri: 6 AM - 2 PM, Sat: 7 AM - 3 PM, Sunday: Closed

## Environment Variables

**Server-only:**
- `NEXT_PUBLIC_SUPABASE_URL`
- `SUPABASE_SERVICE_ROLE_KEY`
- `XOCO_CLIENT_ID`
- `SQUARE_ENVIRONMENT` (production or sandbox)

**Public (client-accessible):**
- `NEXT_PUBLIC_SQUARE_APPLICATION_ID`
- `NEXT_PUBLIC_SQUARE_LOCATION_ID`

## Path Aliases

`@/*` maps to the root directory (configured in jsconfig.json)
