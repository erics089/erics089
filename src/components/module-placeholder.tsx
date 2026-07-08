import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export function ModulePlaceholder({
  title,
  description,
  phase,
}: {
  title: string;
  description: string;
  phase: string;
}) {
  return (
    <Card className="max-w-2xl">
      <CardHeader>
        <div className="flex items-center gap-2">
          <CardTitle>{title}</CardTitle>
          <Badge variant="secondary">{phase}</Badge>
        </div>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-muted-foreground">
          Dieses Modul ist als Datenmodell und Navigationspunkt in Phase 0 angelegt.
          Die Funktionalität wird in der zugeordneten Roadmap-Phase implementiert
          (siehe <code className="rounded bg-muted px-1 py-0.5">ARCHITECTURE.md</code>).
        </p>
      </CardContent>
    </Card>
  );
}
