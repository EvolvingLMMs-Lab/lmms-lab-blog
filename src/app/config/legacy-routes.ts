export interface LegacyArticleRoute {
  legacySlug: string;
  blogSlug: string;
  tag?: string;
  standalonePath?: string;
}

export const LEGACY_POST_ROUTES: readonly LegacyArticleRoute[] = [
  {
    legacySlug: 'onevision_encoder',
    blogSlug: 'onevision-encoder',
    tag: 'models',
    standalonePath: '/onevision-encoder',
  },
  { legacySlug: 'llava_onevision_2', blogSlug: 'llava-onevision-2', tag: 'models' },
  { legacySlug: 'llava_onevision_1.5_rl', blogSlug: 'llava-onevision-1-5-rl', tag: 'models' },
  { legacySlug: 'longvt', blogSlug: 'longvt', tag: 'models' },
  { legacySlug: 'openmmreasoner', blogSlug: 'openmmreasoner', tag: 'models' },
  { legacySlug: 'llava_onevision_1_5', blogSlug: 'llava-onevision-1-5', tag: 'models' },
  { legacySlug: 'llava_critic_r1', blogSlug: 'llava-critic-r1', tag: 'models' },
  {
    legacySlug: 'mmsearch_r1_improved',
    blogSlug: 'mmsearch-r1-improved',
    tag: 'research',
  },
  { legacySlug: 'sae_made_easy', blogSlug: 'sae-made-easy', tag: 'tools' },
  { legacySlug: 'mmsearch_r1', blogSlug: 'mmsearch-r1', tag: 'models' },
  { legacySlug: 'aero_audio', blogSlug: 'aero-audio', tag: 'models' },
  {
    legacySlug: 'highres_visual_reasoning',
    blogSlug: 'highres-visual-reasoning',
    tag: 'research',
  },
  { legacySlug: 'llava_next_video', blogSlug: 'llava-next-video', tag: 'models' },
  { legacySlug: 'llava_onevision', blogSlug: 'llava-onevision', tag: 'models' },
  { legacySlug: 'lmms_eval', blogSlug: 'lmms-eval', tag: 'evaluation' },
  { legacySlug: 'longva', blogSlug: 'longva', tag: 'models' },
  { legacySlug: 'multimodal_sae', blogSlug: 'multimodal-sae', tag: 'research' },
  { legacySlug: 'videommmu', blogSlug: 'videommmu', tag: 'benchmarks' },
];

export const LEGACY_NOTE_ROUTES: readonly LegacyArticleRoute[] = [
  { legacySlug: 'dllm', blogSlug: 'diffusion-language-models' },
  { legacySlug: 'wake-up', blogSlug: 'digital-tide' },
];

const LEGACY_ROUTES = [...LEGACY_POST_ROUTES, ...LEGACY_NOTE_ROUTES];
const BLOG_SLUG_BY_LEGACY_SLUG = new Map(
  LEGACY_ROUTES.map((route) => [route.legacySlug, route.blogSlug]),
);

export function normalizeLegacySlug(slug: string): string {
  return BLOG_SLUG_BY_LEGACY_SLUG.get(slug) ?? slug;
}

export function legacyArticlePath(blogSlug: string, kind: 'posts' | 'notes'): string {
  const routes = kind === 'posts' ? LEGACY_POST_ROUTES : LEGACY_NOTE_ROUTES;
  const route = routes.find((candidate) => candidate.blogSlug === blogSlug);
  if (!route) {
    return `/blog/${encodeURIComponent(blogSlug)}`;
  }

  return route.standalonePath ?? `/${kind}/${encodeURIComponent(route.legacySlug)}`;
}
