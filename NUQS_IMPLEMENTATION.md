# nuqs Implementation Summary

## Overview

nuqs has been successfully integrated into the banner-money app. nuqs is a type-safe library for managing URL query parameters as React state, making state shareable via URLs and enabling better SEO and user experience.

## What Was Done

### 1. Installation

```bash
bun add nuqs
```

Added `nuqs@2.7.2` to the project dependencies.

### 2. Adapter Setup

**File: `apps/web/src/app/layout.tsx`**

Wrapped the app with `NuqsAdapter` from `nuqs/adapters/next/app`:

```tsx
import { NuqsAdapter } from "nuqs/adapters/next/app";

export default function RootLayout({ children }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body>
        <Providers>
          <NuqsAdapter>
            <div className="grid grid-rows-[auto_1fr] h-svh">
              <Header />
              {children}
            </div>
          </NuqsAdapter>
        </Providers>
      </body>
    </html>
  );
}
```

### 3. Homepage Implementation

**File: `apps/web/src/app/page.tsx`**

Added URL-based state management for search and sorting functionality:

#### Features Added:

1. **Search Functionality**
   - URL parameter: `?search=query`
   - Searches across user names, Twitter usernames, and bios
   - Clears easily with a button

2. **Sort Functionality**
   - URL parameter: `?sort=followers|tweets|verified`
   - Three sorting options:
     - By Followers (default)
     - By Tweets
     - Verified users first
   - Active button styling to show current sort

#### Benefits:

- URLs are shareable (e.g., `/?search=developer&sort=followers`)
- Browser back/forward buttons work correctly
- State persists on page refresh
- No client-side useState needed

#### Code Example:

```tsx
import { useQueryState, parseAsString, parseAsStringEnum } from "nuqs";

// URL-based state management
const [searchQuery, setSearchQuery] = useQueryState(
  "search",
  parseAsString.withDefault("")
);

const [sortBy, setSortBy] = useQueryState(
  "sort",
  parseAsStringEnum(["followers", "tweets", "verified"]).withDefault("followers")
);

// Filter and sort based on URL state
const filteredAndSortedUsers = users
  .filter((user) => {
    if (!searchQuery) return true;
    const query = searchQuery.toLowerCase();
    return (
      user.name?.toLowerCase().includes(query) ||
      user.twitterUsername?.toLowerCase().includes(query) ||
      user.twitterBio?.toLowerCase().includes(query)
    );
  })
  .sort((a, b) => {
    if (sortBy === "followers") {
      return (b.twitterFollowers || 0) - (a.twitterFollowers || 0);
    }
    if (sortBy === "tweets") {
      return (b.twitterTweetCount || 0) - (a.twitterTweetCount || 0);
    }
    if (sortBy === "verified") {
      return (b.twitterVerified ? 1 : 0) - (a.twitterVerified ? 1 : 0);
    }
    return 0;
  });
```

### 4. Dashboard Implementation

**File: `apps/web/src/app/dashboard/page.tsx`**

Added URL-based tab navigation:

#### Features Added:

1. **Tab Navigation**
   - URL parameter: `?tab=profile|campaigns|earnings|settings`
   - Four tabs ready for future expansion:
     - Profile (default) - Shows user profile card
     - Campaigns - Placeholder for campaign marketplace
     - Earnings - Placeholder for earnings tracking
     - Settings - Placeholder for user settings
   - Active tab styling with border highlighting

#### Benefits:

- Direct linking to specific tabs (e.g., `/dashboard?tab=campaigns`)
- Shareable dashboard views
- Browser navigation works with tabs
- Tab state persists on refresh

#### Code Example:

```tsx
import { useQueryState, parseAsStringEnum } from "nuqs";

// URL-based tab state management
const [activeTab, setActiveTab] = useQueryState(
  "tab",
  parseAsStringEnum(["profile", "campaigns", "earnings", "settings"]).withDefault("profile")
);

// Tab navigation
<Button
  variant="ghost"
  className={activeTab === "profile" ? "border-b-2 border-primary rounded-none" : "rounded-none"}
  onClick={() => setActiveTab("profile")}
>
  Profile
</Button>

// Tab content
{activeTab === "profile" && (
  <div className="max-w-md mx-auto">
    <h2 className="text-2xl font-bold mb-6">Your Profile</h2>
    {userData && <UserCard user={userData} />}
  </div>
)}
```

## Key Benefits of nuqs

1. **Type Safety**: All URL parameters are type-checked at compile time
2. **SEO Friendly**: State is in the URL, making pages indexable with different states
3. **Shareable URLs**: Users can share filtered/sorted views or specific tabs
4. **Browser Integration**: Back/forward buttons work correctly
5. **Persistence**: State persists across page refreshes
6. **No useState**: Cleaner code without client-side state management
7. **Shallow Routing**: Updates URL without triggering full page reloads

## Parser Types Used

- `parseAsString`: For text search queries
- `parseAsStringEnum`: For predefined options (sort types, tab names)

## Future Opportunities

Consider adding nuqs to these future features:

1. **Campaign Filters**: Filter campaigns by category, budget, duration
2. **Date Range Pickers**: For earnings reports
3. **Pagination**: Page number in URL
4. **View Modes**: Grid vs. list views
5. **Advanced Filters**: Multiple filter combinations
6. **Modal States**: Open/closed states for dialogs
7. **Form Steps**: Multi-step form progress

## Testing URLs

Try these URLs to see nuqs in action:

- Homepage search: `http://localhost:3001/?search=twitter`
- Sort by tweets: `http://localhost:3001/?sort=tweets`
- Combined: `http://localhost:3001/?search=dev&sort=followers`
- Dashboard campaigns: `http://localhost:3001/dashboard?tab=campaigns`
- Dashboard earnings: `http://localhost:3001/dashboard?tab=earnings`

## Documentation

For more advanced usage, see the official nuqs documentation:
- https://nuqs.47ng.com/

