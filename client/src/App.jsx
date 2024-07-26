/* eslint-disable no-unused-vars */
import {Route, Routes} from 'react-router-dom';
import NavBar from './components/NavBar'
import Home from './pages/Home';
import Register from './pages/Register';
import Login from './pages/Login';
import Account from './pages/Account';
import './App.css';

function App() {
  const isUserSignedIn = !!localStorage.getItem('token');
  
  return (
    <>
      <NavBar/>
      <Routes>
        <Route path='/' element={<Home/>}/>
        <Route path='/register' element={<Register/>}/>
        <Route path='/login' element={<Login/>}/>
        {isUserSignedIn && <Route path='/account' element={<Account/>}/>}
      </Routes>      
    </>
  )
}

export default App;
