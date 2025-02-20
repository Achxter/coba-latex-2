"use server";
import fs from "fs";
import path from "path";
import { createReadStream, createWriteStream } from "fs";
import { resolve } from "path";
import nodeLatex from "node-latex";

export async function downloadLatex({ latex }: { latex: string }) {
  const publicDir = path.join(process.cwd(), "public");
  const latexFilePath = path.join(publicDir, "latex.tex");
  const outputPath = path.join(publicDir, "output.pdf");

  if (!fs.existsSync(publicDir)) {
    fs.mkdirSync(publicDir);
  }

  fs.writeFileSync(latexFilePath, latex);
  const input = createReadStream(latexFilePath);
  const output = createWriteStream(outputPath);

  const options = {
    inputs: resolve(publicDir),
  };

  // Create a promise to handle the PDF generation
  return new Promise((resolve, reject) => {
    const pdf = nodeLatex(input, options);
    pdf.pipe(output);

    output.on("finish", () => {
      try {
        // Read the generated PDF file
        const pdfBuffer = fs.readFileSync(outputPath);
        // Convert to base64
        const base64PDF = pdfBuffer.toString("base64");

        // Clean up temporary files
        fs.unlinkSync(latexFilePath);
        fs.unlinkSync(outputPath);

        resolve(base64PDF);
      } catch (error) {
        reject(error);
      }
    });

    pdf.on("error", (error: Error) => {
      reject(error);
    });
  });
}

export async function compileLatex({ latex }: { latex: string }) {
  const publicDir = path.join(process.cwd(), "public");
  const latexFilePath = path.join(publicDir, "latex.tex");
  const outputPath = path.join(publicDir, "output.pdf");

  if (!fs.existsSync(publicDir)) {
    fs.mkdirSync(publicDir);
  }

  fs.writeFileSync(latexFilePath, latex);
  const input = createReadStream(latexFilePath);
  const output = createWriteStream(outputPath);

  const options = {
    inputs: resolve(publicDir),
  };

  const pdf = nodeLatex(input, options);
  pdf.pipe(output);
  return new Promise((resolve, reject) => {
    output.on('finish', () => {
      resolve('PDF generated successfully');
    });

    output.on('error', (error) => {
      reject('Failed to generate PDF: ' + error.message); 
    });
  });
}
