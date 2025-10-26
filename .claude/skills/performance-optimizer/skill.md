# Performance Optimizer Skill

## Purpose
Identify and fix performance bottlenecks across the AINexSuite to ensure fast, responsive apps with excellent Core Web Vitals.

## When to Use
- Before production deployment
- When experiencing slow performance
- During code reviews
- When adding new features
- During performance audits

## Performance Targets

### Core Web Vitals

| Metric | Target | Maximum |
|--------|--------|---------|
| **LCP** (Largest Contentful Paint) | < 2.5s | < 4.0s |
| **FID** (First Input Delay) | < 100ms | < 300ms |
| **CLS** (Cumulative Layout Shift) | < 0.1 | < 0.25 |
| **FCP** (First Contentful Paint) | < 1.8s | < 3.0s |
| **TTI** (Time to Interactive) | < 3.8s | < 7.3s |

### Lighthouse Scores

**All apps should achieve**:
- Performance: > 90
- Accessibility: > 90
- Best Practices: > 90
- SEO: > 90

### Bundle Size Targets

| App Type | Initial Bundle | Total Bundle |
|----------|----------------|--------------|
| Simple (Notes, Journal) | < 150 KB | < 500 KB |
| Medium (Todo, Track) | < 200 KB | < 700 KB |
| Complex (Pulse, Fit) | < 250 KB | < 1 MB |

## Frontend Optimization

### 1. Code Splitting

**Route-based splitting** (automatic in Next.js):
```typescript
// Automatic code splitting per route
// app/notes/page.tsx - separate bundle
// app/journal/page.tsx - separate bundle
```

**Component-based splitting**:
```typescript
import dynamic from 'next/dynamic';

// Lazy load heavy components
const HeavyChart = dynamic(() => import('./heavy-chart'), {
  loading: () => <div>Loading chart...</div>,
  ssr: false // Don't render on server
});
```

**Conditional imports**:
```typescript
// Only load when needed
if (userWantsAdvancedFeature) {
  const AdvancedFeature = await import('./advanced-feature');
  // Use feature
}
```

### 2. Image Optimization

**Use Next.js Image component**:
```typescript
import Image from 'next/image';

<Image
  src="/logo.png"
  width={200}
  height={50}
  alt="Logo"
  priority // For above-the-fold images
/>
```

**Firebase Storage images**:
```typescript
<Image
  src={firebaseStorageUrl}
  width={400}
  height={300}
  alt="User photo"
  loading="lazy"
  placeholder="blur"
  blurDataURL={thumbnailUrl}
/>
```

**Optimization checklist**:
- [ ] Use WebP/AVIF formats
- [ ] Serve responsive sizes
- [ ] Lazy load below-the-fold images
- [ ] Use `priority` for LCP images
- [ ] Provide width/height to prevent CLS

### 3. Font Optimization

**Use Geist fonts optimally**:
```typescript
// app/layout.tsx
import { GeistSans } from 'geist/font/sans';
import { GeistMono } from 'geist/font/mono';

// Variable fonts reduce file size
export default function RootLayout({ children }) {
  return (
    <html className={`${GeistSans.variable} ${GeistMono.variable}`}>
      <body className="font-sans">{children}</body>
    </html>
  );
}
```

**Font loading strategy**:
```css
/* Prevent FOIT (Flash of Invisible Text) */
@font-face {
  font-family: 'Geist Sans';
  font-display: swap; /* Show fallback immediately */
}
```

### 4. JavaScript Optimization

**Tree shaking**:
```typescript
// ❌ Imports everything
import * as icons from 'lucide-react';

// ✅ Imports only what's needed
import { ChevronRight, Settings } from 'lucide-react';
```

**Remove console logs in production**:
```typescript
// next.config.ts
const nextConfig = {
  compiler: {
    removeConsole: process.env.NODE_ENV === 'production'
  }
};
```

**Minimize client components**:
```typescript
// ❌ Entire page is client component
'use client';
export default function Page() { ... }

// ✅ Only interactive part is client
export default function Page() {
  return (
    <div>
      <StaticContent />
      <InteractiveButton /> {/* 'use client' here */}
    </div>
  );
}
```

### 5. CSS Optimization

**Tailwind CSS purging**:
```javascript
// tailwind.config.ts
export default {
  content: [
    './src/**/*.{js,ts,jsx,tsx}',
    '../../packages/ui/src/**/*.{js,ts,jsx,tsx}'
  ], // Only scan necessary files
};
```

**Critical CSS**:
```typescript
// Inline critical styles
<style dangerouslySetInnerHTML={{
  __html: `.critical-class { ... }`
}} />
```

**Avoid CSS-in-JS bloat**:
```typescript
// ❌ Runtime CSS-in-JS (slower)
const styles = css`
  color: ${theme.primary};
`;

// ✅ Tailwind classes (build-time)
className="text-accent-500"
```

## Firebase Optimization

### 1. Firestore Query Optimization

**Use indexes**:
```typescript
// firestore.indexes.json
{
  "indexes": [
    {
      "collectionGroup": "notes",
      "fields": [
        { "fieldPath": "ownerId", "order": "ASCENDING" },
        { "fieldPath": "createdAt", "order": "DESCENDING" }
      ]
    }
  ]
}
```

**Limit query results**:
```typescript
// ❌ Fetches all documents
const notesQuery = query(
  collection(db, 'notes'),
  where('ownerId', '==', userId)
);

// ✅ Limits to what's needed
const notesQuery = query(
  collection(db, 'notes'),
  where('ownerId', '==', userId),
  orderBy('createdAt', 'desc'),
  limit(20)
);
```

**Pagination**:
```typescript
// First page
const firstBatch = query(
  collection(db, 'notes'),
  orderBy('createdAt', 'desc'),
  limit(20)
);

// Next page
const nextBatch = query(
  collection(db, 'notes'),
  orderBy('createdAt', 'desc'),
  startAfter(lastDocument),
  limit(20)
);
```

**Avoid N+1 queries**:
```typescript
// ❌ N+1 queries
const notes = await getDocs(notesQuery);
for (const note of notes.docs) {
  const user = await getDoc(doc(db, 'users', note.data().userId));
}

// ✅ Batch read
const notes = await getDocs(notesQuery);
const userIds = [...new Set(notes.docs.map(n => n.data().userId))];
const users = await Promise.all(
  userIds.map(id => getDoc(doc(db, 'users', id)))
);
```

### 2. Real-time Listener Optimization

**Unsubscribe when not needed**:
```typescript
useEffect(() => {
  const unsubscribe = onSnapshot(notesQuery, (snapshot) => {
    setNotes(snapshot.docs.map(d => d.data()));
  });

  return () => unsubscribe(); // Cleanup
}, [userId]);
```

**Use query cursors**:
```typescript
// Only listen to recent documents
const recentQuery = query(
  collection(db, 'notes'),
  where('ownerId', '==', userId),
  orderBy('createdAt', 'desc'),
  limit(10) // Don't listen to all documents
);
```

### 3. Firebase Storage Optimization

**Upload compressed images**:
```typescript
async function uploadImage(file: File) {
  // Compress before upload
  const compressed = await compressImage(file, {
    maxWidth: 1920,
    maxHeight: 1080,
    quality: 0.8
  });

  const storageRef = ref(storage, `images/${userId}/${file.name}`);
  await uploadBytes(storageRef, compressed);
}
```

**Use download URLs sparingly**:
```typescript
// ❌ Fetch URL for every image
images.forEach(async (img) => {
  const url = await getDownloadURL(ref(storage, img.path));
});

// ✅ Fetch URLs in batch when needed
const urls = await Promise.all(
  images.map(img => getDownloadURL(ref(storage, img.path)))
);
```

## React Performance

### 1. Memo and Callbacks

**Use React.memo for expensive components**:
```typescript
export const ExpensiveComponent = React.memo(({ data }) => {
  // Expensive rendering logic
  return <div>{/* ... */}</div>;
});
```

**Use useCallback for event handlers**:
```typescript
const handleClick = useCallback(() => {
  // Handler logic
}, [dependencies]);
```

**Use useMemo for expensive calculations**:
```typescript
const sortedNotes = useMemo(() => {
  return notes.sort((a, b) => b.createdAt - a.createdAt);
}, [notes]);
```

### 2. Virtualization for Long Lists

```typescript
import { FixedSizeList } from 'react-window';

function NotesList({ notes }) {
  const Row = ({ index, style }) => (
    <div style={style}>
      <NoteCard note={notes[index]} />
    </div>
  );

  return (
    <FixedSizeList
      height={600}
      itemCount={notes.length}
      itemSize={120}
      width="100%"
    >
      {Row}
    </FixedSizeList>
  );
}
```

### 3. Debouncing and Throttling

**Debounce search input**:
```typescript
import { useMemo } from 'react';
import { debounce } from 'lodash';

function SearchInput() {
  const debouncedSearch = useMemo(
    () => debounce((query: string) => {
      performSearch(query);
    }, 300),
    []
  );

  return <input onChange={(e) => debouncedSearch(e.target.value)} />;
}
```

**Throttle scroll events**:
```typescript
import { throttle } from 'lodash';

useEffect(() => {
  const handleScroll = throttle(() => {
    // Handle scroll
  }, 100);

  window.addEventListener('scroll', handleScroll);
  return () => window.removeEventListener('scroll', handleScroll);
}, []);
```

## Network Optimization

### 1. API Request Optimization

**Batch requests**:
```typescript
// ❌ Multiple requests
await Promise.all([
  fetch('/api/notes'),
  fetch('/api/labels'),
  fetch('/api/settings')
]);

// ✅ Single batch request
await fetch('/api/batch', {
  body: JSON.stringify({ queries: ['notes', 'labels', 'settings'] })
});
```

**Request deduplication**:
```typescript
const cache = new Map();

async function fetchWithCache(url: string) {
  if (cache.has(url)) {
    return cache.get(url);
  }

  const promise = fetch(url).then(r => r.json());
  cache.set(url, promise);

  return promise;
}
```

### 2. Prefetching

**Prefetch route data**:
```typescript
import { useRouter } from 'next/navigation';

function NavigationLink() {
  const router = useRouter();

  return (
    <Link
      href="/journal"
      onMouseEnter={() => router.prefetch('/journal')}
    >
      Journal
    </Link>
  );
}
```

**Prefetch critical resources**:
```typescript
// app/layout.tsx
<head>
  <link rel="prefetch" href="/api/user-data" />
  <link rel="preconnect" href="https://firebasestorage.googleapis.com" />
</head>
```

## Monitoring

### 1. Performance Measurement

**Measure specific operations**:
```typescript
performance.mark('notes-fetch-start');
await fetchNotes();
performance.mark('notes-fetch-end');
performance.measure('notes-fetch', 'notes-fetch-start', 'notes-fetch-end');

const measure = performance.getEntriesByName('notes-fetch')[0];
console.log(`Notes fetch took ${measure.duration}ms`);
```

**Track custom metrics**:
```typescript
// Track time to interactive for notes
useEffect(() => {
  if (notesLoaded) {
    const tti = performance.now();
    trackMetric('notes-tti', tti);
  }
}, [notesLoaded]);
```

### 2. Vercel Analytics

```bash
npm install @vercel/analytics
```

```typescript
// app/layout.tsx
import { Analytics } from '@vercel/analytics/react';

export default function RootLayout({ children }) {
  return (
    <html>
      <body>
        {children}
        <Analytics />
      </body>
    </html>
  );
}
```

### 3. Performance Budget

**Set bundle size budgets**:
```javascript
// next.config.ts
const nextConfig = {
  webpack(config) {
    config.performance = {
      maxEntrypointSize: 200000, // 200KB
      maxAssetSize: 100000 // 100KB
    };
    return config;
  }
};
```

## Quick Wins Checklist

### Immediate Improvements
- [ ] Enable Next.js Image component for all images
- [ ] Remove unused dependencies
- [ ] Enable Tailwind CSS purging
- [ ] Add loading states to prevent CLS
- [ ] Lazy load below-the-fold content
- [ ] Optimize font loading
- [ ] Remove console.logs in production
- [ ] Enable Turbopack for faster dev builds

### Firebase Optimizations
- [ ] Add composite indexes for queries
- [ ] Limit Firestore query results
- [ ] Implement pagination
- [ ] Unsubscribe from listeners
- [ ] Compress images before upload
- [ ] Use Firebase Storage CDN

### React Optimizations
- [ ] Memo expensive components
- [ ] Use useCallback for handlers
- [ ] Virtualize long lists
- [ ] Debounce search inputs
- [ ] Minimize client components

## Tools & Commands

### Analyze Bundle Size

```bash
# Next.js bundle analyzer
npm install @next/bundle-analyzer

# In next.config.ts
const withBundleAnalyzer = require('@next/bundle-analyzer')({
  enabled: process.env.ANALYZE === 'true'
});

# Run analysis
ANALYZE=true npm run build
```

### Lighthouse CI

```bash
# Install
npm install -g @lhci/cli

# Run audit
lhci autorun --collect.url=http://localhost:3000

# Set scores
lhci assert --preset=lighthouse:recommended
```

### Performance Profiling

```bash
# Chrome DevTools
1. Open DevTools
2. Performance tab
3. Record while interacting
4. Analyze flame graph

# React DevTools Profiler
1. Install React DevTools
2. Profiler tab
3. Record render performance
```

## Common Performance Issues

### Issue: Large Initial Bundle
**Fix**: Code split by route, lazy load components

### Issue: Slow Firestore Queries
**Fix**: Add indexes, limit results, use pagination

### Issue: Many Re-renders
**Fix**: Use memo, useCallback, minimize state

### Issue: Layout Shifts (CLS)
**Fix**: Set image dimensions, reserve space for dynamic content

### Issue: Slow Images
**Fix**: Use Next.js Image, optimize formats, lazy load

### Issue: Blocking JavaScript
**Fix**: Defer non-critical scripts, code split

## Resources

- [Next.js Performance](https://nextjs.org/docs/advanced-features/measuring-performance)
- [Web Vitals](https://web.dev/vitals/)
- [Lighthouse](https://developers.google.com/web/tools/lighthouse)
- [Firebase Performance Monitoring](https://firebase.google.com/docs/perf-mon)

---

**Remember**: Measure before optimizing. Focus on the biggest bottlenecks first.
