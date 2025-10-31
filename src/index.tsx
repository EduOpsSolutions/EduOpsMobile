import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { LoginScreen } from "./screens/LoginScreen";
import "./global.css";

createRoot(document.getElementById("app") as HTMLElement).render(
  <StrictMode>
    <LoginScreen />
  </StrictMode>
);
