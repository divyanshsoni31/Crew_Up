# CrewUp Platform - System Architecture & Feature Documentation

## Overview
CrewUp is a multi-sided Volunteer Management Platform connecting three distinct user roles: **Volunteers**, **Organizers**, and **Administrators**. The application is entirely front-end driven built exclusively with React, Vite, and TailwindCSS (focusing on an energetic Gen Z / Gen Alpha aesthetic).

Currently, **all data flows and API requests are simulated using static mocked data.** There is no live backend database, meaning state resets on page reloads (except for simple authentication context).

---

## User Roles & Navigation Flow

### 1. Global Navigation Architecture
All roles operate under a shared `<Layout>` wrapper (`src/app/components/shared/Layout.tsx`). The layout intelligently injects high-level routing tools:
*   **Global Header (`Header.tsx`)**: Fixed at the top for desktop and mobile. Contains branding, notifications, and an intelligent right-side Profile dropdown that redirects the user based on their specific role (Volunteer Profile, Organizer Profile, Admin Profile). Also handles Session Logout.
*   **Role-Based Bottom Nav (`BottomNav.tsx`)**: Fixed at the bottom for mobile, and anchored dynamically to the left sidebar on Desktop. Automatically detects the `useAuth()` state and supplies different icons and rapid-navigation buttons (e.g., Admins see "Users", Volunteers see "Applications").

---

### 2. Volunteer Flow
The supply side of the platform. Volunteers log in to find events, manage applications, and track their reputation.

*   **Login & Onboarding (`VolunteerLogin.tsx`, `VolunteerOnboarding.tsx`)**:
    *   **How it Works**: Users log in to trigger a mocked state change in `AuthContext` to `{ role: 'volunteer' }`. First-time users are routed to Onboarding to select skills.
*   **Dashboard (`VolunteerDashboard.tsx`)**:
    *   **How it Works**: Displays global platform statistics, XP/Levels (simulated), and two main sections:
        *   `My Events`: A quick view of events the volunteer specifically tracked. Features accepted events prominently with a QR generation button.
        *   `Recommended`: Event cards sorted dynamically for the volunteer to "Apply".
*   **Applications Tracker (`VolunteerApplications.tsx`)**:
    *   **How it Works**: A newly built, robust tabbed interface letting volunteers manage their commitments.
    *   **Features**:
        *   **Pending**: Shows applications awaiting Organizer review.
        *   **Accepted**: Shows approved applications. Crucially, clicking "View Ticket" spawns a QR Code generated via `react-qr-code`. The QR token is strictly mocking `"crewup-qr:[eventId]:[volunteerId]"`.
        *   **Rejected**: Provides Organizer feedback notes.
        *   **Past Events**: Logs completed hours.
*   **Profile (`VolunteerProfile.tsx`)**:
    *   **How it Works**: A public-facing (and private-editable) page showing certificates, total hours, and a 1-to-5 star rating average.

---

### 3. Organizer Flow
The demand side. Organizers log in to create events, manage applications, and run on-the-ground check-ins.

*   **Login (`OrganizerLogin.tsx`)**: Mocks authentication into the `organizer` role.
*   **Dashboard (`OrganizerDashboard.tsx`)**:
    *   **How it Works**: Displays quick metrics ("Total Volunteers", "Upcoming Events") and Quick Action buttons routing to creation and scanner features.
*   **Create Event (`CreateEvent.tsx`)**:
    *   **How it Works**: A massive form block gathering Event details, Required Skills, and compensation.
    *   **Features**: Features a "Paid/Unpaid" toggle, creating a conditional input for currency amount. Contains an "Other (Custom Skill)" button for dynamic skill injection.
    *   **Current Limitation**: Because there is no backend, creating an event only fires a console log/simulated delay and pushes the user back to the dashboard; the event *does not* actually persist into the `OrganizerEvents` list.
*   **Applications Review (`OrganizerApplications.tsx`)**:
    *   **How it Works**: A workspace to view all inbound volunteer applications. Features interactive "Approve/Reject" buttons.
    *   **Features**: Includes a PC-only Hover functionality: hovering over a Volunteer Avatar immediately floats a glassmorphic card showcasing their real-time Rating, Past Events, and Hours Logged to enable fast Organizer decision-making.
    *   **Current Limitation**: Approving an application triggers a UI toast, but does not mutate the Volunteer's real list.
*   **QR Code Scanner (`OrganizerQRScanner.tsx`)**:
    *   **How it Works**: The on-site management tool. Taps into the device's native camera using `@yudiel/react-qr-scanner`. Validates the "crewup-qr:" token, executes check-in logic, and reveals a Volunteer Rating feedback form immediately afterwards.
    *   **Known Issues/Limitations**: Requires HTTPS. Because dev environments use local IPs (HTTP), mobile browsers will enforce a security block on the camera. To circumvent this locally without SSL, a **Manual Fallback Input** detects the camera error and provides a text-field to type the mocked token, perfectly allowing testing of the validation logic.

---

### 4. Admin Flow
The platform oversight layer. Admins manage the ecosystem, moderate events, and analyze data.

*   **Login (`AdminLogin.tsx`)**: Mocks authentication into the `admin` role.
*   **Dashboard (`AdminDashboard.tsx`)**: High-level platform metrics overview.
*   **User Management (`AdminUsers.tsx`)**: A data table to view all users, filter by role, and trigger mock suspensions or activations.
*   **Event Moderation (`AdminEvents.tsx`)**: A review queue to Approve/Reject pending events posted by Organizers before they go live on the platform.
*   **Reports (`AdminReports.tsx`)**: Generates visual trajectory charts using `recharts` for User Growth and Event Categories.

---

## Technical Stack & Aesthetic Constraints

*   **Framework**: React 18, Vite.
*   **Styling**: Pure Tailwind CSS leveraging custom CSS variables in `theme.css`.
*   **Aesthetic Theme**: "Gen Z / Gen Alpha Aura". Uses vibrant Electric Violet, Fuchsia, and Pink gradients. Borders are set to completely rounded pill geometry (`--radius: 1.5rem`). Typographic stack overridden to use the geometric Google Font `Outfit` globally.
*   **Icons**: `lucide-react`.
*   **Animations**: `motion/react` (Framer Motion) for heavy layout shifts, dropdowns, and modal animations.

## Universal Persistent Limitations
1. **Mock Data Boundaries**: The application is essentially entirely read-only globally. Actions like "Creating Events," "Approving Applications," and "Checking In Users via QR" reflect only temporary local `useState` modifications or strictly aesthetic Toasts. Cross-user interaction (e.g. Organizer posts event -> Volunteer sees it instantly -> Volunteer applies -> Organizer gets notification) is fundamentally impossible until a database and backend are connected.
2. **Authentication Persistence**: The `AuthContext` only maintains logic in local UI mounts. Refreshing the browser window clears the Active User.
