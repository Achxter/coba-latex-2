'use client'
import Script from 'next/script';
import React, { useState } from 'react';
import { Textarea } from '@/components/ui/textarea';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import Download from './components/Download';
import Compile from './components/Compile';

function Home() {
  const [latex, setLatex] = useState('');

  return (
    <div className="flex min-h-screen">
      <div className="w-1/2 p-4 bg-gray-800 flex flex-col">
        <Script id="latex-js-script" type="module">
          {`import {LaTeXJSComponent} from "https://cdn.jsdelivr.net/npm/latex.js/dist/latex.mjs"; customElements.define("latex-js", LaTeXJSComponent);`}
        </Script>
        <div className="flex items-center gap-2">
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
          <Compile latex={latex} />
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
      <ScrollArea className="w-1/2 p-4 bg-white text-black overflow-auto max-h-screen">
        <latex-js key={latex} baseURL='https://cdn.jsdelivr.net/npm/latex.js/dist/'>
          {latex}
        </latex-js>
      </ScrollArea>
    </div>
  );
}

export default Home;