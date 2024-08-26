/* eslint-disable react/prop-types */
/* eslint-disable no-unused-vars */
import './TypingInput.css';
import { BsBookmarks } from "react-icons/bs";


export default function TypingInput({data, setData}) {

  function handleChange(event) {
    const { name } = event.target;
    if (event.target.type === 'text') {
        setData({...data, [name]: event.target.value});
    }
    else {
        setData({...data, [name]: event.target.checked});
    }

    if (name === 'dictionary') 
      setData(prev => ({...prev, error: ''}));
  }

  return (
    <>
      <p className='error-input'>{data.error}</p>
      <section className="typing-input">
        {data.dictionary ? (
          <>
            <BsBookmarks id='book-icon'/>
            <label>Dictionary</label>
            <input
              type="checkbox"
              name="dictionary"
              checked = {data.dictionary}
              onChange={handleChange}
            />
          </>
        ) : (
          <>
            <BsBookmarks id='book-icon'/>
            <label>Dictionary</label>
            <input
              type="checkbox"
              name="dictionary"
              onChange={handleChange}
            />
            <input
              maxLength={1}
              type="text"
              name="key1"
              value={data.key1}
              placeholder="Enter a key"
              onChange={handleChange}
            />
            <input
              maxLength={1}
              type="text"
              name="key2"
              value={data.key2}
              placeholder="Enter another key"
              onChange={handleChange}
            />
            <label>Upper Case</label>
            <input
              type="checkbox"
              name="capitals"
              checked={data.capitals}
              onChange={handleChange}
            />
          </>
        )}
      </section>
    </>
  );
}
