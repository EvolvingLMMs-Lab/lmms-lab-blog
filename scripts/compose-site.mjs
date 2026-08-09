import {
  copyFileSync,
  existsSync,
  mkdirSync,
  readdirSync,
  readFileSync,
  rmSync,
  statSync,
  writeFileSync,
} from 'node:fs';
import { dirname, join, relative } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = fileURLToPath(new URL('..', import.meta.url));
const blogOutput = join(root, 'dist/lmms-lab-blog/browser');
const legacyOutput = join(root, 'legacy-site/out');
const blogSitemapPath = join(blogOutput, 'sitemap.xml');
const legacySitemapPath = join(legacyOutput, 'sitemap.xml');
const blogApplicationPath = join(blogOutput, 'blog');

function assertBuildOutput(directory, entry, label) {
  if (!existsSync(join(directory, entry))) {
    throw new Error(`${label} build output is missing: ${join(directory, entry)}`);
  }
}

function copyTree(source, destination) {
  for (const entry of readdirSync(source)) {
    const sourcePath = join(source, entry);
    const destinationPath = join(destination, entry);

    if (statSync(sourcePath).isDirectory()) {
      mkdirSync(destinationPath, { recursive: true });
      copyTree(sourcePath, destinationPath);
      continue;
    }

    mkdirSync(dirname(destinationPath), { recursive: true });
    copyFileSync(sourcePath, destinationPath);
  }
}

function snapshotTree(directory) {
  return new Map(
    readdirSync(directory, { recursive: true })
      .filter((entry) => statSync(join(directory, entry)).isFile())
      .map((entry) => [entry, readFileSync(join(directory, entry))]),
  );
}

function sitemapEntries(xml) {
  return [...xml.matchAll(/<url>[\s\S]*?<\/url>/g)].map((match) => match[0]);
}

function sitemapLocation(entry) {
  return entry.match(/<loc>([^<]+)<\/loc>/)?.[1];
}

function canonicalSitemapKey(location) {
  const url = new URL(location);
  const path = url.pathname === '/' ? '/' : url.pathname.replace(/\/+$/, '');
  return `${url.origin}${path}${url.search}`;
}

function mergeSitemaps(legacyXml, blogXml) {
  const entries = new Map();

  // The legacy metadata is authoritative for `/`, `/about`, `/posts`, and `/notes`.
  for (const entry of [...sitemapEntries(legacyXml), ...sitemapEntries(blogXml)]) {
    const location = sitemapLocation(entry);
    const key = location ? canonicalSitemapKey(location) : null;
    if (key && !entries.has(key)) {
      entries.set(key, entry);
    }
  }

  return `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${[
    ...entries.values(),
  ].join('\n')}\n</urlset>\n`;
}

assertBuildOutput(blogOutput, 'blog/index.html', 'Angular blog');
assertBuildOutput(legacyOutput, 'index.html', 'Legacy Next.js site');

const blogSitemap = readFileSync(blogSitemapPath, 'utf8');
const legacySitemap = readFileSync(legacySitemapPath, 'utf8');
const blogApplication = snapshotTree(blogApplicationPath);
const copiedFiles = readdirSync(legacyOutput, { recursive: true }).filter((entry) =>
  statSync(join(legacyOutput, entry)).isFile(),
);

copyTree(legacyOutput, blogOutput);

for (const entry of copiedFiles) {
  const source = readFileSync(join(legacyOutput, entry));
  const destination = readFileSync(join(blogOutput, entry));
  if (!source.equals(destination)) {
    throw new Error(`Legacy output changed while composing: ${entry}`);
  }
}
const composedBlogApplication = snapshotTree(blogApplicationPath);
if (blogApplication.size !== composedBlogApplication.size) {
  throw new Error(
    'Legacy output must not add files to or remove files from the Angular /blog application.',
  );
}
for (const [entry, source] of blogApplication) {
  const destination = composedBlogApplication.get(entry);
  if (!destination?.equals(source)) {
    throw new Error(`Legacy output must not replace the Angular /blog application: ${entry}`);
  }
}

// `/home` was an integration-era duplicate. Keep one canonical legacy homepage.
rmSync(join(blogOutput, 'home'), { recursive: true, force: true });
writeFileSync(blogSitemapPath, mergeSitemaps(legacySitemap, blogSitemap));

console.log(
  `Composed ${copiedFiles.length} legacy files into ${relative(root, blogOutput)}; Angular blog remains at /blog.`,
);
