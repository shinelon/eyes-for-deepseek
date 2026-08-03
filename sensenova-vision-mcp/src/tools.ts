import { z } from "zod";

export type ZodRawShape = Record<string, z.ZodTypeAny>;

export interface ToolDef {
  name: string;
  description: string;
  schema: ZodRawShape;
  imageParams: string[];
  systemPrompt: string;
  buildUserPrompt: (args: Record<string, unknown>) => string;
}

const IMAGE_PARAM = (desc = "Image source: local file path, public URL, or data URL (data:image/...;base64,...)") =>
  z.string().describe(desc);

export const TOOLS: ToolDef[] = [
  {
    name: "analyze_image",
    description:
      "General-purpose image analysis. Analyze any image with a free-form prompt. Use when no specialized tool fits. Supports local file path, URL, or base64 data URL.",
    schema: {
      image: IMAGE_PARAM(),
      prompt: z.string().describe("What you want to know about the image"),
    },
    imageParams: ["image"],
    systemPrompt:
      "You are SenseNova, a vision assistant. Analyze the provided image and answer the user's question accurately and concisely. Respond in the same language as the question.",
    buildUserPrompt: (a) => String(a.prompt),
  },
  {
    name: "extract_text",
    description:
      "OCR tool. Extract recognized text from an image (screenshots, receipts, scanned documents). Returns text only, preserving original layout. Use when you need the text content of an image.",
    schema: {
      image: IMAGE_PARAM(),
      format: z.enum(["plain", "markdown"]).optional().describe("Output format (default: plain)"),
    },
    imageParams: ["image"],
    systemPrompt:
      "You are an OCR engine. Extract ALL text visible in the image faithfully. Output ONLY the recognized text, preserving the original layout and structure. Do not add commentary, descriptions, or explanations.",
    buildUserPrompt: (a) => {
      const fmt = (a.format as string | undefined) ?? "plain";
      return `Extract all text from this image. Output format: ${fmt}. Return ONLY the recognized text, no explanations.`;
    },
  },
  {
    name: "ui_to_artifact",
    description:
      "Convert a UI screenshot into artifacts: code (HTML/CSS/React/Vue), prompt (AI regen prompt), spec (design spec), or description (natural language). Use when turning a UI design into reusable artifacts.",
    schema: {
      image: IMAGE_PARAM(),
      output_type: z
        .enum(["code", "prompt", "spec", "description"])
        .describe("Type of artifact to generate"),
      prompt: z
        .string()
        .optional()
        .describe("Optional extra instructions, e.g. target framework for code"),
    },
    imageParams: ["image"],
    systemPrompt:
      "You are a senior frontend designer. Based on output_type, produce the requested artifact faithfully from the UI screenshot. Output only the artifact, no meta commentary.",
    buildUserPrompt: (a) => {
      const ot = a.output_type as string;
      const extra = a.prompt ? `\nExtra instructions: ${String(a.prompt)}` : "";
      switch (ot) {
        case "code":
          return `Generate frontend code reproducing this UI faithfully (semantic HTML + modern CSS, responsive).${extra}`;
        case "spec":
          return `Extract a design specification from this UI: colors (hex), typography, spacing, layout grid, and key components.${extra}`;
        case "prompt":
          return `Generate an AI image-generation prompt that would recreate this UI design closely.${extra}`;
        case "description":
          return `Describe this UI in natural language: overall layout, sections, visual style, key components.${extra}`;
        default:
          return String(a.prompt ?? "");
      }
    },
  },
  {
    name: "diagnose_error",
    description:
      "Diagnose an error from a screenshot (stack trace, error dialog, failed terminal output). Identifies root cause and gives actionable fixes. Use when debugging from an error screenshot.",
    schema: {
      image: IMAGE_PARAM(),
      context: z
        .string()
        .optional()
        .describe("Optional extra context: what you were doing, relevant code, environment, etc."),
    },
    imageParams: ["image"],
    systemPrompt:
      "You are a debugging expert. Analyze the error shown in the screenshot. Structure your answer as: 1) What the error means, 2) Root cause, 3) Actionable fix steps. Be specific and concise. Respond in the same language as the error.",
    buildUserPrompt: (a) => {
      const ctx = a.context ? `\n\nAdditional context:\n${String(a.context)}` : "";
      return `Diagnose the error in this screenshot and provide a fix.${ctx}`;
    },
  },
  {
    name: "understand_technical_diagram",
    description:
      "Understand and explain technical diagrams (architecture/flowchart/UML/ER-diagram/sequence). Identifies components, relationships, and overall flow. Use for any technical or engineering diagram.",
    schema: {
      image: IMAGE_PARAM(),
      diagram_type: z
        .enum(["architecture", "flowchart", "uml", "er-diagram", "sequence"])
        .optional()
        .describe("Diagram type hint"),
      prompt: z.string().describe("What you want to understand about the diagram"),
    },
    imageParams: ["image"],
    systemPrompt:
      "You are a software architect. Analyze the technical diagram. Identify all components/modules, their relationships (data flow, dependencies, inheritance, calls), and explain the overall architecture. Structure your answer by component, then summarize the flow. Respond in the user's language.",
    buildUserPrompt: (a) => {
      const dt = a.diagram_type ? `(Diagram type hint: ${a.diagram_type})\n` : "";
      return `${dt}${String(a.prompt)}`;
    },
  },
  {
    name: "analyze_data_visualization",
    description:
      "Analyze data visualizations (charts, graphs, dashboards). Extract trends, anomalies, comparisons, and performance metrics. Use for any data/chart image, NOT for UI screenshots or technical diagrams.",
    schema: {
      image: IMAGE_PARAM(),
      analysis_focus: z
        .string()
        .optional()
        .describe("Focus: trends | anomalies | comparisons | performance"),
      prompt: z.string().describe("What you want to extract from the visualization"),
    },
    imageParams: ["image"],
    systemPrompt:
      "You are a data analyst. Analyze the data visualization. Be quantitative and specific — cite concrete values, deltas, percentages, and time ranges. Structure as: 1) Key metrics, 2) Trends, 3) Anomalies, 4) Takeaways. Respond in the user's language.",
    buildUserPrompt: (a) => {
      const f = a.analysis_focus ? `(Focus: ${a.analysis_focus})\n` : "";
      return `${f}${String(a.prompt)}`;
    },
  },
  {
    name: "ui_diff_check",
    description:
      "Compare two UI screenshots (expected/reference design vs actual implementation). Identifies visual differences and implementation discrepancies. Use for design-to-implementation QA verification.",
    schema: {
      expected_image: IMAGE_PARAM("Expected/reference design image: local path, URL, or data URL"),
      actual_image: IMAGE_PARAM("Actual implementation image: local path, URL, or data URL"),
      prompt: z.string().describe("What aspects to compare"),
    },
    imageParams: ["expected_image", "actual_image"],
    systemPrompt:
      "You are a UI QA expert. The FIRST image is the expected/reference design, the SECOND image is the actual implementation. Compare them and list concrete visual differences (layout, spacing, color, typography, missing/extra elements). Be specific about locations. Respond in the user's language.",
    buildUserPrompt: (a) => String(a.prompt),
  },
];
