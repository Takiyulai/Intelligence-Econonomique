import { useState } from 'react'
import type { FormEvent } from 'react'
import { CheckCircle2, LoaderCircle } from 'lucide-react'
import Carte from './Carte'
import type { Membre, Profil } from '../../services/espace'
import { PROFILS, majProfil } from '../../services/espace'

const champ = 'mt-1.5 w-full rounded-2xl border border-line bg-surface-2 px-4 py-3 focus:border-brand focus:outline-none'

export default function ProfilMembre({ membre, surMaj }: { membre: Membre; surMaj: (m: Membre) => void }) {
  const [f, setF] = useState({
    nom: membre.nom,
    entreprise: membre.entreprise,
    pays: membre.pays,
    whatsapp: membre.whatsapp ?? '',
    profil: membre.profil,
    bulletin: membre.bulletin,
  })
  const [etat, setEtat] = useState<'' | 'envoi' | 'ok'>('')
  const [erreur, setErreur] = useState('')
  const maj = <K extends keyof typeof f>(k: K, v: (typeof f)[K]) => {
    setF((x) => ({ ...x, [k]: v }))
    setEtat('')
  }

  const enregistrer = async (e: FormEvent) => {
    e.preventDefault()
    setEtat('envoi')
    setErreur('')
    try {
      surMaj(await majProfil({ ...f, whatsapp: f.whatsapp.trim() || null }))
      setEtat('ok')
    } catch (err) {
      setEtat('')
      setErreur(err instanceof Error ? err.message : "L'enregistrement a échoué.")
    }
  }

  return (
    <Carte titre="Mon profil" className="max-w-2xl">
      <form onSubmit={enregistrer} className="grid gap-4 sm:grid-cols-2">
        <div className="sm:col-span-2">
          <p className="text-sm text-muted">Adresse de connexion</p>
          <p className="font-semibold">{membre.email}</p>
        </div>
        <label className="text-sm font-medium">
          Nom
          <input className={champ} value={f.nom} onChange={(e) => maj('nom', e.target.value)} autoComplete="name" />
        </label>
        <label className="text-sm font-medium">
          Entreprise ou organisation
          <input className={champ} value={f.entreprise} onChange={(e) => maj('entreprise', e.target.value)} autoComplete="organization" />
        </label>
        <label className="text-sm font-medium">
          Activité
          <select className={champ} value={f.profil} onChange={(e) => maj('profil', e.target.value as Profil)}>
            <option value="">Choisir…</option>
            {PROFILS.map((p) => (
              <option key={p.valeur} value={p.valeur}>
                {p.label}
              </option>
            ))}
          </select>
        </label>
        <label className="text-sm font-medium">
          Pays
          <input className={champ} value={f.pays} onChange={(e) => maj('pays', e.target.value)} autoComplete="country-name" />
        </label>
        <label className="text-sm font-medium sm:col-span-2">
          WhatsApp <span className="font-normal text-muted">(avec l'indicatif, pour les alertes Premium)</span>
          <input className={champ} value={f.whatsapp} onChange={(e) => maj('whatsapp', e.target.value)} placeholder="+225 07 01 02 03 04" autoComplete="tel" inputMode="tel" />
        </label>
        <label className="flex cursor-pointer items-start gap-3 rounded-2xl border border-line p-4 text-sm sm:col-span-2">
          <input type="checkbox" checked={f.bulletin} onChange={(e) => maj('bulletin', e.target.checked)} className="mt-0.5 size-4 shrink-0 accent-[var(--brand)]" />
          <span>
            <span className="font-semibold">Recevoir le bulletin gratuit du vendredi</span>
            <span className="block text-muted">Décochez pour ne plus le recevoir. Les abonnés Premium reçoivent le bulletin complet dans tous les cas.</span>
          </span>
        </label>
        {erreur && (
          <p role="alert" className="rounded-2xl bg-accent-soft px-4 py-2.5 text-sm text-danger sm:col-span-2">
            {erreur}
          </p>
        )}
        <div className="flex items-center gap-3 sm:col-span-2">
          <button
            type="submit"
            disabled={etat === 'envoi'}
            className="inline-flex items-center gap-2 rounded-full bg-brand px-5 py-2.5 font-semibold text-white disabled:opacity-70 dark:text-[#06210f]"
          >
            {etat === 'envoi' && <LoaderCircle size={16} className="animate-spin motion-reduce:animate-none" />}
            Enregistrer
          </button>
          {etat === 'ok' && (
            <span role="status" className="inline-flex items-center gap-1.5 text-sm text-brand">
              <CheckCircle2 size={16} /> Enregistré
            </span>
          )}
        </div>
      </form>
    </Carte>
  )
}
