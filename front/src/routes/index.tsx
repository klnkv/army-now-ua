import { createFileRoute } from "@tanstack/react-router";
import { ArmyApp } from "@/components/army-app";

export const Route = createFileRoute("/")({ component: Home });

function Home() {
  return <ArmyApp />;
}
