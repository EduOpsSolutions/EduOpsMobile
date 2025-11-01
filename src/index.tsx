import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { LoginScreen } from "./screens/LoginScreen";

createRoot(document.getElementById("app") as HTMLElement).render(
  <StrictMode>
    <LoginScreen />
  </StrictMode>
);
