export type Project = {
  slug: string;
  title: string;
  titleEm?: string;
  subtitle?: string;
  year: string;
  status?: 'wip';
  /** External URL — when present, the card opens in a new tab. */
  url?: string;
};

export const projects: Project[] = [
  {
    slug: 'halsen-g15',
    title: 'Bench',
    titleEm: 'Boss',
    subtitle: 'coaching app for football teams',
    year: '2026',
  },
  {
    slug: 'ai-meetup-larvik',
    title: 'AI Meetup',
    titleEm: 'Larvik',
    subtitle: 'event page + invite',
    year: '2026',
    url: 'https://ai-meetup-larvik.netlify.app/',
  },
  {
    slug: 'larvik-beach-volley',
    title: 'Larvik Beach',
    titleEm: 'Volley',
    subtitle: 'pitch for an indoor court at Agnes park',
    year: '2026',
    url: 'https://larvik-beach-volley.netlify.app/',
  },
  {
    slug: 'diggski',
    title: 'DiggSki',
    year: '2026',
    status: 'wip',
  },
];
