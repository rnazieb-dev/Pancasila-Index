import fs from 'fs';

const path = 'apps/web/src/lib/i18n.ts';
let content = fs.readFileSync(path, 'utf8');

content = content.replace(/navMyDrafts:\s*"([^"]+)",/g, (match) => {
  return match + `\n  navAuditData: "Audit Data",`;
});

fs.writeFileSync(path, content, 'utf8');
console.log("i18n updated with navAuditData!");
