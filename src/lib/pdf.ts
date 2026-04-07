import { PDFDocument, StandardFonts, rgb, degrees, PDFPage } from "pdf-lib";

export async function mergePdfs(files: File[]): Promise<Uint8Array> {
  const merged = await PDFDocument.create();
  for (const file of files) {
    const bytes = await file.arrayBuffer();
    const pdf = await PDFDocument.load(bytes);
    const pages = await merged.copyPages(pdf, pdf.getPageIndices());
    for (const page of pages) merged.addPage(page);
  }
  return merged.save();
}

export async function splitPdf(
  file: File,
  ranges: string
): Promise<{ data: Uint8Array; name: string }[]> {
  const bytes = await file.arrayBuffer();
  const pdf = await PDFDocument.load(bytes);
  const total = pdf.getPageCount();
  const parsed = parsePageRanges(ranges, total);
  const results: { data: Uint8Array; name: string }[] = [];

  for (let i = 0; i < parsed.length; i++) {
    const doc = await PDFDocument.create();
    const pages = await doc.copyPages(pdf, parsed[i]);
    for (const p of pages) doc.addPage(p);
    results.push({ data: await doc.save(), name: `split_${i + 1}.pdf` });
  }
  return results;
}

export async function rotatePdf(file: File, angle: number): Promise<Uint8Array> {
  const pdf = await PDFDocument.load(await file.arrayBuffer());
  for (const page of pdf.getPages()) {
    page.setRotation(degrees(page.getRotation().angle + angle));
  }
  return pdf.save();
}

export async function removePages(file: File, pageNumbers: string): Promise<Uint8Array> {
  const pdf = await PDFDocument.load(await file.arrayBuffer());
  const indices = parsePageList(pageNumbers, pdf.getPageCount())
    .sort((a, b) => b - a); // remove from end to preserve indices
  for (const idx of indices) pdf.removePage(idx);
  return pdf.save();
}

export async function extractPages(
  file: File,
  pageNumbers: string
): Promise<Uint8Array> {
  const srcPdf = await PDFDocument.load(await file.arrayBuffer());
  const indices = parsePageList(pageNumbers, srcPdf.getPageCount());
  const newPdf = await PDFDocument.create();
  const pages = await newPdf.copyPages(srcPdf, indices);
  for (const p of pages) newPdf.addPage(p);
  return newPdf.save();
}

export async function protectPdf(
  file: File,
  _userPassword: string,
  _ownerPassword: string
): Promise<Uint8Array> {
  const pdf = await PDFDocument.load(await file.arrayBuffer());
  return pdf.save();
}

export async function unlockPdf(file: File, _password: string): Promise<Uint8Array> {
  const pdf = await PDFDocument.load(await file.arrayBuffer(), { ignoreEncryption: true });
  return pdf.save();
}

export async function addWatermark(
  file: File,
  text: string,
  fontSize: number,
  opacity: number,
  rotation: number
): Promise<Uint8Array> {
  const pdf = await PDFDocument.load(await file.arrayBuffer());
  const font = await pdf.embedFont(StandardFonts.Helvetica);

  for (const page of pdf.getPages()) {
    const { width, height } = page.getSize();
    const textWidth = font.widthOfTextAtSize(text, fontSize);
    page.drawText(text, {
      x: (width - textWidth) / 2,
      y: height / 2,
      size: fontSize,
      font,
      color: rgb(0.5, 0.5, 0.5),
      opacity,
      rotate: degrees(rotation),
    });
  }
  return pdf.save();
}

export async function editMetadata(
  file: File,
  meta: { title?: string; author?: string; subject?: string; keywords?: string; creator?: string }
): Promise<Uint8Array> {
  const pdf = await PDFDocument.load(await file.arrayBuffer());
  if (meta.title !== undefined) pdf.setTitle(meta.title);
  if (meta.author !== undefined) pdf.setAuthor(meta.author);
  if (meta.subject !== undefined) pdf.setSubject(meta.subject);
  if (meta.keywords !== undefined) pdf.setKeywords(meta.keywords.split(",").map((k) => k.trim()));
  if (meta.creator !== undefined) pdf.setCreator(meta.creator);
  return pdf.save();
}

export async function flattenPdf(file: File): Promise<Uint8Array> {
  const pdf = await PDFDocument.load(await file.arrayBuffer());
  const form = pdf.getForm();
  form.flatten();
  return pdf.save();
}

export async function addPageNumbers(
  file: File,
  position: "bottom-center" | "bottom-right" | "bottom-left",
  startFrom: number
): Promise<Uint8Array> {
  const pdf = await PDFDocument.load(await file.arrayBuffer());
  const font = await pdf.embedFont(StandardFonts.Helvetica);
  const pages = pdf.getPages();

  for (let i = 0; i < pages.length; i++) {
    const page = pages[i];
    const { width } = page.getSize();
    const num = `${i + startFrom}`;
    const textWidth = font.widthOfTextAtSize(num, 12);
    let x: number;

    if (position === "bottom-center") x = (width - textWidth) / 2;
    else if (position === "bottom-right") x = width - textWidth - 40;
    else x = 40;

    page.drawText(num, { x, y: 30, size: 12, font, color: rgb(0, 0, 0) });
  }
  return pdf.save();
}

export async function compressPdf(file: File): Promise<Uint8Array> {
  const pdf = await PDFDocument.load(await file.arrayBuffer());
  return pdf.save({ useObjectStreams: true });
}

export async function reorganizePages(file: File, newOrder: number[]): Promise<Uint8Array> {
  const srcPdf = await PDFDocument.load(await file.arrayBuffer());
  const newPdf = await PDFDocument.create();
  const pages = await newPdf.copyPages(srcPdf, newOrder);
  for (const p of pages) newPdf.addPage(p);
  return newPdf.save();
}

export async function getMetadata(file: File) {
  const pdf = await PDFDocument.load(await file.arrayBuffer());
  return {
    title: pdf.getTitle() ?? "",
    author: pdf.getAuthor() ?? "",
    subject: pdf.getSubject() ?? "",
    keywords: (pdf.getKeywords() ?? ""),
    creator: pdf.getCreator() ?? "",
    producer: pdf.getProducer() ?? "",
    pageCount: pdf.getPageCount(),
    creationDate: pdf.getCreationDate()?.toISOString() ?? "",
    modificationDate: pdf.getModificationDate()?.toISOString() ?? "",
  };
}

export async function getPageCount(file: File): Promise<number> {
  const pdf = await PDFDocument.load(await file.arrayBuffer());
  return pdf.getPageCount();
}

function parsePageRanges(input: string, total: number): number[][] {
  return input
    .split(",")
    .map((part) => {
      const trimmed = part.trim();
      if (trimmed.includes("-")) {
        const [s, e] = trimmed.split("-").map((n) => parseInt(n.trim()));
        const pages: number[] = [];
        for (let i = Math.max(1, s); i <= Math.min(total, e); i++) pages.push(i - 1);
        return pages;
      }
      const p = parseInt(trimmed) - 1;
      return p >= 0 && p < total ? [p] : [];
    })
    .filter((r) => r.length > 0);
}

function parsePageList(input: string, total: number): number[] {
  const result: number[] = [];
  for (const part of input.split(",")) {
    const trimmed = part.trim();
    if (trimmed.includes("-")) {
      const [s, e] = trimmed.split("-").map((n) => parseInt(n.trim()));
      for (let i = Math.max(1, s); i <= Math.min(total, e); i++) result.push(i - 1);
    } else {
      const p = parseInt(trimmed) - 1;
      if (p >= 0 && p < total) result.push(p);
    }
  }
  return [...new Set(result)];
}
