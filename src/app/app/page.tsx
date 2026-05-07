import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import AppClient from "./AppClient";

export default async function AppPage() {
  const session = await getSession();
  if (!session) redirect("/login");
  return <AppClient session={session} />;
}
