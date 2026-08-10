import { createFileRoute } from "@tanstack/react-router";
import { HiveWorkspace } from "@/components/hive/hive-workspace";

export const Route = createFileRoute("/hive")({
  component: HivePage,
  head: () => ({
    meta: [
      { title: "Hive Brain · Live — Interactive reasoning" },
      {
        name: "description",
        content:
          "Interactive Hive Brain demo: formation modes, active reasoning playback, and public-safe knowledge graph.",
      },
    ],
  }),
});

function HivePage() {
  return <HiveWorkspace />;
}
