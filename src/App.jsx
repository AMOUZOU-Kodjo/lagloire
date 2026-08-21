import { RouterProvider } from "react-router-dom";
import QueryProvider from "./app/providers/QueryProvider";
import AuthProvider from "./app/providers/AuthProvider";
import SocketProvider from "./app/providers/SocketProvider";
import { router } from "./app/router";
import { ErrorBoundary, Toaster } from "./components/feedback";

export default function App() {
  return (
    <ErrorBoundary>
      <QueryProvider>
        <AuthProvider>
          <SocketProvider>
            <RouterProvider router={router} />
            <Toaster />
          </SocketProvider>
        </AuthProvider>
      </QueryProvider>
    </ErrorBoundary>
  );
}
