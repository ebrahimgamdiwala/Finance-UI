# Performance Issues & Solutions

## Issues Identified (November 9, 2025)

### 1. **Multiple Sequential API Calls**
**Location:** `components/dashboards/ProjectManagerDashboard.jsx`

**Problem:**
- Makes 4 separate API calls on every dashboard load:
  - `/api/projects`
  - `/api/sales-orders?status=PENDING_APPROVAL`
  - `/api/tasks`
  - `/api/users`
- Each call waits for the previous one to complete
- No parallel fetching
- No caching between navigations

**Impact:** 2-5 seconds initial load time

**Solutions:**
1. Create a unified `/api/dashboard/stats` endpoint
2. Use `Promise.all()` for parallel fetching
3. Implement SWR or React Query for caching
4. Add loading states for each section

### 2. **Heavy Database Queries**
**Location:** `/api/projects/route.js`, `/api/tasks/route.js`

**Problem:**
- Deep nested includes loading unnecessary data
- Loading all tasks for all projects, then filtering in JavaScript
- No pagination on large datasets
- Statistics calculated in application code instead of database

**Example:**
```javascript
include: {
  manager: { ... },
  members: { 
    include: { user: { ... } }  // N+1 potential
  },
  tasks: { ... },  // Loading ALL tasks
  _count: { ... }
}
```

**Impact:** Slow queries, high memory usage

**Solutions:**
1. Add pagination to all list endpoints
2. Use Prisma aggregations for counts
3. Load only required fields with `select`
4. Add database indexes on frequently queried fields
5. Cache computed statistics

### 3. **No Query Optimization**
**Locations:** All API routes

**Problem:**
- No database indexes on foreign keys
- No query result caching
- Loading relations that aren't displayed
- Full table scans on large datasets

**Solutions:**
1. Add indexes in Prisma schema:
   ```prisma
   @@index([managerId])
   @@index([status])
   @@index([createdAt])
   ```
2. Use Redis for caching frequent queries
3. Implement query result pagination
4. Add `take` and `skip` parameters

### 4. **Real-time Polling Overhead**
**Location:** `app/dashboard/sales-orders/activities/page.js`

**Problem:**
- Polls every 3 seconds (20 requests/minute)
- Fetches all data even if nothing changed
- No conditional requests (ETag/Last-Modified)
- Runs even when user is not viewing the page

**Solutions:**
1. Increase polling interval to 5-10 seconds
2. Implement WebSocket for real-time updates
3. Use document visibility API to pause when hidden
4. Add conditional requests with ETags

### 5. **Missing Database Indexes**

**Problem:**
- No indexes on commonly queried fields
- Slow lookups on foreign keys
- Full table scans on filtered queries

**Required Indexes:**
```prisma
model Project {
  @@index([managerId])
  @@index([status])
  @@index([createdAt])
}

model Task {
  @@index([projectId])
  @@index([assigneeId])
  @@index([status])
  @@index([deadline])
}

model SalesOrder {
  @@index([projectId])
  @@index([status])
  @@index([requestedById])
}

model PurchaseOrder {
  @@index([projectId])
  @@index([partnerId])
  @@index([status])
  @@index([requestedById])
}
```

## Quick Wins (Immediate Fixes)

### Priority 1: Parallel API Calls
Change from sequential to parallel:
```javascript
// BEFORE (Sequential)
const res1 = await fetch('/api/projects');
const res2 = await fetch('/api/tasks');

// AFTER (Parallel)
const [res1, res2] = await Promise.all([
  fetch('/api/projects'),
  fetch('/api/tasks')
]);
```

### Priority 2: Add Pagination
```javascript
// Add to all list endpoints
const page = parseInt(searchParams.get('page')) || 1;
const limit = parseInt(searchParams.get('limit')) || 10;
const skip = (page - 1) * limit;

const data = await prisma.model.findMany({
  take: limit,
  skip: skip,
});
```

### Priority 3: Reduce Data Loading
```javascript
// Load only what's needed
select: {
  id: true,
  name: true,
  status: true,
  // Don't load relations unless needed
}
```

### Priority 4: Add Database Indexes
```bash
# Add to schema.prisma, then run:
npx prisma db push
```

## Long-term Solutions

1. **Implement Caching Layer**
   - Redis for frequent queries
   - Client-side caching with SWR/React Query
   - Server-side caching with Next.js

2. **Database Optimization**
   - Add composite indexes
   - Use materialized views for statistics
   - Implement query result caching

3. **Real-time Updates**
   - WebSocket connections
   - Server-Sent Events (SSE)
   - Replace polling with push notifications

4. **API Optimization**
   - GraphQL for flexible data fetching
   - Batch API endpoints
   - Response compression

5. **Monitoring**
   - Add query timing logs
   - Database slow query log
   - Client-side performance monitoring

## Measurement

Before optimization:
- Dashboard load: ~3-5 seconds
- Projects API: ~1-2 seconds
- Tasks API: ~1-2 seconds

Target after optimization:
- Dashboard load: <1 second
- API responses: <300ms
- Real-time updates: <100ms latency
