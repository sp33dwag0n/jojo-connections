import { BrowserRouter, Route, Routes} from "react-router-dom";
import CharacterList from './Pages/Admin/CharacterList.jsx';
import AddCharacter from './Pages/Admin/AddCharacter.jsx';
import CatagoryList from './Pages/Admin/CatagoryList.jsx';
import AddCatagory from './Pages/Admin/AddCatagory.jsx';
import AdminHome from "./Pages/Admin/AdminHome.jsx";
import Puzzle from "./Pages/Main/Puzzle.jsx";
import './Styles/modal.css';
import './Styles/home.css';
import './Styles/list.css';
import './Styles/connections.css';



function App() {

  return (
    <>
      <div>
        <BrowserRouter>
          <Routes>
            <Route exact path="/" element={<Puzzle />} />
            
            <Route exact path="/admin" element={<AdminHome />} />
            <Route exact path="/admin/characters" element={<CharacterList />} />
            <Route exact path="/admin/characters/add" element={<AddCharacter />} />
            <Route exact path="/admin/characters/edit/:id" element={<AddCharacter />} />
            <Route exact path="/admin/catagories" element={<CatagoryList />} />
            <Route exact path="/admin/catagories/add" element={<AddCatagory />} />
            <Route exact path="/admin/catagories/edit/:id" element={<AddCatagory />} />
          </Routes>
        </BrowserRouter>
      </div>
    </>
  )
}

export default App
