import type { CandidateProfile, InterviewTurn, PersonalityAnalysis } from "../types/domain";

const PAGE_WIDTH = 595.28;
const PAGE_HEIGHT = 841.89;
const TOP_MARGIN = 56;
const BOTTOM_MARGIN = 42;
const LEFT_MARGIN = 52;
const RIGHT_MARGIN = 52;
const HEADER_HEIGHT = 86;

const FONT_SIZES = {
  title: 22,
  subtitle: 11,
  heading: 15,
  body: 11,
  meta: 10,
  footer: 9,
};

type ReportInput = {
  userData: CandidateProfile;
  analysis: PersonalityAnalysis;
  interviewData: InterviewTurn[];
};

type ReportItem =
  | {
      type: "text";
      text: string;
      fontSize: number;
      x: number;
      gapBefore: number;
      gapAfter: number;
      lineGap: number;
    }
  | {
      type: "divider";
      gapBefore: number;
      gapAfter: number;
    }
  | {
      type: "space";
      gapAfter: number;
    };

type WrappedBlockOptions = {
  fontSize?: number;
  indent?: number;
  gapBefore?: number;
  gapAfter?: number;
  lineGap?: number;
  bullet?: boolean;
};

const normalizeWhitespace = (value = "") => String(value).replace(/\s+/g, " ").trim();

const sanitizePdfText = (value = "") =>
  normalizeWhitespace(value)
    .replace(/[^\x20-\x7E]/g, "")
    .replace(/\\/g, "\\\\")
    .replace(/\(/g, "\\(")
    .replace(/\)/g, "\\)");

const sanitizeFileName = (value = "PersonaLens Report") =>
  normalizeWhitespace(value)
    .replace(/[<>:"/\\|?*\x00-\x1F]/g, "")
    .replace(/\s+/g, "-")
    .slice(0, 60) || "PersonaLens-Report";

const getReadinessBand = (score: number) => {
  if (score >= 82) {
    return "Interview Ready";
  }

  if (score >= 68) {
    return "Mentor Review";
  }

  return "Needs Practice";
};

const wrapText = (text: string, maxChars: number) => {
  const clean = normalizeWhitespace(text);

  if (!clean) {
    return [];
  }

  const words = clean.split(" ");
  const lines = [];
  let current = "";

  for (const word of words) {
    const candidate = current ? `${current} ${word}` : word;

    if (candidate.length <= maxChars) {
      current = candidate;
      continue;
    }

    if (current) {
      lines.push(current);
      current = word;
      continue;
    }

    let start = 0;
    while (start < word.length) {
      lines.push(word.slice(start, start + maxChars));
      start += maxChars;
    }
  }

  if (current) {
    lines.push(current);
  }

  return lines;
};

const approximateMaxChars = (fontSize: number, indent = 0) => {
  const usableWidth = PAGE_WIDTH - LEFT_MARGIN - RIGHT_MARGIN - indent;
  return Math.max(24, Math.floor(usableWidth / (fontSize * 0.52)));
};

const summarizeEmotion = (emotionFrames: InterviewTurn["emotions"] = []) => {
  const totals: Record<string, number> = {};
  let frameCount = 0;

  for (const frame of emotionFrames) {
    if (!frame || typeof frame !== "object") {
      continue;
    }

    let hasSignal = false;

    for (const [key, value] of Object.entries(frame)) {
      if (key === "timestamp" || typeof value !== "number") {
        continue;
      }

      totals[key] = (totals[key] || 0) + value;
      hasSignal = true;
    }

    if (hasSignal) {
      frameCount += 1;
    }
  }

  if (!frameCount) {
    return null;
  }

  const [emotion, total] =
    Object.entries(totals).sort((a, b) => b[1] - a[1])[0] || [];

  if (!emotion) {
    return null;
  }

  const confidence = Math.round((total / frameCount) * 100);
  return `${emotion.charAt(0).toUpperCase()}${emotion.slice(1)} (${confidence}%)`;
};

const addWrappedBlock = (
  items: ReportItem[],
  text: string,
  options: WrappedBlockOptions = {},
) => {
  const {
    fontSize = FONT_SIZES.body,
    indent = 0,
    gapBefore = 0,
    gapAfter = 0,
    lineGap = 4,
    bullet = false,
  } = options;

  const prefix = bullet ? "- " : "";
  const continuationIndent = bullet ? indent + 12 : indent;
  const maxChars = approximateMaxChars(fontSize, indent);
  const wrapped = wrapText(`${prefix}${text}`, maxChars);

  wrapped.forEach((line, index) => {
    items.push({
      type: "text",
      text: line,
      fontSize,
      x: LEFT_MARGIN + (index === 0 ? indent : continuationIndent),
      gapBefore: index === 0 ? gapBefore : 0,
      gapAfter: index === wrapped.length - 1 ? gapAfter : 0,
      lineGap,
    });
  });

  if (!wrapped.length && gapAfter) {
    items.push({ type: "space", gapAfter });
  }
};

const addDivider = (items: ReportItem[], gapBefore = 8, gapAfter = 14) => {
  items.push({ type: "divider", gapBefore, gapAfter });
};

const buildReportItems = ({ userData, analysis, interviewData }: ReportInput) => {
  const items: ReportItem[] = [];
  const generatedAt = new Date().toLocaleString();
  const candidateName = normalizeWhitespace(userData?.name) || "Candidate";
  const oceanTraits = Array.isArray(analysis?.ocean) ? analysis.ocean : [];
  const strengths = Array.isArray(analysis?.strengths) ? analysis.strengths : [];
  const improvements = Array.isArray(analysis?.improvements) ? analysis.improvements : [];
  const suggestions = Array.isArray(analysis?.suggestions) ? analysis.suggestions : [];
  const turns = Array.isArray(interviewData) ? interviewData : [];
  const readinessScore = oceanTraits.length
    ? Math.round(oceanTraits.reduce((sum, item) => sum + Number(item.A || 0), 0) / oceanTraits.length)
    : 0;
  const readinessLabel = getReadinessBand(readinessScore);

  addWrappedBlock(items, "Candidate Snapshot", {
    fontSize: FONT_SIZES.title,
    gapAfter: 8,
  });

  [
    `Candidate: ${candidateName}`,
    `Program: ${normalizeWhitespace(userData?.program) || "Not provided"}`,
    `Assessment track: ${normalizeWhitespace(userData?.assessmentTrack) || "General interview readiness"}`,
    `Generated: ${generatedAt}`,
    `Overall readiness index: ${readinessScore}/100 - ${readinessLabel}`,
  ].forEach((line) => {
    addWrappedBlock(items, line, {
      fontSize: FONT_SIZES.subtitle,
      gapAfter: 4,
    });
  });

  addDivider(items);

  addWrappedBlock(items, "Executive Summary", {
    fontSize: FONT_SIZES.heading,
    gapAfter: 8,
  });

  addWrappedBlock(items, analysis?.summary || "No summary available.", {
    fontSize: FONT_SIZES.body,
    gapAfter: 16,
  });

  addWrappedBlock(items, "Competency Matrix", {
    fontSize: FONT_SIZES.heading,
    gapAfter: 8,
  });

  [
    `Role readiness: ${readinessLabel}`,
    `Evidence captured: ${turns.length} interview response${turns.length === 1 ? "" : "s"}`,
    `Report confidence: ${turns.length ? "Evidence-backed session summary" : "Limited response evidence"}`,
  ].forEach((item) => {
    addWrappedBlock(items, item, {
      bullet: true,
      indent: 6,
      gapAfter: 4,
    });
  });

  addWrappedBlock(items, "OCEAN Behavioral Indicators", {
    fontSize: FONT_SIZES.heading,
    gapBefore: 10,
    gapAfter: 8,
  });

  oceanTraits.forEach((trait) => {
    const traitName = normalizeWhitespace(trait?.trait) || "Trait";
    const score = Number.isFinite(trait?.A) ? trait.A : 0;
    addWrappedBlock(items, `${traitName}: ${score}/100`, {
      bullet: true,
      indent: 6,
      gapAfter: 4,
    });
  });

  addWrappedBlock(items, "Demonstrated Strengths", {
    fontSize: FONT_SIZES.heading,
    gapBefore: 10,
    gapAfter: 8,
  });

  strengths.forEach((item) => {
    addWrappedBlock(items, item, {
      bullet: true,
      indent: 6,
      gapAfter: 4,
    });
  });

  addWrappedBlock(items, "Development Areas", {
    fontSize: FONT_SIZES.heading,
    gapBefore: 10,
    gapAfter: 8,
  });

  improvements.forEach((item) => {
    addWrappedBlock(items, item, {
      bullet: true,
      indent: 6,
      gapAfter: 4,
    });
  });

  addWrappedBlock(items, "Preparation Roadmap", {
    fontSize: FONT_SIZES.heading,
    gapBefore: 10,
    gapAfter: 8,
  });

  suggestions.forEach((item) => {
    addWrappedBlock(items, item, {
      bullet: true,
      indent: 6,
      gapAfter: 4,
    });
  });

  addWrappedBlock(items, "Question-wise Evidence", {
    fontSize: FONT_SIZES.heading,
    gapBefore: 12,
    gapAfter: 8,
  });

  turns.forEach((turn, index) => {
    addWrappedBlock(items, `Question ${index + 1}`, {
      fontSize: 12,
      gapBefore: index === 0 ? 0 : 10,
      gapAfter: 4,
    });

    addWrappedBlock(items, `Prompt: ${turn?.question || "N/A"}`, {
      fontSize: FONT_SIZES.body,
      gapAfter: 4,
    });

    addWrappedBlock(items, `Answer: ${turn?.answer || "N/A"}`, {
      fontSize: FONT_SIZES.body,
      gapAfter: 4,
    });

    const dominantEmotion = summarizeEmotion(turn?.emotions);
    addWrappedBlock(
      items,
      `Dominant emotion signal: ${dominantEmotion || "Not enough data captured"}`,
      {
        fontSize: FONT_SIZES.meta,
        gapAfter: 8,
      }
    );
  });

  addDivider(items, 12, 10);

  addWrappedBlock(
    items,
    "Interpretation note: OCEAN values in PersonaLens are interview-behavior coaching indicators, not clinical personality labels. Raw audio and video should be treated as temporary evidence; final storage should retain derived metrics and report summaries.",
    {
      fontSize: FONT_SIZES.meta,
      gapAfter: 4,
    },
  );

  return items;
};

const renderPageContents = (items: ReportItem[]) => {
  const pages: string[][] = [[]];
  let pageIndex = 0;
  let y = PAGE_HEIGHT - HEADER_HEIGHT - 34;

  const pushCommand = (command: string) => {
    pages[pageIndex].push(command);
  };

  const pushHeader = () => {
    const headerY = PAGE_HEIGHT - HEADER_HEIGHT;
    pushCommand(`0.05 0.09 0.16 rg 0 ${headerY.toFixed(2)} ${PAGE_WIDTH} ${HEADER_HEIGHT} re f`);
    pushCommand(
      `1 1 1 rg BT /F1 18 Tf ${LEFT_MARGIN} ${(PAGE_HEIGHT - 38).toFixed(
        2,
      )} Td (PersonaLens Candidate Assessment Report) Tj ET`,
    );
    pushCommand(
      `0.72 0.81 0.95 rg BT /F1 9 Tf ${LEFT_MARGIN} ${(PAGE_HEIGHT - 58).toFixed(
        2,
      )} Td (Academic readiness | Behavioral proxy | Interview evidence) Tj ET`,
    );
    pushCommand("0 0 0 rg");
  };

  pushHeader();

  const pushPage = () => {
    pages.push([]);
    pageIndex += 1;
    y = PAGE_HEIGHT - HEADER_HEIGHT - 34;
    pushHeader();
  };

  items.forEach((item) => {
    if (item.type === "space") {
      y -= item.gapAfter || 0;
      return;
    }

    y -= item.gapBefore || 0;

    const requiredHeight =
      item.type === "divider"
        ? 12
        : (item.fontSize || FONT_SIZES.body) + (item.lineGap || 4);

    if (y - requiredHeight < BOTTOM_MARGIN) {
      pushPage();
    }

    if (item.type === "divider") {
      const lineY = y - 2;
      pushCommand(`0.78 0.82 0.88 RG ${LEFT_MARGIN} ${lineY.toFixed(2)} m ${(
        PAGE_WIDTH - RIGHT_MARGIN
      ).toFixed(2)} ${lineY.toFixed(2)} l S 0 0 0 RG`);
      y -= 6 + (item.gapAfter || 0);
      return;
    }

    const text = sanitizePdfText(item.text);
    const fontSize = item.fontSize || FONT_SIZES.body;
    pushCommand(
      `BT /F1 ${fontSize} Tf ${item.x.toFixed(2)} ${y.toFixed(
        2
      )} Td (${text}) Tj ET`
    );
    y -= fontSize + (item.lineGap || 4) + (item.gapAfter || 0);
  });

  return pages;
};

const buildPdf = (pageCommands: string[][]) => {
  const objects: string[] = [];

  const addObject = (body: string) => {
    objects.push(body);
    return objects.length;
  };

  addObject("<< /Type /Catalog /Pages 2 0 R >>");

  const kids: string[] = [];
  pageCommands.forEach((commands, index) => {
    const pageObjectNumber = 3 + index * 2;
    kids.push(`${pageObjectNumber} 0 R`);
  });

  addObject(`<< /Type /Pages /Kids [${kids.join(" ")}] /Count ${pageCommands.length} >>`);

  const fontObjectNumber = 3 + pageCommands.length * 2;

  pageCommands.forEach((commands, index) => {
    const pageObjectNumber = 3 + index * 2;
    const contentObjectNumber = pageObjectNumber + 1;
    const pageFooter = `BT /F1 ${FONT_SIZES.footer} Tf ${LEFT_MARGIN} 24 Td (Page ${
      index + 1
    } of ${pageCommands.length}) Tj ET`;
    const content = `${commands.join("\n")}\n${pageFooter}`;
    addObject(
      `<< /Type /Page /Parent 2 0 R /MediaBox [0 0 ${PAGE_WIDTH} ${PAGE_HEIGHT}] /Resources << /Font << /F1 ${fontObjectNumber} 0 R >> >> /Contents ${contentObjectNumber} 0 R >>`
    );
    addObject(`<< /Length ${content.length} >>\nstream\n${content}\nendstream`);
  });

  addObject("<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>");

  let pdf = "%PDF-1.4\n";
  const offsets = [0];

  objects.forEach((body, index) => {
    offsets.push(pdf.length);
    pdf += `${index + 1} 0 obj\n${body}\nendobj\n`;
  });

  const xrefOffset = pdf.length;
  pdf += `xref\n0 ${objects.length + 1}\n`;
  pdf += "0000000000 65535 f \n";

  offsets.slice(1).forEach((offset) => {
    pdf += `${String(offset).padStart(10, "0")} 00000 n \n`;
  });

  pdf += `trailer\n<< /Size ${objects.length + 1} /Root 1 0 R >>\nstartxref\n${xrefOffset}\n%%EOF`;

  return pdf;
};

export const downloadReportPdf = ({ userData, analysis, interviewData }: ReportInput) => {
  const items = buildReportItems({ userData, analysis, interviewData });
  const pageCommands = renderPageContents(items);
  const pdf = buildPdf(pageCommands);
  const fileName = `${sanitizeFileName(userData?.name || "PersonaLens-Report")}-report.pdf`;

  const blob = new Blob([pdf], { type: "application/pdf" });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");

  anchor.href = url;
  anchor.download = fileName;
  document.body.appendChild(anchor);
  anchor.click();
  anchor.remove();

  setTimeout(() => URL.revokeObjectURL(url), 1000);

  return fileName;
};
