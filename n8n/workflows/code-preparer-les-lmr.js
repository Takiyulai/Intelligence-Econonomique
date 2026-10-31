// Garde, pour chaque substance, la LMR mangue en vigueur la plus récente (mg/kg). « 0.01* » = limite de quantification : on garde 0.01.
// Dates de l'API au format JJ/MM/AAAA.
// L'API v3.0 peut écrire les champs en minuscules ou en MAJUSCULES : la recherche ignore la casse.
const champ = (x, ...cles) => {
  if (!x || typeof x !== 'object') return null;
  const parNom = new Map(Object.keys(x).map((k) => [k.toLowerCase(), k]));
  for (const c of cles) { const k = parNom.get(c.toLowerCase()); if (k !== undefined && x[k] !== null && x[k] !== '') return x[k]; }
  return null;
};
const enregistrements = (j) => {
  if (!j || typeof j !== 'object' || j.error) return [];
  for (const k of ['value', 'data', 'items', 'results', 'records']) if (Array.isArray(j[k])) return j[k];
  return Object.keys(j).some((k) => /_id$/i.test(k)) ? [j] : []; // réponse en tableau : n8n crée un élément par ligne
};
const valeurs = (nom) => { try { return $(nom).all().flatMap((i) => enregistrements(i.json)); } catch { return []; } };
const date = (v) => {
  const s = String(v ?? '').trim();
  let m = s.match(/^(\d{4})-(\d{2})-(\d{2})/);
  if (m) return `${m[1]}-${m[2]}-${m[3]}`;
  m = s.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})/);
  if (m) return `${m[3]}-${m[2].padStart(2, '0')}-${m[1].padStart(2, '0')}`;
  return null;
};
const nombre = (v) => {
  const s = String(v ?? '').replace(',', '.').replace(/[^0-9.]/g, '');
  return s && Number.isFinite(Number(s)) ? Number(s) : null;
};

const noms = new Map();
for (const s of valeurs('Noms des substances')) {
  const id = champ(s, 'pesticide_residue_id', 'pesticideResidueId', 'substance_id', 'id');
  const n = champ(s, 'pesticide_residue_name', 'pesticideResidueName', 'substance_name', 'name', 'pesticide_residue_name_fr');
  if (id !== null && n) noms.set(String(id), String(n));
}
const mrls = valeurs('LMR mangue (UE)');
const parSubstance = new Map();
for (const m of mrls) {
  const id = champ(m, 'pesticide_residue_id', 'pesticideResidueId', 'substance_id');
  if (id === null) continue;
  // On ignore les anciennes LMR (« No longer applicable ») ; une LMR future est gardée : sa date d'application sera plus récente.
  if (/no longer/i.test(String(champ(m, 'applicability_text') ?? ''))) continue;
  const l = {
    residu_id: String(id),
    residu_nom: noms.get(String(id)) ?? String(champ(m, 'pesticide_residue_name', 'pesticideResidueName', 'substance_name') ?? `substance n° ${id}`),
    valeur: nombre(champ(m, 'mrl_value_only', 'mrl_value', 'mrlValue', 'mrl')), // « No MRL required » → vide
    unite: 'mg/kg',
    date_application: date(champ(m, 'application_date', 'applicability_date', 'entry_into_force_date', 'entryIntoForceDate', 'date')),
  };
  const ex = parSubstance.get(l.residu_id);
  if (!ex || (l.date_application && (!ex.date_application || l.date_application > ex.date_application))) parSubstance.set(l.residu_id, l);
}
const lignes = [...parSubstance.values()];
const erreur = lignes.length ? '' : `LMR : aucune valeur lue. ${JSON.stringify($('Trouver la mangue').first().json.erreur ?? $('LMR mangue (UE)').first().json).slice(0, 300)}`;
return [{ json: { lignes, recues: mrls.length, erreur } }];
