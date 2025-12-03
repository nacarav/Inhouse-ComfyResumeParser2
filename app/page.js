import React, { FC } from 'react';

const Parser = ({type}) => {
  return (
    <div className='parser'>
      <h2>{type}</h2>
      <input className='upload' type="file" />
      <button type="submit">Upload</button>
    </div>
  );  
};

const Output = ({output}) => {
  return (
    <div className='output'>
      <h2>Output</h2>
      <p className='output-text'>{output}</p>
    </div>
  );
}

export default function App() {
  return (
    <>
      <h1>Inhouse Parser</h1>
      <Parser type="Resume" />
      <Parser type="Generic" />
      <Output output={"nothing to output"}/>
    </>
  );
}