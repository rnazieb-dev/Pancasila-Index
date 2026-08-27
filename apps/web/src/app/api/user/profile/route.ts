import { NextResponse, type NextRequest } from "next/server";
import { auth } from "@/auth";
import { db } from "@/lib/db";

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const user = await db.user.findUnique({
    where: { id: session.user.id },
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      affiliation: true,
      title: true,
      funding: true,
      bio: true,
      createdAt: true,
    },
  });

  if (!user) {
    return NextResponse.json({ error: "User not found" }, { status: 404 });
  }

  return NextResponse.json({ data: user });
}

export async function PUT(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let body: Record<string, unknown>;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Format JSON tidak valid" }, { status: 400 });
  }

  const name = body.name ? String(body.name).trim() : undefined;
  const affiliation = body.affiliation !== undefined ? String(body.affiliation).trim() : undefined;
  const title = body.title !== undefined ? String(body.title).trim() : undefined;
  const funding = body.funding !== undefined ? String(body.funding).trim() : undefined;
  const bio = body.bio !== undefined ? String(body.bio).trim() : undefined;

  const updated = await db.user.update({
    where: { id: session.user.id },
    data: {
      ...(name && { name }),
      ...(affiliation !== undefined && { affiliation }),
      ...(title !== undefined && { title }),
      ...(funding !== undefined && { funding }),
      ...(bio !== undefined && { bio }),
    },
  });

  return NextResponse.json({
    success: true,
    message: "Profil berhasil diperbarui.",
    data: {
      id: updated.id,
      name: updated.name,
      email: updated.email,
      affiliation: updated.affiliation,
      title: updated.title,
      funding: updated.funding,
      bio: updated.bio,
    },
  });
}
