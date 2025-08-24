import { Routes, Route } from "react-router-dom";
import Layout from "./components/Layout"; // The layout with sidebars and outlet

import Home from "./pages/Home";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Profile from "./pages/Profile";
import CreatePost from "./pages/CreatePost";
import ViewProfile from "./pages/ViewProfile";
import SearchPage from "./pages/SearchPage";
import Chat from "./pages/Chat";
import Explore from "./pages/Explore";
import { useAuth } from "./contexts/AuthContexts";
import KinnectLoader from "./components/KinnectLoader";

const App = () => {
  const { loading } = useAuth();

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <KinnectLoader />
      </div>
    );
  }

  return (
    <Routes>
      <Route element={<Layout />}>
        <Route path="/" element={<Home />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/create" element={<CreatePost />} />
        <Route path="/profile/:id" element={<ViewProfile />} />
        <Route path="/chat" element={<Chat />} />
        <Route path="/explore" element={<Explore />} />
        <Route path="/:query" element={<SearchPage />} />
      </Route>
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
    </Routes>
  );
};

export default App;
