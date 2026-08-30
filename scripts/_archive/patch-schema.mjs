import fs from 'fs';

const path = 'apps/web/prisma/schema.prisma';
let content = fs.readFileSync(path, 'utf8');

const modelToAdd = `
model CkanAudit {
  id                String    @id @default(cuid())
  resourceId        String
  baseUrl           String
  title             String
  contextNote       String
  relevantDimension String
  contributorId     String?
  contributor       User?     @relation(fields: [contributorId], references: [id])
  status            String    @default("pending") // pending, pending_second, published, rejected
  approverNames     String[]  @default([])
  createdAt         DateTime  @default(now())
  updatedAt         DateTime  @updatedAt

  @@index([status, createdAt])
}
`;

content = content.replace('audits         AuditLog[]', 'audits         AuditLog[]\n  ckanAudits     CkanAudit[]');
content = content + modelToAdd;

fs.writeFileSync(path, content, 'utf8');
console.log("Schema updated with CkanAudit model!");
