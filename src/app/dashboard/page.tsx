"use client";

import Link from "next/link";
import { useAuth } from "@/hooks/useAuth";
import { useProjects } from "@/hooks/useProjects";
import { UploadProductWidget } from "@/components/dashboard/UploadProductWidget";
import { RecentProjectsWidget } from "@/components/dashboard/RecentProjectsWidget";
import { AICreditsWidget } from "@/components/dashboard/AICreditsWidget";
import { DownloadHistoryWidget } from "@/components/dashboard/DownloadHistoryWidget";
import { ProfileWidget } from "@/components/dashboard/ProfileWidget";
import { Button } from "@/components/ui/Button";

export default function DashboardPage() {
  const { user } = useAuth();
  const { projects, status: projectsStatus } = useProjects();
  const firstName = user?.displayName?.split(" ")[0] ?? "there";

  return (
    <div className="mx-auto max-w-6xl">
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-xl font-semibold text-white sm:text-2xl">
            Welcome back, {firstName} 👋
          </h2>
          <p className="mt-1 text-sm text-slate-400">
            The AI Generator is live — turn a product photo into a full ad
            kit, saved automatically to My Projects. Download history
            unlocks in an upcoming phase.
          </p>
        </div>
        <Link href="/dashboard/generate" className="shrink-0">
          <Button size="md">Open AI Generator</Button>
        </Link>
      </div>

      <div className="grid grid-cols-1 gap-5 lg:grid-cols-3">
        <UploadProductWidget className="lg:col-span-2" />
        <AICreditsWidget />

        <RecentProjectsWidget
          projects={projects.slice(0, 4)}
          isLoading={projectsStatus === "loading"}
          className="lg:col-span-2"
        />
        <DownloadHistoryWidget />

        <ProfileWidget className="lg:col-span-3" />
      </div>
    </div>
  );
}
