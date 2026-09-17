import type { ReactNode } from "react";
import { Card, CardHeader } from "@/components/ui/Card";

export function OutputSection({
  title,
  action,
  children,
}: {
  title: string;
  action?: ReactNode;
  children: ReactNode;
}) {
  return (
    <Card>
      <CardHeader>
        <p className="text-sm font-semibold text-white">{title}</p>
        {action}
      </CardHeader>
      {children}
    </Card>
  );
}
