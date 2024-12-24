import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import { createBrowserRouter, RouterProvider } from "react-router";
import { HomePage } from "./pages/home/index.tsx";

const router = createBrowserRouter([
  {
    path: "/",
    element: <HomePage />,
    loader: () => <div>loading</div>,
  },
]);

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <RouterProvider router={router} />
  </StrictMode>,
);
