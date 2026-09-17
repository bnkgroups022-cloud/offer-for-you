"use client";

import Link from "next/link";
import { Button } from "@/components/ui/Button";
import { EmptyState } from "@/components/dashboard/EmptyState";
import { ProjectCard } from "@/components/projects/ProjectCard";
import { useProjects } from "@/hooks/useProjects";

function ProjectsIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth={1.8}>
      <rect x="3" y="3" width="7" height="7" rx="1.5" />
      <rect x="14" y="3" width="7" height="7" rx="1.5" />
      <rect x="3" y="14" width="7" height="7" rx="1.5" />
      <rect x="14" y="14" width="7" height="7" rx="1.5" />
    </svg>
  );
}

export default function ProjectsPage() {
  const { projects, status, error, deletingId, removeProject } = useProjects();

  return (
    <div className="mx-auto max-w-4xl">
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-xl font-semibold text-white sm:text-2xl">My Projects</h2>
          <p className="mt-1 text-sm text-slate-400">
            Every ad kit you&apos;ve generated, saved automatically to your account.
          </p>
        </div>
        <Link href="/dashboard/generate" className="shrink-0">
          <Button size="md">New Ad Kit</Button>
        </Link>
      </div>

      {error && (
        <div className="mb-4 rounded-xl border border-red-400/20 bg-red-400/10 px-4 py-3 text-sm text-red-300">
          {error}
        </div>
      )}

      {status === "loading" && projects.length === 0 ? (
        <div className="flex flex-col gap-3">
          {[0, 1, 2].map((i) => (
            <div key={i} className="h-24 animate-pulse rounded-2xl bg-white/[0.03]" />
          ))}
        </div>
      ) : projects.length === 0 ? (
        <EmptyState
          icon={<ProjectsIcon />}
          title="No projects yet"
          description="Generate your first ad kit and it'll be saved here automatically — thumbnail, name, and everything the AI wrote."
          action={
            <Link href="/dashboard/generate">
              <Button size="sm" variant="secondary">
                Open AI Generator
              </Button>
            </Link>
          }
        />
      ) : (
        <div className="flex flex-col gap-3">
          {projects.map((project) => (
            <ProjectCard
              key={project.id}
              project={project}
              isDeleting={deletingId === project.id}
              onDelete={removeProject}
            />
          ))}
        </div>
      )}
    </div>
  );
}
