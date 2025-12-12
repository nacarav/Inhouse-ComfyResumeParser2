'use client'

import React, { FC } from 'react';
import { useState } from 'react';

const Parser = ({ type, setOutput }) => {
  const [file, setFile] = useState(null);
  const updateFile = (e) => {
    setFile(e.target.files[0]);
  };

  const handleClick = () => {
    console.log('file: ', file);
    if(file) {
      setOutput(file.name);
    }
  };

  return (
    <div className='parser'>
      <h2>{type}</h2>
      <input className='upload' type="file" onChange={updateFile}/>
      <button onClick={handleClick} type="submit">Upload</button>
    </div>
  );  
};

export default function App() {
  const [output, setOutput] = useState('nothing to output');

  return (
    <>
      <h1>Inhouse Parser</h1>
      <Parser type="Resume" setOutput={setOutput}/>
      <Parser type="Generic" setOutput={setOutput}/>
      <div className='output'>
        <h2>Output</h2>
        <p className='output-text'>{output}</p>
      </div>
    </>
  );
}