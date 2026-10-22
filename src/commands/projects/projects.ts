// CMD-PROJECTS: stub until implementation.
export type Project = { title: string; urls: string[]; description: string[] };

export const PROJECTS: Project[] = [];

export function projectsText(projects: Project[]): string {
  void projects;
  throw new Error("not implemented");
}
