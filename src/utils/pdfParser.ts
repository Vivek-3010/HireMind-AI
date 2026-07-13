/**
 * Pure client-side PDF and Text Resume parser utility.
 * Handles validation, raw text stream extraction, email & name detection,
 * and compiles metadata for AI processing without external backend dependecies.
 */

export interface ParsedCandidateData {
  name: string;
  email: string;
  summary: string;
  extractedText: string;
  skills: string[];
  isPdf: boolean;
  fileSize: number;
  fileName: string;
}

/**
 * Validates if the file is a valid PDF based on magic bytes (%PDF) or standard text file
 */
export function validateFileHeader(arrayBuffer: ArrayBuffer, fileName: string): { isValid: boolean; error?: string } {
  const extension = fileName.split(".").pop()?.toLowerCase();
  
  if (extension === "txt") {
    return { isValid: true };
  }
  
  if (extension === "pdf") {
    const uint8 = new Uint8Array(arrayBuffer.slice(0, 4));
    // Check if starts with %PDF (hex: 25 50 44 46)
    if (uint8[0] === 0x25 && uint8[1] === 0x50 && uint8[2] === 0x44 && uint8[3] === 0x46) {
      return { isValid: true };
    }
    // Proceed with a warning instead of a hard fail, as some PDFs have prepended bytes or BOM
    console.warn("[PDF Warning] PDF header magic bytes did not match exactly, attempting to parse anyway.");
    return { isValid: true };
  }

  // Treat unrecognized text extensions loosely as txt files instead of failing immediately
  return { isValid: true };
}

/**
 * Extracts raw textual streams from a PDF binary ArrayBuffer
 */
export function extractTextFromPdf(arrayBuffer: ArrayBuffer): string {
  const uint8 = new Uint8Array(arrayBuffer);
  let binaryString = "";
  const chunkSize = 8192;
  
  // Safe chunking to prevent Call Stack exceeded errors on larger documents
  for (let i = 0; i < uint8.length; i += chunkSize) {
    const chunk = uint8.subarray(i, i + chunkSize);
    binaryString += String.fromCharCode.apply(null, Array.from(chunk));
  }

  // Core parsing: Find all text blocks enclosed in standard BT (Begin Text) and ET (End Text) streams
  const textBlocks: string[] = [];
  const btEtRegex = /BT[\s\S]*?ET/g;
  let match;

  while ((match = btEtRegex.exec(binaryString)) !== null) {
    const block = match[0];
    // Find text inside parentheses: e.g. (My text string) Tj or [ (Hello) 10 (World) ] TJ
    const parenRegex = /\(([^)]*)\)/g;
    let parenMatch;
    const blockWords: string[] = [];
    
    while ((parenMatch = parenRegex.exec(block)) !== null) {
      let textSegment = parenMatch[1];
      
      // Clean PDF escaped octal characters (e.g. \377), standard escapes and punctuation
      textSegment = textSegment
        .replace(/\\([0-7]{3})/g, (_, octal) => String.fromCharCode(parseInt(octal, 8)))
        .replace(/\\n/g, "\n")
        .replace(/\\r/g, "\r")
        .replace(/\\t/g, "\t")
        .replace(/\\\(/g, "(")
        .replace(/\\\)/g, ")")
        .replace(/\\/g, "");
      
      blockWords.push(textSegment);
    }
    
    if (blockWords.length > 0) {
      textBlocks.push(blockWords.join(" "));
    }
  }

  // Fallback: If no BT/ET blocks were matched, extract general text patterns (Tj / TJ commands)
  if (textBlocks.length === 0) {
    const fallbackRegex = /\(([^)]*)\)\s*(Tj|TJ|\'|\")/g;
    let fallbackMatch;
    while ((fallbackMatch = fallbackRegex.exec(binaryString)) !== null) {
      let textSegment = fallbackMatch[1];
      textSegment = textSegment
        .replace(/\\([0-7]{3})/g, (_, octal) => String.fromCharCode(parseInt(octal, 8)))
        .replace(/\\n/g, "\n")
        .replace(/\\r/g, "\r")
        .replace(/\\t/g, "\t")
        .replace(/\\\(/g, "(")
        .replace(/\\\)/g, ")")
        .replace(/\\/g, "");
      
      if (textSegment.trim().length > 1) {
        textBlocks.push(textSegment);
      }
    }
  }

  // Clean and filter noise
  const cleanedLines = textBlocks
    .map((line) => line.trim())
    .filter((line) => line.length > 0 && !line.includes("/Font") && !line.includes("/Resources") && !line.includes("/ProcSet"));

  if (cleanedLines.length === 0) {
    // Attempt ASCII word extraction as a absolute backup (e.g. metadata text or basic raw streams)
    const asciiWords = binaryString.match(/[a-zA-Z0-9\s\-\.\,\@\:\/\_]{5,60}/g) || [];
    const filteredAscii = asciiWords.filter((w) => {
      const trimmed = w.trim();
      return (
        trimmed.length > 6 &&
        !trimmed.includes("obj") &&
        !trimmed.includes("endobj") &&
        !trimmed.includes("stream") &&
        !trimmed.includes("endstream") &&
        !trimmed.includes("xref") &&
        !trimmed.includes("trailer")
      );
    });

    if (filteredAscii.length > 15) {
      return filteredAscii.join("\n");
    }
    throw new Error("No readable text found in PDF. The document might be image-only (scanned) or encrypted.");
  }

  return cleanedLines.join("\n");
}

/**
 * Searches and parses typical patterns in resume text to populate candidate info
 */
export function parseResumeMetadata(text: string, fileName: string): { name: string; email: string; summary: string; skills: string[] } {
  // 1. Extract Email
  const emailRegex = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/;
  const emailMatch = text.match(emailRegex);
  const email = emailMatch ? emailMatch[0] : "";

  // 2. Extract Skills (Common catalog mapping)
  const commonSkills = [
    "React", "Vue", "Angular", "TypeScript", "JavaScript", "HTML", "CSS", "Tailwind",
    "Node", "Express", "Python", "Django", "Flask", "FastAPI", "Go", "Golang", "Rust",
    "Java", "Spring", "Kotlin", "Swift", "Docker", "Kubernetes", "AWS", "GCP", "Azure",
    "SQL", "Postgres", "MongoDB", "Redis", "GraphQL", "Git", "CI/CD", "Machine Learning",
    "LLM", "Generative AI", "NLP", "System Design", "Architecture", "API", "REST", "gRPC"
  ];
  
  const matchedSkills: string[] = [];
  const lowerText = text.toLowerCase();
  commonSkills.forEach((skill) => {
    // Look for skills with word boundaries to avoid false positives (e.g., "Go" in "Good")
    const escapedSkill = skill.replace(/[-\/\\^$*+?.()|[\]{}]/g, "\\$&");
    const regex = new RegExp(`\\b${escapedSkill}\\b`, "i");
    if (regex.test(lowerText)) {
      matchedSkills.push(skill);
    }
  });

  // 3. Extract Name
  // Usually the name is on the first 3 lines of text, before the email is defined
  const lines = text.split("\n").map((l) => l.trim()).filter((l) => l.length > 2);
  let name = "";
  
  // Clean line check to pick the first reasonable line
  for (let i = 0; i < Math.min(lines.length, 5); i++) {
    const line = lines[i];
    // Skip if contains email, URL, or common heading words
    if (
      !line.includes("@") &&
      !line.includes("http") &&
      !line.includes("Resume") &&
      !line.includes("Curriculum") &&
      !/skills|experience|education|profile|about|contact/i.test(line) &&
      line.split(/\s+/).length <= 4
    ) {
      name = line;
      break;
    }
  }

  // Fallback to file name if no reasonable name is parsed
  if (!name) {
    const cleanFileName = fileName.split(".")[0].replace(/[-_]/g, " ");
    name = cleanFileName
      .split(/\s+/)
      .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
      .join(" ");
  }

  // 4. Extract or Generate Career Summary
  let summary = "";
  // Look for "Summary", "Profile", "Objective", "About Me" sections
  const summaryHeaderIndex = lines.findIndex((l) => /^(summary|profile|about me|professional summary|objective)$/i.test(l));
  
  if (summaryHeaderIndex !== -1 && lines[summaryHeaderIndex + 1]) {
    summary = lines[summaryHeaderIndex + 1];
    if (lines[summaryHeaderIndex + 2] && lines[summaryHeaderIndex + 2].length > 15) {
      summary += " " + lines[summaryHeaderIndex + 2];
    }
  } else {
    // Generative fallback summary using top credentials
    const skillsList = matchedSkills.slice(0, 5).join(", ");
    summary = `Parsed Candidate showing professional focus in system operations. Strong foundations identified in ${skillsList || "software engineering"}. Ready for adaptive evaluation campaigns.`;
  }

  return {
    name,
    email: email || "candidate@example.com",
    summary: summary.slice(0, 240) + (summary.length > 240 ? "..." : ""),
    skills: matchedSkills,
  };
}
