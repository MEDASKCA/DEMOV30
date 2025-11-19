# Access Logs Setup Guide

## Overview
The access logging system tracks all login attempts with timestamps, IP addresses, geolocation data, and device information.

## Features
- ✅ Real-time logging of all access attempts (approved, pending, denied)
- ✅ IP address tracking with geolocation (country, region, city)
- ✅ Device type detection (Desktop, Mobile, Tablet)
- ✅ User agent logging
- ✅ Interactive admin dashboard with filters
- ✅ Auto-refresh capability (5-second intervals)
- ✅ Statistics overview (total, approved, pending, denied)

## Setup Instructions

### Step 1: Create Vercel KV Database

1. Go to your Vercel dashboard: https://vercel.com/dashboard
2. Navigate to **Storage** → **Create Database**
3. Select **KV (Key-Value Store)**
4. Name it: `access-logs` or any name you prefer
5. Click **Create**

### Step 2: Connect KV to Your Project

1. In the Vercel KV dashboard, click on your newly created database
2. Go to the **.env.local** tab
3. Copy the environment variables shown (should include):
   - `KV_URL`
   - `KV_REST_API_URL`
   - `KV_REST_API_TOKEN`
   - `KV_REST_API_READ_ONLY_TOKEN`

4. In your Vercel project settings:
   - Go to **Settings** → **Environment Variables**
   - Add all the KV environment variables
   - Make sure to add them to **Production**, **Preview**, and **Development** environments

### Step 3: Deploy

The access logging system is now ready! Deploy your project:

```bash
cd theatre-operations-manager
git add .
git commit -m "Add access logging system"
git push origin main
npx vercel --prod
```

### Step 4: Access the Admin Dashboard

After deployment, navigate to:
```
https://your-domain.com/admin/access-logs
```

You must be logged in (authenticated) to view the access logs.

## How It Works

### Logging Events

The system automatically logs these events:

1. **Approved Access** - When `nhscep2025/cohort10` successfully logs in
2. **Pending Access** - When `demo/nhscep2025` attempts to log in
3. **Denied Access** - When invalid credentials are used

### Data Captured

For each access attempt, the system records:

```typescript
{
  id: string;              // Unique log ID
  timestamp: string;       // ISO timestamp
  username: string;        // Attempted username
  ipAddress: string;       // Client IP address
  userAgent: string;       // Browser/device user agent
  geolocation: {           // Vercel Edge geolocation
    country: string;       // e.g., "GB"
    region: string;        // e.g., "England"
    city: string;          // e.g., "London"
    latitude: number;      // GPS coordinates
    longitude: number;
  };
  status: 'approved' | 'pending' | 'denied';
}
```

### Storage

- Uses **Vercel KV** (Redis-compatible key-value store)
- Stores last **1000 logs** (automatically trims older entries)
- Fast retrieval with Redis LIST operations
- Persists across deployments

## API Endpoints

### POST /api/access-logs
Logs a new access attempt (called internally by login route)

**Request:**
```json
{
  "username": "demo",
  "status": "pending"
}
```

**Response:**
```json
{
  "success": true,
  "log": { /* AccessLog object */ }
}
```

### GET /api/access-logs
Retrieves access logs (requires authentication)

**Response:**
```json
{
  "success": true,
  "logs": [/* Array of AccessLog objects */]
}
```

## Admin Dashboard Features

### Statistics Cards
- **Total Requests**: All access attempts
- **Approved**: Successful logins with nhscep2025
- **Pending**: Attempts with demo credentials
- **Denied**: Invalid credentials

### Filters
- View all logs
- Filter by status (approved/pending/denied)
- Real-time counts for each category

### Auto-Refresh
- Toggle auto-refresh (updates every 5 seconds)
- Manual refresh button
- Loading states

### Log Table
Displays:
- Status badge with color coding
- Formatted timestamp (local time)
- Username
- IP address (monospace)
- Geolocation (City, Region, Country)
- Device type (Desktop/Mobile/Tablet)

## Security Notes

1. **Authentication Required**: Only authenticated users can view access logs via `/api/access-logs` GET endpoint
2. **HTTP-Only Cookies**: Uses secure authentication cookies
3. **Rate Limiting**: Consider adding rate limiting to prevent log flooding
4. **Data Retention**: Currently stores last 1000 entries, adjust as needed
5. **Privacy Compliance**: Ensure GDPR/privacy law compliance when storing IP addresses

## Troubleshooting

### "KV is not defined" Error
- Verify Vercel KV environment variables are set correctly
- Redeploy after adding environment variables
- Check `.env.local` file exists for local development

### No Logs Appearing
- Check Vercel Functions logs for errors
- Verify KV database is connected to the project
- Test API endpoint directly: `POST /api/access-logs`

### Geolocation Shows "Unknown"
- Geolocation only works on Vercel Edge Network
- Local development will show "Unknown"
- Test on production deployment for accurate geolocation

## Customization

### Change Log Retention
Edit `app/api/access-logs/route.ts`:
```typescript
// Keep only last 1000 logs (change 999 to desired number - 1)
await kv.ltrim('access_logs', 0, 999);
```

### Add More Fields
Extend the `AccessLog` interface in `app/api/access-logs/route.ts`:
```typescript
interface AccessLog {
  // ... existing fields
  customField: string;
}
```

### Modify Auto-Refresh Interval
Edit `app/admin/access-logs/page.tsx`:
```typescript
// Change 5000 to desired milliseconds
const interval = setInterval(fetchLogs, 5000);
```

## Support

For issues or questions:
- Check Vercel KV documentation: https://vercel.com/docs/storage/vercel-kv
- Review Vercel deployment logs
- Ensure environment variables are correctly set
