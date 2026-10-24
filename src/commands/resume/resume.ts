import { BASE_PATH } from "@/site";

// CMD-RESUME: the PRD's text and the file to download (public/resume.pdf).
export const RESUME_URL = `${BASE_PATH}/resume.pdf`;
export const RESUME_FILENAME = "Han-Zeng-Resume.pdf";

export const RESUME_LINES = [
  "I am looking forward to hearing from you.",
  "(Come on! please! give me job.)",
];

// Plain text as printed, lines joined by "\n".
export function resumeText(): string {
  return RESUME_LINES.join("\n");
}
