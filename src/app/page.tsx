'use client'
// import Script from 'next/script';
import React, { useState, useMemo, useCallback } from 'react';
import { useResizeObserver } from '@wojtekmaj/react-hooks';
import { Textarea } from '@/components/ui/textarea';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import Download from './components/Download';
import Compile from './components/Compile';
import { pdfjs, Document, Page } from 'react-pdf'
import 'react-pdf/dist/Page/AnnotationLayer.css';
import 'react-pdf/dist/Page/TextLayer.css';
import { Card } from '@/components/ui/card';

pdfjs.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjs.version}/legacy/build/pdf.worker.min.mjs`

const options = {
  cMapUrl: '/cmaps/',
  standardFontDataUrl: '/standard_fonts/',
};

const resizeObserverOptions = {};

const maxWidth = 800;

function Home() {
  const [latex, setLatex] = useState('');
  const [numPages, setNumPages] = useState<number>();
  const [pdfKey, setPdfKey] = useState(0);

  const pdfFile = useMemo(() => ({
    url: `../output.pdf?${pdfKey}`
  }), [pdfKey]);

  const [containerRef, setContainerRef] = useState<HTMLElement | null>(null);
  const [containerWidth, setContainerWidth] = useState<number>();

  const onResize = useCallback<ResizeObserverCallback>((entries) => {
    const [entry] = entries;

    if (entry) {
      setContainerWidth(entry.contentRect.width);
    }
  }, []);

  useResizeObserver(containerRef, resizeObserverOptions, onResize);

  function onDocumentLoadSuccess({ numPages }: { numPages: number }): void {
    setNumPages(numPages);
  }
  return (
    <div className="flex min-h-screen">
      <div className="w-1/2 p-4 bg-gray-800 flex flex-col">
        {/* <Script id="latex-js-script" type="module">
          {`import {LaTeXJSComponent} from "https://cdn.jsdelivr.net/npm/latex.js/dist/latex.mjs"; customElements.define("latex-js", LaTeXJSComponent);`}
        </Script> */}
        <div className="flex flex-wrap items-center gap-2">
          <Button
            className="w-fit mb-2 px-4 py-2 bg-primary-foreground text-primary-background"
            onClick={() => {
              const fileHandle = (window as unknown as { showSaveFilePicker: (options: { suggestedName: string; types: { description: string; accept: { [key: string]: string[] } }[] }) => Promise<FileSystemFileHandle> }).showSaveFilePicker({
                suggestedName: 'document.tex',
                types: [{
                  description: 'TeX files',
                  accept: { 'text/plain': ['.tex'] },
                }],
              });
              fileHandle.then(handle => {
                handle.createWritable().then(writable => {
                  writable.write(latex).then(() => {
                    writable.close();
                  });
                });
              }).catch(err => {
                console.error('Save file failed', err);
              });
            }}
          >
            Save .tex
          </Button>
          <Label htmlFor='uploadTex' className="w-fit mb-2 px-4 py-2 bg-primary-foreground text-primary-background rounded hover:bg-primary hover:text-primary-foreground cursor-pointer ease-in-out duration-100 transition-colors">
            Upload .tex
          </Label>
          <Input
            id='uploadTex'
            type="file"
            accept=".tex"
            className="hidden"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) {
                const reader = new FileReader();
                reader.onload = (event) => {
                  const text = event.target?.result;
                  if (typeof text === 'string') {
                    const textarea = document.getElementById('latex-input') as HTMLTextAreaElement;
                    if (textarea) {
                      setLatex(text);
                      textarea.value = text;
                      textarea.dispatchEvent(new Event('change'));
                    }
                  }
                };
                reader.readAsText(file);
                // Reset the input value so the same file can be uploaded again
                e.target.value = '';
              }
            }}
          />
          <Compile latex={latex} onCompileSuccess={() => setPdfKey(prev => prev + 1)} />
          <Download latex={latex} />
        </div>
        <Textarea
          id="latex-input"
          defaultValue={latex}
          className="w-full flex-grow p-2 bg-background text-foreground"
          onChange={(e) => setLatex(e.target.value)}
        >
        </Textarea>
      </div>
      <ScrollArea className="w-1/2 p-4 bg-white text-black overflow-auto max-h-screen" ref={setContainerRef}>
        {/* <latex-js key={latex} baseURL='https://cdn.jsdelivr.net/npm/latex.js/dist/'>
          {latex}
        </latex-js> */}
        <Document
          className="my-2 mx-0"
          key={`${pdfKey}`}
          file={pdfFile}
          onLoadSuccess={onDocumentLoadSuccess}
          options={options}
        >
          {Array.from(new Array(numPages), (_el, index) => (
            <Card key={`page_${index + 1}`} className="mb-4 shadow-lg rounded-lg bg-white p-2">
              <Page
                width={containerWidth ? containerWidth - 24 : maxWidth}
                pageNumber={index + 1}
              />
            </Card>
          ))}
        </Document>
      </ScrollArea>
    </div>
  );
}

export default Home;