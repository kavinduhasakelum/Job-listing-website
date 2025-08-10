import React from "react";
import { createBrowserRouter,RouterProvider } from "react-router-dom";
import HomePage from "./pages/HomePage";
import Root from "./pages/Root";


const router = createBrowserRouter([
  {
    path: "/",
    element: <Root />,
    children: [
      {
        index: true,
        element: <HomePage />
      }
    ]
  }
])

function App() {
  return <RouterProvider router={router} />;
}

export default App;
