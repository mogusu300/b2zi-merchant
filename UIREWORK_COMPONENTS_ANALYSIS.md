# UIREWORK COMPONENTS ANALYSIS

## PAGE & LAYOUT COMPONENTS

### Root Layout
```
COMPONENT: RootLayout
PATH: uirework/app/layout.tsx
RENDERS: HTML document structure with Geist fonts, metadata, and analytics integration
KEY_CLASSES: font-sans, antialiased
KEY_PATTERNS: layout, document structure, font setup, metadata configuration
```

### Home Page (Redirect)
```
COMPONENT: Page (Home)
PATH: uirework/app/page.tsx
RENDERS: Redirect component that navigates to /marketplace on mount
KEY_CLASSES: (none - functional redirect only)
KEY_PATTERNS: redirect, client-side navigation, useRouter hook
```

---

## MARKETPLACE COMPONENTS

### Marketplace Container
```
COMPONENT: Marketplace
PATH: uirework/components/marketplace/Marketplace.tsx
RENDERS: Full marketplace grid with product cards, filters, search, categories, cart sidebar, and product detail modal
KEY_CLASSES: min-h-screen, max-w-7xl, mx-auto, px-4, sticky, z-40, border-b, border-gray-200, bg-white, flex, items-center, justify-between, gap-4, px-4, py-2.5, rounded-lg, transition-all, shadow-sm, hover:shadow-md, py-12, space-y-6, grid, grid-cols-1, sm:grid-cols-2, lg:grid-cols-4, gap-6, animate-spin, border-4, border-gray-300, border-t-[#2e3621]
KEY_PATTERNS: grid layout, product grid, sticky navigation, search bar, category filters, sort dropdown, responsive grid (1 col mobile -> 4 col desktop), modal overlay, sidebar drawer, loading spinner, session hooks, favorites tracking, cart management
```

### Product Card
```
COMPONENT: ProductCard
PATH: uirework/components/marketplace/ProductCard.tsx
RENDERS: Individual product card with image, name, price, color swatches, quantity controls, favorite button, add-to-cart button, stock badge
KEY_CLASSES: h-full, flex, flex-col, bg-background, rounded-xl, overflow-hidden, border, border-border, transition-all, hover:border-primary/60, hover:shadow-md, group, cursor-pointer, relative, overflow-hidden, bg-secondary, aspect-square, flex-shrink-0, w-full, h-full, object-cover, group-hover:scale-105, transition-transform, absolute, top-3, right-3, bg-success, text-background, px-2.5, py-1, rounded-md, text-xs, font-semibold, shadow-sm, absolute, inset-0, bg-black/50, flex, items-center, justify-center, absolute, top-3, left-3, p-2, bg-background, rounded-lg, shadow-sm, hover:shadow-md, hover:scale-110, w-4, h-4, transition-all, fill-accent, text-accent, absolute, bottom-3, left-3, flex, gap-1.5, bg-background/95, rounded-lg, p-2, shadow-sm, w-5, h-5, rounded-md, border, border-border, cursor-pointer, hover:border-primary/70, hover:scale-110, line-clamp-2, text-sm, font-semibold, text-muted-foreground, p-3, space-y-2, gap-2, h-8, rounded-md, bg-secondary/50, w-6, text-center, font-semibold, text-xs, flex-1, px-3, py-2, bg-primary, text-primary-foreground, hover:bg-primary/90, disabled:opacity-50
KEY_PATTERNS: card, product display, image gallery, color swatches, quantity selector, favorite toggle, stock status badge, hover effects, responsive image scaling, price display, add-to-cart action
```

### Product Detail Modal
```
COMPONENT: ProductDetail
PATH: uirework/components/marketplace/ProductDetail.tsx
RENDERS: Full-screen modal dialog with large product image carousel, variant selectors (color/size), price, rating, description, quantity controls, and add-to-cart button
KEY_CLASSES: fixed, inset-0, bg-black/40, backdrop-blur-sm, z-50, flex, items-center, justify-center, p-4, animate-in, fade-in, bg-background, rounded-2xl, max-w-2xl, w-full, max-h-[90vh], overflow-y-auto, shadow-xl, sticky, top-0, flex, justify-end, p-4, border-b, border-border, p-6, md:p-8, mb-8, relative, w-full, aspect-square, bg-secondary, rounded-xl, overflow-hidden, w-full, h-full, object-cover, absolute, left-3, top-1/2, -translate-y-1/2, p-2, bg-background, hover:bg-secondary, rounded-lg, shadow-sm, border, border-border, transition-all, hover:scale-105, w-5, h-5, text-foreground, absolute, right-3, top-1/2, -translate-y-1/2, space-y-4, flex, flex-wrap, gap-2, px-3, py-1.5, rounded-lg, border, border-border, bg-background, cursor-pointer, hover:border-primary/60, transition-all, text-sm, font-medium, h-10, px-4, bg-primary, text-primary-foreground, hover:bg-primary/90, w-full, flex, items-center, justify-center
KEY_PATTERNS: modal dialog, image carousel with navigation, product image gallery, variant selector, color picker, size selector, rating display, quantity controls, price display, add-to-cart action, image counter, thumbnail navigation, backdrop blur overlay
```

### Cart Sidebar
```
COMPONENT: CartSidebar
PATH: uirework/components/marketplace/CartSidebar.tsx
RENDERS: Right-side sliding drawer containing cart items list, quantity controls, remove buttons, empty state, and checkout button
KEY_CLASSES: fixed, inset-0, bg-black/40, backdrop-blur-sm, z-40, animate-in, fade-in, fixed, right-0, top-0, h-screen, w-full, max-w-sm, bg-background, border-l, border-border, z-50, flex, flex-col, transition-transform, animate-in, slide-in-from-right-full, translate-x-0, translate-x-full, flex, items-center, justify-between, p-6, border-b, border-border, text-xl, font-bold, text-foreground, p-1.5, hover:bg-secondary, rounded-lg, transition-colors, w-5, h-5, text-muted-foreground, flex-1, overflow-y-auto, p-6, space-y-4, flex, flex-col, items-center, justify-center, h-full, text-center, w-14, h-14, bg-secondary, rounded-xl, flex, items-center, justify-center, text-2xl, mb-4, text-foreground, font-semibold, text-sm, mb-1, text-muted-foreground, text-xs, mb-2, text-sm, font-medium, border, border-border, rounded-lg, p-3.5, space-y-3, w-full, aspect-square, object-cover, rounded-lg, bg-secondary, font-semibold, text-foreground, text-sm, line-clamp-2, mb-1, text-xs, text-muted-foreground, mb-2, sm, font-medium, text-foreground, flex, items-center, gap-2, border, border-border, rounded-lg, bg-secondary/50, p-1.5, hover:bg-secondary, transition-colors, w-3.5, h-3.5, text-muted-foreground, w-6, text-center, font-semibold, text-xs, text-foreground, w-10, border, border-destructive, rounded-lg, hover:bg-destructive/10, transition-colors
KEY_PATTERNS: sidebar, drawer, slide-in from right, cart management, item list, quantity controls, remove functionality, empty state, checkout button, authentication check, total calculation, price formatting
```

---

## SELLER/ADMIN COMPONENTS

### Products Page Content
```
COMPONENT: ProductsPageContent
PATH: uirework/components/sellers/products-page-content.tsx
RENDERS: Product form page with image upload, color variants, type variants, category selection, and form fields for name/description/price/stock
KEY_CLASSES: space-y-6, max-w-4xl, mx-auto, p-6, bg-white, rounded-lg, shadow-sm, border, border-gray-200, text-2xl, font-bold, text-gray-900, mb-6, text-sm, text-gray-600, mb-4, space-y-4, flex, flex-col, gap-2, text-sm, font-medium, text-gray-700, w-full, px-3, py-2, border, border-gray-300, rounded-lg, focus:outline-none, focus:ring-2, focus:ring-[#2e3621], max-w-full, resize-none, h-24, gap-3, flex-wrap, relative, w-20, h-20, rounded-lg, border-2, border-dashed, border-gray-300, flex, items-center, justify-center, cursor-pointer, hover:border-[#2e3621], transition-colors, text-xs, text-gray-500, text-center, space-y-3, mt-4, flex, items-center, gap-2, text-sm, font-medium, text-gray-700, w-full, flex, gap-2, flex-1, px-3, py-2, border, border-gray-300, rounded-lg, focus:outline-none, bg-[#2e3621], text-white, px-4, py-2, rounded-lg, hover:bg-black, transition-colors, font-medium, text-sm, space-y-2, gap-2, px-3, py-1.5, text-xs, font-medium, rounded-lg, bg-gray-100, text-gray-700, flex, items-center, gap-1, cursor-pointer, hover:bg-gray-200, bg-blue-100, text-blue-700, bg-red-100, text-red-700, px-4, py-2, bg-blue-600, text-white, rounded-lg, hover:bg-blue-700, transition-colors, font-medium, text-sm, w-full, px-4, py-2, bg-[#2e3621], text-white, font-bold, rounded-lg, hover:bg-black, transition-colors
KEY_PATTERNS: form, product form, image upload, multi-image gallery, color variant management, type variant management, dropdown select, text input, textarea, submit button, loading state, error messages, back navigation, product editing
```

### Customers Page Content
```
COMPONENT: CustomersPageContent
PATH: uirework/components/sellers/customers-page-content.tsx
RENDERS: Customers data table with search, displaying customer name, email, total orders, total spent, and last order date
KEY_CLASSES: space-y-6, flex, flex-col, sm:flex-row, sm:items-center, sm:justify-between, gap-4, text-3xl, font-bold, text-foreground, text-muted-foreground, text-sm, mb-4, flex, items-center, gap-2, flex-1, border, border-border, rounded-lg, px-3, py-2, placeholder:text-muted-foreground, w-4, h-4, text-muted-foreground, flex, gap-2, px-3, py-1.5, rounded-lg, text-xs, font-medium, bg-blue-100, text-blue-700, bg-green-100, text-green-700, bg-gray-100, text-gray-700, bg-card, rounded-lg, border, border-border, overflow-hidden, shadow-sm, flex, flex-col, items-center, justify-center, py-8, text-muted-foreground, w-5, h-5, mr-2, text-card-foreground, font-semibold, text-sm, w-full, border-collapse, text-sm, text-muted-foreground, border-b, border-border, px-4, py-3, text-left, font-medium, text-foreground, text-card-foreground, py-4, border-b, border-border, last:border-b-0, hover:bg-muted/50, transition-colors, cursor-pointer, text-sm, font-mono, text-muted-foreground, flex, items-center, gap-1, rounded-full, text-xs, font-semibold, px-2.5, py-1
KEY_PATTERNS: table, data table, customer list, search filter, status badges, customer stats, last order tracking, responsive table, pagination, click rows, customer information display, email display
```

### Orders Timeline
```
COMPONENT: OrderTimeline
PATH: uirework/components/orders/OrderTimeline.tsx
RENDERS: Vertical timeline of order status events (created, approved, rejected, paid, dispatched, in-transit, delivered, cancelled) with animated events
KEY_CLASSES: space-y-0, flex, items-center, justify-center, py-8, text-gray-500, w-5, h-5, mr-2, border-l-2, border-l-blue-500, pl-6, relative, space-y-2, before:content-[''], before:absolute, before:left-0, before:top-0, before:bottom-0, before:w-0.5, before:bg-gradient-to-b, before:from-blue-500, before:to-gray-300, flex, items-start, relative, z-10, absolute, -left-3, top-2, w-5, h-5, rounded-full, bg-blue-500, text-white, flex, items-center, justify-center, absolute, -left-7, top-1, z-20, bg-white, rounded-full, flex, items-center, justify-center, gap-3, flex-1, rounded-lg, border, border-blue-100, bg-blue-50, p-4, text-sm, text-gray-700, font-medium, text-xs, text-gray-500, mt-1, motion.div, className="space-y-0", variants=containerVariants, initial="hidden", animate="visible", motion.div, opacity-0, x-20, staggerChildren-0.1, opacity-1, x-0
KEY_PATTERNS: timeline, vertical timeline, event list, status progression, animated events, event icons, color-coded events, motion animations, status badges, actor labels, event timestamps, order progression tracking
```

---

## PROFILE & AUTHENTICATION COMPONENTS

### Profile Dropdown
```
COMPONENT: ProfileDropdown
PATH: uirework/components/ProfileDropdown.tsx
RENDERS: User profile button with dropdown menu showing user info, favorites count, settings link, logout button, and decorative gradient header
KEY_CLASSES: relative, p-2.5, hover:bg-gray-100, rounded-full, transition-all, w-10, h-10, rounded-full, bg-gradient-to-br, from-[#2e3621], to-[#b1c98d], flex, items-center, justify-center, text-white, shadow-md, group-hover:shadow-lg, w-5, h-5, absolute, bottom-0, right-0, w-3, h-3, bg-green-500, rounded-full, border-2, border-white, shadow-md, fixed, inset-0, z-30, absolute, right-0, mt-2, w-96, z-40, animate-in, fade-in, slide-in-from-top-2, duration-200, bg-white, rounded-2xl, shadow-2xl, border, border-gray-200, overflow-hidden, bg-gradient-to-r, from-[#2e3621], to-[#b1c98d], px-6, py-8, text-white, relative, overflow-hidden, absolute, top-0, right-0, w-24, h-24, bg-white/10, rounded-full, -mr-12, -mt-12, absolute, bottom-0, left-0, w-20, h-20, bg-white/5, rounded-full, -ml-8, -mb-8, relative, z-10, flex, items-center, gap-4, mb-6, w-16, h-16, rounded-2xl, bg-white/20, flex, items-center, justify-center, backdrop-blur-sm, border, border-white/30, w-8, h-8, text-white, flex-1, text-lg, font-bold, text-white, mb-1, text-white/80, text-sm, h-px, bg-white/20, mb-4, flex, gap-4, text-xs, text-white/70, font-semibold, uppercase, tracking-widest, flex-1, text-center, py-2, text-lg, font-bold, text-white, border-t, border-white/20, mt-4, pt-4, space-y-3, w-full, px-6, py-3, text-sm, text-gray-700, hover:bg-gray-50, transition-colors, flex, items-center, gap-3, w-4, h-4, text-gray-500, flex-1, w-4, h-4, text-muted-foreground
KEY_PATTERNS: dropdown menu, profile menu, user information display, gradient header, stats display, action buttons, logout functionality, favorite count, settings link, animated dropdown, backdrop click handler, avatar display, online indicator
```

### Theme Provider
```
COMPONENT: ThemeProvider
PATH: uirework/components/theme-provider.tsx
RENDERS: Theme provider wrapper using next-themes for dark/light mode support
KEY_CLASSES: (wrapper component - no classes)
KEY_PATTERNS: theme provider, dark mode support, next-themes integration, client-side provider
```

---

## UI PRIMITIVE COMPONENTS (SHADCN/UI BASED)

### Accordion
```
COMPONENT: Accordion, AccordionItem, AccordionTrigger, AccordionContent
PATH: uirework/components/ui/accordion.tsx
RENDERS: Collapsible accordion components with expand/collapse animation
KEY_CLASSES: w-full, flex, items-center, justify-between, py-4, font-medium, transition-all, hover:underline, text-sm
KEY_PATTERNS: accordion, collapsible, expand/collapse, animation, keyboard support
```

### Alert Dialog
```
COMPONENT: AlertDialog, AlertDialogTrigger, AlertDialogContent, AlertDialogHeader, AlertDialogTitle, AlertDialogDescription, AlertDialogAction, AlertDialogCancel
PATH: uirework/components/ui/alert-dialog.tsx
RENDERS: Modal dialog for confirmations with action and cancel buttons
KEY_CLASSES: fixed, inset-0, bg-black/50, z-50, flex, items-center, justify-center, bg-background, rounded-lg, shadow-lg, p-6, text-lg, font-semibold, text-muted-foreground, text-sm, px-4, py-2, rounded, font-medium
KEY_PATTERNS: modal dialog, confirmation dialog, alert, action buttons, backdrop overlay
```

### Alert
```
COMPONENT: Alert, AlertTitle, AlertDescription
PATH: uirework/components/ui/alert.tsx
RENDERS: Alert box with icon, title, and description
KEY_CLASSES: relative, w-full, rounded-lg, border, p-4, bg-background, text-foreground, font-semibold, text-sm, text-muted-foreground
KEY_PATTERNS: alert, message display, icon + text, information box, warning/error display
```

### Avatar
```
COMPONENT: Avatar, AvatarImage, AvatarFallback
PATH: uirework/components/ui/avatar.tsx
RENDERS: Circular avatar with image and fallback initials
KEY_CLASSES: relative, flex, h-10, w-10, shrink-0, overflow-hidden, rounded-full, bg-muted, w-full, h-full, object-cover, flex, items-center, justify-center, bg-muted, font-medium, text-xs, text-muted-foreground
KEY_PATTERNS: avatar, profile picture, circular image, initials fallback, user representation
```

### Badge
```
COMPONENT: Badge
PATH: uirework/components/ui/badge.tsx
RENDERS: Small inline status badge with variants (default, secondary, destructive, outline)
KEY_CLASSES: inline-flex, items-center, rounded-full, border, px-2.5, py-0.5, text-xs, font-semibold, transition-colors, w-fit
KEY_PATTERNS: badge, label, tag, status indicator, inline element
```

### Breadcrumb
```
COMPONENT: Breadcrumb, BreadcrumbList, BreadcrumbItem, BreadcrumbLink, BreadcrumbPage, BreadcrumbSeparator
PATH: uirework/components/ui/breadcrumb.tsx
RENDERS: Navigation breadcrumb trail showing current page location
KEY_CLASSES: flex, flex-wrap, items-center, gap-1.5, text-sm, text-muted-foreground, text-foreground
KEY_PATTERNS: breadcrumb, navigation trail, hierarchical navigation, current page indicator
```

### Button
```
COMPONENT: Button
PATH: uirework/components/ui/button.tsx
RENDERS: Reusable button component with multiple variants (default, destructive, outline, secondary, ghost, link) and sizes (default, sm, lg, icon)
KEY_CLASSES: inline-flex, items-center, justify-center, gap-2, whitespace-nowrap, rounded-md, text-sm, font-medium, transition-all, disabled:pointer-events-none, disabled:opacity-50, bg-primary, text-primary-foreground, hover:bg-primary/90, h-9, px-4, h-8, h-10
KEY_PATTERNS: button, action element, variant system, size variants, disabled state, icon support, focus states
```

### Button Group
```
COMPONENT: ButtonGroup, ButtonGroupItem
PATH: uirework/components/ui/button-group.tsx
RENDERS: Group of buttons displayed horizontally or vertically with proper spacing
KEY_CLASSES: flex, flex-row, flex-col, gap-2, items-center, justify-center
KEY_PATTERNS: button group, button cluster, action group, horizontal/vertical layout
```

### Calendar
```
COMPONENT: Calendar
PATH: uirework/components/ui/calendar.tsx
RENDERS: Interactive calendar for date selection
KEY_CLASSES: w-full, border, border-border, rounded-lg, p-3, bg-background, grid, grid-cols-7, gap-1, text-sm, font-semibold, text-center, py-2, rounded, hover:bg-accent, text-muted-foreground
KEY_PATTERNS: calendar, date picker, date selection, month navigation, grid layout
```

### Card
```
COMPONENT: Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter
PATH: uirework/components/ui/card.tsx
RENDERS: Container component with header, title, description, content, and footer sections
KEY_CLASSES: bg-card, text-card-foreground, flex, flex-col, gap-6, rounded-xl, border, py-6, shadow-sm, px-6, has-data-[slot=card-action]:grid-cols-[1fr_auto], leading-none, font-semibold, text-muted-foreground, text-sm
KEY_PATTERNS: card, container, section, content grouping, bordered box, shadow effect
```

### Carousel
```
COMPONENT: Carousel, CarouselContent, CarouselItem, CarouselPrevious, CarouselNext
PATH: uirework/components/ui/carousel.tsx
RENDERS: Image carousel with previous/next navigation buttons
KEY_CLASSES: relative, w-full, overflow-hidden, flex, items-center, justify-center, rounded-lg, bg-muted, aspect-square, p-4, h-12, w-12, rounded-lg, bg-background, hover:bg-accent
KEY_PATTERNS: carousel, image slider, navigation controls, previous/next buttons, overflow hidden
```

### Chart
```
COMPONENT: ChartContainer, ChartTooltip, ChartTooltipContent, ChartLegend, ChartLegendContent
PATH: uirework/components/ui/chart.tsx
RENDERS: Chart/graph wrapper with tooltip and legend support
KEY_CLASSES: relative, w-full, h-full, flex, flex-col, justify-center, items-center
KEY_PATTERNS: chart, data visualization, graph, tooltip, legend, responsive container
```

### Checkbox
```
COMPONENT: Checkbox
PATH: uirework/components/ui/checkbox.tsx
RENDERS: Form checkbox input with check icon
KEY_CLASSES: peer, h-4, w-4, shrink-0, rounded-sm, border, border-primary, ring-offset-background, cursor-pointer, disabled:cursor-not-allowed, disabled:opacity-50, peer-disabled:cursor-not-allowed, peer-disabled:opacity-50
KEY_PATTERNS: checkbox, form input, toggle, boolean input, checked state
```

### Collapsible
```
COMPONENT: Collapsible, CollapsibleTrigger, CollapsibleContent
PATH: uirework/components/ui/collapsible.tsx
RENDERS: Expandable/collapsible content section
KEY_CLASSES: w-full, cursor-pointer, flex, items-center, justify-between, py-4, font-medium, transition-all, hover:underline, overflow-hidden, data-[state=open]:animate-in, data-[state=closed]:animate-out
KEY_PATTERNS: collapsible, expandable, toggle content, animation, state management
```

### Command
```
COMPONENT: Command, CommandDialog, CommandInput, CommandList, CommandEmpty, CommandGroup, CommandItem, CommandSeparator, CommandShortcut
PATH: uirework/components/ui/command.tsx
RENDERS: Command palette / autocomplete search interface
KEY_CLASSES: flex, h-full, w-full, flex-col, overflow-hidden, rounded-md, bg-background, border, border-border, px-3, py-2, text-base, outline-none, placeholder:text-muted-foreground, disabled:cursor-not-allowed, disabled:opacity-50, px-2, py-1.5, text-sm, font-semibold, rounded, bg-secondary, text-muted-foreground
KEY_PATTERNS: command palette, autocomplete, search, keyboard navigation, command list, shortcuts
```

### Context Menu
```
COMPONENT: ContextMenu, ContextMenuTrigger, ContextMenuContent, ContextMenuItem, ContextMenuCheckboxItem, ContextMenuRadioItem, ContextMenuLabel, ContextMenuSeparator, ContextMenuShortcut, ContextMenuSub, ContextMenuSubContent, ContextMenuSubTrigger
PATH: uirework/components/ui/context-menu.tsx
RENDERS: Right-click context menu with submenu support
KEY_CLASSES: z-50, min-w-[8rem], overflow-hidden, rounded-md, border, border-border, bg-popover, p-1, text-popover-foreground, shadow-md, px-2, py-1.5, text-sm, rounded, cursor-pointer, select-none, relative, flex, items-center, gap-2
KEY_PATTERNS: context menu, right-click menu, submenu, keyboard shortcuts, hover states
```

### Dialog
```
COMPONENT: Dialog, DialogTrigger, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogClose
PATH: uirework/components/ui/dialog.tsx
RENDERS: Modal dialog component with overlay, header, and close button
KEY_CLASSES: fixed, inset-0, z-50, bg-black/50, fade-in-0, animate-in, animate-out, bg-background, gap-4, border, border-border, shadow-lg, duration-200, rounded-lg, max-w-lg, w-full, p-6, absolute, right-4, top-4, w-8, h-8, opacity-70, hover:opacity-100, text-lg, font-semibold, leading-none, tracking-tight, text-sm, text-muted-foreground, flex, items-center, justify-between, px-6, py-4, border-t, border-border
KEY_PATTERNS: modal dialog, overlay, centered dialog, focus trap, escape to close, header/footer sections
```

### Drawer
```
COMPONENT: Drawer, DrawerTrigger, DrawerContent, DrawerHeader, DrawerTitle, DrawerDescription, DrawerFooter, DrawerClose
PATH: uirework/components/ui/drawer.tsx
RENDERS: Side drawer/slide-out panel (mobile-optimized)
KEY_CLASSES: fixed, inset-0, z-50, bg-black/50, animate-in, animate-out, fixed, z-50, flex, h-auto, flex-col, rounded-t-lg, border-t, bg-background, data-[vaul-drawer-direction=top]:inset-x-0, data-[vaul-drawer-direction=top]:top-0, data-[vaul-drawer-direction=top]:rounded-b-lg, data-[vaul-drawer-direction=top]:border-b, p-4, text-lg, font-semibold, border-b, border-border, px-4, py-3
KEY_PATTERNS: drawer, slide-out panel, mobile drawer, side sheet, gesture support, flexible positioning
```

### Dropdown Menu
```
COMPONENT: DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem, DropdownMenuCheckboxItem, DropdownMenuRadioItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuShortcut, DropdownMenuGroup, DropdownMenuPortal, DropdownMenuSub, DropdownMenuSubContent, DropdownMenuSubTrigger
PATH: uirework/components/ui/dropdown-menu.tsx
RENDERS: Dropdown menu with items, submenus, checkboxes, and radio items
KEY_CLASSES: z-50, min-w-[8rem], overflow-hidden, rounded-md, border, border-border, bg-popover, p-1, text-popover-foreground, shadow-md, px-2, py-1.5, text-sm, rounded, cursor-pointer, select-none, relative, flex, items-center, gap-2, data-[disabled]:pointer-events-none, data-[disabled]:opacity-50, flex, h-6, items-center, justify-center
KEY_PATTERNS: dropdown menu, menu items, submenus, checkboxes, radio selection, keyboard navigation
```

### Empty
```
COMPONENT: Empty, EmptyIcon, EmptyTitle, EmptyDescription, EmptyAction
PATH: uirework/components/ui/empty.tsx
RENDERS: Empty state component with icon, title, description, and action button
KEY_CLASSES: flex, flex-col, items-center, justify-center, rounded-lg, border-2, border-dashed, border-border, bg-muted/50, p-8, text-center, h-40, text-4xl, font-bold, text-foreground, text-sm, text-muted-foreground, mt-2, mb-4
KEY_PATTERNS: empty state, placeholder, no data state, icon + message, action button, dashed border
```

### Field
```
COMPONENT: Field, FieldGroup, FieldLabel, FieldDescription, FieldError
PATH: uirework/components/ui/field.tsx
RENDERS: Form field wrapper with label, description, error, and input grouping
KEY_CLASSES: space-y-1, flex, flex-col, gap-1.5, text-sm, font-medium, text-foreground, text-xs, text-muted-foreground, text-red-500, flex, items-center, gap-2, px-3, py-2, border, border-border, rounded-lg
KEY_PATTERNS: form field, input wrapper, label + input, error messages, description text, grouped inputs
```

### Form
```
COMPONENT: Form, FormField, FormItem, FormLabel, FormControl, FormDescription, FormMessage
PATH: uirework/components/ui/form.tsx
RENDERS: React Hook Form integration wrapper with validation
KEY_CLASSES: space-y-6, flex, flex-col, gap-2, w-full, text-sm, font-medium, text-foreground, text-xs, text-muted-foreground, text-sm, text-destructive, font-medium
KEY_PATTERNS: form, react-hook-form integration, field validation, error messages, label association, form state
```

### Hover Card
```
COMPONENT: HoverCard, HoverCardTrigger, HoverCardContent
PATH: uirework/components/ui/hover-card.tsx
RENDERS: Card that appears on hover with additional information
KEY_CLASSES: z-50, w-64, rounded-md, border, border-border, bg-popover, p-4, text-popover-foreground, shadow-md, outline-none, data-[state=open]:animate-in, data-[state=closed]:animate-out
KEY_PATTERNS: hover card, tooltip alternative, additional info, hover trigger, animation
```

### Input
```
COMPONENT: Input
PATH: uirework/components/ui/input.tsx
RENDERS: Text input field with styling and focus states
KEY_CLASSES: border-input, h-9, w-full, rounded-md, border, bg-transparent, px-3, py-1, text-base, placeholder:text-muted-foreground, transition-all, focus-visible:border-ring, focus-visible:ring-ring/50, focus-visible:ring-[3px], disabled:cursor-not-allowed, disabled:opacity-50
KEY_PATTERNS: input field, text input, form control, focus states, placeholder text, disabled state
```

### Input Group
```
COMPONENT: InputGroup, InputGroupIcon, InputGroupPrefix, InputGroupSuffix, InputGroupButton
PATH: uirework/components/ui/input-group.tsx
RENDERS: Input with prefix/suffix icons and buttons
KEY_CLASSES: relative, flex, items-center, w-full, rounded-md, border, border-border, bg-transparent, has-[:disabled]:opacity-50, px-0, py-1, pr-3, pl-3, text-muted-foreground, pointer-events-none, flex, items-center, justify-center, absolute, left-3, top-1/2, -translate-y-1/2
KEY_PATTERNS: input group, input with icon, input with prefix/suffix, grouped controls
```

### Input OTP
```
COMPONENT: InputOTP, InputOTPGroup, InputOTPSlot, InputOTPSeparator
PATH: uirework/components/ui/input-otp.tsx
RENDERS: One-time password input with multiple slots
KEY_CLASSES: flex, items-center, gap-2, w-8, h-10, rounded-lg, border, border-input, bg-transparent, text-center, text-sm, font-medium, tabindex-0, z-10, focus-visible:outline-none, focus-visible:ring-1, focus-visible:ring-ring, aria-disabled:cursor-not-allowed, aria-disabled:opacity-50, w-1, h-6, bg-muted
KEY_PATTERNS: OTP input, one-time password, multi-slot input, code entry
```

### Item
```
COMPONENT: Item, ItemIcon, ItemTitle, ItemDescription
PATH: uirework/components/ui/item.tsx
RENDERS: List item component with icon, title, and description
KEY_CLASSES: flex, items-start, gap-3, px-4, py-2, rounded, hover:bg-accent, cursor-pointer, transition-colors, w-5, h-5, text-muted-foreground, flex-shrink-0, mt-0.5, text-sm, font-medium, text-foreground, text-xs, text-muted-foreground
KEY_PATTERNS: list item, icon + title + description, hoverable item, selectable item
```

### KBD (Keyboard)
```
COMPONENT: Kbd, KbdGroup
PATH: uirework/components/ui/kbd.tsx
RENDERS: Keyboard key display for shortcuts (e.g., Cmd+K)
KEY_CLASSES: rounded, border, border-border, bg-muted, px-2, py-1, font-mono, text-xs, font-semibold, text-muted-foreground, inline-flex, gap-1, items-center
KEY_PATTERNS: keyboard key, shortcut display, command key, modifier keys
```

### Label
```
COMPONENT: Label
PATH: uirework/components/ui/label.tsx
RENDERS: Form label element with styling
KEY_CLASSES: text-sm, font-medium, leading-none, peer-disabled:cursor-not-allowed, peer-disabled:opacity-70, cursor-pointer
KEY_PATTERNS: form label, input label, accessibility, cursor pointer
```

### Menubar
```
COMPONENT: Menubar, MenubarMenu, MenubarTrigger, MenubarContent, MenubarItem, MenubarCheckboxItem, MenubarRadioItem, MenubarLabel, MenubarSeparator, MenubarShortcut, MenubarSub, MenubarSubContent, MenubarSubTrigger
PATH: uirework/components/ui/menubar.tsx
RENDERS: Horizontal menu bar similar to desktop applications
KEY_CLASSES: flex, h-10, items-center, gap-1, rounded-md, border, border-border, bg-background, p-1, px-2, py-1.5, text-sm, outline-none, focus:bg-accent, data-[state=open]:bg-accent, z-50, min-w-[12rem], overflow-hidden, rounded-md, border, border-border, bg-popover, p-1, text-popover-foreground, shadow-md
KEY_PATTERNS: menubar, horizontal menu, desktop-like menu, submenus, keyboard navigation
```

### Navigation Menu
```
COMPONENT: NavigationMenu, NavigationMenuList, NavigationMenuItem, NavigationMenuTrigger, NavigationMenuContent, NavigationMenuLink, NavigationMenuIndicator, NavigationMenuViewport
PATH: uirework/components/ui/navigation-menu.tsx
RENDERS: Horizontal navigation with megamenu support
KEY_CLASSES: z-10, flex, max-w-max, flex-1, items-center, justify-center, rounded-md, bg-muted, p-1, text-muted-foreground, relative, flex, items-center, justify-between, gap-0.5, rounded-md, px-4, py-2, text-sm, font-medium, outline-none, transition-colors, hover:bg-accent, focus:bg-accent, data-[state=open]:bg-accent, z-40, w-full, md:absolute, md:w-auto, min-w-[500px], rounded-md, border, border-border, bg-popover, p-4, text-popover-foreground, shadow-md
KEY_PATTERNS: navigation menu, megamenu, horizontal nav, submenu, keyboard support
```

### Pagination
```
COMPONENT: Pagination, PaginationContent, PaginationItem, PaginationLink, PaginationPrevious, PaginationNext, PaginationEllipsis
PATH: uirework/components/ui/pagination.tsx
RENDERS: Pagination controls with previous/next and page numbers
KEY_CLASSES: flex, w-full, items-center, justify-center, gap-1, flex, items-center, gap-1, h-9, w-9, p-0, rounded-md, border, border-input, hover:bg-accent, flex, items-center, justify-center, text-sm, font-medium, gap-1
KEY_PATTERNS: pagination, page numbers, previous/next buttons, navigation controls
```

### Popover
```
COMPONENT: Popover, PopoverTrigger, PopoverContent, PopoverAnchor
PATH: uirework/components/ui/popover.tsx
RENDERS: Floating popover panel triggered by click or hover
KEY_CLASSES: z-50, w-72, rounded-md, border, border-border, bg-popover, p-4, text-popover-foreground, shadow-md, outline-none, data-[state=open]:animate-in, data-[state=closed]:animate-out, data-[side=bottom]:slide-in-from-top-2, data-[side=left]:slide-in-from-right-2, data-[side=right]:slide-in-from-left-2, data-[side=top]:slide-in-from-bottom-2
KEY_PATTERNS: popover, floating panel, position-aware, animation, positioned overlay
```

### Progress
```
COMPONENT: Progress
PATH: uirework/components/ui/progress.tsx
RENDERS: Linear progress bar
KEY_CLASSES: relative, h-2, w-full, overflow-hidden, rounded-full, bg-muted, h-full, w-full, flex-1, bg-primary, transition-all
KEY_PATTERNS: progress bar, loading indicator, percentage display, linear progress
```

### Radio Group
```
COMPONENT: RadioGroup, RadioGroupItem
PATH: uirework/components/ui/radio-group.tsx
RENDERS: Radio button group for single selection
KEY_CLASSES: flex, items-center, space-x-2, peer, h-4, w-4, rounded-full, border, border-primary, ring-offset-background, cursor-pointer, disabled:cursor-not-allowed, disabled:opacity-50, peer-disabled:cursor-not-allowed, peer-disabled:opacity-50, h-2, w-2, rounded-full, bg-primary
KEY_PATTERNS: radio group, radio button, single selection, grouped radios
```

### Resizable
```
COMPONENT: ResizablePanelGroup, ResizablePanel, ResizableHandle
PATH: uirework/components/ui/resizable.tsx
RENDERS: Resizable panel layout with drag handles
KEY_CLASSES: flex, data-[orientation=vertical]:flex-col, group, relative, w-full, h-full, w-1, select-none, touch-none, cursor-col-resize, bg-border, rounded-sm, group-hover:bg-primary
KEY_PATTERNS: resizable panels, flexible layout, drag handles, panel groups
```

### Scroll Area
```
COMPONENT: ScrollArea, ScrollBar
PATH: uirework/components/ui/scroll-area.tsx
RENDERS: Scrollable area with custom scrollbar styling
KEY_CLASSES: relative, w-full, h-full, overflow-hidden, absolute, top-0, right-0, bottom-0, w-2.5, touch-none, select-none, transition-colors, bg-border, hover:bg-muted-foreground/30
KEY_PATTERNS: scroll area, custom scrollbar, overflow container, styled scrolling
```

### Select
```
COMPONENT: Select, SelectGroup, SelectValue, SelectTrigger, SelectContent, SelectItem, SelectLabel, SelectSeparator, SelectScrollUpButton, SelectScrollDownButton
PATH: uirework/components/ui/select.tsx
RENDERS: Dropdown select component with grouping and search support
KEY_CLASSES: flex, h-9, w-full, rounded-md, border, border-input, bg-transparent, px-3, py-2, text-sm, placeholder:text-muted-foreground, focus:outline-none, focus:ring-1, focus:ring-ring, disabled:cursor-not-allowed, disabled:opacity-50, z-50, max-h-[300px], w-[var(--radix-select-trigger-width)], min-w-[8rem], overflow-hidden, rounded-md, border, border-border, bg-popover, p-1, text-popover-foreground, shadow-md, py-1.5, pl-8, pr-2, text-sm
KEY_PATTERNS: select dropdown, option selection, groups, search, keyboard navigation
```

### Separator
```
COMPONENT: Separator
PATH: uirework/components/ui/separator.tsx
RENDERS: Horizontal or vertical dividing line
KEY_CLASSES: shrink-0, bg-border, data-[orientation=horizontal]:h-px, data-[orientation=horizontal]:w-full, data-[orientation=vertical]:h-full, data-[orientation=vertical]:w-px
KEY_PATTERNS: divider, separator line, visual divider, horizontal/vertical
```

### Sheet
```
COMPONENT: Sheet, SheetTrigger, SheetContent, SheetHeader, SheetTitle, SheetDescription, SheetFooter, SheetClose
PATH: uirework/components/ui/sheet.tsx
RENDERS: Side sheet panel (alias for Drawer)
KEY_CLASSES: fixed, z-50, bg-black/50, animate-in, animate-out, fixed, z-50, gap-4, border, border-border, bg-background, shadow-lg, p-4, flex, items-center, justify-between, border-b, border-border, text-lg, font-semibold, text-sm, text-muted-foreground, flex, items-center, justify-between
KEY_PATTERNS: sheet, side panel, overlay, modal sheet
```

### Sidebar
```
COMPONENT: Sidebar, SidebarProvider, SidebarTrigger, SidebarContent, SidebarGroup, SidebarGroupLabel, SidebarGroupContent, SidebarMenu, SidebarMenuItem, SidebarMenuButton, SidebarMenuSub, SidebarMenuSubItem, SidebarFooter, SidebarRail, useSidebar
PATH: uirework/components/ui/sidebar.tsx
RENDERS: Collapsible sidebar navigation with menu groups and items
KEY_CLASSES: group/sidebar-wrapper, flex, h-full, w-full, overflow-hidden, has-data-[variant=inset]:bg-muted, fixed, inset-y-0, left-0, z-10, w-16rem, bg-background, border-r, border-border, transition-all, duration-300, group-data-[state=collapsed]/sidebar-wrapper:w-3rem, group-data-[state=collapsed]/sidebar-wrapper:overflow-hidden, flex, flex-col, w-full, h-full, gap-4, px-4, py-4, flex, items-center, gap-2, px-2, py-1.5, text-sm, font-medium, rounded-lg, hover:bg-accent, cursor-pointer
KEY_PATTERNS: sidebar, navigation sidebar, collapsible menu, menu groups, responsive sidebar, mobile drawer
```

### Skeleton
```
COMPONENT: Skeleton
PATH: uirework/components/ui/skeleton.tsx
RENDERS: Loading placeholder component
KEY_CLASSES: rounded-md, bg-muted, animate-pulse, h-12, w-12, rounded-full
KEY_PATTERNS: skeleton, loading placeholder, placeholder animation, content placeholder
```

### Slider
```
COMPONENT: Slider
PATH: uirework/components/ui/slider.tsx
RENDERS: Range slider for value selection
KEY_CLASSES: relative, flex, w-full, touch-none, select-none, items-center, h-2, w-full, rounded-full, bg-muted, relative, h-5, w-5, rounded-full, border-2, border-primary, bg-background, ring-offset-background, cursor-pointer, disabled:pointer-events-none, disabled:opacity-50, focus-visible:outline-none, focus-visible:ring-2, focus-visible:ring-ring
KEY_PATTERNS: slider, range slider, value selection, draggable handle, interactive range
```

### Spinner
```
COMPONENT: Spinner
PATH: uirework/components/ui/spinner.tsx
RENDERS: Loading spinner animation
KEY_CLASSES: inline-block, animate-spin, rounded-full, border-2, border-muted, border-t-primary, h-4, w-4
KEY_PATTERNS: spinner, loading indicator, animated spinner, circular loading
```

### Sonner Toaster
```
COMPONENT: Toaster
PATH: uirework/components/ui/sonner.tsx
RENDERS: Toast notification container using Sonner library
KEY_CLASSES: (container component, no visible classes)
KEY_PATTERNS: toast notifications, notification queue, notification provider
```

### Switch
```
COMPONENT: Switch
PATH: uirework/components/ui/switch.tsx
RENDERS: Toggle switch for boolean input
KEY_CLASSES: peer, inline-flex, h-6, w-11, shrink-0, cursor-pointer, items-center, rounded-full, border-2, border-transparent, transition-colors, focus-visible:outline-none, focus-visible:ring-2, focus-visible:ring-ring, disabled:cursor-not-allowed, disabled:opacity-50, data-[state=checked]:bg-primary, h-5, w-5, rounded-full, bg-background, shadow-lg, ring-0, transition-transform, data-[state=checked]:translate-x-5
KEY_PATTERNS: switch, toggle, boolean input, on/off state
```

### Table
```
COMPONENT: Table, TableHeader, TableBody, TableFooter, TableHead, TableRow, TableCell, TableCaption
PATH: uirework/components/ui/table.tsx
RENDERS: HTML table with proper styling and structure
KEY_CLASSES: w-full, caption-bottom, text-sm, border-collapse, border-b, text-left, align-middle, font-medium, bg-muted/50, text-muted-foreground, border-t, border-b, p-4, text-table-foreground, [&_tr:last-child]:border-0
KEY_PATTERNS: table, data table, columns, rows, cells, headers, footers
```

### Tabs
```
COMPONENT: Tabs, TabsList, TabsTrigger, TabsContent
PATH: uirework/components/ui/tabs.tsx
RENDERS: Tab interface for switching between content sections
KEY_CLASSES: inline-flex, h-10, items-center, justify-center, rounded-md, bg-muted, p-1, text-muted-foreground, inline-flex, items-center, justify-center, whitespace-nowrap, rounded-sm, px-3, py-1.5, text-sm, font-medium, ring-offset-background, transition-all, focus-visible:outline-none, focus-visible:ring-2, focus-visible:ring-ring, disabled:pointer-events-none, disabled:opacity-50, data-[state=active]:bg-background, data-[state=active]:text-foreground, data-[state=active]:shadow-sm
KEY_PATTERNS: tabs, tab navigation, content switching, tab list, tab panels
```

### Textarea
```
COMPONENT: Textarea
PATH: uirework/components/ui/textarea.tsx
RENDERS: Multi-line text input
KEY_CLASSES: border-input, flex, min-h-[80px], w-full, rounded-md, border, bg-transparent, px-3, py-2, text-base, placeholder:text-muted-foreground, focus-visible:outline-none, focus-visible:ring-1, focus-visible:ring-ring, disabled:cursor-not-allowed, disabled:opacity-50, md:text-sm
KEY_PATTERNS: textarea, multi-line input, text input, form control
```

### Toast
```
COMPONENT: Toast, ToastAction, ToastClose, ToastDescription, ToastTitle, ToastProvider, ToastViewport, useToast
PATH: uirework/components/ui/toast.tsx
RENDERS: Toast notification component with action and close buttons
KEY_CLASSES: pointer-events-auto, relative, flex, w-full, items-center, justify-between, gap-4, overflow-hidden, rounded-md, border, border-border, bg-background, p-4, text-foreground, shadow-lg, group, data-[swipe=move]:translate-x-[var(--radix-toast-swipe-move)], data-[swipe=cancel]:translate-x-0, data-[swipe=end]:translate-x-[var(--radix-toast-swipe-end)], data-[state=open]:animate-in, data-[state=closed]:animate-out
KEY_PATTERNS: toast, notification, temporary message, action button, close button
```

### Toaster
```
COMPONENT: Toaster
PATH: uirework/components/ui/toaster.tsx
RENDERS: Toast container and state management
KEY_CLASSES: (container component)
KEY_PATTERNS: toast container, toast queue, notification system
```

### Toggle
```
COMPONENT: Toggle
PATH: uirework/components/ui/toggle.tsx
RENDERS: Toggle button that switches between pressed/unpressed states
KEY_CLASSES: inline-flex, items-center, justify-center, rounded-md, text-sm, font-medium, ring-offset-background, transition-colors, hover:bg-muted, focus-visible:outline-none, focus-visible:ring-2, focus-visible:ring-ring, disabled:pointer-events-none, disabled:opacity-50, data-[state=on]:bg-accent, data-[state=on]:text-accent-foreground, h-10, px-3, min-w-10, h-9, px-2.5, h-11, px-5
KEY_PATTERNS: toggle button, pressed state, button group toggle, accent state
```

### Toggle Group
```
COMPONENT: ToggleGroup, ToggleGroupItem
PATH: uirework/components/ui/toggle-group.tsx
RENDERS: Group of toggle buttons with single or multiple selection
KEY_CLASSES: flex, items-center, justify-center, rounded-md, bg-muted, p-1, text-muted-foreground, inline-flex, items-center, justify-center, rounded-sm, px-3, py-2, text-sm, font-medium, ring-offset-background, transition-all, focus-visible:outline-none, focus-visible:ring-2, focus-visible:ring-ring, disabled:pointer-events-none, disabled:opacity-50, data-[state=on]:bg-accent, data-[state=on]:text-accent-foreground
KEY_PATTERNS: toggle group, button group, single/multiple selection, segmented control
```

### Tooltip
```
COMPONENT: Tooltip, TooltipTrigger, TooltipContent, TooltipProvider
PATH: uirework/components/ui/tooltip.tsx
RENDERS: Tooltip that appears on hover with positioned content
KEY_CLASSES: z-50, overflow-hidden, rounded-md, border, border-border, bg-popover, px-3, py-1.5, text-sm, text-popover-foreground, shadow-md, animate-in, fade-in-0, zoom-in-95, data-[state=closed]:animate-out, data-[state=closed]:fade-out-0, data-[state=closed]:zoom-out-95, data-[side=bottom]:slide-in-from-top-2, data-[side=left]:slide-in-from-right-2, data-[side=right]:slide-in-from-left-2, data-[side=top]:slide-in-from-bottom-2
KEY_PATTERNS: tooltip, hover info, positioned overlay, animation, accessibility
```

### Use Mobile Hook
```
COMPONENT: useIsMobile
PATH: uirework/components/ui/use-mobile.tsx
RENDERS: Hook to detect if viewport is mobile size
KEY_CLASSES: (hook - no JSX)
KEY_PATTERNS: hook, responsive detection, media query, mobile breakpoint
```

### Use Toast Hook
```
COMPONENT: useToast
PATH: uirework/components/ui/use-toast.ts
RENDERS: Hook for triggering toast notifications
KEY_CLASSES: (hook - no JSX)
KEY_PATTERNS: hook, notification trigger, toast management, state management
```

---

## SUMMARY STATISTICS

**Total Components: 67**

### By Category:
- **Page/Layout**: 2 files
- **Marketplace**: 4 files  
- **Sellers/Admin**: 2 files
- **Orders**: 1 file
- **Profile/Auth**: 2 files
- **UI Primitives**: 56 files

### Key Patterns Used:
- Grid layouts (product grids, responsive grids)
- Cards (product cards, info cards)
- Modals & Dialogs
- Drawers & Sidebars
- Forms (inputs, selects, checkboxes, radio groups)
- Tables (data display, customer lists)
- Navigation (menus, breadcrumbs, pagination)
- Animations (Framer Motion, CSS transitions)
- Status badges & indicators
- Loading spinners & skeletons
- Tooltips & popovers
- Notifications (toasts)
- Collapsibles & accordions
- Command palettes & autocomplete

### Primary Tailwind Classes Used:
- **Layout**: `flex`, `grid`, `space-*`, `gap-*`, `p-*`, `m-*`
- **Positioning**: `fixed`, `absolute`, `relative`, `sticky`, `z-*`
- **Sizing**: `w-*`, `h-*`, `max-w-*`, `min-h-*`
- **Styling**: `rounded-*`, `border-*`, `bg-*`, `text-*`, `shadow-*`
- **States**: `hover:*`, `focus:*`, `disabled:*`, `data-*:*`
- **Animations**: `animate-*`, `transition-*`, `duration-*`
- **Responsive**: `sm:*`, `md:*`, `lg:*`

### Design System:
- **Color Palette**: Primary (#2e3621 - dark green), Accent (#b1c98d - light green), with semantic colors (success, destructive, warning)
- **Typography**: System fonts with Geist font family
- **Spacing**: Consistent spacing scale
- **Shadows**: Subtle shadows for depth (shadow-sm, shadow-md, shadow-lg, shadow-xl)
- **Borders**: Subtle 1px borders with rounded corners
- **Animations**: Smooth transitions and Framer Motion integration
