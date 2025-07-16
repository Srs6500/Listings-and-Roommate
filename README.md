<<<<<<< HEAD
# Roommate Finder App

A web application for finding and saving roommate listings in the NYC/NJ area.

## Features

- Browse available roommate listings
- Save listings to your personal mailbox
- Google Sign-In for authentication
- Responsive design that works on all devices

## Tech Stack

- **Frontend**: Next.js 13+ with App Router
- **Styling**: Tailwind CSS
- **Authentication**: Firebase Authentication with Google Sign-In
- **Database**: Firebase Firestore (NoSQL)
- **State Management**: React Context API
- **Form Handling**: React Hook Form
- **Type Safety**: TypeScript

## Getting Started

### Prerequisites

- Node.js 14.6.0 or later
- npm or yarn
- Firebase project with Firestore and Authentication enabled
- Google OAuth 2.0 credentials

### Installation

1. Clone the repository
   ```bash
   git clone https://github.com/your-username/roommate-finder.git
   cd roommate-finder
   ```

2. Install dependencies
   ```bash
   npm install
   # or
   yarn
   ```

3. Create a `.env.local` file in the root directory and add your Firebase configuration:
   ```env
   NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key
   NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_project_id.firebaseapp.com
   NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
   NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_project_id.appspot.com
   NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_messaging_sender_id
   NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id
   
   # NextAuth
   NEXTAUTH_SECRET=your_nextauth_secret
   NEXTAUTH_URL=http://localhost:3000
   
   # Google OAuth
   GOOGLE_CLIENT_ID=your_google_client_id
   GOOGLE_CLIENT_SECRET=your_google_client_secret
   ```

4. Run the development server:
   ```bash
   npm run dev
   # or
   yarn dev
   ```

5. Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## Firebase Setup

1. Go to the [Firebase Console](https://console.firebase.google.com/)
2. Create a new project
3. Enable Authentication:
   - Go to Authentication > Sign-in method
   - Enable Google Sign-In
   - Add support email
4. Set up Firestore:
   - Go to Firestore Database
   - Create a database in production mode
   - Start in test mode for development
   - Create a collection called "listings"

## Project Structure

```
src/
├── app/
│   ├── auth/
│   │   └── signin/           # Sign in page
│   ├── api/
│   │   └── auth/            # NextAuth API routes
│   ├── mailbox/              # Saved listings
│   ├── layout.tsx            # Root layout
│   └── page.tsx              # Home page
├── components/               # Reusable components
├── context/                  # React context providers
│   └── AuthContext.tsx       # Authentication context
└── lib/
    ├── auth.ts              # Authentication utilities
    └── firebase.ts           # Firebase configuration
```

## Deployment

### Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-docs) from the creators of Next.js.

1. Push your code to a GitHub repository
2. Import the repository on Vercel
3. Add your environment variables in the Vercel dashboard
4. Deploy!
=======
# Listings-and-Roommate
This is an application that is designed by Sri Ram Swaminathan and Vighanesh Gaund for Roommate and Property Listings. Hence it is named Listings and Roommate.
>>>>>>> 367f78b158531fe6d3b935587893173700c4dc25
