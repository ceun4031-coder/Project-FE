// src/main.jsx
import "./components/common/Button.css";
import "./components/common/Input.css";
import "./styles/index.css";

import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

import App from "./App";
import { AuthProvider } from "./context/AuthContext";

// React Query 클라이언트 생성 (앱 전체에서 하나만)
const queryClient = new QueryClient();

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    {/* 서버 상태 관리 (React Query) */}
    <QueryClientProvider client={queryClient}>
      {/* 라우팅 */}
      <BrowserRouter>
        {/* 인증 컨텍스트 */}
        <AuthProvider>
          <App />
        </AuthProvider>
      </BrowserRouter>
    </QueryClientProvider>
  </React.StrictMode>
);
