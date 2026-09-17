"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { generateVideo, fetchVideoStatus } from "@/lib/projects/client";
import type { ProjectVideo, VideoProviderId } from "@/types/video";

const POLL_INTERVAL_MS = 5000;

/**
 * Drives one project's video-generation lifecycle: submit -> poll -> settle.
 * Kept independent of the wider `projects` list (useProjects) — the caller
 * owns `initialVideo`/`onVideoChange`, so this hook only ever knows about
 * one project's video slot at a time.
 */
export function useVideoGenerator({
  projectId,
  uid,
  imageUrl,
  initialVideo,
  onVideoChange,
}: {
  projectId: string;
  uid: string | undefined;
  imageUrl: string;
  initialVideo: ProjectVideo;
  onVideoChange: (video: ProjectVideo) => void;
}) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const stopPolling = useCallback(() => {
    if (pollRef.current) {
      clearInterval(pollRef.current);
      pollRef.current = null;
    }
  }, []);

  const poll = useCallback(() => {
    if (!uid) return;
    stopPolling();
    pollRef.current = setInterval(async () => {
      try {
        const project = await fetchVideoStatus(projectId, uid);
        onVideoChange(project.video);
        if (project.video.status !== "processing") stopPolling();
      } catch {
        // Transient network hiccup — keep polling, the next tick may succeed.
      }
    }, POLL_INTERVAL_MS);
  }, [projectId, uid, onVideoChange, stopPolling]);

  const generate = useCallback(
    async (provider: VideoProviderId, prompt: string) => {
      if (!uid) return;
      setSubmitError(null);
      setIsSubmitting(true);
      try {
        await generateVideo({ projectId, uid, provider, prompt, imageUrl });
        onVideoChange({ provider, prompt, status: "processing", jobId: null, url: null, error: null });
        poll();
      } catch (err) {
        setSubmitError(err instanceof Error ? err.message : "Could not start video generation.");
      } finally {
        setIsSubmitting(false);
      }
    },
    [projectId, uid, imageUrl, onVideoChange, poll]
  );

  // Resume polling if this project already has a job in flight (e.g. the
  // page was reloaded mid-generation, or the project switch landed on one
  // that was left "processing").
  useEffect(() => {
    stopPolling();
    if (initialVideo.status === "processing") poll();
    return stopPolling;
    // Only re-run when switching to a different project.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [projectId]);

  return { generate, isSubmitting, submitError };
}
