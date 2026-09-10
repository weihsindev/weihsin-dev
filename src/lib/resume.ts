import { load } from 'js-yaml';
import { z } from 'zod';
// ?raw 讓 Vite 在 build 時把 YAML 內容內嵌進來。
// 不要改回 fs.readFileSync:打包後 import.meta.url 會指到 dist,檔案不在那裡。
import source from '../content/resume.yaml?raw';

const yearMonth = z.string().regex(/^\d{4}-\d{2}$/, '日期格式必須是 YYYY-MM');

const schema = z.object({
  basics: z.object({
    name: z.string(),
    name_full: z.string(),
    name_zh: z.string(),
    title: z.string(),
    stack_line: z.string().nullable(),
    email: z.string().email(),
    location: z.string(),
    remote: z.boolean(),
    status: z.string().nullable(),
    available_from: yearMonth,
  }),
  summary: z.string(),
  stats: z.array(z.object({ label: z.string(), value: z.string() })),
  about: z.array(z.string()),
  experience: z.array(
    z.object({
      company: z.string(),
      role: z.string(),
      track: z.enum(['software', 'pre_software']),
      start: yearMonth,
      end: yearMonth,
      industry: z.string().optional(),
      company_size: z.string().optional(),
      location: z.string(),
      summary: z.string().optional(),
    }),
  ),
  projects_intro: z.string(),
  projects: z.array(z.object({ title: z.string(), detail: z.string() })),
  background_intro: z.string(),
  education: z.array(
    z.object({
      institution: z.string(),
      program: z.string(),
      start: yearMonth,
      end: yearMonth,
      note: z.string().optional(),
    }),
  ),
  skills: z.array(z.object({ group: z.string(), items: z.array(z.string()).min(1) })),
  languages: z.array(z.object({ name: z.string(), level: z.string() })),
  links: z.object({
    email: z.string().email(),
    resume_pdf: z.string().nullable(),
    github: z.string().nullable(),
  }),
});

const parsed = schema.safeParse(load(source));

if (!parsed.success) {
  // build 時就炸掉,不要讓壞掉的資料上線
  throw new Error(`resume.yaml 格式錯誤:\n${z.prettifyError(parsed.error)}`);
}

export const resume = parsed.data;
export type Resume = typeof resume;

/**
 * 年資。沿用 104 的算法:含頭含尾,所以月數要 +1。
 * 2022-06 至 2026-04 = 47 個月 = 3 年 11 個月。
 */
export function duration(start: string, end: string): string {
  const [sy, sm] = start.split('-').map(Number) as [number, number];
  const [ey, em] = end.split('-').map(Number) as [number, number];
  const months = (ey - sy) * 12 + (em - sm) + 1;
  const years = Math.floor(months / 12);
  const rest = months % 12;
  if (years && rest) return `${years} 年 ${rest} 個月`;
  if (years) return `${years} 年`;
  return `${rest} 個月`;
}

/** 2022-06 → 2022.06 */
export const ym = (d: string) => d.replace('-', '.');
