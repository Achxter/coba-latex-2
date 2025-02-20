import React from 'react'
import { handleLatex } from '../actions';

function Compile({ latex, onCompileSuccess }: { latex: string, onCompileSuccess: () => void }) {
  const handleClick = async () => {
    try {
      await handleLatex({ latex, method: "compile" });
      onCompileSuccess();
    } catch (error) {
      console.error('Error compiling LaTeX:', error);
    }
  }
  return (
    <button
      onClick={handleClick}
      style={{
        backgroundColor: '#4CAF50',
        color: 'white',
        padding: '15px 32px',
        textAlign: 'center',
        textDecoration: 'none',
        display: 'inline-block',
        fontSize: '16px',
        margin: '4px 2px',
        cursor: 'pointer',
        border: 'none',
        borderRadius: '4px'
      }}
    >
      Compile Latex
    </button>
  )
}

export default Compile