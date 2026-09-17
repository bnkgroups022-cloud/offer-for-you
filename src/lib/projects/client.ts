import type { Project } from "@/types/project";
import type { GeneratedAdKit } from "@/types/generator";

interface ProjectsListResponse {
  success: boolean;
  projects?: Project[];
  error?: string;
}

interface ProjectResponse {
  success: boolean;
  project?: Project;
  error?: string;
}

interface SimpleResponse {
  success: boolean;
  error?: string;
}

export async function fetchProjects(uid: string): Promise<Project[]> {
  const response = await fetch(`/api/projects?uid=${encodeURIComponent(uid)}`);
  const body: ProjectsListResponse = await response.json();

  if (!response.ok || !body.success || !body.projects) {
    throw new Error(body.error ?? "Could not load your projects.");
  }

  return body.projects;
}

export interface CreateProjectInput {
  uid: string;
  productName: string;
  category: string;
  language: string;
  imageUrl: string;
  imagePublicId: string;
  adKit: GeneratedAdKit;
}

export async function createProject(input: CreateProjectInput): Promise<Project> {
  const response = await fetch("/api/projects", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(input),
  });
  const body: ProjectResponse = await response.json();

  if (!response.ok || !body.success || !body.project) {
    throw new Error(body.error ?? "Could not save this project.");
  }

  return body.project;
}

export async function deleteProject(id: string, uid: string): Promise<void> {
  const response = await fetch(`/api/projects/${id}?uid=${encodeURIComponent(uid)}`, {
    method: "DELETE",
  });
  const body: SimpleResponse = await response.json();

  if (!response.ok || !body.success) {
    throw new Error(body.error ?? "Could not delete this project.");
  }
}
