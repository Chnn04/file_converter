async function extractTextFromPdf(file: File): Promise<string[]> {
  const pdfjsLib = await import("pdfjs-dist");
  pdfjsLib.GlobalWorkerOptions.workerSrc = "/pdf.worker.min.mjs";

  const buffer = await file.arrayBuffer();
  const pdf = await pdfjsLib.getDocument({ data: buffer }).promise;
  const pages: string[] = [];

  for (let i = 1; i <= pdf.numPages; i++) {
    const page = await pdf.getPage(i);
    const content = await page.getTextContent();
    const lines: string[] = [];
    let lastY: number | null = null;

    for (const item of content.items) {
      if (!("str" in item)) continue;
      const y = Math.round(item.transform[5]);
      if (lastY !== null && Math.abs(y - lastY) > 2) {
        lines.push("\n");
      }
      lines.push(item.str);
      lastY = y;
    }
    pages.push(lines.join(""));
  }
  return pages;
}

export async function pdfToDocx(file: File): Promise<Uint8Array> {
  const { Document, Packer, Paragraph, TextRun, PageBreak } = await import("docx");

  const pages = await extractTextFromPdf(file);
  const children = pages.flatMap((pageText, idx) => {
    const paragraphs = pageText
      .split("\n")
      .filter((line) => line.trim().length > 0)
      .map(
        (line) =>
          new Paragraph({
            children: [new TextRun({ text: line, size: 24 })],
          })
      );

    if (idx < pages.length - 1) {
      paragraphs.push(new Paragraph({ children: [new PageBreak()] }));
    }

    return paragraphs;
  });

  const doc = new Document({
    sections: [{ children }],
  });

  const blob = await Packer.toBlob(doc);
  const arrayBuffer = await blob.arrayBuffer();
  return new Uint8Array(arrayBuffer);
}

export async function pdfToTxt(file: File): Promise<Uint8Array> {
  const pages = await extractTextFromPdf(file);
  const fullText = pages
    .map((text, i) => `--- Página ${i + 1} ---\n${text}`)
    .join("\n\n");
  return new TextEncoder().encode(fullText);
}
