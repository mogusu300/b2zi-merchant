# UIREWORK IMPLEMENTATION - FILE-BY-FILE EXECUTION PLAN

**Status:** PHASE 1 ✅ Complete (Design System Foundation - globals.css updated)
**Next:** PHASE 2 - Core Routes (4-6 hours)

---

## PHASE 2: CORE MARKETPLACE & SELLERS ROUTES

### Priority Order (by user impact):

#### **2.1 MARKETPLACE ROUTE** (2 hours)
Files to update:
```
1. app/marketplace/page.tsx
   - Apply Marketplace.tsx UI structure from uirework
   - Preserve: API calls, state management, event handlers
   - Update: Grid layout, product card styling, filter UI, search bar
   - Status tokens: Use new CSS variables for product statuses

2. components/marketplace/Marketplace.tsx (MAIN FILE)
   - Complete redesign of marketplace container
   - Apply responsive grid (1→4 columns)
   - Update search bar styling
   - Update category filter UI
   - Update sort dropdown styling
   - Status: ~454 lines → will refactor while preserving logic

3. components/marketplace/ProductCard.tsx
   - Apply new card design from uirework
   - Update hover states, shadows
   - Apply new badge styling for stock status
   - Update color swatch UI
   - Status: ~203 lines

4. components/marketplace/ProductDetail.tsx
   - Apply modal design from uirework
   - Update image carousel styling
   - Update variant selector UI
   - Update quantity/button layout
   - Status: ~294 lines

5. components/marketplace/CartSidebar.tsx
   - Apply drawer design from uirework
   - Update item layout
   - Update totals section styling
   - Apply new button styling for checkout
   - Status: ~153 lines
```

#### **2.2 SELLERS LOGIN ROUTE** (1 hour)
Files to update:
```
1. app/sellers/login/page.tsx
   - Apply sellers login page layout from uirework
   - Preserve: Auth logic, API calls, navigation
   - Update: Form styling, input fields, button, background
   - Status: New structure needed

2. components/ (login form components if separate)
   - Apply form styling from uirework
   - Update input field styling
   - Update button styling
```

#### **2.3 SELLERS DASHBOARD LAYOUT** (1 hour)
Files to update:
```
1. app/sellers/dashboard/layout.tsx
   - Apply sidebar navigation layout from uirework
   - Preserve: Navigation structure, routing
   - Update: Sidebar styling, colors, typography, responsive behavior
   - Status: ~205 lines, critical layout file

2. components/ (sidebar/nav components if separate)
   - Update navigation styling
   - Apply primary color to active state
   - Update icon styling
```

#### **2.4 SELLERS DASHBOARD PAGES** (1.5 hours)
Files to update:
```
1. app/sellers/dashboard/page.tsx (Overview)
   - Apply dashboard overview layout from uirework
   - Update stats card styling
   - Update chart/graph styling
   - Preserve: Data queries, calculations

2. app/sellers/dashboard/orders/page.tsx
   - Apply order list table design from uirework
   - Update table styling, borders, spacing
   - Update status badge colors (use new CSS variables)
   - Preserve: API pagination, filtering, sorting logic
   - Status: ~485 lines

3. app/sellers/dashboard/orders/[id]/page.tsx
   - Apply order detail page design from uirework
   - Update OrderTimeline component styling
   - Update order info card styling
   - Preserve: State machine logic, API calls
   - Status: ~499 lines

4. app/sellers/dashboard/products/page.tsx
   - Apply products list design (table or grid)
   - Update product row/card styling
   - Update status indicators
   - Preserve: Filtering, search, pagination
   - Status: ~266 lines

5. app/sellers/dashboard/products/new/page.tsx
   - Apply form design from uirework
   - Update input field styling
   - Update image upload UI
   - Update submit button styling

6. app/sellers/dashboard/products/edit/page.tsx
   - Same as new/page.tsx but for edit flow

7. app/sellers/dashboard/customers/page.tsx
   - Apply customer list table design
   - Update table styling, status indicators
   - Preserve: API calls, filtering
   
8. app/sellers/dashboard/analytics/page.tsx
   - Apply analytics dashboard design
   - Update chart styling
   - Update metric cards

9. app/sellers/dashboard/settings/page.tsx
   - Apply settings page design
   - Update form fields and sections
```

---

## PHASE 3: CUSTOMER ROUTES (2-3 hours)

Files to update:
```
1. app/customers/login/page.tsx
   - Apply login page design from uirework
   - Preserve: Auth flow

2. app/customers/register/page.tsx
   - Apply registration form design
   - Preserve: Validation logic

3. app/customers/checkout/page.tsx
   - Apply checkout flow design
   - Update form styling, address inputs
   - Update summary section
   - Preserve: Payment logic, API calls

4. app/customers/orders/page.tsx
   - Apply customer orders list design
   - Update order card/table styling

5. app/customers/orders/[id]/page.tsx
   - Apply customer order detail design
   - Update timeline styling
   - Update order summary
```

---

## PHASE 4: REMAINING ROUTES & ADMIN (1-2 hours)

Files to update:
```
1. components/ProfileDropdown.tsx
   - Apply dropdown styling from uirework
   - Update avatar styling
   - Update menu item styling

2. app/admin/page.tsx (if exists)
   - Apply admin dashboard design

3. app/page.tsx (home)
   - Apply home page design if needed

4. components/ shared components
   - Update any shared UI components with new styling
```

---

## PHASE 5: VERIFICATION & TESTING (1 hour)

For EACH major file group:
- [ ] Authentication still redirects correctly
- [ ] API calls execute and receive data
- [ ] State management works (cart, user session, etc.)
- [ ] Routing works between pages
- [ ] Forms submit correctly
- [ ] Tables/lists load and display data
- [ ] Modals/drawers open and close
- [ ] Status colors display correctly
- [ ] Responsive design works on mobile
- [ ] Dark mode still functions (if applicable)

---

## DETAILED CHECKLIST - READY TO START

**Current Status:**
- ✅ PHASE 1: Design System (colors, typography, spacing, animations, status tokens)
- ⏳ PHASE 2: Ready to start marketplace & sellers routes
- ⏳ PHASE 3: Customer routes
- ⏳ PHASE 4: Admin & shared components
- ⏳ PHASE 5: Verification & testing

**Files to be modified:** ~40+ files across all phases
**Estimated time:** 7-10 hours total
**Risk level:** LOW (all logic preserved, UI layer only)
**Rollback:** Easy (git diff available after each phase)

---

## CRITICAL NOTES

1. **ALL API calls, authentication, routing, state management = PRESERVED**
2. **UI layer ONLY = UPDATED** (JSX structure, Tailwind classes, styling)
3. **Component props and handlers = UNCHANGED** (business logic intact)
4. **Each file will have output confirming functionality preserved**

Ready to proceed with PHASE 2: MARKETPLACE ROUTE ✅
