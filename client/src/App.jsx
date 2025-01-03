/* eslint-disable no-unused-vars */
import {Route, Routes} from 'react-router-dom';
//import NavBar from './components/NavBar'
import Race from './pages/Race';
import Practice from './pages/Practice';
import Footer from './components/Footer/Footer';
import './App.css';

function App() {
  
  return (
    <>
      <Routes>
        <Route path='/' element={<Race/>}/>
        <Route path='/race' element={<Race/>}/>
        <Route path='/practice' element={<Practice/>}></Route>
      </Routes>
      <Footer/>
    </>
  )
}

export default App;
