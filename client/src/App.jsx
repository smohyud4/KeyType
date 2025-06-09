/* eslint-disable no-unused-vars */
import {Route, Routes} from 'react-router-dom';
//import NavBar from './components/NavBar'
import Race from './pages/Race';
import Practice from './pages/Practice';
import Account from './pages/Account';
import './App.css';

function App() {
  
  return (
    <>
      <Routes>
        <Route path='/' element={<Race/>}/>
        <Route path='/race' element={<Race/>}/>
        <Route path='/practice' element={<Practice/>}></Route>
        <Route path='/stats' element={<Account/>}></Route>
      </Routes>
    </>
  )
}

export default App;
