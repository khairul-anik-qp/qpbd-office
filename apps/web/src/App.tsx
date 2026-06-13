import { GoogleOAuthProvider } from "@react-oauth/google";
import { AppRouter } from "./router";

const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID ?? "";

export function App() {
  return (
    <GoogleOAuthProvider clientId={clientId}>
      <AppRouter />
    </GoogleOAuthProvider>
  );
}
