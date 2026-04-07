import * as pdf from "./pdf";

export type OptionType = "text" | "number" | "password" | "select" | "pageRange";

export interface ToolOption {
  type: OptionType;
  id: string;
  label: string;
  placeholder?: string;
  required?: boolean;
  min?: number;
  max?: number;
  defaultValue?: string | number;
  selectOptions?: { value: string; label: string }[];
}

export interface ProcessResult {
  type: "single" | "multiple";
  files: { data: Uint8Array; filename: string }[];
}

export interface Tool {
  id: string;
  name: string;
  description: string;
  icon: string;
  category: "organize" | "security" | "modify" | "convert";
  multiFile: boolean;
  acceptTypes: string[];
  options: ToolOption[];
  process: (files: File[], options: Record<string, string>) => Promise<ProcessResult>;
}

function single(data: Uint8Array, filename: string): ProcessResult {
  return { type: "single", files: [{ data, filename }] };
}

function multi(files: { data: Uint8Array; name: string }[]): ProcessResult {
  return { type: "multiple", files: files.map((f) => ({ data: f.data, filename: f.name })) };
}

const PDF_ONLY = ["application/pdf"];

export const tools: Tool[] = [
  {
    id: "merge",
    name: "Unir PDFs",
    description: "Combina múltiples archivos PDF en uno solo",
    icon: "IconFileStack",
    category: "organize",
    multiFile: true,
    acceptTypes: PDF_ONLY,
    options: [],
    process: async (files) => single(await pdf.mergePdfs(files), "merged.pdf"),
  },
  {
    id: "split",
    name: "Dividir PDF",
    description: "Separa un PDF en múltiples archivos por rangos de páginas",
    icon: "IconScissors",
    category: "organize",
    multiFile: false,
    acceptTypes: PDF_ONLY,
    options: [
      {
        type: "pageRange",
        id: "ranges",
        label: "Rangos de páginas",
        placeholder: "1-3, 4-6, 7-10",
        required: true,
      },
    ],
    process: async (files, opts) => multi(await pdf.splitPdf(files[0], opts.ranges)),
  },
  {
    id: "rotate",
    name: "Rotar páginas",
    description: "Rota todas las páginas del PDF en el ángulo indicado",
    icon: "IconRotateClockwise",
    category: "organize",
    multiFile: false,
    acceptTypes: PDF_ONLY,
    options: [
      {
        type: "select",
        id: "angle",
        label: "Ángulo de rotación",
        defaultValue: "90",
        selectOptions: [
          { value: "90", label: "90° (derecha)" },
          { value: "180", label: "180°" },
          { value: "270", label: "270° (izquierda)" },
        ],
      },
    ],
    process: async (files, opts) =>
      single(await pdf.rotatePdf(files[0], parseInt(opts.angle || "90")), "rotated.pdf"),
  },
  {
    id: "extract-pages",
    name: "Extraer páginas",
    description: "Extrae páginas específicas a un nuevo PDF",
    icon: "IconFileExport",
    category: "organize",
    multiFile: false,
    acceptTypes: PDF_ONLY,
    options: [
      {
        type: "pageRange",
        id: "pages",
        label: "Páginas a extraer",
        placeholder: "1, 3, 5-8",
        required: true,
      },
    ],
    process: async (files, opts) =>
      single(await pdf.extractPages(files[0], opts.pages), "extracted.pdf"),
  },
  {
    id: "remove-pages",
    name: "Eliminar páginas",
    description: "Elimina páginas específicas del PDF",
    icon: "IconFileShredder",
    category: "organize",
    multiFile: false,
    acceptTypes: PDF_ONLY,
    options: [
      {
        type: "pageRange",
        id: "pages",
        label: "Páginas a eliminar",
        placeholder: "2, 4, 6-8",
        required: true,
      },
    ],
    process: async (files, opts) =>
      single(await pdf.removePages(files[0], opts.pages), "trimmed.pdf"),
  },
  {
    id: "unlock",
    name: "Desbloquear PDF",
    description: "Intenta abrir un PDF ignorando el cifrado (funcionalidad limitada en navegador)",
    icon: "IconLockOpen",
    category: "security",
    multiFile: false,
    acceptTypes: PDF_ONLY,
    options: [],
    process: async (files) =>
      single(await pdf.unlockPdf(files[0], ""), "unlocked.pdf"),
  },
  {
    id: "flatten",
    name: "Aplanar formularios",
    description: "Convierte campos de formulario en contenido estático",
    icon: "IconLayersSubtract",
    category: "security",
    multiFile: false,
    acceptTypes: PDF_ONLY,
    options: [],
    process: async (files) => single(await pdf.flattenPdf(files[0]), "flattened.pdf"),
  },
  {
    id: "watermark",
    name: "Marca de agua",
    description: "Añade un texto como marca de agua en todas las páginas",
    icon: "IconDroplet",
    category: "modify",
    multiFile: false,
    acceptTypes: PDF_ONLY,
    options: [
      { type: "text", id: "text", label: "Texto", placeholder: "CONFIDENCIAL", required: true },
      { type: "number", id: "fontSize", label: "Tamaño de fuente", defaultValue: "48", min: 8, max: 200 },
      { type: "number", id: "opacity", label: "Opacidad (0-1)", defaultValue: "0.3", min: 0, max: 1 },
      {
        type: "select",
        id: "rotation",
        label: "Rotación",
        defaultValue: "-45",
        selectOptions: [
          { value: "0", label: "Horizontal" },
          { value: "-45", label: "Diagonal ↘" },
          { value: "45", label: "Diagonal ↗" },
          { value: "-90", label: "Vertical" },
        ],
      },
    ],
    process: async (files, opts) =>
      single(
        await pdf.addWatermark(
          files[0],
          opts.text,
          parseFloat(opts.fontSize || "48"),
          parseFloat(opts.opacity || "0.3"),
          parseFloat(opts.rotation || "-45")
        ),
        "watermarked.pdf"
      ),
  },
  {
    id: "metadata",
    name: "Editar metadatos",
    description: "Modifica título, autor, asunto y palabras clave del PDF",
    icon: "IconFileInfo",
    category: "modify",
    multiFile: false,
    acceptTypes: PDF_ONLY,
    options: [
      { type: "text", id: "title", label: "Título", placeholder: "Título del documento" },
      { type: "text", id: "author", label: "Autor", placeholder: "Nombre del autor" },
      { type: "text", id: "subject", label: "Asunto", placeholder: "Asunto del documento" },
      { type: "text", id: "keywords", label: "Palabras clave", placeholder: "palabra1, palabra2" },
    ],
    process: async (files, opts) =>
      single(await pdf.editMetadata(files[0], opts), "metadata_updated.pdf"),
  },
  {
    id: "page-numbers",
    name: "Numerar páginas",
    description: "Añade números de página a todas las páginas del PDF",
    icon: "IconListNumbers",
    category: "modify",
    multiFile: false,
    acceptTypes: PDF_ONLY,
    options: [
      {
        type: "select",
        id: "position",
        label: "Posición",
        defaultValue: "bottom-center",
        selectOptions: [
          { value: "bottom-center", label: "Centro inferior" },
          { value: "bottom-right", label: "Derecha inferior" },
          { value: "bottom-left", label: "Izquierda inferior" },
        ],
      },
      { type: "number", id: "startFrom", label: "Empezar desde", defaultValue: "1", min: 0 },
    ],
    process: async (files, opts) =>
      single(
        await pdf.addPageNumbers(
          files[0],
          (opts.position || "bottom-center") as "bottom-center" | "bottom-right" | "bottom-left",
          parseInt(opts.startFrom || "1")
        ),
        "numbered.pdf"
      ),
  },
  {
    id: "compress",
    name: "Comprimir PDF",
    description: "Reduce el tamaño del archivo PDF optimizando su estructura",
    icon: "IconFileZip",
    category: "modify",
    multiFile: false,
    acceptTypes: PDF_ONLY,
    options: [],
    process: async (files) => single(await pdf.compressPdf(files[0]), "compressed.pdf"),
  },
  {
    id: "pdf-to-docx",
    name: "PDF a Word",
    description: "Convierte un PDF a documento Word (.docx) extrayendo el texto",
    icon: "IconFileTypeDocx",
    category: "convert",
    multiFile: false,
    acceptTypes: PDF_ONLY,
    options: [],
    process: async (files) => {
      const { pdfToDocx } = await import("./convert");
      return single(await pdfToDocx(files[0]), "converted.docx");
    },
  },
  {
    id: "pdf-to-txt",
    name: "PDF a Texto",
    description: "Extrae todo el texto de un PDF a un archivo .txt",
    icon: "IconFileText",
    category: "convert",
    multiFile: false,
    acceptTypes: PDF_ONLY,
    options: [],
    process: async (files) => {
      const { pdfToTxt } = await import("./convert");
      return single(await pdfToTxt(files[0]), "extracted.txt");
    },
  },
];

export function getToolById(id: string): Tool | undefined {
  return tools.find((t) => t.id === id);
}

export function getToolsByCategory(category: Tool["category"]): Tool[] {
  return tools.filter((t) => t.category === category);
}

export const categories: { id: Tool["category"]; label: string }[] = [
  { id: "organize", label: "Organizar" },
  { id: "security", label: "Seguridad" },
  { id: "modify", label: "Modificar" },
  { id: "convert", label: "Convertir" },
];
