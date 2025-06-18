import { Routes, Route } from "react-router-dom";
import Layout from "./components/Layout"; // ✅ renamed from Navbar to Layout

import Home from "./pages/Home";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Profile from "./pages/Profile";
import CreatePost from "./pages/CreatePost";
import ViewProfile from "./pages/ViewProfile";
const App = () => {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route path="/" element={<Home />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/settings" element={<div>Settings coming soon</div>} />
        <Route path="/create" element={<CreatePost />} />
        <Route path="/profile/:id" element={<ViewProfile />} />
      </Route>
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
    </Routes>
  );
};

export default App;
