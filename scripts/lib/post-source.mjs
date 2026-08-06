import { existsSync, readdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { parseDocument } from 'yaml';

const FRONT_MATTER_START = /^---[ \t]*\r?\n/;
const FRONT_MATTER_END = /^---[ \t]*(?:\r?\n|$)/m;
const SLUG_PATTERN = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
const DATE_PATTERN = /^\d{4}-\d{2}-\d{2}$/;
const METADATA_FIELDS = ['title', 'date', 'description'];

function sourceError(sourcePath, message) {
  return new Error(`Post source "${sourcePath}" ${message}`);
}

function validateDate(value, sourcePath) {
  if (typeof value !== 'string' || !DATE_PATTERN.test(value)) {
    throw sourceError(sourcePath, 'must define "date" as a YYYY-MM-DD string');
  }

  const parsed = new Date(`${value}T00:00:00Z`);
  if (Number.isNaN(parsed.valueOf()) || parsed.toISOString().slice(0, 10) !== value) {
    throw sourceError(sourcePath, `has an invalid calendar date: ${value}`);
  }

  return value;
}

function validateMetadata(value, sourcePath) {
  if (!value || typeof value !== 'object' || Array.isArray(value)) {
    throw sourceError(sourcePath, 'front matter must be a YAML mapping');
  }

  const unknownFields = Object.keys(value).filter((field) => !METADATA_FIELDS.includes(field));
  if (unknownFields.length) {
    throw sourceError(sourcePath, `has unknown front matter field(s): ${unknownFields.join(', ')}`);
  }

  const title = typeof value.title === 'string' ? value.title.trim() : '';
  const description = typeof value.description === 'string' ? value.description.trim() : '';
  if (!title) {
    throw sourceError(sourcePath, 'must define a non-empty "title" string');
  }
  if (!description) {
    throw sourceError(sourcePath, 'must define a non-empty "description" string');
  }

  return {
    title,
    date: validateDate(value.date, sourcePath),
    description,
  };
}

export function parsePostSource(rawSource, sourcePath = 'index.md') {
  const source = rawSource.startsWith('\uFEFF') ? rawSource.slice(1) : rawSource;
  const opening = FRONT_MATTER_START.exec(source);
  if (!opening) {
    throw sourceError(sourcePath, 'must start with YAML front matter delimited by "---"');
  }

  const afterOpening = source.slice(opening[0].length);
  const closing = FRONT_MATTER_END.exec(afterOpening);
  if (!closing) {
    throw sourceError(sourcePath, 'has unterminated YAML front matter');
  }

  const frontMatter = afterOpening.slice(0, closing.index);
  const content = afterOpening.slice(closing.index + closing[0].length);
  const document = parseDocument(frontMatter, {
    logLevel: 'error',
    prettyErrors: true,
    schema: 'core',
    strict: true,
    uniqueKeys: true,
  });
  const diagnostics = [...document.errors, ...document.warnings];
  if (diagnostics.length) {
    throw sourceError(sourcePath, `has invalid YAML front matter: ${diagnostics[0].message}`);
  }

  let parsedMetadata;
  try {
    parsedMetadata = document.toJS({ maxAliasCount: 0 });
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    throw sourceError(sourcePath, `has invalid YAML front matter: ${message}`);
  }

  if (!content.trim()) {
    throw sourceError(sourcePath, 'must contain article content after front matter');
  }

  return {
    meta: validateMetadata(parsedMetadata, sourcePath),
    source: content,
  };
}

export function discoverPostSources(postsDir) {
  const entries = readdirSync(postsDir, { withFileTypes: true });
  const looseSources = entries
    .filter((entry) => entry.isFile() && /\.(?:md|html)$/i.test(entry.name))
    .map((entry) => entry.name)
    .sort();
  if (looseSources.length) {
    throw new Error(
      `Loose post sources are not supported: ${looseSources.join(', ')}. ` +
        'Move each post to content/posts/<slug>/index.md or index.html.',
    );
  }

  return entries
    .filter((entry) => entry.isDirectory() && !entry.name.startsWith('.'))
    .sort((a, b) => a.name.localeCompare(b.name))
    .map((entry) => {
      const slug = entry.name;
      if (!SLUG_PATTERN.test(slug)) {
        throw new Error(`Post directory "${slug}" must use a lowercase kebab-case slug`);
      }

      const postDir = join(postsDir, slug);
      const markdownPath = join(postDir, 'index.md');
      const htmlPath = join(postDir, 'index.html');
      const hasMarkdown = existsSync(markdownPath);
      const hasHtml = existsSync(htmlPath);
      if (hasMarkdown === hasHtml) {
        throw new Error(`Post "${slug}" must have exactly one source file: index.md or index.html`);
      }

      const format = hasHtml ? 'html' : 'markdown';
      const sourcePath = hasHtml ? htmlPath : markdownPath;
      const { meta, source } = parsePostSource(readFileSync(sourcePath, 'utf-8'), sourcePath);
      return { slug, meta, format, source, sourcePath };
    });
}
