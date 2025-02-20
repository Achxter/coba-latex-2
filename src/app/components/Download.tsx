'use client'
import React from 'react'
import { downloadLatex } from '@/app/actions/index'

function Download({ latex }: { latex: string }) {
  const handleClick = async () => {
    try {
      const base64PDF = await downloadLatex({ latex });
      if (typeof base64PDF !== 'string') {
        throw new Error('Invalid response from downloadLatex');
      }
      const binaryData = atob(base64PDF);
      const bytes = new Uint8Array(binaryData.length);
      for (let i = 0; i < binaryData.length; i++) {
        bytes[i] = binaryData.charCodeAt(i);
      }
      const pdfBlob = new Blob([bytes], { type: 'application/pdf' });

      // Check if File System Access API is available
      if ('showSaveFilePicker' in window) {
        try {
          const handle = await (window as unknown as {
            showSaveFilePicker: (options: {
              suggestedName: string;
              types: { description: string; accept: { [key: string]: string[] } }[]
            }) => Promise<FileSystemFileHandle>
          }).showSaveFilePicker({
            suggestedName: 'document.pdf',
            types: [{
              description: 'PDF Document',
              accept: { 'application/pdf': ['.pdf'] },
            }],
          });
          const writable = await handle.createWritable();
          await writable.write(pdfBlob);
          await writable.close();
        } catch (err) {
          console.log(err)
          // If user cancels or API fails, fallback to traditional method
          fallbackSaveMethod(pdfBlob);
        }

      } else {
        // Fallback for browsers that don't support File System Access API
        fallbackSaveMethod(pdfBlob);
      }
    } catch (error) {
      console.error('Error processing LaTeX:', error);
    }
  }

  const fallbackSaveMethod = (blob: Blob) => {
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'document.pdf';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }

  return (
    <div>
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
        Download PDF
      </button>
    </div>
  )
}

export default Download