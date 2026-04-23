export type Project = {
  slug: string;
  title: string;
  titleEm?: string;
  year: string;
  status?: 'wip';
};

export const projects: Project[] = [
  {
    slug: 'larvik-beach-volley',
    title: 'Larvik Beach',
    titleEm: 'Volley',
    year: '2026',
    status: 'wip',
  },
  {
    slug: 'diggski',
    title: 'DiggSki',
    year: '2026',
    status: 'wip',
  },
  {
    slug: 'halsen-g15',
    title: 'Bench',
    titleEm: 'Boss',
    year: '2026',
  },
];
