import Login from "./pages/login/login.jsx";
import Signup from "./pages/signup/signup.jsx";
import Tasks from "./pages/tasks/tasks.jsx";
import Task from "./pages/task/task.jsx";
import Projects from "./pages/projects/projects.jsx";
import Error404 from "./pages/404/404.jsx";

import { createBrowserRouter } from "react-router";
import PrivateRoutes from "./components/privateRoutes/privateRoutes.jsx";

export const router = createBrowserRouter([
  {
    element: <PrivateRoutes />,
    children: [
      // {
      //   path: "tasks",
      //   element: <Tasks />,
      // },
      {
        path: "projects/:projectId/tasks",
        element: <Tasks />,
      },
      {
        path: "projects",
        element: <Projects />,
      },
      {
        path: "projects/:projectId/tasks/:taskId",
        element: <Task />,
      },

    ],
  },
  {
    path: "/",
    element: <Login />,
  },
  {
    path: "signup",
    element: <Signup />,
  },

  {
    path: "*",
    element: <Error404 />,
  },
]);
