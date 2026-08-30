import fs from 'fs';

const path = 'apps/web/src/app/lembaga/[slug]/[term]/page.tsx';
let content = fs.readFileSync(path, 'utf8');

content = content.replace(
  'import { db } from "@/lib/db";',
  'import { db, isDatabaseAvailable } from "@/lib/db";'
);

content = content.replace(
  'if (!isDatabaseAvailable) { publishedCkanAudits = []; }',
  ''
);

const oldQuery = `  let publishedCkanAudits: any[] = [];
  try {
    publishedCkanAudits = await db.ckanAudit.findMany({
      where: { status: "published" },
      include: { contributor: { select: { name: true, affiliation: true } } },
      orderBy: { createdAt: "desc" },
      take: 3
    });
  } catch (e) {
    // Graceful fallback if db is offline during SSG
    publishedCkanAudits = [];
  }`;

const newQuery = `  let publishedCkanAudits: any[] = [];
  if (isDatabaseAvailable) {
    try {
      publishedCkanAudits = await db.ckanAudit.findMany({
        where: { status: "published" },
        include: { 
          contributor: { 
            select: { name: true, affiliation: true, title: true, funding: true } 
          } 
        },
        orderBy: { createdAt: "desc" },
        take: 3
      });
    } catch (e) {
      publishedCkanAudits = [];
    }
  }`;

content = content.replace(oldQuery, newQuery);

fs.writeFileSync(path, content, 'utf8');
console.log("Term page updated with DB safe guard!");
