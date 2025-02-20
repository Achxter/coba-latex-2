"use server";
import fs from "fs";
import path from "path";
import { createReadStream, createWriteStream } from "fs";
import { resolve } from "path";
import nodeLatex from "node-latex";

export async function handleLatex({
  latex,
  method,
}: {
  latex: string;
  method: "download" | "compile";
}) {
  const publicDir = path.join(process.cwd(), "public");
  const latexFilePath = path.join(publicDir, "latex.tex");
  const outputPath = path.join(publicDir, "output.pdf");

  // Clean up any existing files first
  try {
    if (fs.existsSync(latexFilePath)) {
      fs.unlinkSync(latexFilePath);
    }
    if (fs.existsSync(outputPath)) {
      fs.unlinkSync(outputPath);
    }
  } catch (error) {
    console.error("Error cleaning up files:", error);
  }

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
    output.on("finish", async () => {
      try {
        if (method === "download") {
          // Read the generated PDF file and convert to base64
          const pdfBuffer = fs.readFileSync(outputPath);
          const base64PDF = pdfBuffer.toString("base64");

          // Clean up both files
          fs.unlinkSync(latexFilePath);
          fs.unlinkSync(outputPath);

          resolve(base64PDF);
        } else {
          // For compile, just clean up the .tex file
          fs.unlinkSync(latexFilePath);
          resolve("PDF generated successfully");
        }
      } catch (error) {
        reject(error);
      }
    });

    const handleError = (error: Error) => {
      // Clean up both files if there's an error
      try {
        if (fs.existsSync(latexFilePath)) {
          fs.unlinkSync(latexFilePath);
        }
        if (fs.existsSync(outputPath)) {
          fs.unlinkSync(outputPath);
        }
      } catch (cleanupError) {
        console.error("Error cleaning up files after error:", cleanupError);
      }
      reject("Failed to generate PDF: " + error.message);
    };

    pdf.on("error", handleError);
    output.on("error", handleError);
  });
}
