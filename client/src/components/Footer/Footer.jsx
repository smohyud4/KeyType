import './Footer.css';
import { FaGithub } from "react-icons/fa";

const year = new Date().getFullYear();

export default function Footer() {

  return (
    <footer>
      <p> 
        {year} | Leave feedback 
        <a href="https://github.com/smohyud4" target='blank'><FaGithub/></a>
      </p>
    </footer>
 );
}