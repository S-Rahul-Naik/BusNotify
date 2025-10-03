
import type { RouteObject } from "react-router-dom";
import NotFound from "../pages/NotFound";
import Home from "../pages/home/page";
import Dashboard from "../pages/dashboard/page";
import AdminDashboard from "../pages/admin/page";
import Routes from "../pages/routes/page";
import LiveTracking from "../pages/live-tracking/page";
import Schedule from "../pages/schedule/page";
import Notifications from "../pages/notifications/page";
import SignIn from "../pages/signin/page";
import SignUp from "../pages/signup/page";

const routes: RouteObject[] = [
  {
    path: "/",
    element: <Home />,
  },
  {
    path: "/dashboard",
    element: <Dashboard />,
  },
  {
    path: "/routes",
    element: <Routes />,
  },
  {
    path: "/live-tracking",
    element: <LiveTracking />,
  },
  {
    path: "/schedule",
    element: <Schedule />,
  },
  {
    path: "/notifications",
    element: <Notifications />,
  },
  {
    path: "/signin",
    element: <SignIn />,
  },
  {
    path: "/signup",
    element: <SignUp />,
  },
  {
    path: "/admin",
    element: <AdminDashboard />,
  },
  {
    path: "*",
    element: <NotFound />,
  },
];

export default routes;
