import { BrowserRouter, Routes, Route } from "react-router-dom";
import './App.css';
import Home from './Home.jsx';
import Signin from './Signin.jsx';
import Signup from './Signup.jsx';
import Persona from './Persona.jsx';
import SavePersona from "./SavePersona.jsx";

function App() {

  return (
    <>

      <BrowserRouter>
        <Routes>
          <Route path='/' element={<Home />} />
          <Route path='/Signin' element={<Signin />} />
          <Route path='/Signup' element={<Signup />} />
          <Route path='/Persona' element={<Persona />} />
          <Route path='/Persona/Save/:id?' element={<SavePersona />} />
        </Routes>
      </BrowserRouter>
    </>
  )
}

export default App
