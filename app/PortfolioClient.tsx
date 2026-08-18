'use client';

import React, { useEffect, useLayoutEffect, useRef, useState, useSyncExternalStore } from 'react';
import Image from 'next/image';
import gsap from 'gsap';
import { Observer } from 'gsap/Observer';

import { PortfolioContent } from '../lib/content';
import { gameAudio } from '../lib/gameAudio';

if (typeof window !== 'undefined') {
  gsap.registerPlugin(Observer);
}

/** useLayoutEffect côté navigateur, useEffect au rendu serveur (évite l'avertissement React). */
const useIsoLayoutEffect = typeof window !== 'undefined' ? useLayoutEffect : useEffect;

type Step = { id: string; label: string; hint: string; fx: string };

const STEPS: Step[] = [
  { id: 'hero',     label: 'SPAWN',    hint: 'Point de départ',     fx: 'START!' },
  { id: 'about',    label: 'PERSO',    hint: 'Fiche du héros',      fx: 'PROFIL!' },
  { id: 'skills',   label: 'POUVOIRS', hint: 'Arbre de talents',    fx: 'POWER!' },
  { id: 'projects', label: 'ARCS',     hint: 'Quêtes terminées',    fx: 'BOOM!' },
  { id: 'journey',  label: 'SAGA',     hint: 'Formation & langues', fx: 'LEVEL UP!' },
  { id: 'contact',  label: 'BOSS',     hint: 'Rejoindre la team',   fx: 'GO!' },
];

type Skill = { n: string; t: string; lv: number; v: number; tags: string[]; hot: number; bonus?: boolean };

const SKILLS: Skill[] = [
  { n: '01', t: 'Web & API', lv: 24, v: 92, tags: ['Next.js', 'ReactJS', 'Laravel', 'NestJS', 'ASP.NET', 'API REST'], hot: 2 },
  { n: '02', t: 'Mobile', lv: 23, v: 90, tags: ['React Native', 'Flutter', 'Expo', 'Firebase'], hot: 2 },
  { n: '03', t: 'Langages', lv: 22, v: 88, tags: ['TypeScript', 'Dart', 'Python', 'C', 'C#'], hot: 3 },
  { n: '04', t: 'Bases de données', lv: 20, v: 85, tags: ['MySQL', 'PostgreSQL', 'MongoDB'], hot: 2 },
  { n: '05', t: 'Conception', lv: 19, v: 82, tags: ['UML', 'Merise', 'Agile Scrum', 'Design Patterns'], hot: 2 },
  { n: '06', t: 'Déploiement', lv: 18, v: 80, tags: ['GCP', 'Docker', 'GH Actions', 'Prometheus', 'Grafana', 'VPS'], hot: 2 },
  { n: '07', t: 'Python avancé', lv: 17, v: 78, tags: ['Automatisation', 'Scrapy', 'Selenium', 'Sockets'], hot: 1 },
  { n: '08', t: 'Bonus', lv: 0, v: 0, hot: 0, bonus: true,
    tags: ['Git', 'GitHub', 'Linux', 'DigitalOcean', 'Vercel', 'OVH', 'O2Switch', 'Stripe'] },
];

type Arc = {
  rank: string; bg: string; code: string; t: string; client: string; year: string;
  tag: string; d: string; bullets: string[];
  /** Captures d'écran : déposer les fichiers dans public/projets/ (la 1re sert de couverture). */
  imgs?: string[];
  /** Orientation des captures : 'web' (paysage) ou 'mobile' (écran de téléphone). */
  shape?: 'web' | 'mobile';
  /** Technos détaillées de la fiche ; à défaut, `tag` est découpé sur « · ». */
  techs?: string[];
  /** Lien public du projet, affiché dans la fiche de quête. */
  link?: string;
};

const ARCS: Arc[] = [
  {
    rank: 'S', bg: 'p-bg-1', code: 'SCAN', t: 'Scan Colis', year: '2026',
    client: 'Pièces et Pneu France · Télétravail', tag: 'React Native · Tailwind',
    shape: 'mobile',
    techs: ['React Native', 'TailwindCSS', 'API SMS/Email', 'PAX A920 Pro', 'Android 10'],
    imgs: [
      '/projets/scan-colis-accueil.png',
      '/projets/scan-colis-historique.png',
      '/projets/scan-colis-filtres.png',
    ],
    d: "Application de scan de colis qui notifie les clients dès que leur colis est disponible pour le retrait.",
    bullets: [
      "Conception et réalisation de l'application de scan de bout en bout",
      'Développement avec React Native et TailwindCSS',
      'Intégration des API de notification par SMS et Email',
      'Mode unité et mode rafale : plus de 100 colis par session',
      'Compatibilité et installation sur terminal PAX A920 Pro (Android 10)',
    ],
  },
  {
    rank: 'S', bg: 'p-bg-2', code: 'IA', t: 'App mobile IA — Flyers & Images', year: '2026',
    client: 'Hipster-Marketing France · Télétravail', tag: 'React Native · NestJS',
    shape: 'mobile',
    techs: ['React Native', 'TailwindCSS', 'NestJS', 'MySQL', 'OpenAI', 'Stable Diffusion', 'Stripe', 'VPS'],
    imgs: [
      '/projets/hipster-creation.jpg',
      '/projets/hipster-styles.jpg',
      '/projets/hipster-resultat.jpg',
      '/projets/hipster-packs.jpg',
      '/projets/hipster-parrainage.jpg',
      '/projets/hipster-accueil.jpg',
      '/projets/hipster-connexion.jpg',
      '/projets/hipster-inscription.jpg',
      '/projets/hipster-mot-de-passe.jpg',
      '/projets/hipster-code-envoye.jpg',
    ],
    d: "Application mobile générative orientée métier : création de flyers et d'images pilotée par l'IA.",
    bullets: [
      'Conception et réalisation de l\'application avec React Native et TailwindCSS',
      'Backend NestJS adossé à une base de données MySQL',
      'Intégration et orchestration de modèles IA (OpenAI, Stable Diffusion)',
      'Minimisation de la consommation de tokens',
      'Mode guidé et mode libre, bibliothèque de styles de visuels',
      'Abonnements par packs via Stripe et déploiement sur VPS',
    ],
  },
  {
    rank: 'A', bg: 'p-bg-3', code: 'PM', t: 'Gestion de projet interne', year: '2026',
    client: 'Hipster-Marketing France · Télétravail', tag: 'Next.js · NestJS',
    shape: 'web',
    techs: ['Next.js', 'NestJS', 'MySQL', 'Stripe', 'VPS'],
    imgs: [
      '/projets/hipster-pm-projet.png',
      '/projets/hipster-pm-dashboard.png',
      '/projets/hipster-pm-employes.png',
      '/projets/hipster-pm-admins.png',
    ],
    d: "Back-office de pilotage de l'agence : projets en tableau kanban, équipes, clients, devis et facturation.",
    bullets: [
      'Développement de la plateforme avec Next.js et NestJS',
      'Suivi des projets en tableau kanban : à faire, en cours, en révision, terminé, bloqué',
      'Gestion des administrateurs, employés et clients avec droits d\'accès',
      'Devis, facturation et tableau de bord des revenus',
      'Intégration des notifications par email et push',
      'Paiement Stripe et déploiement sur VPS',
    ],
  },
  {
    rank: 'S', bg: 'p-bg-4', code: 'GCP', t: 'Haute disponibilité sur GCP', year: '2026',
    client: 'Projet académique', tag: 'GCP · Grafana',
    d: "Mise en place d'une infrastructure résiliente et scalable sur Google Cloud Platform.",
    bullets: [
      "Mise en place d'un cluster sur Google Cloud Platform",
      "Déploiement d'une application Laravel avec MySQL",
      'Configuration résiliente et scalable, monitoring Prometheus et Grafana',
    ],
  },
  {
    rank: 'S', bg: 'p-bg-3', code: 'FARM', t: 'Farm Connect', year: '2026',
    client: 'Prest Agri Services · Application publiée', tag: 'React Native · Supabase',
    shape: 'mobile',
    techs: ['React Native', 'Expo', 'Supabase', 'PostgreSQL', 'Hors-ligne', 'Export PDF'],
    imgs: [
      '/projets/farmconnect-accueil.jpg',
      '/projets/farmconnect-materiels.jpg',
      '/projets/farmconnect-entretiens.jpg',
      '/projets/farmconnect-parcelles.jpg',
      '/projets/farmconnect-stocks.jpg',
      '/projets/farmconnect-fournisseurs.jpg',
    ],
    d: "Gestion d'exploitation agricole : matériels, entretiens, parcelles, stocks et travail de l'équipe réunis dans une seule application.",
    bullets: [
      'Suivi du matériel et carnet d\'entretien exportable en PDF, machine par machine',
      'Parcelles, interventions et registre parcellaire prêt pour un contrôle',
      'Stocks carburant, céréales et produits phytosanitaires, chaque mouvement daté',
      'Collaborateurs invités par e-mail ou par code, avec droits et relevés d\'heures',
      'Messagerie interne : photos, fichiers, messages vocaux et points GPS',
      'Consultation hors connexion, pensée pour le fond des champs',
    ],
  },
  {
    rank: 'S', bg: 'p-bg-4', code: 'ZTRA', t: 'Zintra', year: '2026',
    client: 'Application sociale · Projet en cours', tag: 'React Native · Supabase',
    shape: 'mobile',
    techs: ['React Native', 'Expo', 'Supabase', 'Stripe', 'Mapbox', 'Three.js', 'Skia', 'Sentry'],
    d: "Réseau social d'événements : créer, partager et vivre soirées, concerts, afterworks et rencontres.",
    bullets: [
      'Application Expo / React Native adossée à Supabase',
      'Fil d\'actualité, stories, groupes, messagerie et appels audio/vidéo',
      'Création d\'événements par format : soirée, concert, afterwork, sport, business…',
      'Billetterie et paiements via Stripe, système de gems et de récompenses',
      'Carte Mapbox, avatars 3D (react-three-fiber) et rendu graphique Skia',
      'Interface bilingue français / anglais, supervision des erreurs via Sentry',
    ],
  },
  {
    rank: 'A', bg: 'p-bg-1', code: 'API', t: 'API Todo List', year: '2026',
    client: 'Projet personnel', tag: 'ASP.NET Minimal API',
    d: "API REST complète construite avec ASP.NET Minimal API.",
    bullets: [
      "Conception d'une API REST (opérations CRUD)",
      'Documentation des end-points via Swagger UI',
    ],
  },
  {
    rank: 'A', bg: 'p-bg-2', code: 'WEB', t: 'Site vitrine customisable', year: '2025',
    client: 'Xternpro · Télétravail', tag: 'Laravel · Filament',
    link: 'https://xternpro.com',
    shape: 'web',
    imgs: [
      '/projets/xternpro-accueil.png',
      '/projets/xternpro-presentation.png',
      '/projets/xternpro-connexion.png',
    ],
    d: "Site vitrine moderne pour XTern Pro, entièrement personnalisable par le client.",
    bullets: [
      "Conception et réalisation d'un site vitrine moderne",
      'Développement avec Laravel et Filament PHP',
      "Mise en place d'une architecture de type CMS",
    ],
  },
  {
    rank: 'A', bg: 'p-bg-3', code: 'CAR', t: 'Réservation de véhicules', year: '2024',
    client: 'Vezotours · Télétravail', tag: 'Laravel · React',
    d: "Plateforme de réservation de véhicules, de la conception au déploiement.",
    bullets: [
      "Conception et réalisation de la plateforme de réservation",
      'Développement fullstack avec Laravel et React',
    ],
  },
  {
    rank: 'B', bg: 'p-bg-4', code: 'JOB', t: 'Mise en relation recruteurs', year: '2023',
    client: "APRHMADA Human Cart'office · Antananarivo", tag: 'Laravel',
    d: "Plateforme web de recrutement reliant recruteurs et chercheurs d'emploi.",
    bullets: [
      "Conception et réalisation d'une plateforme web de recrutement",
      'Développement avec Laravel',
    ],
  },
];

/** Onglets du panneau « Arcs » : applications mobiles d'un côté, le reste de l'autre.
 *  Les projets les mieux illustrés passent devant, la vitrine s'ouvrant sur le premier. */
const MOBILE_ARCS = ARCS
  .filter((a) => a.shape === 'mobile')
  .sort((a, b) => (b.imgs?.length ?? 0) - (a.imgs?.length ?? 0));
const WEB_ARCS = ARCS.filter((a) => a.shape !== 'mobile');

const SAGA = [
  { y: '2025 — 2026', t: 'Master 2 en Informatique', p: 'ENI, Toliara', cur: true },
  { y: '2024 — 2025', t: 'Master 1 en Informatique', p: 'ENI, Toliara' },
  { y: '2021 — 2024', t: 'Licence en Informatique (L1 → L3)', p: 'ENI, Toliara' },
  { y: '2022 — 2023', t: 'Certification Développeur Backend', p: 'SAYNA, Toliara' },
  { y: '2022 — 2023', t: 'Communication & Développement Personnel', p: 'Hello Elton' },
];

const LANGS = [
  { k: 'FRANÇAIS', lv: 'Courant', v: 95 },
  { k: 'ANGLAIS', lv: 'Technique', v: 70 },
  { k: 'ALLEMAND', lv: 'Basique', v: 35 },
];

/**
 * Préférence de son, partagée entre le rendu et le moteur audio.
 * Le serveur suppose « activé » ; le navigateur lit le choix mémorisé.
 */
const soundStore = {
  listeners: new Set<() => void>(),
  subscribe(cb: () => void) {
    soundStore.listeners.add(cb);
    return () => { soundStore.listeners.delete(cb); };
  },
  read() {
    return window.localStorage.getItem('rd-sound') !== 'off';
  },
  write(on: boolean) {
    window.localStorage.setItem('rd-sound', on ? 'on' : 'off');
    soundStore.listeners.forEach((l) => l());
  },
};

/** Traînée du curseur : du cœur incandescent à la fumée. Plus la particule est
 *  loin dans la liste, plus elle traîne — la queue se forme donc toujours à
 *  l'opposé du mouvement, quel que soit le sens. */
const FLAME = [
  { size: 20, lag: 0.05, from: '#FFFFFF', to: '#FFD166', blur: 0, opacity: 1 },
  { size: 17, lag: 0.09, from: '#FFE28A', to: '#FFA537', blur: 1, opacity: 0.95 },
  { size: 15, lag: 0.14, from: '#FFB25A', to: '#F07217', blur: 2, opacity: 0.85 },
  { size: 12, lag: 0.2, from: '#F58A2E', to: '#E8621A', blur: 3, opacity: 0.7 },
  { size: 9, lag: 0.27, from: '#E8621A', to: '#B03C08', blur: 4, opacity: 0.55 },
  { size: 6, lag: 0.35, from: '#B03C08', to: '#5E2A10', blur: 5, opacity: 0.4 },
];

const TRAITS = ["Esprit d'analyse", 'Adaptabilité', 'Curiosité technologique', 'Créativité'];

/**
 * Vrai une fois le composant monté.
 *
 * Sert à rendre, lors de la toute première passe client, exactement ce que le
 * serveur a produit — puis seulement à basculer sur la version adaptée à
 * l'écran. Sans cela, le carousel n'a pas le même nombre de pages de part et
 * d'autre et React signale une divergence d'hydratation.
 */
function useMounted() {
  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- bascule volontaire après hydratation
    setMounted(true);
  }, []);
  return mounted;
}

/**
 * Nombre d'éléments par page selon la largeur de l'écran.
 *
 * `useSyncExternalStore` plutôt qu'un état mis à jour dans un effet : le rendu
 * serveur et la première passe client partagent alors la même valeur, sinon
 * React signale une différence d'hydratation sur les boutons de pagination.
 */
function subscribeResize(cb: () => void) {
  window.addEventListener('resize', cb);
  return () => window.removeEventListener('resize', cb);
}

function usePerPage(base: number, sm: number, lg: number) {
  return useSyncExternalStore(
    subscribeResize,
    () => {
      const w = window.innerWidth;
      return w >= 1024 ? lg : w >= 640 ? sm : base;
    },
    () => base,
  );
}

type CarouselProps<T> = {
  items: T[];
  /** colonnes puis lignes, par palier : [mobile, tablette, desktop] */
  cols: [number, number, number];
  rows: [number, number, number];
  /** actif = ce panneau est à l'écran, on peut capter les flèches ← → */
  enabled: boolean;
  label: string;
  render: (item: T, index: number) => React.ReactNode;
};

function Carousel<T>({ items, cols, rows, enabled, label, render }: CarouselProps<T>) {
  const mounted = useMounted();
  const liveCols = usePerPage(cols[0], cols[1], cols[2]);
  const liveRows = usePerPage(rows[0], rows[1], rows[2]);
  const colCount = mounted ? liveCols : cols[0];
  const rowCount = mounted ? liveRows : rows[0];
  const perPage = Math.max(1, colCount * rowCount);
  const pageCount = Math.max(1, Math.ceil(items.length / perPage));

  const [page, setPage] = useState(0);
  const trackRef = useRef<HTMLDivElement>(null);
  const mountedRef = useRef(false);
  const current = Math.min(page, pageCount - 1);

  const pages: T[][] = [];
  for (let i = 0; i < items.length; i += perPage) pages.push(items.slice(i, i + perPage));

  useEffect(() => {
    if (!trackRef.current) return;
    gsap.to(trackRef.current, { xPercent: -100 * current, duration: 0.55, ease: 'power3.inOut' });
    if (mountedRef.current) gameAudio.click(760);
    mountedRef.current = true;
    // la hauteur de page a pu changer : on redemande un ajustement à l'écran
    window.dispatchEvent(new Event('resize'));
  }, [current, perPage]);

  const go = React.useCallback(
    (dir: number) => setPage((p) => Math.min(pageCount - 1, Math.max(0, Math.min(p, pageCount - 1) + dir))),
    [pageCount]
  );

  useEffect(() => {
    if (!enabled || pageCount < 2) return;
    const onKey = (e: KeyboardEvent) => {
      const tag = (e.target as HTMLElement).tagName;
      if (tag === 'INPUT' || tag === 'TEXTAREA') return;
      if (e.key === 'ArrowRight') { e.preventDefault(); go(1); }
      else if (e.key === 'ArrowLeft') { e.preventDefault(); go(-1); }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [enabled, pageCount, go]);

  if (!mounted) {
    return (
      <div
        className="grid gap-2.5 px-0.5 pb-1"
        style={{ gridTemplateColumns: `repeat(${cols[0]}, minmax(0, 1fr))` }}
      >
        {items.map((item, i) => render(item, i))}
      </div>
    );
  }

  return (
    <div>
      <div className="overflow-hidden">
        <div ref={trackRef} className="flex w-full">
          {pages.map((group, gi) => (
            <div
              key={gi}
              className="grid w-full shrink-0 grow-0 basis-full gap-2.5 px-0.5 pb-1"
              style={{ gridTemplateColumns: `repeat(${colCount}, minmax(0, 1fr))` }}
              aria-hidden={gi !== current}
              inert={gi !== current}
            >
              {group.map((item, i) => render(item, gi * perPage + i))}
            </div>
          ))}
        </div>
      </div>

      {pageCount > 1 && (
        <div className="mt-3 flex items-center justify-center gap-3">
          <button
            onClick={() => go(-1)}
            disabled={current === 0}
            aria-label={`${label} — page précédente`}
            className="grid h-7 w-7 place-items-center rounded-md border-2 border-ink bg-ink font-manga text-sm text-flame shadow-manga-sm transition-all duration-150 hover:bg-orange hover:text-cream disabled:opacity-30"
          >
            ◀
          </button>

          <div className="flex items-center gap-1.5">
            {pages.map((_, i) => (
              <button
                key={i}
                onClick={() => setPage(i)}
                aria-label={`${label} — page ${i + 1}`}
                aria-current={i === current ? 'true' : undefined}
                style={{ transform: 'rotate(45deg)' }}
                className={`h-2.5 w-2.5 border-2 border-ink transition-colors duration-200 ${i === current ? 'bg-orange' : 'bg-transparent hover:bg-sand'}`}
              />
            ))}
          </div>

          <span className="font-pixel text-[7px] tracking-widest text-brown">
            {String(current + 1).padStart(2, '0')}/{String(pageCount).padStart(2, '0')}
          </span>

          <button
            onClick={() => go(1)}
            disabled={current === pageCount - 1}
            aria-label={`${label} — page suivante`}
            className="grid h-7 w-7 place-items-center rounded-md border-2 border-ink bg-ink font-manga text-sm text-flame shadow-manga-sm transition-all duration-150 hover:bg-orange hover:text-cream disabled:opacity-30"
          >
            ▶
          </button>
        </div>
      )}
    </div>
  );
}

/**
 * Capture d'écran d'un projet. Tant que le fichier n'existe pas (ou en cas
 * d'erreur de chargement), on retombe sur la trame manga et le code du projet.
 */
function Shot({ src, alt, code, sizes, className, fit = 'cover' }: {
  src?: string; alt: string; code: string; sizes: string; className: string;
  /** « contain » pour les captures de téléphone, qui ne doivent jamais être rognées. */
  fit?: 'cover' | 'contain';
}) {
  const [failed, setFailed] = useState(false);

  if (!src || failed) {
    return (
      <span className={`absolute inset-0 grid place-items-center font-manga text-ink drop-shadow-[1px_1px_0_rgba(255,255,255,.45)] ${className}`}>
        {code}
      </span>
    );
  }
  return (
    <Image
      src={src}
      alt={alt}
      fill
      sizes={sizes}
      className={fit === 'contain' ? 'object-contain p-1.5' : 'object-cover object-top'}
      onError={() => setFailed(true)}
    />
  );
}

/**
 * Découpe un texte en spans animables (un par caractère).
 *
 * Chaque mot est enveloppé dans un bloc insécable : sans cela, les lettres
 * étant des `inline-block` indépendants, le navigateur coupe au milieu d'un
 * mot (« FULLSTAC / K »). Les retours à la ligne ne se font donc qu'aux
 * espaces, restés de vrais nœuds texte entre les blocs.
 */
function Chars({ text }: { text: string }) {
  const words = text.split(' ');
  return (
    <>
      {words.map((word, w) => (
        <React.Fragment key={w}>
          <span className="inline-block whitespace-nowrap">
            {Array.from(word).map((c, i) => (
              <span key={i} className="hero-char inline-block will-change-transform">
                {c}
              </span>
            ))}
          </span>
          {w < words.length - 1 ? ' ' : null}
        </React.Fragment>
      ))}
    </>
  );
}

export default function PortfolioClient({ data }: { data: PortfolioContent }) {
  const flameRefs = useRef<(HTMLDivElement | null)[]>([]);
  const stageRef = useRef<HTMLDivElement>(null);
  const deckRef = useRef<HTMLDivElement>(null);
  const fxRef = useRef<HTMLDivElement>(null);
  const lvlRef = useRef<HTMLSpanElement>(null);
  const formBtnRef = useRef<HTMLButtonElement>(null);
  const pipRefs = useRef<(HTMLButtonElement | null)[]>([]);

  const idxRef = useRef(0);
  const busyRef = useRef(true);
  const goToRef = useRef<(next: number) => void>(() => {});

  const [active, setActive] = useState(0);
  const mounted = useMounted();
  const soundPref = useSyncExternalStore(soundStore.subscribe, soundStore.read, () => true);
  const sound = mounted ? soundPref : true;

  /* Panneau « Arcs » : onglet actif et vitrine mobile */
  const [arcTab, setArcTab] = useState<'mobile' | 'web'>('mobile');
  const [mobIdx, setMobIdx] = useState(0);
  const [mobShot, setMobShot] = useState(0);
  const mobRef = useRef<HTMLDivElement>(null);
  const mobScreenRef = useRef<HTMLDivElement>(null);

  /* Modal projet + transition d'élément partagé */
  const [arc, setArc] = useState<number | null>(null);
  const [shot, setShot] = useState(0);
  const shotRef = useRef<HTMLDivElement>(null);
  const arcSrcRef = useRef<HTMLElement | null>(null);
  const arcRectRef = useRef<DOMRect | null>(null);
  const modalWrapRef = useRef<HTMLDivElement>(null);
  const modalThumbRef = useRef<HTMLDivElement>(null);
  const modalBodyRef = useRef<HTMLDivElement>(null);
  const backdropRef = useRef<HTMLDivElement>(null);
  const modalOpenRef = useRef(false);
  const closingRef = useRef(false);

  const waNumber = data.contactPhone.replace(/[^0-9]/g, '');

  /* ------------------------------------------------------------------ *
   *  Deck : transitions de panneaux + capture du scroll (GSAP Observer) *
   * ------------------------------------------------------------------ */
  useEffect(() => {
    const stage = stageRef.current;
    if (!stage) return;

    document.body.classList.add('deck-locked');

    const ctx = gsap.context(() => {
      const panels = gsap.utils.toArray<HTMLElement>('[data-panel]');
      const cols = gsap.utils.toArray<HTMLElement>('.wipe-col');
      const fx = fxRef.current;

      gsap.set(panels, { autoAlpha: 0, zIndex: 1 });
      gsap.set(panels[idxRef.current], { autoAlpha: 1, zIndex: 2 });
      gsap.set('[data-anim]', { autoAlpha: 0 });

      /* --- Chaque panneau se met à l'échelle de l'écran ---
       * `zoom` plutôt que `transform` : il agit sur la mise en page, donc le
       * conteneur mesure bien la hauteur réduite. En dessous du plancher, on
       * cesse de réduire (le texte deviendrait illisible) et le panneau défile
       * — cas des tout petits téléphones uniquement. */
      const MIN_ZOOM = 0.72;
      let rafId = 0;
      const fit = () => {
        panels.forEach((p) => {
          const box = p.querySelector<HTMLElement>('[data-fitbox]');
          const content = p.querySelector<HTMLElement>('[data-fit]');
          if (!box || !content) return;
          content.style.zoom = '1';
          const w = content.offsetWidth;
          const h = content.offsetHeight;
          if (!w || !h) return;
          const k = Math.min(1, box.clientWidth / w, box.clientHeight / h);
          content.style.zoom = String(Math.max(MIN_ZOOM, k));
        });
      };
      const scheduleFit = () => {
        cancelAnimationFrame(rafId);
        rafId = requestAnimationFrame(fit);
      };
      scheduleFit();
      document.fonts?.ready.then(scheduleFit).catch(() => {});
      window.addEventListener('resize', scheduleFit);
      window.addEventListener('orientationchange', scheduleFit);

      /** Animations « d'arrivée » propres à chaque panneau. */
      const enter = (i: number) => {
        const p = panels[i];
        if (!p) return;

        p.querySelectorAll<HTMLElement>('[data-bar]').forEach((bar, k) => {
          gsap.fromTo(
            bar,
            { width: '0%' },
            {
              width: `${bar.dataset.val ?? 0}%`,
              duration: 0.9,
              delay: 0.15 + k * 0.06,
              ease: 'power3.out',
            }
          );
        });

        p.querySelectorAll<HTMLElement>('[data-count]').forEach((el) => {
          const target = Number(el.dataset.count ?? 0);
          const obj = { v: 0 };
          gsap.to(obj, {
            v: target,
            duration: 1.2,
            ease: 'power2.out',
            onUpdate: () => { el.textContent = String(Math.round(obj.v)); },
          });
        });

        if (i === 0) {
          gsap.fromTo(
            p.querySelectorAll('.hero-char'),
            { yPercent: 130, autoAlpha: 0, rotate: 10 },
            {
              yPercent: 0, autoAlpha: 1, rotate: 0,
              duration: 0.7, ease: 'back.out(2.2)',
              stagger: { each: 0.032 },
            }
          );
        }
      };

      /** Transition d'un panneau à l'autre : rideau manga + onomatopée. */
      const goTo = (next: number) => {
        const cur = idxRef.current;
        if (busyRef.current || next === cur || next < 0 || next >= panels.length) return;

        const dir = next > cur ? 1 : -1;
        busyRef.current = true;
        idxRef.current = next;
        setActive(next);

        const from = panels[cur];
        const to = panels[next];
        const outEls = from.querySelectorAll('[data-anim]');
        const inEls = to.querySelectorAll('[data-anim]');

        if (fx) fx.textContent = STEPS[next].fx;
        gameAudio.swoosh(dir);
        gsap.set(cols, { yPercent: dir > 0 ? 100 : -100 });

        gsap.timeline({
          defaults: { ease: 'power3.out' },
          onComplete: () => { busyRef.current = false; },
        })
          .to(outEls, {
            autoAlpha: 0,
            y: -40 * dir,
            filter: 'blur(8px)',
            duration: 0.32,
            ease: 'power2.in',
            stagger: { each: 0.02, from: dir > 0 ? 'start' : 'end' },
          }, 0)
          .to(cols, {
            yPercent: 0,
            duration: 0.42,
            ease: 'power3.inOut',
            stagger: { each: 0.04, from: dir > 0 ? 'start' : 'end' },
          }, 0.04)
          .fromTo(fx,
            { autoAlpha: 0, scale: 0.45, rotate: -16 },
            { autoAlpha: 1, scale: 1, rotate: -6, duration: 0.24, ease: 'back.out(2.6)' },
            '-=0.16')
          .add(() => {
            gsap.set(from, { autoAlpha: 0, zIndex: 1 });
            gsap.set(to, { autoAlpha: 1, zIndex: 2 });
          })
          .to(fx, { autoAlpha: 0, scale: 1.7, duration: 0.26, ease: 'power2.in' }, '+=0.05')
          .to(cols, {
            yPercent: dir > 0 ? -100 : 100,
            duration: 0.52,
            ease: 'power3.inOut',
            stagger: { each: 0.04, from: dir > 0 ? 'end' : 'start' },
          }, '<')
          .fromTo(inEls,
            { autoAlpha: 0, y: 48 * dir, scale: 0.97, filter: 'blur(6px)' },
            {
              autoAlpha: 1, y: 0, scale: 1, filter: 'blur(0px)',
              duration: 0.55,
              stagger: { each: 0.04, from: dir > 0 ? 'start' : 'end' },
            }, '<0.16')
          .add(() => enter(next), '<')
          .to(deckRef.current, {
            keyframes: { x: [0, -9, 7, -4, 0], y: [0, 6, -5, 3, 0] },
            duration: 0.36, ease: 'none',
          }, '<');
      };

      goToRef.current = goTo;

      /* --- Intro : le rideau s'ouvre sur le premier panneau --- */
      if (fx) fx.textContent = STEPS[0].fx;
      gsap.timeline({ delay: 0.15 })
        .set(cols, { yPercent: 0 })
        .to(cols, {
          yPercent: -100,
          duration: 0.65,
          ease: 'power3.inOut',
          stagger: { each: 0.05, from: 'edges' },
        })
        .fromTo(panels[0].querySelectorAll('[data-anim]'),
          { autoAlpha: 0, y: 46, scale: 0.97 },
          { autoAlpha: 1, y: 0, scale: 1, duration: 0.6, stagger: 0.05, ease: 'power3.out' },
          '-=0.32')
        .add(() => enter(0), '<0.1')
        .add(() => { busyRef.current = false; });

      /* --- Traits de vitesse en rotation continue --- */
      gsap.to('.speed-lines g', {
        rotation: 360,
        transformOrigin: '600px 400px',
        duration: 90,
        repeat: -1,
        ease: 'none',
      });

      /* --- Curseur boule de feu --- */
      const flames = flameRefs.current.filter(Boolean) as HTMLDivElement[];
      const setX = flames.map((el, i) =>
        gsap.quickTo(el, 'x', { duration: FLAME[i].lag, ease: 'power3' }));
      const setY = flames.map((el, i) =>
        gsap.quickTo(el, 'y', { duration: FLAME[i].lag, ease: 'power3' }));
      const setRot = flames.map((el, i) =>
        gsap.quickTo(el, 'rotation', { duration: FLAME[i].lag + 0.06, ease: 'power2' }));
      const setStretch = flames.map((el, i) =>
        gsap.quickTo(el, 'scaleX', { duration: FLAME[i].lag + 0.06, ease: 'power2' }));

      let lastX = -100;
      let lastY = -100;
      let hovering = false;

      const onMouseMove = (e: MouseEvent) => {
        const dx = e.clientX - lastX;
        const dy = e.clientY - lastY;
        lastX = e.clientX;
        lastY = e.clientY;

        // la flamme s'étire dans le sens du déplacement, d'autant plus qu'il est rapide
        const speed = Math.min(Math.hypot(dx, dy), 60);
        const angle = (Math.atan2(dy, dx) * 180) / Math.PI;
        const stretch = 1 + (speed / 60) * 1.1;

        flames.forEach((_, i) => {
          setX[i](e.clientX);
          setY[i](e.clientY);
          if (speed > 1) setRot[i](angle);
          setStretch[i](hovering ? 1.6 : stretch);
        });
      };

      const onOver = (e: MouseEvent) => {
        const hit = !!(e.target as HTMLElement).closest('a, button, [data-hover]');
        if (hit === hovering) return;
        hovering = hit;
        flames.forEach((el, i) => {
          gsap.to(el, { scale: hit ? 1.7 : 1, duration: 0.25, ease: 'back.out(2)' });
          gsap.to(el, { opacity: hit ? 1 : FLAME[i].opacity, duration: 0.25 });
        });
      };

      // scintillement permanent : la flamme ne doit jamais paraître figée
      flames.forEach((el, i) => {
        gsap.to(el, {
          scaleY: 0.82,
          duration: 0.16 + i * 0.03,
          repeat: -1,
          yoyo: true,
          ease: 'sine.inOut',
        });
      });

      window.addEventListener('mousemove', onMouseMove);
      window.addEventListener('mouseover', onOver);

      /* --- Le scroll change de page, il ne défile jamais --- */
      /** Vrai si le panneau courant ne peut plus défiler dans cette direction. */
      const atEdge = (dir: number) => {
        const sc = panels[idxRef.current]?.querySelector<HTMLElement>('[data-fitbox]');
        if (!sc || sc.scrollHeight <= sc.clientHeight + 2) return true;
        return dir > 0
          ? sc.scrollTop + sc.clientHeight >= sc.scrollHeight - 4
          : sc.scrollTop <= 4;
      };
      const tryGo = (dir: number) => {
        if (modalOpenRef.current || !atEdge(dir)) return;
        goTo(idxRef.current + dir);
      };

      const observer = Observer.create({
        target: window,
        type: 'wheel,touch,pointer',
        wheelSpeed: -1,
        tolerance: 12,
        dragMinimum: 24,
        preventDefault: false,
        onUp: () => tryGo(1),
        onDown: () => tryGo(-1),
      });

      const onKey = (e: KeyboardEvent) => {
        const tag = (e.target as HTMLElement).tagName;
        if (tag === 'INPUT' || tag === 'TEXTAREA' || modalOpenRef.current) return;
        if (['ArrowDown', 'PageDown', ' '].includes(e.key)) { e.preventDefault(); tryGo(1); }
        else if (['ArrowUp', 'PageUp'].includes(e.key)) { e.preventDefault(); tryGo(-1); }
        else if (e.key === 'Home') { e.preventDefault(); goTo(0); }
        else if (e.key === 'End') { e.preventDefault(); goTo(panels.length - 1); }
      };
      window.addEventListener('keydown', onKey);

      return () => {
        cancelAnimationFrame(rafId);
        panels.forEach((p) => {
          const content = p.querySelector<HTMLElement>('[data-fit]');
          if (content) content.style.zoom = '';
        });
        window.removeEventListener('resize', scheduleFit);
        window.removeEventListener('orientationchange', scheduleFit);
        window.removeEventListener('mousemove', onMouseMove);
        window.removeEventListener('mouseover', onOver);
        window.removeEventListener('keydown', onKey);
        observer.kill();
      };
    }, stageRef);

    return () => {
      document.body.classList.remove('deck-locked');
      ctx.revert();
      busyRef.current = true;
    };
  }, []);

  /* ------------------------------------------ *
   *  Jauge de pouvoir (barre de vie) façon jeu  *
   * ------------------------------------------ */
  useEffect(() => {
    const pct = ((active + 1) / STEPS.length) * 100;

    gsap.to('.pwr-fill-y', { height: `${pct}%`, duration: 0.7, ease: 'power3.out' });
    gsap.to('.pwr-fill-x', { width: `${pct}%`, duration: 0.7, ease: 'power3.out' });

    const labels = Array.from(document.querySelectorAll<HTMLElement>('.pwr-pct'));
    if (labels.length) {
      const obj = { v: Number(labels[0].dataset.v ?? 0) };
      gsap.to(obj, {
        v: pct,
        duration: 0.7,
        ease: 'power3.out',
        onUpdate: () => {
          labels.forEach((el) => {
            el.textContent = `${Math.round(obj.v)}%`;
            el.dataset.v = String(obj.v);
          });
        },
      });
    }

    const pip = pipRefs.current[active];
    if (pip) {
      gsap.fromTo(pip,
        { scale: 0.6 },
        { scale: 1, duration: 0.75, ease: 'elastic.out(1, 0.45)', transformOrigin: 'left center' });
    }

    if (lvlRef.current) {
      gsap.fromTo(lvlRef.current,
        { yPercent: 45, autoAlpha: 0 },
        { yPercent: 0, autoAlpha: 1, duration: 0.4, ease: 'back.out(2)' });
    }
  }, [active]);

  useEffect(() => {
    // Les navigateurs n'autorisent l'audio qu'après un geste de l'utilisateur :
    // on applique la préférence enregistrée au premier geste, pas au montage.
    gameAudio.setEnabled(soundStore.read());
    // Tentative de lecture dès le chargement. La plupart des navigateurs la
    // refusent tant que la page n'a pas été touchée : les écouteurs ci-dessous
    // reprennent alors la main au premier geste.
    gameAudio.unlock();

    const unlock = () => gameAudio.unlock();
    window.addEventListener('pointerdown', unlock);
    window.addEventListener('keydown', unlock);
    window.addEventListener('touchstart', unlock, { passive: true });
    window.addEventListener('wheel', unlock, { passive: true });

    return () => {
      window.removeEventListener('pointerdown', unlock);
      window.removeEventListener('keydown', unlock);
      window.removeEventListener('touchstart', unlock);
      window.removeEventListener('wheel', unlock);
      gameAudio.dispose();
    };
  }, []);

  const toggleSound = () => {
    const on = !sound;
    soundStore.write(on);
    if (on) {
      gameAudio.unlock();
      gameAudio.setEnabled(true);
      gameAudio.click(660);
    } else {
      gameAudio.setEnabled(false);
    }
  };

  /* La bascule d'onglet change la hauteur du contenu : on redemande l'ajustement. */
  useEffect(() => {
    window.dispatchEvent(new Event('resize'));
  }, [arcTab, mobIdx]);

  /* Entrée en cascade des détails du projet mobile courant. */
  useEffect(() => {
    if (arcTab !== 'mobile' || !mobRef.current) return;
    gsap.fromTo(mobRef.current.querySelectorAll('[data-mob]'),
      { autoAlpha: 0, y: 22 },
      { autoAlpha: 1, y: 0, duration: 0.45, stagger: 0.05, ease: 'power3.out' });
  }, [mobIdx, arcTab]);

  /* Fondu de l'écran du mockup au changement de capture. */
  useEffect(() => {
    if (!mobScreenRef.current) return;
    gsap.fromTo(mobScreenRef.current,
      { autoAlpha: 0.3, scale: 1.03 },
      { autoAlpha: 1, scale: 1, duration: 0.32, ease: 'power3.out' });
  }, [mobShot, mobIdx]);

  const goMobile = (dir: number) => {
    if (MOBILE_ARCS.length < 2) return;
    setMobIdx((i) => (i + dir + MOBILE_ARCS.length) % MOBILE_ARCS.length);
    setMobShot(0);
    gameAudio.click(700);
  };

  /* Flèches ← → : capture suivante dans l'onglet mobile. */
  useEffect(() => {
    if (active !== 3 || arcTab !== 'mobile') return;
    const onKey = (e: KeyboardEvent) => {
      const tag = (e.target as HTMLElement).tagName;
      if (tag === 'INPUT' || tag === 'TEXTAREA') return;
      const shots = MOBILE_ARCS[mobIdx]?.imgs?.length ?? 0;
      if (e.key === 'ArrowRight') { e.preventDefault(); if (shots) setMobShot((v) => (v + 1) % shots); }
      else if (e.key === 'ArrowLeft') { e.preventDefault(); if (shots) setMobShot((v) => (v - 1 + shots) % shots); }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [active, arcTab, mobIdx]);

  const nav = (i: number) => goToRef.current?.(i);

  /* --- Modal projet : la vignette de la carte devient l'image du modal --- */
  const openArc = (i: number, e: React.MouseEvent<HTMLElement>) => {
    if (arc !== null) return;
    const thumb = e.currentTarget.querySelector<HTMLElement>('[data-thumb]');
    arcSrcRef.current = thumb;
    arcRectRef.current = thumb?.getBoundingClientRect() ?? null;
    modalOpenRef.current = true;
    gameAudio.click(980);
    setShot(0);
    setArc(i);
  };

  const closeArc = () => {
    if (arc === null || closingRef.current) return;
    closingRef.current = true;

    const thumb = modalThumbRef.current;
    const first = arcRectRef.current;
    const tl = gsap.timeline({
      onComplete: () => {
        if (arcSrcRef.current) gsap.set(arcSrcRef.current, { autoAlpha: 1 });
        closingRef.current = false;
        modalOpenRef.current = false;
        setArc(null);
      },
    });

    if (thumb && first) {
      const last = thumb.getBoundingClientRect();
      tl.to(thumb, {
        x: first.left + first.width / 2 - (last.left + last.width / 2),
        y: first.top + first.height / 2 - (last.top + last.height / 2),
        scaleX: first.width / last.width,
        scaleY: first.height / last.height,
        duration: 0.45,
        ease: 'power3.inOut',
      }, 0);
    }
    tl.to([backdropRef.current, modalBodyRef.current], { autoAlpha: 0, duration: 0.3, ease: 'power2.in' }, 0);
  };

  useEffect(() => {
    if (arc === null || shot === 0) return;
    gsap.fromTo(shotRef.current,
      { autoAlpha: 0.25, scale: 1.04 },
      { autoAlpha: 1, scale: 1, duration: 0.35, ease: 'power3.out' });
  }, [shot, arc]);

  useIsoLayoutEffect(() => {
    if (arc === null) return;
    const wrap = modalWrapRef.current;
    const thumb = modalThumbRef.current;
    const body = modalBodyRef.current;
    if (!wrap || !thumb) return;

    gsap.set(wrap, { autoAlpha: 1 });
    if (arcSrcRef.current) gsap.set(arcSrcRef.current, { autoAlpha: 0 });

    const first = arcRectRef.current;
    const last = thumb.getBoundingClientRect();
    const tl = gsap.timeline();

    if (first) {
      tl.fromTo(thumb, {
        x: first.left + first.width / 2 - (last.left + last.width / 2),
        y: first.top + first.height / 2 - (last.top + last.height / 2),
        scaleX: first.width / last.width,
        scaleY: first.height / last.height,
      }, { x: 0, y: 0, scaleX: 1, scaleY: 1, duration: 0.55, ease: 'power3.inOut' }, 0);
    }
    tl.fromTo(backdropRef.current, { autoAlpha: 0 }, { autoAlpha: 1, duration: 0.35 }, 0);
    if (body) {
      tl.fromTo(body, { autoAlpha: 0, y: 26 }, { autoAlpha: 1, y: 0, duration: 0.45, ease: 'power3.out' }, 0.15)
        .fromTo(body.querySelectorAll('[data-m]'),
          { autoAlpha: 0, y: 14 },
          { autoAlpha: 1, y: 0, duration: 0.4, stagger: 0.05, ease: 'power3.out' }, 0.25);
    }

    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') closeArc(); };
    window.addEventListener('keydown', onKey);
    return () => {
      window.removeEventListener('keydown', onKey);
      tl.kill();
    };
  }, [arc]);

  const handleForm = (e: React.FormEvent) => {
    e.preventDefault();
    const btn = formBtnRef.current;
    if (!btn) return;
    btn.textContent = 'QUÊTE ACCEPTÉE !';
    btn.style.background = '#7FB3A0';
    gsap.fromTo(btn, { scale: 0.9 }, { scale: 1, duration: 0.45, ease: 'back.out(2.4)' });
    const form = e.currentTarget as HTMLFormElement;
    setTimeout(() => {
      if (formBtnRef.current) {
        formBtnRef.current.textContent = 'ENVOYER /';
        formBtnRef.current.style.background = '';
      }
      form.reset();
    }, 3000);
  };

  /* Zone utile : ce qui reste une fois le HUD (stepper, en-tête, indice) déduit. */
  const pad = 'absolute inset-0 px-3 pt-[52px] pb-[58px] sm:px-[178px] sm:pt-[74px] sm:pb-[56px]';
  // « safe center » : le contenu reste centré, mais bascule en haut s'il déborde,
  // sinon son sommet deviendrait inatteignable au défilement.
  const box = 'flex h-full w-full flex-col items-center overflow-y-auto overscroll-contain thin-scroll';

  const chip = 'rounded border-2 border-ink px-2 py-0.5 font-mono text-[0.6rem] font-bold shadow-[1px_1px_0_#2C1810]';
  const title = 'font-manga text-[clamp(1.6rem,3.4vw,2.7rem)] leading-tight tracking-wide text-ink';
  const kicker = 'mb-1 font-pixel text-[8px] tracking-widest text-orange';

  return (
    <>
      <noscript>
        <style dangerouslySetInnerHTML={{ __html: `
          .wipe-col{display:none!important}
          [data-anim]{opacity:1!important;visibility:visible!important}
        ` }} />
      </noscript>

      {/* ============================ DECK ============================ */}
      <div ref={stageRef} className="fixed inset-0 overflow-hidden bg-ink">
        <div ref={deckRef} className="absolute inset-0">

          {/* ---------------- 01 · SPAWN ---------------- */}
          <section data-panel id="hero" className="invisible absolute inset-0 overflow-hidden bg-parch scanlines">
            <div className="pointer-events-none absolute inset-0 halftone" />
            <div className="speed-lines pointer-events-none absolute inset-0 overflow-hidden">
              <svg viewBox="0 0 1200 800" preserveAspectRatio="xMidYMid slice" xmlns="http://www.w3.org/2000/svg" className="h-full w-full">
                <g stroke="#8B5E3C" strokeWidth=".6" opacity=".2">
                  <line x1="600" y1="400" x2="0" y2="0"/><line x1="600" y1="400" x2="160" y2="0"/>
                  <line x1="600" y1="400" x2="320" y2="0"/><line x1="600" y1="400" x2="480" y2="0"/>
                  <line x1="600" y1="400" x2="640" y2="0"/><line x1="600" y1="400" x2="800" y2="0"/>
                  <line x1="600" y1="400" x2="960" y2="0"/><line x1="600" y1="400" x2="1120" y2="0"/>
                  <line x1="600" y1="400" x2="0" y2="200"/><line x1="600" y1="400" x2="0" y2="400"/>
                  <line x1="600" y1="400" x2="0" y2="600"/><line x1="600" y1="400" x2="0" y2="800"/>
                  <line x1="600" y1="400" x2="1200" y2="200"/><line x1="600" y1="400" x2="1200" y2="400"/>
                  <line x1="600" y1="400" x2="1200" y2="600"/><line x1="600" y1="400" x2="1200" y2="800"/>
                  <line x1="600" y1="400" x2="200" y2="800"/><line x1="600" y1="400" x2="400" y2="800"/>
                  <line x1="600" y1="400" x2="600" y2="800"/><line x1="600" y1="400" x2="800" y2="800"/>
                  <line x1="600" y1="400" x2="1000" y2="800"/>
                </g>
              </svg>
            </div>
            <div className="pointer-events-none absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 -rotate-12 select-none whitespace-nowrap font-manga text-[clamp(4rem,13vw,10rem)] leading-[0.9] tracking-wider text-orange opacity-10 text-stroke-ink animate-drift">FULLSTACK!</div>

            <div className={pad}>
              <div data-fitbox className={box}>
                <div data-fit className="my-auto w-full max-w-3xl text-center">
                  <div data-anim className="mb-4 inline-flex items-center gap-2 rounded border-2 border-ink bg-ink px-3 py-1.5 font-mono text-[0.68rem] uppercase tracking-[0.14em] text-cream shadow-manga-sm">
                    <span className="h-2 w-2 bg-sage animate-blink" />
                    {data.heroEyebrow}
                  </div>

                  <h1 className="mb-2 font-manga text-[clamp(1.9rem,7vw,5rem)] leading-[0.92] tracking-wider text-ink">
                    <span className="block text-orange text-stroke-ink-sm"><Chars text={data.heroTitleLine1} /></span>
                    <span className="block text-brown"><Chars text={data.heroTitleLine2} /></span>
                  </h1>

                  <div
                    data-anim
                    className="speech-bubble relative mx-auto my-7 max-w-[460px] rounded-[18px] border-manga border-ink bg-cream px-5 py-3 text-[0.9rem] font-medium shadow-manga"
                    dangerouslySetInnerHTML={{ __html: data.heroBubble }}
                  />

                  <div data-anim className="mt-7 flex flex-wrap justify-center gap-3">
                    <button onClick={() => nav(3)} className="rounded-lg border-manga border-ink bg-orange px-6 py-2 font-manga text-lg tracking-wider text-cream shadow-manga transition-transform duration-150 hover:-translate-x-0.5 hover:-translate-y-1 hover:shadow-manga-hover" dangerouslySetInnerHTML={{ __html: data.heroCta1 }} />
                    <button onClick={() => nav(5)} className="rounded-lg border-manga border-ink bg-cream px-6 py-2 font-manga text-lg tracking-wider text-ink shadow-manga transition-transform duration-150 hover:-translate-x-0.5 hover:-translate-y-1 hover:shadow-manga-hover" dangerouslySetInnerHTML={{ __html: data.heroCta2 }} />
                    <a href={data.cvUrl} download className="rounded-lg border-manga border-ink bg-sage px-6 py-2 font-manga text-lg tracking-wider text-ink no-underline shadow-manga transition-transform duration-150 hover:-translate-x-0.5 hover:-translate-y-1 hover:shadow-manga-hover">CV .PDF</a>
                  </div>

                  <div data-anim className="mt-7 flex flex-wrap justify-center gap-3">
                    {[
                      { v: data.statsProjects, l: 'Quêtes' },
                      { v: data.statsTechs, l: 'Techs' },
                      { v: data.statsYears, l: 'Ans XP' },
                    ].map((s) => (
                      <div key={s.l} className="min-w-[92px] rounded-lg border-manga border-ink bg-ink px-4 py-2 text-center shadow-manga">
                        <div className="font-manga text-2xl tracking-wider text-flame" data-count={s.v}>0</div>
                        <div className="font-pixel text-[7px] uppercase tracking-widest text-sand">{s.l}</div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* ---------------- 02 · PERSO ---------------- */}
          <section data-panel id="about" className="invisible absolute inset-0 overflow-hidden bg-cream scanlines">
            <div className="pointer-events-none absolute inset-0 grid-lines" />
            <div className={pad}>
              <div data-fitbox className={box}>
                <div data-fit className="my-auto grid w-full max-w-5xl grid-cols-1 items-center gap-6 md:grid-cols-[minmax(0,300px)_1fr] md:gap-10">

                  <div data-anim>
                    <div className="char-card char-card-bg relative overflow-hidden rounded-xl border-manga border-ink bg-parch p-4 text-center shadow-manga-lg sm:p-5">
                      <div className="absolute left-0 right-0 top-0 h-[6px] hp-fill" />
                      <div className="relative z-10 mx-auto mb-3 h-[92px] w-[92px] overflow-hidden rounded-full border-manga border-ink bg-sand shadow-manga animate-drift sm:h-[118px] sm:w-[118px]">
                        <Image
                          src="/portrait.jpg"
                          alt={`Portrait de ${data.aboutName}`}
                          fill
                          sizes="118px"
                          priority
                          className="object-cover object-top"
                        />
                      </div>
                      <div className="relative z-10 font-manga text-xl leading-tight tracking-wide text-ink sm:text-2xl">{data.aboutName}</div>
                      <div className="relative z-10 my-1.5 inline-block rounded bg-brown px-3 py-0.5 font-mono text-[0.68rem] uppercase tracking-widest text-cream">{data.aboutRole}</div>
                      <div className="relative z-10 mt-3 grid grid-cols-2 gap-2">
                        {[
                          { k: 'École', v: data.aboutSchool, c: 'text-orange' },
                          { k: 'Niveau', v: data.aboutSpecialty, c: 'text-orange' },
                          { k: 'Stack', v: data.aboutStack, c: 'text-orange' },
                          { k: 'Statut', v: data.aboutStatus, c: 'text-sage' },
                        ].map((s) => (
                          <div key={s.k} className="rounded-md border-2 border-ink bg-cream p-1.5 shadow-manga-sm">
                            <div className="font-pixel text-[6px] uppercase tracking-widest text-brown">{s.k}</div>
                            <div className={`font-manga text-base tracking-wider ${s.c}`}>{s.v}</div>
                          </div>
                        ))}
                      </div>
                      <div className="relative z-10 mt-3 font-pixel text-[6px] leading-relaxed tracking-widest text-brown">
                        {data.contactLocation.toUpperCase()}
                      </div>
                    </div>
                  </div>

                  <div>
                    <p data-anim className={kicker}>{'// FICHE PERSONNAGE'}</p>
                    <h2 data-anim className={`${title} mb-3`}>
                      Développeur <em className="not-italic text-orange">Fullstack</em><br />web &amp; mobile
                    </h2>
                    <div data-anim className="space-y-2 text-[0.88rem] font-medium leading-relaxed text-brown">
                      <p dangerouslySetInnerHTML={{ __html: data.aboutText1 }} />
                      <p dangerouslySetInnerHTML={{ __html: data.aboutText2 }} />
                    </div>

                    <div data-anim className="mt-4 space-y-2 rounded-xl border-manga border-ink bg-ink p-3.5 shadow-manga">
                      <div className="mb-1 font-pixel text-[8px] tracking-widest text-flame">CARACTÉRISTIQUES</div>
                      {[
                        { k: 'WEB & API', v: 92, c: 'hp-fill' },
                        { k: 'MOBILE', v: 90, c: 'hp-fill' },
                        { k: 'BASES DE DONNÉES', v: 85, c: 'mp-fill' },
                        { k: 'DÉPLOIEMENT', v: 80, c: 'mp-fill' },
                      ].map((s) => (
                        <div key={s.k} className="flex items-center gap-2.5">
                          <span className="w-[86px] shrink-0 font-pixel text-[6px] text-sand sm:w-[118px] sm:text-[7px]">{s.k}</span>
                          <span className="relative h-3 flex-1 overflow-hidden rounded border-2 border-sand/40 bg-brown/30">
                            <span data-bar data-val={s.v} className={`absolute inset-y-0 left-0 w-0 ${s.c}`} />
                            <span className="bar-notch pointer-events-none absolute inset-0" />
                          </span>
                          <span className="w-7 shrink-0 text-right font-mono text-[0.65rem] font-bold text-flame">{s.v}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* ---------------- 03 · POUVOIRS ---------------- */}
          <section data-panel id="skills" className="invisible absolute inset-0 overflow-hidden bg-parch scanlines">
            <div className="pointer-events-none absolute inset-0 halftone-dense" />
            <div className="pointer-events-none absolute right-5 top-14 hidden select-none font-manga text-[clamp(2.5rem,8vw,6rem)] leading-none tracking-wider text-orange opacity-10 text-stroke-orange-fade animate-drift sm:block">POWER!</div>
            <div className={pad}>
              <div data-fitbox className={box}>
                <div data-fit className="my-auto w-full max-w-5xl">
                  <div data-anim className="mb-4 text-center">
                    <p className={kicker}>{'// ARBRE DE TALENTS'}</p>
                    <h2 className={title}>Mes <em className="not-italic text-orange">Pouvoirs</em></h2>
                  </div>

                  <div data-anim>
                    <Carousel
                      items={SKILLS}
                      cols={[1, 2, 3]}
                      rows={[2, 2, 2]}
                      enabled={active === 2}
                      label="Pouvoirs"
                      render={(s) => (
                        s.bonus ? (
                          <div key={s.n} className="rounded-xl border-manga border-ink bg-ink p-3.5 shadow-manga">
                            <div className="font-manga text-lg tracking-wider text-flame">{s.t}</div>
                            <div className="mb-2 font-pixel text-[6px] tracking-widest text-sand">ENVIRONNEMENT</div>
                            <div className="flex flex-wrap gap-1">
                              {s.tags.map((t) => (
                                <span key={t} className={`${chip} border-sand/50 bg-brown/40 text-cream shadow-none`}>{t}</span>
                              ))}
                            </div>
                          </div>
                        ) : (
                          <div key={s.n} className="skill-card group relative overflow-hidden rounded-xl border-manga border-ink bg-cream p-3.5 shadow-manga transition-all duration-200 hover:-translate-x-1 hover:-translate-y-1 hover:shadow-manga-hover">
                            <div className="absolute left-0 right-0 top-0 h-[5px] origin-left scale-x-0 bg-orange transition-transform duration-300 group-hover:scale-x-100" />
                            <div className="pointer-events-none absolute right-2 top-0 font-manga text-4xl leading-none text-sand">{s.n}</div>

                            <div className="font-manga text-lg leading-tight tracking-wider text-ink">{s.t}</div>
                            <div className="mb-1.5 font-pixel text-[6px] tracking-widest text-brown">LVL {s.lv} · {s.v}%</div>

                            <div className="relative mb-2 h-3 overflow-hidden rounded border-2 border-ink bg-ink/15">
                              <span data-bar data-val={s.v} className="hp-fill absolute inset-y-0 left-0 w-0" />
                              <span className="bar-notch pointer-events-none absolute inset-0" />
                            </div>

                            <div className="flex flex-wrap gap-1">
                              {s.tags.map((t, i) => (
                                <span key={t} className={`${chip} ${i < s.hot ? 'bg-orange text-cream' : 'bg-parch text-ink'}`}>{t}</span>
                              ))}
                            </div>
                          </div>
                        )
                      )}
                    />
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* ---------------- 04 · ARCS ---------------- */}
          <section data-panel id="projects" className="invisible absolute inset-0 overflow-hidden bg-cream scanlines">
            <div className="pointer-events-none absolute inset-0 grid-lines" />
            <div className="pointer-events-none absolute bottom-8 left-3 hidden select-none font-manga text-[clamp(2.5rem,8vw,6rem)] leading-none tracking-wider text-orange opacity-10 text-stroke-orange-fade animate-drift sm:block">BOOM!</div>
            <div className={pad}>
              <div data-fitbox className={box}>
                <div data-fit className="my-auto w-full max-w-5xl">
                  <div data-anim className="mb-3 text-center">
                    <p className={kicker}>{'// EXPÉRIENCES & PROJETS'}</p>
                    <h2 className={title}>Mes <em className="not-italic text-orange">Arcs</em></h2>
                  </div>

                  {/* Onglets */}
                  <div data-anim className="mb-4 flex justify-center gap-2">
                    {([
                      { k: 'mobile' as const, l: 'MOBILE', n: MOBILE_ARCS.length },
                      { k: 'web' as const, l: 'WEB & DIVERS', n: WEB_ARCS.length },
                    ]).map((t) => (
                      <button
                        key={t.k}
                        onClick={() => { setArcTab(t.k); gameAudio.click(t.k === 'mobile' ? 880 : 720); }}
                        aria-pressed={arcTab === t.k}
                        className={`flex items-center gap-1.5 rounded-lg border-manga border-ink px-2.5 py-1 font-manga text-sm tracking-wider shadow-manga-sm transition-all duration-200 sm:gap-2 sm:px-4 sm:py-1.5 sm:text-base ${
                          arcTab === t.k
                            ? 'bg-orange text-cream shadow-manga'
                            : 'bg-parch text-brown hover:bg-sand'
                        }`}
                      >
                        <span
                          style={{ transform: 'rotate(45deg)' }}
                          className={`h-2 w-2 border-2 border-ink ${arcTab === t.k ? 'bg-flame' : 'bg-transparent'}`}
                        />
                        {t.l}
                        <span className="font-pixel text-[6px] opacity-70">{String(t.n).padStart(2, '0')}</span>
                      </button>
                    ))}
                  </div>

                  {arcTab === 'web' ? (
                    <>
                      <div data-anim>
                        <Carousel
                          items={WEB_ARCS}
                          cols={[1, 2, 3]}
                          rows={[1, 1, 1]}
                          enabled={active === 3 && arcTab === 'web'}
                          label="Arcs"
                          render={(p) => (
                            <button
                              key={p.code}
                              onClick={(e) => openArc(ARCS.indexOf(p), e)}
                              aria-label={`Ouvrir les détails du projet ${p.t}`}
                              className="project-card group flex flex-col overflow-hidden rounded-xl border-manga border-ink bg-parch text-left shadow-manga transition-all duration-200 hover:-translate-x-1 hover:-translate-y-1 hover:shadow-manga-lg"
                            >
                              <div data-thumb className={`relative aspect-[2/1] w-full overflow-hidden border-b-manga border-ink ${p.bg}`}>
                                <Shot
                                  src={p.imgs?.[0]}
                                  alt={`Capture du projet ${p.t}`}
                                  code={p.code}
                                  sizes="(max-width: 640px) 90vw, 32vw"
                                  className="text-4xl"
                                  fit="contain"
                                />
                                <span className="absolute left-2 top-2 grid h-6 w-6 place-items-center rounded-full border-2 border-ink bg-flame font-manga text-sm leading-none text-ink shadow-manga-sm">{p.rank}</span>
                                <span className="absolute bottom-2 right-2 rounded bg-ink px-2 py-0.5 font-mono text-[0.55rem] font-bold text-cream">{p.tag}</span>
                              </div>
                              <div className="flex flex-1 flex-col p-2.5">
                                <div className="font-manga text-base leading-tight tracking-wider text-ink">{p.t}</div>
                                <div className="truncate font-pixel text-[6px] tracking-widest text-brown">{p.year} · {p.client.toUpperCase()}</div>
                                <p className="mt-1 line-clamp-2 text-[0.72rem] leading-snug text-brown">{p.d}</p>
                                <span className="mt-1.5 inline-flex items-center gap-1 font-pixel text-[6px] tracking-widest text-orange">
                                  DÉTAILS <span className="inline-block transition-transform duration-200 group-hover:translate-x-1">▶</span>
                                </span>
                              </div>
                            </button>
                          )}
                        />
                      </div>

                      <div data-anim className="mt-3 text-center font-pixel text-[6px] tracking-widest text-brown">
                        CLIQUEZ UNE CARTE POUR OUVRIR LA FICHE DE QUÊTE · ← → POUR NAVIGUER
                      </div>
                    </>
                  ) : (
                    <div data-anim ref={mobRef}>
                      {(() => {
                        const m = MOBILE_ARCS[mobIdx];
                        const shots = m.imgs ?? [];
                        const next = MOBILE_ARCS[(mobIdx + 1) % MOBILE_ARCS.length];
                        const goShot = (d: number) => {
                          if (!shots.length) return;
                          setMobShot((v) => (v + d + shots.length) % shots.length);
                          gameAudio.click(1040);
                        };
                        return (
                          <div className="mx-auto flex w-full max-w-4xl flex-col gap-4 md:flex-row md:items-center md:gap-8">

                            {/* Mockup téléphone, sorti du bloc de texte pour respirer */}
                            <div data-mob className="mx-auto shrink-0 md:mx-0">
                              <div className="relative mx-auto h-[30vh] w-[13.9vh] rounded-[1.2rem] border-manga border-ink bg-ink p-[4px] shadow-manga-lg sm:h-[40vh] sm:w-[18.5vh] md:h-[56vh] md:w-[25.9vh] md:rounded-[1.9rem] md:p-[7px]">
                                <span className="absolute -right-[3px] top-[22%] h-8 w-[3px] rounded-r bg-ink md:h-12" />
                                <span className="absolute -left-[3px] top-[16%] h-5 w-[3px] rounded-l bg-ink md:h-8" />
                                <div className={`relative h-full w-full overflow-hidden rounded-[0.9rem] md:rounded-[1.4rem] ${m.bg}`}>
                                  <div ref={mobScreenRef} className="absolute inset-0">
                                    <Shot
                                      key={shots[mobShot] ?? m.code}
                                      src={shots[mobShot]}
                                      alt={`Capture ${mobShot + 1} de ${m.t}`}
                                      code={m.code}
                                      sizes="320px"
                                      className="text-3xl"
                                    />
                                  </div>
                                  <span className="absolute left-1/2 top-1 z-10 h-1 w-7 -translate-x-1/2 rounded-full bg-ink/70 md:h-1.5 md:w-10" />
                                </div>
                              </div>

                              {/* Écran précédent / suivant */}
                              {shots.length > 1 && (
                                <div className="mt-2 flex items-center justify-center gap-2">
                                  <button
                                    onClick={() => goShot(-1)}
                                    aria-label="Écran précédent"
                                    className="grid h-6 w-6 place-items-center rounded border-2 border-ink bg-ink font-manga text-[0.65rem] leading-none text-flame transition-colors duration-150 hover:bg-orange hover:text-cream"
                                  >
                                    ◀
                                  </button>
                                  <span className="font-pixel text-[6px] tracking-widest text-brown sm:text-[7px]">
                                    ÉCRAN {String(mobShot + 1).padStart(2, '0')}/{String(shots.length).padStart(2, '0')}
                                  </span>
                                  <button
                                    onClick={() => goShot(1)}
                                    aria-label="Écran suivant"
                                    className="grid h-6 w-6 place-items-center rounded border-2 border-ink bg-ink font-manga text-[0.65rem] leading-none text-flame transition-colors duration-150 hover:bg-orange hover:text-cream"
                                  >
                                    ▶
                                  </button>
                                </div>
                              )}
                            </div>

                            {/* Fiche du projet */}
                            <div className="min-w-0 flex-1">
                              <div data-mob className="flex items-center gap-2">
                                <span className="grid h-6 w-6 shrink-0 place-items-center rounded-full border-2 border-ink bg-flame font-manga text-sm leading-none text-ink shadow-manga-sm sm:h-7 sm:w-7 sm:text-base">{m.rank}</span>
                                <span className="font-pixel text-[6px] tracking-widest text-orange sm:text-[7px]">{m.year} · APPLICATION MOBILE</span>
                              </div>
                              <h3 data-mob className="mt-1 font-manga text-[clamp(1.25rem,4vw,2.2rem)] leading-tight tracking-wider text-ink">{m.t}</h3>
                              <div data-mob className="mt-0.5 font-mono text-[0.66rem] font-bold text-brown sm:text-[0.74rem]">{m.client}</div>

                              <p data-mob className="mt-2 text-[0.78rem] leading-relaxed text-brown sm:text-[0.88rem]">{m.d}</p>

                              <ul data-mob className="mt-2 space-y-1 sm:mt-3 sm:space-y-1.5">
                                {m.bullets.map((b) => (
                                  <li key={b} className="flex gap-1.5 text-[0.72rem] leading-snug text-ink sm:gap-2 sm:text-[0.82rem]">
                                    <span style={{ transform: 'rotate(45deg)' }} className="mt-[5px] h-1.5 w-1.5 shrink-0 border-2 border-ink bg-orange sm:mt-1.5 sm:h-2 sm:w-2" />
                                    <span>{b}</span>
                                  </li>
                                ))}
                              </ul>

                              <div data-mob className="mt-2.5 flex flex-wrap gap-1 sm:gap-1.5">
                                {(m.techs ?? m.tag.split(' · ')).map((t) => (
                                  <span key={t} className={`${chip} bg-parch text-ink`}>{t}</span>
                                ))}
                              </div>

                              {MOBILE_ARCS.length > 1 && (
                                <div data-mob className="mt-3 flex items-center gap-2 sm:mt-4">
                                  <button
                                    onClick={() => goMobile(-1)}
                                    aria-label="Projet mobile précédent"
                                    className="grid h-8 w-8 shrink-0 place-items-center rounded-lg border-manga border-ink bg-ink font-manga text-sm text-flame shadow-manga-sm transition-colors duration-150 hover:bg-orange hover:text-cream"
                                  >
                                    ◀
                                  </button>
                                  <button
                                    onClick={() => goMobile(1)}
                                    className="flex min-w-0 items-center gap-2 rounded-lg border-manga border-ink bg-orange px-4 py-1.5 font-manga text-sm tracking-wider text-cream shadow-manga transition-transform duration-150 hover:-translate-y-0.5 sm:text-base"
                                  >
                                    <span className="truncate">Suivant : {next.t}</span>
                                    <span aria-hidden="true">▶</span>
                                  </button>
                                  <span className="shrink-0 font-pixel text-[6px] tracking-widest text-brown sm:text-[7px]">
                                    {String(mobIdx + 1).padStart(2, '0')}/{String(MOBILE_ARCS.length).padStart(2, '0')}
                                  </span>
                                </div>
                              )}
                            </div>
                          </div>
                        );
                      })()}
                    </div>
                  )}

                </div>
              </div>
            </div>
          </section>

          {/* ---------------- 05 · SAGA ---------------- */}
          <section data-panel id="journey" className="invisible absolute inset-0 overflow-hidden bg-parch scanlines">
            <div className="pointer-events-none absolute inset-0 halftone" />
            <div className="pointer-events-none absolute left-4 top-14 hidden select-none font-manga text-[clamp(2.5rem,8vw,6rem)] leading-none tracking-wider text-orange opacity-10 text-stroke-orange-fade animate-drift sm:block">SAGA!</div>
            <div className={pad}>
              <div data-fitbox className={box}>
                <div data-fit className="my-auto w-full max-w-5xl">
                  <div data-anim className="mb-4 text-center">
                    <p className={kicker}>{'// PARCOURS DU HÉROS'}</p>
                    <h2 className={title}>Ma <em className="not-italic text-orange">Saga</em></h2>
                  </div>

                  <div className="grid grid-cols-1 gap-4 md:grid-cols-[1.35fr_1fr]">
                    {/* Timeline formation */}
                    <div data-anim className="relative rounded-xl border-manga border-ink bg-cream p-4 shadow-manga">
                      <div className="mb-2.5 font-pixel text-[8px] tracking-widest text-orange">FORMATION</div>
                      <ol className="relative space-y-2.5 border-l-2 border-dashed border-gold pl-4">
                        {SAGA.map((f) => (
                          <li key={f.t} className="relative">
                            <span
                              style={{ transform: 'rotate(45deg)' }}
                              className={`absolute -left-[22px] top-1 grid h-3 w-3 place-items-center border-2 border-ink ${f.cur ? 'bg-flame' : 'bg-sand'}`}
                            />
                            <div className="font-pixel text-[6px] tracking-widest text-brown">{f.y}{f.cur ? ' · EN COURS' : ''}</div>
                            <div className="font-manga text-base leading-tight tracking-wider text-ink">{f.t}</div>
                            <div className="text-[0.72rem] text-brown">{f.p}</div>
                          </li>
                        ))}
                      </ol>
                    </div>

                    <div className="space-y-3">
                      {/* Langues */}
                      <div data-anim className="rounded-xl border-manga border-ink bg-ink p-3.5 shadow-manga">
                        <div className="mb-2 font-pixel text-[8px] tracking-widest text-flame">LANGUES</div>
                        {LANGS.map((l) => (
                          <div key={l.k} className="mb-1.5 last:mb-0">
                            <div className="mb-0.5 flex items-center justify-between font-pixel text-[6px] tracking-widest text-sand">
                              <span>{l.k}</span><span className="text-flame">{l.lv.toUpperCase()}</span>
                            </div>
                            <div className="relative h-2.5 overflow-hidden rounded border-2 border-sand/40 bg-brown/30">
                              <span data-bar data-val={l.v} className="mp-fill absolute inset-y-0 left-0 w-0" />
                              <span className="bar-notch pointer-events-none absolute inset-0" />
                            </div>
                          </div>
                        ))}
                      </div>

                      {/* Qualités */}
                      <div data-anim className="rounded-xl border-manga border-ink bg-cream p-3.5 shadow-manga">
                        <div className="mb-2 font-pixel text-[8px] tracking-widest text-orange">QUALITÉS</div>
                        <div className="flex flex-wrap gap-1.5">
                          {TRAITS.map((t) => (
                            <span key={t} className={`${chip} bg-parch text-ink`}>{t}</span>
                          ))}
                        </div>
                        <div className="mt-2.5 font-pixel text-[6px] tracking-widest text-brown">INTÉRÊTS</div>
                        <div className="mt-1 flex flex-wrap gap-1.5">
                          {['Musique', 'Basketball'].map((t) => (
                            <span key={t} className={`${chip} bg-sage text-ink`}>{t}</span>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* ---------------- 06 · BOSS ---------------- */}
          <section data-panel id="contact" className="invisible absolute inset-0 overflow-hidden bg-cream scanlines">
            <div className="pointer-events-none absolute inset-0 halftone" />
            <div className={pad}>
              <div data-fitbox className={box}>
                <div data-fit className="my-auto w-full max-w-[620px] text-center">
                  <p data-anim className={kicker}>{'// BOSS FINAL'}</p>
                  <h2 data-anim className={title}>Travaillons <em className="not-italic text-orange">Ensemble</em></h2>

                  <div data-anim className="mx-auto mt-3 max-w-[400px] rounded-lg border-manga border-ink bg-ink px-3.5 py-2.5 shadow-manga">
                    <div className="mb-1.5 flex items-center justify-between font-pixel text-[7px] text-sand">
                      <span>DISPONIBILITÉ</span><span className="text-flame">100%</span>
                    </div>
                    <div className="relative h-3.5 overflow-hidden rounded border-2 border-sand/40 bg-brown/30">
                      <span data-bar data-val={100} className="hp-fill absolute inset-y-0 left-0 w-0" />
                      <span className="bar-notch pointer-events-none absolute inset-0" />
                    </div>
                  </div>

                  <p data-anim className="my-4 text-[0.88rem] leading-relaxed text-brown">
                    Un projet, un stage, une collaboration ? Réponse rapide, où que vous soyez — {data.contactLocation} ou télétravail.
                  </p>

                  <div data-anim className="mb-5 flex flex-wrap justify-center gap-2">
                    {[
                      { h: `mailto:${data.contactEmail}`, l: data.contactEmail },
                      { h: `https://wa.me/${waNumber}`, l: data.contactPhone },
                      { h: data.contactGithub, l: 'GitHub / aina-lang' },
                      { h: data.cvUrl, l: 'CV .PDF' },
                    ].map((a) => (
                      <a key={a.l} href={a.h} className="rounded-lg border-manga border-ink bg-parch px-3.5 py-2 font-mono text-[0.72rem] font-bold text-ink no-underline shadow-manga transition-all duration-150 hover:-translate-x-1 hover:-translate-y-1 hover:bg-orange hover:text-cream hover:shadow-manga-hover">{a.l}</a>
                    ))}
                  </div>

                  <form data-anim className="flex flex-col gap-2.5 text-left" onSubmit={handleForm}>
                    <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2">
                      <div className="flex flex-col gap-1">
                        <label className="font-pixel text-[7px] tracking-widest text-brown">NOM</label>
                        <input type="text" required placeholder="Votre nom" className="rounded-lg border-manga border-ink bg-parch px-3 py-2 font-body text-[0.85rem] font-medium text-ink shadow-manga-sm outline-none transition-shadow duration-150 focus:shadow-[4px_4px_0_#E8621A]" />
                      </div>
                      <div className="flex flex-col gap-1">
                        <label className="font-pixel text-[7px] tracking-widest text-brown">EMAIL</label>
                        <input type="email" required placeholder="vous@email.com" className="rounded-lg border-manga border-ink bg-parch px-3 py-2 font-body text-[0.85rem] font-medium text-ink shadow-manga-sm outline-none transition-shadow duration-150 focus:shadow-[4px_4px_0_#E8621A]" />
                      </div>
                    </div>
                    <div className="flex flex-col gap-1">
                      <label className="font-pixel text-[7px] tracking-widest text-brown">MESSAGE</label>
                      <textarea required placeholder="Parlez-moi de votre aventure..." className="h-[74px] resize-none rounded-lg border-manga border-ink bg-parch px-3 py-2 font-body text-[0.85rem] font-medium text-ink shadow-manga-sm outline-none transition-shadow duration-150 focus:shadow-[4px_4px_0_#E8621A]" />
                    </div>
                    <button ref={formBtnRef} type="submit" className="self-center rounded-lg border-manga border-ink bg-orange px-10 py-2.5 font-manga text-lg tracking-wider text-cream shadow-manga transition-all duration-150 hover:-translate-x-1 hover:-translate-y-1 hover:shadow-manga-hover">ENVOYER /</button>
                  </form>

                  <div data-anim className="mt-5 font-pixel text-[6px] leading-relaxed tracking-widest text-brown">
                    © 2026 RAFANDEFERANA MAMINIAINA MERCIA — NEXT.JS + GSAP
                  </div>
                </div>
              </div>
            </div>
          </section>
        </div>

        {/* ==================== HUD : barre d'étapes ====================
            Téléphone : barre horizontale en bas, pour libérer toute la largeur.
            Écran large : colonne verticale à gauche. */}
        <aside className="pointer-events-none fixed inset-x-2 bottom-2 z-[130] select-none sm:inset-x-auto sm:bottom-auto sm:left-4 sm:top-1/2 sm:-translate-y-1/2">
          <div className="pointer-events-auto flex items-center gap-2.5 rounded-2xl border-manga border-ink bg-ink/95 px-2.5 py-1.5 shadow-manga-lg backdrop-blur-sm sm:items-stretch sm:gap-2 sm:px-2 sm:py-2.5">

            {/* Jauge de pouvoir — horizontale sur téléphone */}
            <div className="flex shrink-0 items-center gap-1.5 sm:hidden">
              <span className="font-pixel text-[6px] leading-none text-flame">PWR</span>
              <div className="relative h-[9px] w-[58px] overflow-hidden rounded-full border-2 border-sand/40 bg-brown/30">
                <div className="pwr-fill-x hp-fill absolute inset-y-0 left-0 w-0" />
                <div className="bar-notch pointer-events-none absolute inset-0" />
              </div>
              <span className="pwr-pct font-pixel text-[6px] leading-none text-sand" data-v="0">0%</span>
            </div>

            {/* Jauge de pouvoir — verticale sur écran large */}
            <div className="hidden flex-col items-center gap-1.5 sm:flex">
              <span className="font-pixel text-[7px] leading-none text-flame">PWR</span>
              <div className="relative min-h-[150px] w-[12px] flex-1 overflow-hidden rounded-full border-2 border-sand/40 bg-brown/30">
                <div className="pwr-fill-y hp-fill absolute inset-x-0 bottom-0 h-0" />
                <div className="bar-notch-y pointer-events-none absolute inset-0" />
              </div>
              <span className="pwr-pct font-pixel text-[7px] leading-none text-sand" data-v="0">0%</span>
            </div>

            {/* Points d'étape */}
            <ol className="flex flex-1 flex-row items-center justify-between gap-0.5 sm:flex-col sm:justify-between">
              {STEPS.map((s, i) => (
                <li key={s.id}>
                  <button
                    ref={(el) => { pipRefs.current[i] = el; }}
                    onClick={() => nav(i)}
                    aria-current={active === i ? 'step' : undefined}
                    aria-label={`Niveau ${i + 1} — ${s.label} · ${s.hint}`}
                    title={`${s.label} — ${s.hint}`}
                    className="group flex w-full items-center gap-2 py-0.5 pr-0 text-left sm:pr-1"
                  >
                    <span
                      style={{ transform: 'rotate(45deg)' }}
                      className={`grid h-[15px] w-[15px] shrink-0 place-items-center border-2 transition-colors duration-200 sm:h-[18px] sm:w-[18px] ${
                        i === active
                          ? 'border-cream bg-flame glow-orange'
                          : i < active
                            ? 'border-sand/70 bg-orange/80'
                            : 'border-sand/40 bg-transparent group-hover:border-sand/80'
                      }`}
                    >
                      <span className={`h-1.5 w-1.5 ${i <= active ? 'bg-ink' : 'bg-sand/40'}`} />
                    </span>
                    <span className="hidden flex-col leading-none sm:flex">
                      <span className={`font-pixel text-[6px] tracking-widest ${i === active ? 'text-flame' : 'text-sand/60'}`}>
                        {String(i + 1).padStart(2, '0')}
                      </span>
                      <span className={`mt-1 font-manga text-[0.92rem] tracking-wider transition-colors ${i === active ? 'text-cream' : 'text-sand/60 group-hover:text-sand'}`}>
                        {s.label}
                      </span>
                    </span>
                  </button>
                </li>
              ))}
            </ol>
          </div>
        </aside>

        {/* ==================== HUD : barre du haut ==================== */}
        <header className="pointer-events-none fixed inset-x-0 top-0 z-[125] flex items-start justify-between gap-1.5 px-2 py-2 sm:px-5 sm:py-2.5">
          <div className="pointer-events-auto rounded-lg border-manga border-ink bg-ink px-2 py-1 font-manga text-base leading-none tracking-wider text-cream shadow-manga sm:px-2.5 sm:py-1.5 sm:text-xl">
            <span className="text-flame">/</span> Mercia.dev
          </div>
          <div className="flex items-center gap-2">
            <div className="pointer-events-auto rounded-lg border-manga border-ink bg-ink px-2 py-1 shadow-manga sm:px-2.5 sm:py-1.5">
              <span className="hidden font-pixel text-[7px] tracking-widest text-sand sm:inline">STAGE</span>
              <span ref={lvlRef} className="inline-block font-manga text-base leading-none tracking-wider text-flame sm:ml-2 sm:text-lg">
                {String(active + 1).padStart(2, '0')}
                <span className="text-xs text-sand/60">/{String(STEPS.length).padStart(2, '0')}</span>
              </span>
            </div>
            <button
              onClick={toggleSound}
              aria-pressed={sound}
              aria-label={sound ? 'Couper le son' : 'Activer le son'}
              title={sound ? 'Couper le son' : 'Activer le son'}
              className={`pointer-events-auto flex h-[30px] items-center gap-1 rounded-lg border-manga border-ink px-2 shadow-manga transition-colors duration-200 sm:h-[34px] sm:gap-1.5 sm:px-2.5 ${
                sound ? 'bg-ink' : 'bg-brown/60'
              }`}
            >
              <span className={`font-manga text-base leading-none ${sound ? 'text-flame' : 'text-sand/60 line-through'}`}>♪</span>
              <span className="flex h-3.5 items-end gap-[2px]" aria-hidden="true">
                {[0, 1, 2].map((i) => (
                  <span
                    key={i}
                    className={`w-[3px] ${sound ? 'bg-flame animate-eq' : 'h-[3px] bg-sand/40'}`}
                    style={sound ? { animationDelay: `${i * 0.18}s` } : undefined}
                  />
                ))}
              </span>
            </button>

            <div className="pointer-events-auto hidden rounded-lg border-manga border-ink bg-orange px-2.5 py-1.5 font-manga text-sm tracking-wider text-cream shadow-manga animate-badge-bounce sm:block">
              ● Disponible
            </div>
          </div>
        </header>

        {/* ==================== HUD : indice bas ==================== */}
        <div className="pointer-events-none fixed inset-x-0 bottom-2 z-[125] hidden justify-center px-2 sm:flex">
          <div className="flex max-w-full items-center gap-2 truncate rounded-full border-2 border-ink bg-ink/90 px-3 py-1 font-pixel text-[6px] tracking-widest text-sand shadow-manga-sm backdrop-blur-sm sm:text-[7px]">
            <span className="text-flame animate-blink">▲▼</span>
            <span className="sm:hidden">SWIPE</span>
            <span className="hidden sm:inline">MOLETTE / SWIPE / FLÈCHES</span>
            <span className="hidden text-sand/50 sm:inline">— {STEPS[active].hint}</span>
          </div>
        </div>

        {/* Vignette */}
        <div className="pointer-events-none absolute inset-0 z-[110] shadow-[inset_0_0_140px_rgba(44,24,16,.45)]" />

        {/* ==================== Rideau de transition ==================== */}
        <div className="pointer-events-none fixed inset-0 z-[200] flex">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="wipe-col h-full flex-1 border-x border-ink/40 bg-ink" />
          ))}
          <div ref={fxRef} className="pointer-events-none absolute inset-0 grid place-items-center font-manga text-[clamp(2.5rem,13vw,9rem)] tracking-wider text-flame opacity-0 text-stroke-ink" />
        </div>
      </div>

      {/* ==================== Modal projet ==================== */}
      {arc !== null && (
        <div
          ref={modalWrapRef}
          role="dialog"
          aria-modal="true"
          aria-label={ARCS[arc].t}
          className="fixed inset-0 z-[300] grid place-items-center p-3 opacity-0 sm:p-6"
        >
          <div ref={backdropRef} onClick={closeArc} className="absolute inset-0 bg-ink/85 backdrop-blur-sm" />

          <div className="relative z-10 grid w-full max-w-3xl items-start gap-3 md:grid-cols-[auto_1fr]">
            <div
              ref={modalThumbRef}
              className={`relative overflow-hidden rounded-2xl border-manga border-ink shadow-manga-lg ${ARCS[arc].bg} ${
                ARCS[arc].shape === 'mobile'
                  ? 'mx-auto h-[34vh] w-[15.7vh] max-w-full sm:h-[52vh] sm:w-[24vh]'
                  : 'aspect-[2/1] w-full md:w-[min(56vw,460px)]'
              }`}
            >
              <div ref={shotRef} className="absolute inset-0">
                <Shot
                  key={ARCS[arc].imgs?.[shot] ?? ARCS[arc].code}
                  src={ARCS[arc].imgs?.[shot]}
                  alt={`Capture du projet ${ARCS[arc].t}`}
                  code={ARCS[arc].code}
                  sizes="(max-width: 768px) 92vw, 45vw"
                  className="text-6xl"
                  fit="contain"
                />
              </div>
              <span className="absolute left-3 top-3 grid h-8 w-8 place-items-center rounded-full border-2 border-ink bg-flame font-manga text-lg leading-none text-ink shadow-manga-sm">{ARCS[arc].rank}</span>
            </div>

            <div ref={modalBodyRef} className="max-h-[70vh] overflow-hidden rounded-2xl border-manga border-ink bg-cream p-4 shadow-manga-lg sm:p-5">
              <div data-m className="font-pixel text-[7px] tracking-widest text-orange">
                {ARCS[arc].year} · RANG {ARCS[arc].rank}
              </div>
              <h3 data-m className="mt-1 font-manga text-[clamp(1.4rem,3vw,2rem)] leading-tight tracking-wider text-ink">{ARCS[arc].t}</h3>
              <div data-m className="mt-1 font-mono text-[0.7rem] font-bold text-brown">{ARCS[arc].client}</div>
              <p data-m className="mt-2 text-[0.82rem] leading-relaxed text-brown">{ARCS[arc].d}</p>

              <ul data-m className="mt-3 space-y-1.5">
                {ARCS[arc].bullets.map((b) => (
                  <li key={b} className="flex gap-2 text-[0.78rem] leading-snug text-ink">
                    <span style={{ transform: 'rotate(45deg)' }} className="mt-1.5 h-2 w-2 shrink-0 border-2 border-ink bg-orange" />
                    <span>{b}</span>
                  </li>
                ))}
              </ul>

              <div data-m className="mt-3 flex flex-wrap gap-1.5">
                {(ARCS[arc].techs ?? ARCS[arc].tag.split(' · ')).map((t) => (
                  <span key={t} className={`${chip} bg-parch text-ink`}>{t}</span>
                ))}
              </div>

              {ARCS[arc].link && (
                <a
                  data-m
                  href={ARCS[arc].link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-3 inline-flex items-center gap-2 rounded-lg border-manga border-ink bg-orange px-4 py-2 font-manga text-base tracking-wider text-cream no-underline shadow-manga transition-transform duration-150 hover:-translate-x-0.5 hover:-translate-y-1 hover:shadow-manga-hover"
                >
                  Visiter le site <span aria-hidden="true">↗</span>
                </a>
              )}
            </div>

            {(ARCS[arc].imgs?.length ?? 0) > 1 && (
              <div data-m className="flex flex-wrap justify-center gap-1.5 md:col-span-2">
                {ARCS[arc].imgs!.map((src, i) => (
                  <button
                    key={src}
                    onClick={() => setShot(i)}
                    aria-label={`Capture ${i + 1} de ${ARCS[arc].t}`}
                    aria-current={i === shot ? 'true' : undefined}
                    className={`relative h-11 w-14 shrink-0 overflow-hidden rounded-md border-2 transition-all duration-150 ${
                      i === shot
                        ? 'border-flame shadow-[0_0_10px_rgba(232,98,26,.7)]'
                        : 'border-ink/50 opacity-55 hover:opacity-100'
                    } ${ARCS[arc].bg}`}
                  >
                    <Shot src={src} alt="" code={ARCS[arc].code} sizes="80px" className="text-xs" />
                  </button>
                ))}
              </div>
            )}
          </div>

          <button
            onClick={closeArc}
            aria-label="Fermer la fiche de quête"
            className="fixed right-3 top-3 z-20 grid h-10 w-10 place-items-center rounded-lg border-manga border-ink bg-orange font-manga text-xl text-cream shadow-manga transition-transform duration-150 hover:-translate-y-0.5 sm:right-6 sm:top-6"
          >
            ✕
          </button>
        </div>
      )}

      {/* ==================== Curseur boule de feu ==================== */}
      {FLAME.map((f, i) => (
        <div
          key={i}
          ref={(el) => { flameRefs.current[i] = el; }}
          className="custom-cursor pointer-events-none fixed left-0 top-0 rounded-full"
          style={{
            width: f.size,
            height: f.size,
            marginLeft: -f.size / 2,
            marginTop: -f.size / 2,
            zIndex: 9999 - i,
            opacity: f.opacity,
            filter: f.blur ? `blur(${f.blur}px)` : undefined,
            background: `radial-gradient(circle at 50% 50%, ${f.from} 0%, ${f.to} 65%, transparent 100%)`,
            boxShadow: i < 3 ? `0 0 ${10 + f.size}px ${f.to}` : undefined,
          }}
        />
      ))}
    </>
  );
}
