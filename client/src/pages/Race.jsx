/* eslint-disable no-unused-vars */
import {useState, useEffect} from 'react';
import { useNavigate } from 'react-router-dom';
import Typing from '../components/Typing/Typing';
import axios from 'axios';
import NavBar from '../components/NavBar/NavBar';


export default function Race() {
  const [auth, setAuth] = useState(false);
  const [error, setError] = useState('');
  const [user, setUser] = useState('');
  const navigate = useNavigate();
 
  useEffect(() => {
    async function checkAuth() {
      try {
        const apiUrl = import.meta.env.VITE_API_URL;
        const response = await axios.get(`${apiUrl}/authorize`, {withCredentials: true});
        if (response.data.error) {
          setAuth(false);
          setError(response.data.error);
          return;
        }

        setUser(response.data.user);
        setAuth(true);
      }
      catch {
        setAuth(false);
        navigate('../login');
      }
    }
    checkAuth();
  }, [navigate]);  


  return (
    <>
      <NavBar isUserSignedIn={auth} user={user}/>
      {
        auth ?
        <main>
          <br/>
          <Typing isUserSignedIn={auth}/>
        </main>
        :
        <main id='loader-container'>
          <div className="loader"></div>
        </main>
      }
    </>
  )
} 