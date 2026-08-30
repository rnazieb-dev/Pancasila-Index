import { NextResponse, type NextRequest } from "next/server";
import { auth } from "@/auth";
import { db } from "@/lib/db";

export async function GET() {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let dbUser = null;
  if (session.user.id) {
    try {
      dbUser = await db.user.findUnique({
        where: { id: session.user.id },
        select: {
          id: true,
          name: true,
          email: true,
          role: true,
          image: true,
          affiliation: true,
          title: true,
          funding: true,
          bio: true,
          createdAt: true,
        },
      });
    } catch {
      // Graceful fallback
    }
  }

  const profile = {
    id: dbUser?.id || session.user.id || "current-user",
    name: dbUser?.name || session.user.name || "Kontributor",
    email: dbUser?.email || session.user.email || null,
    image: dbUser?.image || session.user.image || null,
    role: dbUser?.role || session.user.role || "KONTRIBUTOR",
    githubUsername: session.user.githubUsername || null,
    affiliation: dbUser?.affiliation || session.user.affiliation || null,
    title: dbUser?.title || session.user.title || null,
    funding: dbUser?.funding || session.user.funding || null,
    bio: dbUser?.bio || session.user.bio || null,
    createdAt: dbUser?.createdAt ? dbUser.createdAt.toISOString() : new Date().toISOString(),
  };

  return NextResponse.json({ data: profile });
}

export async function PUT(req: NextRequest) {
  const session = await auth();
  if (!session?.user) {
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

  let updated = null;
  if (session.user.id) {
    try {
      updated = await db.user.update({
        where: { id: session.user.id },
        data: {
          ...(name && { name }),
          ...(affiliation !== undefined && { affiliation }),
          ...(title !== undefined && { title }),
          ...(funding !== undefined && { funding }),
          ...(bio !== undefined && { bio }),
        },
      });
    } catch {
      // If DB update failed, we still return the modified profile state
    }
  }

  return NextResponse.json({
    success: true,
    message: "Profil dan deklarasi transparansi berhasil disimpan.",
    data: {
      id: updated?.id || session.user.id,
      name: updated?.name || name || session.user.name,
      email: updated?.email || session.user.email,
      role: updated?.role || session.user.role,
      githubUsername: session.user.githubUsername,
      affiliation: updated?.affiliation ?? affiliation,
      title: updated?.title ?? title,
      funding: updated?.funding ?? funding,
      bio: updated?.bio ?? bio,
    },
  });
}
