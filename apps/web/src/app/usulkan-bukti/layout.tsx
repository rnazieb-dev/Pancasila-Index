import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/authz";
import { currentPath } from "@/lib/current-path";

export default async function UsulkanBuktiLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await getCurrentUser();

  if (!user) {
    const tujuan = await currentPath("/usulkan-bukti");
    redirect(`/masuk?callbackUrl=${encodeURIComponent(tujuan)}`);
  }

  return <>{children}</>;
}
