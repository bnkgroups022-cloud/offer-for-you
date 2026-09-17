"use client";

import { Card, CardHeader } from "@/components/ui/Card";
import { CopyButton } from "@/components/generator/CopyButton";
import { downloadTextAsset, type ExportableAssetKind } from "@/lib/export/assetExport";

function DownloadIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth={1.8}>
      <path d="M12 3v12m0 0-4-4m4 4 4-4M4 17v3a1 1 0 0 0 1 1h14a1 1 0 0 0 1-1v-3" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export function AssetExportCard({
  kind,
  title,
  content,
  productName,
}: {
  kind: ExportableAssetKind;
  title: string;
  content: string;
  productName: string;
}) {
  return (
    <Card className="flex flex-col">
      <CardHeader>
        <p className="text-sm font-semibold text-white">{title}</p>
        <div className="flex shrink-0 items-center gap-2">
          <CopyButton text={content} />
          <button
            type="button"
            onClick={() => downloadTextAsset(kind, content, productName)}
            className="inline-flex items-center gap-1.5 rounded-lg border border-white/10 bg-white/5 px-2.5 py-1 text-xs font-medium text-slate-300 transition-colors hover:bg-white/10"
          >
            <DownloadIcon />
            Download
          </button>
        </div>
      </CardHeader>

      <p className="max-h-40 flex-1 overflow-y-auto whitespace-pre-wrap text-sm leading-relaxed text-slate-300">
        {content}
      </p>
    </Card>
  );
}
