import { BrowserRouter, Routes, Route, Link } from 'react-router-dom';
import PublicProfilePage from './components/public_profile_page/PublicProfilePage';
import './App.css';

// A simple placeholder for the home page
const HomePage = () => (
  <div className="text-center">
    <h1 className="text-2xl font-bold mb-4">이루리 소개팅</h1>
    <p>오신 것을 환영합니다!</p>
    <Link to="/profile/123" className="text-primary hover:underline mt-4 inline-block">
      프로필 예시 보러가기 (ID: 123)
    </Link>
  </div>
);

function App() {
  return (
    <BrowserRouter>
      <div className="min-h-screen flex items-center justify-center">
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/profile/:userId" element={<PublicProfilePage />} />
        </Routes>
      </div>
    </BrowserRouter>
  );
}

export default App;
