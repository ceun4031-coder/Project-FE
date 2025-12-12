// src/App.jsx
import Header from "./components/layout/Header";
import AppRouter from "./router";
import Footer from '@/components/layout/Footer';

function App() {
  return (
    <div className="app-main">
      <Header />
      <AppRouter />
      <Footer/>
    </div>
  );
}

export default App;
