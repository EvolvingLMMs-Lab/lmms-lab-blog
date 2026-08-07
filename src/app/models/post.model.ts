export type TocLevel = 2 | 3;

export interface TocItem {
  id: string;
  text: string;
  level: TocLevel;
  children: TocItem[];
}

export interface Post {
  slug: string;
  title: string;
  date: string;
  description: string;
  contentHtml: string;
  toc: TocItem[];
}
