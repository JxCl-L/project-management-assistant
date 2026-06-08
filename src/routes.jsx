import { lazy, Suspense } from "react";
import { createBrowserRouter } from "react-router";
import PrivateRoutes from "./components/privateRoutes/privateRoutes.jsx";
import AppLayout from "./layouts/AppLayout.jsx";

const Login    = lazy(() => import("./pages/login/login.jsx"));
const Signup   = lazy(() => import("./pages/signup/signup.jsx"));
const Tasks    = lazy(() => import("./pages/tasks/tasks.jsx"));
const Task     = lazy(() => import("./pages/task/task.jsx"));
const Projects = lazy(() => import("./pages/projects/projects.jsx"));
const Error404 = lazy(() => import("./pages/404/404.jsx"));

function Lazy({ children }) {
  return <Suspense fallback={null}>{children}</Suspense>;
}

export const router = createBrowserRouter([
  {
    element: <PrivateRoutes />,
    children: [
      {
        element: <AppLayout />,
        children: [
          { path: "projects",                              element: <Lazy><Projects /></Lazy> },
          { path: "projects/:projectId/tasks",             element: <Lazy><Tasks /></Lazy> },
          { path: "projects/:projectId/tasks/:taskId",     element: <Lazy><Task /></Lazy> },
        ],
      },
    ],
  },
  { path: "/",      element: <Lazy><Login /></Lazy> },
  { path: "signup", element: <Lazy><Signup /></Lazy> },
  { path: "*",      element: <Lazy><Error404 /></Lazy> },
]);
