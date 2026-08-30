import fs from 'fs';

const path = 'apps/web/src/app/api/v1/openapi.json/route.ts';
let content = fs.readFileSync(path, 'utf8');

const pathToAdd = `
      "/api/v1/ckan-audits": {
        get: {
          summary: "Daftar hasil audit data terbuka pemerintah (CKAN DataStore) yang terverifikasi kuorum",
          parameters: [
            { name: "dimension", in: "query", schema: { type: "string" }, description: "Filter ID dimensi UUD 1945" },
            { name: "status", in: "query", schema: { type: "string", enum: ["published", "pending", "pending_second", "rejected", "all"] } },
            { name: "page", in: "query", schema: { type: "integer", default: 1 } },
            { name: "limit", in: "query", schema: { type: "integer", default: 20 } },
          ],
          responses: { "200": { description: "Daftar audit data terbuka terverifikasi" } },
        },
      },
`;

content = content.replace('paths: {', `paths: {${pathToAdd}`);

fs.writeFileSync(path, content, 'utf8');
console.log("OpenAPI spec updated!");
