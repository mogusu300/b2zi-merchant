# Admin Dashboard Implementation Guide

## Overview

The Admin Dashboard is a complete merchant management interface built with React, TypeScript, and shadcn/ui components. It provides administrators with tools to review, approve, or reject merchant registrations.

## ✅ Completed Features

### 1. **Dashboard Statistics**
- Real-time merchant counters
- 4 stat cards showing:
  - Total merchants
  - Pending reviews
  - Approved merchants
  - Rejected merchants
- Color-coded for quick visual reference (blue, yellow, green, red)

### 2. **Merchant Search & Filtering**
- **Search**: Search merchants by business name, owner name, or email
- **Status Filter**: Filter merchants by status (All, Pending, Approved, Rejected)
- Real-time filtering updates
- Case-insensitive search

### 3. **Merchant List View**
- Responsive grid layout of merchant cards
- Each card displays:
  - Business name and owner
  - Email and phone
  - Business type and address
  - Status badge with color coding
  - Registration date
  - Action buttons

### 4. **Status Management**
- **Status Badges**: Color-coded badges showing merchant status
  - Yellow: Pending Review
  - Green: Approved
  - Red: Rejected
- **Approve/Reject Actions**: 
  - Available from detail modal
  - Available from dropdown menu on merchant cards
  - Direct status change without page reload
- Status updates reflected immediately in dashboard

### 5. **Detailed Merchant View**
- Modal dialog showing complete merchant information
- Expandable document preview (ID front and back)
- Full contact information display
- Action buttons:
  - **Approve**: Mark merchant as approved
  - **Reject**: Mark merchant as rejected
  - **Export**: Export merchant data (UI ready)
  - **Download**: Download documents (UI ready)

### 6. **Action Menu**
- Dropdown menu on each merchant card
- Quick actions:
  - View Details
  - Approve (pending merchants only)
  - Reject (pending merchants only)
  - Export data

## 📁 File Structure

```
app/
├── admin/
│   └── page.tsx                 # Admin dashboard component
├── api/
│   └── merchant/
│       └── route.ts             # PUT endpoint for status updates
└── register/
    └── page.tsx                 # Registration form
```

## 🔧 Technical Implementation

### Component Architecture

#### AdminPage Component
Main container managing:
- Merchant data state (`useState<Merchant[]>`)
- Search and filter state
- Selected merchant detail modal
- Real-time stats calculation

```typescript
const [merchants, setMerchants] = useState<Merchant[]>(mockMerchants)
const [search, setSearch] = useState('')
const [statusFilter, setStatusFilter] = useState<string>('all')
const [selectedMerchant, setSelectedMerchant] = useState<Merchant | null>(null)
const [detailOpen, setDetailOpen] = useState(false)
```

#### DetailModal Component
Displays:
- Merchant details
- Document preview with toggle
- Status-specific action buttons
- Export/download options

Props:
```typescript
interface DetailModalProps {
  merchant: Merchant | null
  open: boolean
  onOpenChange: (open: boolean) => void
  onStatusUpdate?: (merchantId: string, status: 'approved' | 'rejected') => Promise<void>
}
```

### Data Model

```typescript
interface Merchant {
  id: string
  businessName: string
  ownerName: string
  email: string
  phone: string
  businessType: string
  businessAddress: string
  idType: string
  status: 'pending' | 'approved' | 'rejected'
  createdAt: Date
  updatedAt: Date
  idFrontUrl?: string
  idBackUrl?: string
}
```

### API Integration

#### Merchant Status Update Endpoint
**Endpoint**: `PUT /api/merchant`

**Request**:
```json
{
  "merchantId": "string",
  "status": "approved" | "rejected"
}
```

**Response**:
```json
{
  "success": true,
  "message": "Merchant status updated to [status]"
}
```

**Implementation Details**:
- Validates merchantId and status
- Updates merchant record in database (when connected)
- Returns success/error response
- Currently returns mock response (database connection pending)

## 🎨 UI Components Used

- **Card**: Merchant cards and stat cards
- **Badge**: Status indicators
- **Button**: Action buttons with various variants
- **Input**: Search field
- **Dialog**: Detail modal
- **DropdownMenu**: Action menu on merchant cards
- **Alert**: Error/info messages (ready for implementation)

All components from `shadcn/ui` with Tailwind CSS styling.

## 🚀 Key Features in Action

### 1. Search & Filter
```typescript
const filteredMerchants = merchants.filter(m => {
  const matchesSearch = 
    m.businessName.toLowerCase().includes(search.toLowerCase()) ||
    m.ownerName.toLowerCase().includes(search.toLowerCase()) ||
    m.email.toLowerCase().includes(search.toLowerCase())
  const matchesStatus = statusFilter === 'all' || m.status === statusFilter
  return matchesSearch && matchesStatus
})
```

### 2. Status Update Handler
```typescript
const handleStatusUpdate = async (merchantId: string, newStatus: 'approved' | 'rejected') => {
  try {
    const response = await fetch('/api/merchant', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ merchantId, status: newStatus })
    })
    
    // Update local state
    setMerchants(merchants.map(m => 
      m.id === merchantId ? { ...m, status: newStatus } : m
    ))
  } catch (error) {
    console.error('Error updating merchant status:', error)
  }
}
```

### 3. Stats Calculation
```typescript
const stats = {
  total: merchants.length,
  pending: merchants.filter(m => m.status === 'pending').length,
  approved: merchants.filter(m => m.status === 'approved').length,
  rejected: merchants.filter(m => m.status === 'rejected').length,
}
```

## 🔄 Data Flow

```
User Action (Approve/Reject)
    ↓
handleStatusUpdate() triggered
    ↓
API Call: PUT /api/merchant
    ↓
Server updates database (when connected)
    ↓
Local state updated (setMerchants)
    ↓
UI re-renders with new status
    ↓
Modal closes, stats update, merchant list refreshes
```

## 🔗 Integration with Registration Form

The admin dashboard works with the registration form at `/register`:

1. Merchants register at `/app/register`
2. Form data submitted to `POST /api/register`
3. Merchant record created in database
4. Admin reviews merchant at `/admin`
5. Admin approves or rejects
6. Status updated via `PUT /api/merchant`

## 📊 Mock Data Structure

Currently using mock merchants for development/testing without database:

```typescript
const mockMerchants: Merchant[] = [
  {
    id: '1',
    businessName: 'TechHub Store',
    ownerName: 'John Doe',
    email: 'john@techhub.com',
    phone: '+263771234567',
    businessType: 'Retail',
    businessAddress: '123 Main St, Harare',
    idType: 'nrc',
    status: 'pending',
    createdAt: new Date('2024-12-10'),
    updatedAt: new Date('2024-12-10'),
    idFrontUrl: 'https://via.placeholder.com/400x300?text=ID+Front',
    idBackUrl: 'https://via.placeholder.com/400x300?text=ID+Back',
  },
  // ... more merchants
]
```

## 🔌 Connecting to Database

When your PostgreSQL database is running and migrations are complete:

### 1. Update API Route

In `app/api/merchant/route.ts`, uncomment the Prisma code:

```typescript
const merchant = await prisma.merchant.update({
  where: { id: merchantId },
  data: { status: newStatus }
})

return NextResponse.json({
  success: true,
  message: `Merchant status updated to ${newStatus}`,
  merchant
})
```

### 2. Update Admin Dashboard

In `app/admin/page.tsx`, replace mock data with database query:

```typescript
import { prisma } from '@/lib/prisma'

export default function AdminPage() {
  // Instead of: const [merchants, setMerchants] = useState<Merchant[]>(mockMerchants)
  // Use server-side query or fetch from API
  
  // Option 1: Client-side fetch from API endpoint
  useEffect(() => {
    const fetchMerchants = async () => {
      const response = await fetch('/api/merchants')
      const data = await response.json()
      setMerchants(data)
    }
    fetchMerchants()
  }, [])
}
```

### 3. Create Merchants List API Endpoint

Create `app/api/merchants/route.ts`:

```typescript
export async function GET() {
  try {
    const merchants = await prisma.merchant.findMany()
    return NextResponse.json(merchants)
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to fetch merchants' },
      { status: 500 }
    )
  }
}
```

## ✨ Styling & Theme

- **Color Scheme**:
  - Pending: Yellow (#FCD34D)
  - Approved: Green (#22C55E)
  - Rejected: Red (#EF4444)
  - Primary: Blue (#3B82F6)

- **Typography**: System fonts with Tailwind CSS
- **Spacing**: Consistent padding and margins
- **Responsive**: Mobile-first design, adapts from mobile to desktop

## 🛠️ Development Notes

### Current State
✅ UI complete and functional
✅ Mock data working
✅ All interactions implemented
⏳ Database integration pending (awaiting PostgreSQL setup)

### Known Limitations
- Using mock data (replace when database connected)
- Error notifications not fully styled
- Document preview uses placeholder images
- Export functionality UI only (not implemented)

### Future Enhancements
- Bulk actions (approve/reject multiple)
- Merchant status history/audit log
- Document verification features
- Email notifications to merchants
- Dashboard analytics and charts
- Role-based access control
- Advanced filtering options

## 🐛 Troubleshooting

### Admin page shows no merchants
**Solution**: Ensure mock data is loaded or database is connected

### Status updates not working
**Solution**: Check browser console for API errors, verify `/api/merchant` endpoint is accessible

### Modal not opening
**Solution**: Check that DetailModal component is properly rendered with correct props

### Search not working
**Solution**: Verify input field is updating state correctly

## 📚 Related Files

- `prisma/schema.prisma` - Database schema
- `lib/prisma.ts` - Prisma client
- `app/api/register/route.ts` - Registration API
- `app/api/upload/route.ts` - File upload API
- `app/register/page.tsx` - Registration form
- `DATABASE_CONNECTION_GUIDE.md` - Database setup instructions

## 🎓 Learning Resources

The admin dashboard demonstrates:
- React hooks (useState, useEffect when database integrated)
- TypeScript interfaces and types
- async/await with fetch API
- Component composition
- Responsive design with Tailwind CSS
- shadcn/ui component usage
- Client-side state management
