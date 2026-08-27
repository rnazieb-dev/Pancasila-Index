import { NextResponse, type NextRequest } from "next/server";
import { db } from "@/lib/db";
import { hashPassword } from "@/lib/password";
import { checkRateLimit } from "@/lib/rate-limit";

export async function POST(req: NextRequest) {
  const ip = req.headers.get("x-forwarded-for") ?? "local";
  const rl = checkRateLimit(`register:${ip}`, 10, 60_000);
  if (!rl.ok) {
    return NextResponse.json(
      { error: "Terlalu banyak permintaan pendaftaran. Silakan tunggu 1 menit." },
      { status: 429 }
    );
  }

  let body: Record<string, unknown>;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Format JSON tidak valid" }, { status: 400 });
  }

  const name = String(body.name || "").trim();
  const email = String(body.email || "").toLowerCase().trim();
  const password = String(body.password || "");
  const affiliation = String(body.affiliation || "").trim();
  const title = String(body.title || "").trim();
  const funding = String(body.funding || "").trim();

  if (!name || name.length < 3) {
    return NextResponse.json({ error: "Nama lengkap minimal 3 karakter." }, { status: 422 });
  }

  if (!email || !email.includes("@")) {
    return NextResponse.json({ error: "Alamat email tidak valid." }, { status: 422 });
  }

  if (!password || password.length < 6) {
    return NextResponse.json({ error: "Kata sandi minimal 6 karakter." }, { status: 422 });
  }

  // Cek apakah email sudah terdaftar
  const existingUser = await db.user.findUnique({
    where: { email },
  });

  if (existingUser) {
    return NextResponse.json(
      { error: "Email sudah terdaftar. Silakan masuk menggunakan akun Anda." },
      { status: 409 }
    );
  }

  const passwordHash = hashPassword(password);

  // Jika ini akun pertama di database, jadikan ADMIN; selain itu KONTRIBUTOR
  const totalUsers = await db.user.count();
  const role = totalUsers === 0 ? "ADMIN" : "KONTRIBUTOR";

  const newUser = await db.user.create({
    data: {
      name,
      email,
      passwordHash,
      affiliation: affiliation || null,
      title: title || null,
      funding: funding || null,
      role,
    },
  });

  // Catat AuditLog
  await db.auditLog.create({
    data: {
      actorId: newUser.id,
      action: "auth.register",
      entity: "User",
      entityId: newUser.id,
      meta: JSON.stringify({ email: newUser.email, role: newUser.role }),
    },
  });

  return NextResponse.json(
    {
      success: true,
      message: "Pendaftaran akun berhasil. Silakan masuk.",
      user: {
        id: newUser.id,
        name: newUser.name,
        email: newUser.email,
        role: newUser.role,
      },
    },
    { status: 201 }
  );
}
