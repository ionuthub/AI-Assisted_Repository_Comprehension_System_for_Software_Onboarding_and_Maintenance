# Supabase OAuth/GitHub Login Integration Setup

This document describes the OAuth authentication setup for the AI-Code-Tutor project using Supabase and GitHub.

## Overview

The project now includes a complete OAuth/GitHub authentication flow using Supabase as the auth provider. Users can sign in using their GitHub account, granting access to repositories for analysis.

## Architecture

### Components Created

#### 1. **useSupabaseOAuth Hook** (`src/hooks/useSupabaseOAuth.ts`)
A comprehensive React hook that manages OAuth authentication state and operations:
- **State Management**: Tracks loading, authentication status, user info, and errors
- - **Sign In**: `signInWithGitHub()` - Initiates OAuth flow
  - - **Sign Out**: `signOut()` - Clears user session
    - - **Token Retrieval**: `getGitHubToken()` - Gets GitHub access token for API calls
      - - **Session Refresh**: `refreshSession()` - Refreshes the current session
        - - **Auto-listening**: Automatically listens for auth state changes
         
          - #### 2. **AuthCallback Component** (`src/pages/AuthCallback.tsx`)
          - Handles the OAuth redirect callback from Supabase:
          - - Receives the auth code/state from Supabase
            - - Establishes the user session
              - - Provides user feedback via toast notifications
                - - Redirects to home page on success or back to auth page on failure
                 
                  - #### 3. **GitHub Secrets** (GitHub Repository Settings)
                  - - `SUPABASE_OAUTH_CLIENT_ID`: GitHub OAuth Client ID from Supabase
                    - - `SUPABASE_OAUTH_CLIENT_SECRET`: GitHub OAuth Client Secret from Supabase
                     
                      - ## Setup Instructions
                     
                      - ### 1. GitHub Secrets Configuration ✅ COMPLETED
                     
                      - The following secrets have already been added to the GitHub repository:
                     
                      - ```
                        Settings > Secrets and variables > Actions
                        ├── SUPABASE_OAUTH_CLIENT_ID
                        └── SUPABASE_OAUTH_CLIENT_SECRET
                        ```

                        ### 2. Supabase Configuration

                        Configure your Supabase project for GitHub OAuth:

                        1. Go to [Supabase Dashboard](https://app.supabase.com)
                        2. 2. Navigate to **Authentication > Providers**
                           3. 3. Enable **GitHub** provider
                              4. 4. Add OAuth credentials:
                                 5.    - Client ID: (from your GitHub OAuth app)
                                       -    - Client Secret: (from your GitHub OAuth app)
                                            - 5. Set Callback URL to: `https://wtxqtukugqvojqfsyiva.supabase.co/auth/v1/callback`
                                             
                                              6. ### 3. Supabase Client Configuration
                                             
                                              7. The Supabase client is already configured in `src/integrations/supabase/client.ts`:
                                             
                                              8. ```typescript
                                                 export const supabase = createClient(
                                                   env.VITE_SUPABASE_URL,
                                                   env.VITE_SUPABASE_PUBLISHABLE_KEY,
                                                   {
                                                     auth: {
                                                       storage: localStorage,
                                                       persistSession: true,
                                                       autoRefreshToken: true,
                                                     },
                                                   }
                                                 );
                                                 ```

                                                 ### 4. Application Routing

                                                 Add the callback route to your router configuration (e.g., in `App.tsx` or router setup):

                                                 ```typescript
                                                 import { AuthCallback } from '@/pages/AuthCallback';

                                                 // In your router configuration:
                                                 {
                                                   path: '/auth/callback',
                                                   element: <AuthCallback />,
                                                 }
                                                 ```

                                                 ### 5. Environment Variables

                                                 Ensure your `.env` file includes (example):

                                                 ```
                                                 VITE_SUPABASE_URL=https://wtxqtukugqvojqfsyiva.supabase.co
                                                 VITE_SUPABASE_PUBLISHABLE_KEY=your_publishable_key_here
                                                 ```

                                                 ## Usage in Components

                                                 ### Basic Sign In/Out Example

                                                 ```typescript
                                                 import { useSupabaseOAuth } from '@/hooks/useSupabaseOAuth';

                                                 export function LoginButton() {
                                                   const { isAuthenticated, isLoading, signInWithGitHub, signOut } = useSupabaseOAuth();

                                                   if (isLoading) {
                                                     return <div>Loading...</div>;
                                                   }

                                                   if (isAuthenticated) {
                                                     return <button onClick={signOut}>Sign Out</button>;
                                                   }

                                                   return <button onClick={signInWithGitHub}>Sign In with GitHub</button>;
                                                 }
                                                 ```

                                                 ### Getting GitHub Access Token

                                                 ```typescript
                                                 import { useSupabaseOAuth } from '@/hooks/useSupabaseOAuth';

                                                 export function GitHubAPIAccess() {
                                                   const { getGitHubToken } = useSupabaseOAuth();

                                                   const fetchUserRepos = async () => {
                                                     const token = await getGitHubToken();
                                                     if (!token) {
                                                       console.error('No GitHub token available');
                                                       return;
                                                     }

                                                     // Use token for GitHub API calls
                                                     const response = await fetch('https://api.github.com/user/repos', {
                                                       headers: {
                                                         Authorization: `Bearer ${token}`,
                                                       },
                                                     });
                                                   };
                                                 }
                                                 ```

                                                 ## Authentication Flow

                                                 ```
                                                 User Click "Sign In"
                                                          ↓
                                                 useSupabaseOAuth.signInWithGitHub()
                                                          ↓
                                                 Supabase OAuth Flow (Redirect to GitHub)
                                                          ↓
                                                 User Authorizes & GitHub Redirects
                                                          ↓
                                                 Browser Redirects to /auth/callback
                                                          ↓
                                                 AuthCallback Component Processes
                                                          ↓
                                                 Session Established & Redirects to Home
                                                 ```

                                                 ## Files Modified/Created

                                                 ### New Files Created
                                                 - ✅ `src/hooks/useSupabaseOAuth.ts` - OAuth hook
                                                 - - ✅ `src/pages/AuthCallback.tsx` - OAuth callback handler
                                                  
                                                   - ### Files to Update (Next Steps)
                                                   - - `src/App.tsx` - Add AuthCallback route
                                                     - - `src/pages/Auth.tsx` - Integrate useSupabaseOAuth hook
                                                       - - `.env.example` - Document OAuth variables
                                                         - - Router configuration - Add callback route
                                                          
                                                           - ## Troubleshooting
                                                          
                                                           - ### Issue: "Invalid OAuth credentials"
                                                           - **Solution**: Verify that `SUPABASE_OAUTH_CLIENT_ID` and `SUPABASE_OAUTH_CLIENT_SECRET` are correctly set in GitHub Secrets and Supabase Dashboard.
                                                          
                                                           - ### Issue: Callback URL mismatch error
                                                           - **Solution**: Ensure the redirect URL in Supabase matches exactly: `https://wtxqtukugqvojqfsyiva.supabase.co/auth/v1/callback`
                                                          
                                                           - ### Issue: Token not available
                                                           - **Solution**: Make sure the user is authenticated before calling `getGitHubToken()`. Check `isAuthenticated` state first.
                                                          
                                                           - ### Issue: Session expires immediately
                                                           - **Solution**: Verify `persistSession: true` and `autoRefreshToken: true` are set in the Supabase client config.
                                                          
                                                           - ## Security Considerations
                                                          
                                                           - 1. **Client Secret**: Never expose `SUPABASE_OAUTH_CLIENT_SECRET` in client-side code
                                                             2. 2. **CORS**: Ensure Supabase is configured to allow requests from your domain
                                                                3. 3. **HTTPS**: OAuth flows must use HTTPS in production
                                                                   4. 4. **Token Storage**: Browser localStorage is used for session persistence (default Supabase behavior)
                                                                     
                                                                      5. ## Next Steps
                                                                     
                                                                      6. 1. ✅ Created useSupabaseOAuth hook
                                                                         2. 2. ✅ Created AuthCallback component
                                                                            3. 3. ⏳ Add AuthCallback route to router
                                                                               4. 4. ⏳ Integrate hook in Auth.tsx page
                                                                                  5. 5. ⏳ Test OAuth flow end-to-end
                                                                                     6. 6. ⏳ Add Supabase OAuth variables to .env.example
                                                                                        7. 7. ⏳ Add database profile syncing for GitHub metadata
