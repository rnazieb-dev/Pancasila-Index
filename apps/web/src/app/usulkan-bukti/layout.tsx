import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/authz";

export default async function UsulkanBuktiLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/masuk?callbackUrl=/usulkan-bukti");
  }

  return <>{children}</>;
}
