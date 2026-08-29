import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/authz";

export default async function PeerReviewLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/masuk?callbackUrl=/peer-review");
  }

  return <>{children}</>;
}
