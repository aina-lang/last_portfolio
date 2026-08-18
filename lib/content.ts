/**
 * Contenu du portfolio, en dur.
 *
 * Pas de base de données : pour changer un texte, un chiffre ou un lien,
 * on édite ce fichier et c'est tout.
 */
export type PortfolioContent = {
  heroEyebrow: string;
  heroTitleLine1: string;
  heroTitleLine2: string;
  /** HTML autorisé (entités, <strong>, <br />…). */
  heroBubble: string;
  heroCta1: string;
  heroCta2: string;

  statsProjects: number;
  statsTechs: number;
  statsYears: number;

  aboutName: string;
  aboutRole: string;
  aboutSchool: string;
  aboutSpecialty: string;
  aboutStack: string;
  aboutStatus: string;
  /** HTML autorisé. */
  aboutText1: string;
  /** HTML autorisé. */
  aboutText2: string;

  contactEmail: string;
  contactPhone: string;
  contactGithub: string;
  contactLocation: string;
  cvUrl: string;
};

export const CONTENT: PortfolioContent = {
  heroEyebrow: "ENI Toliara · Master 2 Informatique",
  heroTitleLine1: "Mercia",
  heroTitleLine2: "Développeur Fullstack",
  heroBubble:
    "Web &amp; mobile, du back-end au pixel : React Native, Next.js, Laravel, NestJS. Chaque projet est un niveau de plus.",
  heroCta1: "Voir mes Arcs &rarr;",
  heroCta2: "Me rejoindre",

  statsProjects: 10,
  statsTechs: 30,
  statsYears: 3,

  aboutName: "RAFANDEFERANA Maminiaina Mercia",
  aboutRole: "Développeur Fullstack",
  aboutSchool: "ENI Toliara",
  aboutSpecialty: "Master 2",
  aboutStack: "Next · RN",
  aboutStatus: "Dispo",
  aboutText1:
    "Étudiant en Master 2 en Informatique à l'École Nationale d'Informatique (ENI), développeur web et mobile spécialisé Fullstack — back-end, mobile et conception.",
  aboutText2:
    "Expertise en structures de données, algorithmes et résolution de problèmes. Maîtrise des environnements collaboratifs et des bonnes pratiques de développement logiciel.",

  contactEmail: "merciaaina@gmail.com",
  contactPhone: "+261 32 57 153 47",
  contactGithub: "https://github.com/aina-lang",
  contactLocation: "Fianarantsoa, Madagascar",
  cvUrl: "/CV-RAFANDEFERANA-Maminiaina-Mercia.pdf",
};
