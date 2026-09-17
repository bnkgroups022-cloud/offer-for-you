"use client";

import { useCallback, useEffect, useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { fetchProjects, deleteProject } from "@/lib/projects/client";
import type { Project } from "@/types/project";

export type ProjectsStatus = "idle" | "loading" | "success" | "error";

export function useProjects() {
  const { user } = useAuth();
  const [projects, setProjects] = useState<Project[]>([]);
  const [status, setStatus] = useState<ProjectsStatus>("idle");
  const [error, setError] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    if (!user) return;
    setStatus("loading");
    setError(null);
    try {
      const result = await fetchProjects(user.uid);
      setProjects(result);
      setStatus("success");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not load your projects.");
      setStatus("error");
    }
  }, [user]);

  useEffect(() => {
    if (user) refresh();
  }, [user, refresh]);

  const removeProject = useCallback(
    async (id: string) => {
      if (!user) return;
      setDeletingId(id);
      setError(null);
      try {
        await deleteProject(id, user.uid);
        setProjects((prev) => prev.filter((p) => p.id !== id));
      } catch (err) {
        setError(err instanceof Error ? err.message : "Could not delete this project.");
      } finally {
        setDeletingId(null);
      }
    },
    [user]
  );

  return { projects, status, error, deletingId, refresh, removeProject };
}
