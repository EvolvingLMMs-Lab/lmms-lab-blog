export const SITE_ORIGIN = 'https://www.lmms-lab.com';
export const SITE_NAME = 'LMMs-Lab';
export const SITE_DESCRIPTION =
  'Open research on multimodal models, evaluation, benchmarks, and multimodal intelligence.';
export const BLOG_DESCRIPTION =
  'Research notes, engineering stories, and open-source updates from LMMs-Lab.';
export const BLOG_BASE_PATH = '/blog';

export const LEGACY_BLOG_SLUGS: Readonly<Record<string, string>> = {
  aero_audio: 'aero-audio',
  highres_visual_reasoning: 'highres-visual-reasoning',
  llava_critic_r1: 'llava-critic-r1',
  llava_next_video: 'llava-next-video',
  llava_onevision: 'llava-onevision',
  'llava_onevision_1.5_rl': 'llava-onevision-1-5-rl',
  llava_onevision_1_5: 'llava-onevision-1-5',
  llava_onevision_2: 'llava-onevision-2',
  lmms_eval: 'lmms-eval',
  longva: 'longva',
  longvt: 'longvt',
  mmsearch_r1: 'mmsearch-r1',
  mmsearch_r1_improved: 'mmsearch-r1-improved',
  multimodal_sae: 'multimodal-sae',
  onevision_encoder: 'onevision-encoder',
  openmmreasoner: 'openmmreasoner',
  sae_made_easy: 'sae-made-easy',
  videommmu: 'videommmu',
};

export function normalizeLegacySlug(slug: string): string {
  return (
    LEGACY_BLOG_SLUGS[slug] ??
    slug
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '')
  );
}
