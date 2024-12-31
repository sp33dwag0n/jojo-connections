import { BrowserRouter, Route, Routes} from "react-router-dom";
import CharacterList from './Admin/CharacterList.jsx';
import AddCharacter from './Admin/AddCharacter.jsx';
import CatagoryList from './Admin/CatagoryList.jsx';
import AddCatagory from './Admin/AddCatagory.jsx';
import AdminHome from "./Admin/AdminHome.jsx";
import Puzzle from "./Main/Puzzle.jsx";
import LoginPage from "./Admin/LoginPage.jsx";
import PrivateRoute from "./Routes/PrivateRoute.jsx";
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
            <Route exact path="/admin" element={<LoginPage />} />
            
            <Route exact path="/admin/home" element={<PrivateRoute element ={<AdminHome />}/>} />
            <Route exact path="/admin/characters" element={<PrivateRoute element={<CharacterList />} />} />
            <Route exact path="/admin/characters/add" element={<PrivateRoute element={<AddCharacter />}/>} />
            <Route exact path="/admin/characters/edit/:id" element={<PrivateRoute element={<AddCharacter />}/>} />
            <Route exact path="/admin/catagories" element={<PrivateRoute element={<CatagoryList />}/>} />
            <Route exact path="/admin/catagories/add" element={<PrivateRoute element={<AddCatagory />}/>} />
            <Route exact path="/admin/catagories/edit/:id" element={<PrivateRoute element={<AddCatagory />}/>} />
          </Routes>
        </BrowserRouter>
      </div>
    </>
  )
}

export default App
