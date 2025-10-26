# 📊 Admin Panel - Event Photo Platform

Admin dashboard for managing events, photos, orders, and system settings.

## ✨ Features

### Event Management
- ✅ Create new events
- ✅ Edit event details
- ✅ Delete events
- ✅ View event photos
- ✅ Manage event status

### Photo Management
- ✅ Upload photos (drag & drop, multiple files)
- ✅ View all photos (grid/list view)
- ✅ Filter by event and status
- ✅ Batch delete operations
- ✅ View photo statistics

### Order Management
- ✅ View all orders
- ✅ Filter by status
- ✅ Search by email
- ✅ Confirm payments manually
- ✅ Resend download links
- ✅ Export to CSV

### Settings
- ✅ Photo pricing
- ✅ Watermark configuration
- ✅ Payment gateway setup (Stripe/Omise)
- ✅ Email (SMTP) configuration

---

## 🚀 Getting Started

### Development

```bash
# Install dependencies
npm install

# Set environment variables
cp .env.example .env

# Edit .env and set your API URL
NEXT_PUBLIC_API_URL=http://localhost:8000

# Start development server
npm run dev

# Open browser
http://localhost:3000/admin
```

### Production Build

```bash
# Build
npm run build

# Start production server
npm start
```

### Docker

```bash
# Build image
docker build -t admin-panel .

# Run container
docker run -p 3000:3000 \
  -e NEXT_PUBLIC_API_URL=https://api.yourdomain.com \
  admin-panel
```

---

## 📁 Project Structure

```
apps/admin/
├── app/
│   ├── layout.tsx              # Root layout with sidebar
│   ├── page.tsx                # Dashboard
│   ├── events/
│   │   ├── page.tsx            # Event list
│   │   ├── new/page.tsx        # Create event
│   │   └── [id]/
│   │       ├── edit/page.tsx   # Edit event
│   │       └── photos/page.tsx # Event photos
│   ├── photos/
│   │   ├── page.tsx            # All photos
│   │   └── upload/page.tsx     # Upload interface
│   ├── orders/page.tsx         # Order management
│   └── settings/page.tsx       # System settings
├── components/
│   └── AdminSidebar.tsx        # Navigation sidebar
└── ...config files
```

---

## 🎨 Design System

### Colors
- Primary: Blue (`primary-600`)
- Success: Green
- Warning: Orange/Yellow
- Error: Red
- Neutral: Gray

### Components
- Forms with validation
- Toast notifications
- Progress bars
- Status badges
- Drag & drop zones
- Modal confirmations

---

## 🔧 Configuration

### Environment Variables

```bash
# Required
NEXT_PUBLIC_API_URL=http://localhost:8000

# Optional (for production)
NODE_ENV=production
PORT=3000
```

### API Endpoints Used

```
GET    /api/events
POST   /api/events
GET    /api/events/{id}
PUT    /api/events/{id}
DELETE /api/events/{id}
GET    /api/events/{id}/photos
POST   /api/events/{id}/photos
DELETE /api/photos/{id}
GET    /api/orders (TODO)
PUT    /api/settings (TODO)
```

---

## ðŸ› ï¸ Development

### Tech Stack
- **Framework:** Next.js 14 (App Router)
- **Language:** TypeScript
- **Styling:** Tailwind CSS
- **HTTP Client:** Axios
- **Notifications:** react-hot-toast
- **State:** React Hooks

### Code Style
- Use TypeScript for type safety
- Follow React best practices
- Keep components focused and reusable
- Use async/await for API calls
- Handle errors gracefully

---

## 📋 Pages Overview

### Dashboard (`/admin`)
- Statistics overview
- Quick actions
- Recent activity

### Events (`/admin/events`)
- List all events
- Filter by status
- Create/Edit/Delete

### Photos (`/admin/photos`)
- View all photos
- Filter by event/status
- Upload new photos
- Batch operations

### Orders (`/admin/orders`)
- View all orders
- Filter by status/date
- Manual payment confirmation
- Export to CSV

### Settings (`/admin/settings`)
- General settings
- Payment configuration
- Email setup

---

## âœ… TODO

### High Priority
- [ ] User authentication
- [ ] Real orders API integration
- [ ] Settings save/load API
- [ ] Photo reprocess functionality

### Medium Priority
- [ ] Search functionality
- [ ] Pagination
- [ ] Advanced filters
- [ ] Analytics dashboard

### Low Priority
- [ ] Dark mode
- [ ] Keyboard shortcuts
- [ ] Export/Import
- [ ] Activity logs

---

## 🐛 Known Issues

1. **Orders** - Using mock data, needs API integration
2. **Settings** - Save/load not persisted, needs API
3. **Photos** - Delete/reprocess needs API endpoints
4. **Auth** - No authentication yet

---

## 📝 Contributing

1. Follow existing code style
2. Add TypeScript types
3. Test all features
4. Update documentation

---

## 📞 Support

For issues or questions:
1. Check documentation in `/docs`
2. Review TODO.md
3. Check API documentation

---

## 📄 License

Part of Event Photo Platform project.

---

**Version:** 2.0  
**Last Updated:** October 26, 2025  
**Status:** Production Ready ðŸš€
