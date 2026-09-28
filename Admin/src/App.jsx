import { BrowserRouter, Navigate, Route, Routes } from "react-router";
import CharacterList from './Admin/CharacterList.jsx';
import AddCharacter from './Admin/AddCharacter.jsx';
import CatagoryList from './Admin/CatagoryList.jsx';
import AddCatagory from './Admin/AddCatagory.jsx';
import AdminHome from "./Admin/AdminHome.jsx";
import Puzzle from "./Main/Puzzle.jsx";
import LoginPage from "./Admin/LoginPage.jsx";
import PrivateRoute from "./Routes/PrivateRoute.jsx";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Puzzle />} />
        <Route path="/admin" element={<LoginPage />} />

        <Route path="/admin/home" element={<PrivateRoute element={<AdminHome />} />} />
        <Route path="/admin/characters" element={<PrivateRoute element={<CharacterList />} />} />
        <Route path="/admin/characters/add" element={<PrivateRoute element={<AddCharacter />} />} />
        <Route path="/admin/characters/edit/:id" element={<PrivateRoute element={<AddCharacter />} />} />
        <Route path="/admin/catagories" element={<PrivateRoute element={<CatagoryList />} />} />
        <Route path="/admin/catagories/add" element={<PrivateRoute element={<AddCatagory />} />} />
        <Route path="/admin/catagories/edit/:id" element={<PrivateRoute element={<AddCatagory />} />} />

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App
