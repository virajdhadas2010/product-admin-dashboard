# AdminPulse - Product Admin Dashboard

A high-performance, responsive Product Admin Dashboard built for the **Nexgensis Technologies** Frontend Assignment using **Next.js (App Router)**, **React 19**, **Tailwind CSS**, and **Axios**.

---

## 🚀 Live Demo & Repository
- **Submission Form**: [Google Form](https://forms.gle/wXScuDqFPMZDrm326)
- **Framework**: Next.js (App Router), React 19, TypeScript
- **Styling**: Tailwind CSS
- **Data Source**: [DummyJSON API](https://dummyjson.com)

---

## ✨ Features Implemented

### 1. Authentication & Route Protection
- **Login Flow**: Authenticates using `POST https://dummyjson.com/auth/login` with username `emilys` and password `emilyspass`.
- **Validation & Error Handling**: Displays clear errors for incorrect credentials and highlights missing fields.
- **Auto-Fill Demo Helper**: Quick button to fill demo credentials with a single click.
- **Route Guard (`AuthGuard.tsx`)**: Unauthenticated users cannot view `/products` or `/products/[id]` and are redirected to `/login?redirect=...`.
- **Session Expiration**: Centralized 401 handling in Axios interceptor automatically logs out and redirects expired sessions.
- **Logout Action**: Clean session termination in the navbar.

### 2. Product Catalog (Responsive Table & Card Views)
- **Desktop (Table)**: Displays thumbnail, title, brand, category badge, price, star rating, stock badge, and quick actions.
- **Mobile (Cards)**: Smooth card grid layout on smaller viewports with full product preview and touch-friendly actions.
- **Loading Skeletons**: Tailored skeleton placeholders during fetch requests.
- **Empty & Error States**: Contextual empty state message and a dedicated Retry button on network errors.

### 3. Custom Pagination (Zero Third-Party UI Libraries)
- **API Controlled**: Uses DummyJSON's `limit` and `skip` query parameters.
- **Page Numbers & Ellipsis**: Interactive page pills, "First", "Previous", "Next", and "Last" controls.
- **Range Label**: Dynamic range display (e.g. `Showing 21–40 of 194`).
- **Page Size Switcher**: Dropdown allowing users to choose between 10, 20, or 50 items per page.

### 4. Real-Time Debounced Search
- **Endpoint**: Fetches via `/products/search?q=`.
- **Debounced Input**: Custom `useDebounce` hook waits ~450ms after the user stops typing before making network calls.
- **Auto Page Reset**: Returning to page 1 automatically when search input changes.
- **Clear Button**: Quick one-click search reset.

### 5. Filtering & Sorting
- **Dynamic Categories**: Populated from `/products/categories`.
- **Multi-Field Sorting**: Sort by **Price**, **Rating**, or **Title**.
- **Direction Toggle**: Switch between ascending (Low → High) and descending (High → Low).
- **Reset Button**: One-click reset for all filters and sorting.

### 6. Product Details (`/products/[id]`)
- **Rich Product View**: High-resolution image gallery with interactive thumbnail selector.
- **Key Information**: Price with discount tag, stock level, SKU, rating breakdown, warranty, shipping, and return policies.
- **Customer Reviews**: Individual customer comments with 5-star rating displays and dates.
- **404 Not Found**: Catches non-existent IDs or invalid routes and renders a dedicated Not Found screen with a return button.

### 7. Add, Edit, and Delete Workflows
- **Add / Edit Modal**: Form with input validation (Title length, Category, positive Price, whole-number Stock, Description).
- **Delete Confirmation Dialog**: Accessible confirmation popup before destructive deletion.
- **In-Session Mutation Persistence**: Because DummyJSON is a mock API and does not persist changes to its remote database, AdminPulse implements an optimistic/session overlay layer (`ProductMutationContext.tsx`) that seamlessly reflects additions, edits, and deletions throughout your dashboard browsing session.

---

## 🛡️ Critical Edge-Case Solutions & Technical Choices

### 1. Race Condition Prevention on Fast Typing
- **Problem**: When a user types rapidly, slow responses from earlier keystrokes (especially with artificial delays like `&delay=2000`) can resolve *after* newer requests, overwriting the latest search results.
- **Solution**:
  - We use standard `AbortController` in Axios to cancel pending in-flight requests when a new search query is initiated.
  - We also track a monotonically increasing `latestRequestIdRef` inside `useProducts.ts`. Even if a network request completes, its payload is discarded if its sequence ID doesn't match the latest request.

### 2. The DummyJSON Category vs Search Limitation
- **Problem**: DummyJSON supports `/products/search?q=` and `/products/category/{cat}`, but does **not** support querying both simultaneously on the backend.
- **Solution**:
  - In `product.service.ts`, when both category and search query are active, we query the category endpoint and perform instant client-side text filtering and sorting across that category.
  - An informative notification banner appears on the dashboard explaining this behavior to the user.

### 3. URL State Synchronization & Malformed Input Handling
- **Problem**: Users may bookmark or share URLs, or tamper with parameters (e.g. `?page=abc`, `?page=999`, `?limit=-10`).
- **Solution**:
  - `useUrlParams.ts` sanitizes all parameters:
    - Any non-positive or non-numeric page value defaults safely to `1`.
    - Allowed limits are restricted to `[10, 20, 50]`.
    - If a user inputs an out-of-range page like `?page=999`, the app displays the graceful empty state with a "Clear All Filters" button rather than crashing.

### 4. Rapid-Click & Double-Submit Protection
- All submit buttons (Login, Add Product, Edit Product, Delete Product) enter an `isLoading` disabled state immediately upon click, preventing duplicate network calls.

---

## 📁 Project Structure

```text
product-admin-dashboard/
├── src/
│   ├── app/
│   │   ├── layout.tsx                   # Root layout with Auth & Mutation providers
│   │   ├── page.tsx                     # Smart redirect to /products or /login
│   │   ├── login/
│   │   │   └── page.tsx                 # Login view with Suspense and demo auto-fill
│   │   └── products/
│   │       ├── page.tsx                 # Main catalog dashboard
│   │       └── [id]/
│   │           ├── page.tsx             # Product detail view
│   │           └── not-found.tsx        # 404 page for invalid product ID
│   ├── components/
│   │   ├── auth/
│   │   │   └── AuthGuard.tsx            # Protected route wrapper
│   │   ├── layout/
│   │   │   └── Navbar.tsx               # Header, user badge, and logout
│   │   ├── products/
│   │   │   ├── ProductTable.tsx         # Desktop responsive table
│   │   │   ├── ProductCardGrid.tsx      # Mobile cards view
│   │   │   ├── ProductSearch.tsx        # Debounced search bar
│   │   │   ├── ProductFilters.tsx       # Category and sorting controls
│   │   │   ├── ProductPagination.tsx    # Custom pagination logic
│   │   │   ├── ProductModal.tsx         # Add/Edit modal with validation
│   │   │   └── DeleteConfirmModal.tsx   # Delete confirmation popup
│   │   └── ui/
│   │       ├── Button.tsx               # Button with variants and loading state
│   │       ├── Input.tsx                # Input with label and error state
│   │       ├── Modal.tsx                # Accessible dialog modal
│   │       ├── Skeleton.tsx             # Shimmer skeleton loader
│   │       └── Toast.tsx                # Floating status notifications
│   ├── context/
│   │   ├── AuthContext.tsx              # Auth state & token storage
│   │   └── ProductMutationContext.tsx   # Session overlay for mock mutations
│   ├── hooks/
│   │   ├── useDebounce.ts               # Custom debounce hook
│   │   ├── useProducts.ts               # Data fetching with race-condition guards
│   │   └── useUrlParams.ts              # URL query params synchronization
│   ├── lib/
│   │   └── axios.ts                     # Shared Axios instance with interceptors
│   ├── services/
│   │   ├── auth.service.ts              # POST /auth/login
│   │   └── product.service.ts           # Product CRUD & category endpoints
│   └── types/
│       ├── auth.ts                      # User and Auth interfaces
│       └── product.ts                   # Product, review, and filter interfaces
├── package.json
└── README.md
```

---

## 🛠️ Local Setup & Running Instructions

### 1. Clone & Install Dependencies
```bash
cd product-admin-dashboard
npm install
```

### 2. Run the Development Server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

### 3. Production Build
```bash
npm run build
npm run start
```

---

## 🔑 Login Credentials
- **Username**: `emilys`
- **Password**: `emilyspass`
*(You can also click the **Auto-fill** button on the login screen!)*

---

## 📝 Developer Notes & Reflection

### 1. Key Challenge & How It Was Handled
- **Challenge**: The DummyJSON API acts as a mock server for write operations (`POST /products/add`, `PUT /products/:id`, `DELETE /products/:id`). It responds with updated objects but doesn't persist them to its backend database. When navigating or searching, any created or updated products would disappear.
- **Solution**: Implemented an optimistic in-session mutation overlay (`ProductMutationContext.tsx`). This context layer intercepts create, update, and delete actions and merges them with server results in real-time. New products are prepended on page 1, edits override the server properties, and deleted items are filtered out across all views.

### 2. Implementation Choices & Tooling
- The project follows a clean feature-based architecture separating API services, custom hooks, and UI presentation components.
- Modern developer tooling and AI assistance were leveraged for drafting boilerplate types and exploring edge-case safeguards (such as request sequencing to prevent race conditions during fast typing). Every line of code, lifecycle hook, and state transition was hand-verified and structured for production quality.
