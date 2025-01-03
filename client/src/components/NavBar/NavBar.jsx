/* eslint-disable no-unused-vars */
import './NavBar.css';

export default function Navbar() {

  return (
    <nav className="nav">
        <h1><a href='/race'>KeyType</a></h1>
        <ul>
          <li>
            <button className="link-button">
              <a href='/race'>Race</a>
            </button>
          </li>
          <li>
            <button className="link-button">
              <a href='/practice'>Practice</a>
            </button>
          </li>
        </ul>
    </nav>
  )
}