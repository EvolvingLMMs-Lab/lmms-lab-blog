export type TocLevel = 2 | 3;

export interface TocItem {
  id: string;
  text: string;
  level: TocLevel;
  children: TocItem[];
}

export interface PostAuthor {
  name: string;
  url?: string;
  main?: boolean;
}

export interface Post {
  slug: string;
  title: string;
  date: string;
  description: string;
  authors: PostAuthor[];
  tags: string[];
  layout: 'standard' | 'showcase';
  contentHtml: string;
  toc: TocItem[];
}
