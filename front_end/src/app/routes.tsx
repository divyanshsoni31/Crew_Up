import { createBrowserRouter } from "react-router";
import { Layout } from "./components/shared/Layout";
import { LandingPage } from "./components/shared/LandingPage";
import { AboutUs } from "./components/shared/AboutUs";
import { VolunteerOnboarding } from "./components/volunteer/VolunteerOnboarding";
import { VolunteerProfileSetup } from "./components/volunteer/VolunteerProfileSetup";
import { VolunteerApplications } from "./components/volunteer/VolunteerApplications";
import { ExploreEvents } from "./components/volunteer/ExploreEvents";
import { EventDetails } from "./components/shared/EventDetails";
import { OrganizerDashboard } from "./components/organizer/OrganizerDashboard";
import { VolunteerProfile } from "./components/volunteer/VolunteerProfile";
import { VolunteerDashboard } from "./components/volunteer/VolunteerDashboard";
import { OrganizerProfile } from "./components/organizer/OrganizerProfile";
import { AdminProfile } from "./components/admin/AdminProfile";
import { UnifiedLogin } from "./components/shared/UnifiedLogin";
import { AdminLogin } from "./components/admin/AdminLogin";
import { AdminDashboard } from "./components/admin/AdminDashboard";
import { ProtectedRoute } from "./components/shared/ProtectedRoute";
import { OrganizerEvents } from "./components/organizer/OrganizerEvents";
import { OrganizerEventDetail } from "./components/organizer/OrganizerEventDetail";
import { CreateEvent } from "./components/organizer/CreateEvent";

import { AdminUsers } from "./components/admin/AdminUsers";
import { AdminEvents } from "./components/admin/AdminEvents";
import { AdminReports } from "./components/admin/AdminReports";
import { OrganizerApplications } from "./components/organizer/OrganizerApplications";
import { OrganizerQRScanner } from "./components/organizer/OrganizerQRScanner";
import { OTPVerification } from "./components/shared/OTPVerification";

export const router = createBrowserRouter([
  {
    path: "/",
    Component: Layout,
    children: [
      // Public routes
      { index: true, Component: LandingPage },
      { path: "about", Component: AboutUs },

      // Auth routes
      { path: "login", Component: UnifiedLogin },
      { path: "admin/login", Component: AdminLogin },
      { path: "admin/login", Component: AdminLogin },
      { path: "verify-otp", Component: OTPVerification },

      // Volunteer routes
      {
        path: "volunteer/onboarding",
        element: (
          <ProtectedRoute allowedRoles={["volunteer"]}>
            <VolunteerOnboarding />
          </ProtectedRoute>
        )
      },
      {
        path: "volunteer/setup",
        element: (
          <ProtectedRoute allowedRoles={["volunteer"]}>
            <VolunteerProfileSetup />
          </ProtectedRoute>
        )
      },
      {
        path: "volunteer/dashboard",
        element: (
          <ProtectedRoute allowedRoles={["volunteer"]}>
            <VolunteerDashboard />
          </ProtectedRoute>
        )
      },
      {
        path: "volunteer/events",
        element: (
          <ProtectedRoute allowedRoles={["volunteer"]}>
            <ExploreEvents />
          </ProtectedRoute>
        )
      },
      {
        path: "volunteer/applications",
        element: (
          <ProtectedRoute allowedRoles={["volunteer"]}>
            <VolunteerApplications />
          </ProtectedRoute>
        )
      },
      {
        path: "volunteer/certificates",
        element: (
          <ProtectedRoute allowedRoles={["volunteer"]}>
            <VolunteerDashboard />
          </ProtectedRoute>
        )
      },
      {
        path: "volunteer/profile",
        element: (
          <ProtectedRoute allowedRoles={["volunteer"]}>
            <VolunteerProfile />
          </ProtectedRoute>
        )
      },

      // Organizer routes
      {
        path: "organizer/dashboard",
        element: (
          <ProtectedRoute allowedRoles={["organizer"]}>
            <OrganizerDashboard />
          </ProtectedRoute>
        )
      },
      {
        path: "organizer/create-event",
        element: (
          <ProtectedRoute allowedRoles={["organizer"]}>
            <CreateEvent />
          </ProtectedRoute>
        )
      },
      {
        path: "organizer/events",
        element: (
          <ProtectedRoute allowedRoles={["organizer"]}>
            <OrganizerEvents />
          </ProtectedRoute>
        )
      },
      {
        path: "organizer/event/:id",
        element: (
          <ProtectedRoute allowedRoles={["organizer"]}>
            <OrganizerEventDetail />
          </ProtectedRoute>
        )
      },

      {
        path: "organizer/applications",
        element: (
          <ProtectedRoute allowedRoles={["organizer"]}>
            <OrganizerApplications />
          </ProtectedRoute>
        )
      },
      {
        path: "organizer/ratings",
        element: (
          <ProtectedRoute allowedRoles={["organizer"]}>
            <OrganizerDashboard />
          </ProtectedRoute>
        )
      },
      {
        path: "organizer/profile",
        element: (
          <ProtectedRoute allowedRoles={["organizer"]}>
            <OrganizerProfile />
          </ProtectedRoute>
        )
      },
      {
        path: "organizer/scan",
        element: (
          <ProtectedRoute allowedRoles={["organizer"]}>
            <OrganizerQRScanner />
          </ProtectedRoute>
        )
      },
      // Admin routes
      {
        path: "admin/dashboard",
        element: (
          <ProtectedRoute allowedRoles={["admin"]}>
            <AdminDashboard />
          </ProtectedRoute>
        )
      },
      {
        path: "admin/users",
        element: (
          <ProtectedRoute allowedRoles={["admin"]}>
            <AdminUsers />
          </ProtectedRoute>
        )
      },
      {
        path: "admin/events",
        element: (
          <ProtectedRoute allowedRoles={["admin"]}>
            <AdminEvents />
          </ProtectedRoute>
        )
      },
      {
        path: "admin/verifications",
        element: (
          <ProtectedRoute allowedRoles={["admin"]}>
            <AdminDashboard />
          </ProtectedRoute>
        )
      },
      {
        path: "admin/reports",
        element: (
          <ProtectedRoute allowedRoles={["admin"]}>
            <AdminReports />
          </ProtectedRoute>
        )
      },
      {
        path: "admin/profile",
        element: (
          <ProtectedRoute allowedRoles={["admin"]}>
            <AdminProfile />
          </ProtectedRoute>
        )
      },

      // Shared routes (accessible by volunteers and organizers)
      {
        path: "event/:id",
        element: (
          <ProtectedRoute allowedRoles={["volunteer", "organizer", "admin"]}>
            <EventDetails />
          </ProtectedRoute>
        )
      },
      {
        path: "profile/:id",
        element: (
          <ProtectedRoute allowedRoles={["volunteer", "organizer", "admin"]}>
            <VolunteerProfile />
          </ProtectedRoute>
        )
      },

      // Legacy routes for backward compatibility (redirect to new routes)
      { path: "onboarding", Component: UnifiedLogin },
      { path: "dashboard", Component: UnifiedLogin },
      { path: "organizer", Component: UnifiedLogin },
    ],
  },
]);