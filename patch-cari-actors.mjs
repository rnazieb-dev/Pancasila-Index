import fs from 'fs';

const path = 'apps/web/src/app/cari/page.tsx';
let content = fs.readFileSync(path, 'utf8');

const oldActorsLogic = `    // 4. Tokoh Bangsa / Aktor
    const matchingActors = (dataset.actors || []).filter((actor) => {
      if (!q) return true;
      return (
        actor.name.toLowerCase().includes(q) ||
        (actor.bio_id && actor.bio_id.toLowerCase().includes(q)) ||
        (actor.role_id && actor.role_id.toLowerCase().includes(q))
      );
    });`;

const newActorsLogic = `    // 4. Tokoh Bangsa / Aktor
    const matchingActors = (dataset.actors || []).filter((actor) => {
      if (!q) return true;
      const aliasesMatch = (actor.aliases || []).some(a => a.toLowerCase().includes(q));
      const rolesMatch = (actor.roles || []).some(r => r.title_id?.toLowerCase().includes(q));
      return (
        actor.name.toLowerCase().includes(q) ||
        (actor.bio_id && actor.bio_id.toLowerCase().includes(q)) ||
        aliasesMatch ||
        rolesMatch
      );
    });`;

content = content.replace(oldActorsLogic, newActorsLogic);

fs.writeFileSync(path, content, 'utf8');
console.log("Cari actors fixed!");
