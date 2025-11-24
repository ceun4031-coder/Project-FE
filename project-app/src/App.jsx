import ButtonDemo from "./testStyle/ButtonTest";
import TokenSystemDemo from "./testStyle/TokenSystem";
import InputDemo from './testStyle/InputTest';

import { Routes, Route } from "react-router-dom";
import Header from './components/layout/Header';

import RegisterPage from './pages/auth/RegisterPage';
import LoginPage from './pages/auth/LoginPage';

function App() {

  return (
    <>
      <Header />
      <Routes>
       <Route 
          path="/" 
          element={
            <div className="page-container">
              <InputDemo/>
            </div>
          } 
        />
        <Route path="/auth/login" element={<LoginPage />} />
        <Route path="/auth/register" element={<RegisterPage />} />
      </Routes>
    </>
  );
}

export default App

