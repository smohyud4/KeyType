/* eslint-disable no-unused-vars */
import {useState} from 'react';
import {useNavigate} from 'react-router-dom';
import axios from 'axios';
import { FaUser, FaEye, FaEyeSlash } from "react-icons/fa";
import { MdEmail } from "react-icons/md";
import Navbar from '../components/NavBar/NavBar';
import Footer from '../components/Footer/Footer';
import './Form.css';


export default function Register() {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [typeReveal, setTypeReveal] = useState('password');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  function validateEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email) && username !== email;
  }

  function validatePassword(password) {
    const lengthValid = password.length >= 8;
    const numberValid = /\d/.test(password);
    return lengthValid && numberValid;
  }

  function revealPassword(event) {
    event.preventDefault();
    setTypeReveal(typeReveal === 'password' ? 'text' : 'password');
  }

  function validateUsername(username) {
    const forbiddenWords = /(?:faggot|nigga|fuck)/i;
    const characters =  /^[a-zA-Z0-9]+$/;
    return !forbiddenWords.test(username) && username.length > 2 && characters.test(username) && username !== email;
  }

  function handleChange(event) {
    const {name, value} = event.target;

    setError('');
    if (name === 'username') setUsername(value);
    else if (name === 'email') setEmail(value);
    else setPassword(value);
  }

  async function handleSubmit(event) {
    event.preventDefault();
    try {
      if (!validatePassword(password)) {
        setError('Password must be at least 8 characters long and contain a number');
        return;
      }
      if (!validateUsername(username)) {
        setError('Invalid Username');
        return;
      }
      if (!validateEmail(email)) {
        setError('Invalid Email');
        return;
      }
      setLoading(true);
      const apiUrl = import.meta.env.VITE_API_URL;
      const response = await axios.post(`${apiUrl}/register`, {username, email, password});
      console.log(response.data);
      if (response.data.error) {
        setError(response.data.error);
        setLoading(false);
        return;
      }
      setEmail('');
      setPassword('');
      navigate('/login');
    }
    catch (error) {
      setError('An error occurred');
      setLoading(false);
      console.log(error);
    }
  }

  return (
    <>
      <Navbar isUserSignedIn={false}/>
      <div className='container-form'>
        <div className='wrapper'>
          <form onSubmit={handleSubmit}>
            <h1 id='register-heading'>Reigster</h1>
            <div className='input-box'>
              <label htmlFor='username' hidden>Username</label>
              <input 
                type='text' 
                placeholder='Username'
                name='username' 
                value={username} 
                onChange={handleChange} 
                required
              />
              <FaUser className='icon'/>
            </div>
            <div className='input-box'>
              <label htmlFor='email' hidden>Email</label>
              <input 
                type='email' 
                placeholder='Email'
                name='email' 
                value={email} 
                onChange={handleChange} 
                required
              />
              <MdEmail className='icon'/>
            </div>
            <div className='input-box'>
              <label htmlFor='password' hidden>Password</label>
              <input 
                type={typeReveal} 
                placeholder='Password'
                name='password' 
                value={password} 
                onChange={handleChange} 
                required
              />
              <button onClick={revealPassword} className='icon-button'>
                {typeReveal === 'password' ? <FaEyeSlash className='icon'/> : <FaEye className='icon'/>}
              </button>
            </div>
            {error && <p>{error}</p>}
            <div className='input-box'>
              <button className='submit-button' type='submit'>
                {loading ? <div className='button-loader'></div> : 'Sign Up'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </>
  )
}