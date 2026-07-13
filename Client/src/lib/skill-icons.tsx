import {
  SiPython, SiJavascript, SiC, SiMysql, SiPostgresql, SiReact,
  SiNodedotjs, SiSpringboot, SiTailwindcss, SiGit, SiGithub, SiDocker,
  SiTypescript, SiNextdotjs, SiExpress, SiMongodb, SiFirebase,
  SiFigma, SiVuedotjs, SiAngular, SiSass, SiRedux, SiGraphql,
  SiKubernetes, SiGooglecloud, SiLinux, SiPostman, SiOpenjdk,
  SiCplusplus,
} from 'react-icons/si'
import { DiPhotoshop, DiIllustrator } from 'react-icons/di'
import { FaPalette, FaMicrosoft } from 'react-icons/fa'
import type { IconType } from 'react-icons'

const iconMap: Record<string, IconType> = {
  SiPython, SiJavascript, SiC, SiMysql, SiPostgresql, SiReact,
  SiNodedotjs, SiSpringboot, SiTailwindcss, SiGit, SiGithub, SiDocker,
  SiTypescript, SiNextdotjs, SiExpress, SiMongodb, SiFirebase,
  SiFigma, SiVuedotjs, SiAngular, SiSass, SiRedux, SiGraphql,
  SiKubernetes, SiGooglecloud, SiLinux, SiPostman, SiOpenjdk,
  SiCplusplus,
  DiPhotoshop, DiIllustrator, FaPalette, FaMicrosoft,
}

const nameToIcon: Record<string, IconType> = {
  python: SiPython,
  java: SiOpenjdk,
  'open jdk': SiOpenjdk,
  javascript: SiJavascript,
  js: SiJavascript,
  c: SiC,
  'c++': SiCplusplus,
  cplusplus: SiCplusplus,
  'c plus plus': SiCplusplus,
  sql: SiMysql,
  mysql: SiMysql,
  postgresql: SiPostgresql,
  'postgres sql': SiPostgresql,
  react: SiReact,
  'react native': SiReact,
  'node.js': SiNodedotjs,
  nodejs: SiNodedotjs,
  'spring boot': SiSpringboot,
  springboot: SiSpringboot,
  tailwindcss: SiTailwindcss,
  'tailwind css': SiTailwindcss,
  tailwind: SiTailwindcss,
  git: SiGit,
  github: SiGithub,
  docker: SiDocker,
  typescript: SiTypescript,
  ts: SiTypescript,
  'next.js': SiNextdotjs,
  nextjs: SiNextdotjs,
  express: SiExpress,
  'express.js': SiExpress,
  mongodb: SiMongodb,
  firebase: SiFirebase,
  figma: SiFigma,
  vue: SiVuedotjs,
  'vue.js': SiVuedotjs,
  angular: SiAngular,
  sass: SiSass,
  scss: SiSass,
  redux: SiRedux,
  graphql: SiGraphql,
  kubernetes: SiKubernetes,
  'google cloud': SiGooglecloud,
  gcp: SiGooglecloud,
  linux: SiLinux,
  postman: SiPostman,
  photoshop: DiPhotoshop,
  'adobe photoshop': DiPhotoshop,
  illustrator: DiIllustrator,
  'adobe illustrator': DiIllustrator,
  canva: FaPalette,
  'microsoft office': FaMicrosoft,
  'ms office': FaMicrosoft,
  aws: SiGooglecloud,
}

export function getSkillIcon(iconName: string, skillName: string): IconType {
  if (iconName && iconMap[iconName]) return iconMap[iconName]
  const key = skillName.toLowerCase().trim()
  
  if (nameToIcon[key]) return nameToIcon[key]
  
  const words = key.split(/[\s\-_./\\#+]+/)
  for (const [name, icon] of Object.entries(nameToIcon)) {
    if (words.includes(name) || key.startsWith(name + ' ') || key.endsWith(' ' + name)) {
      return icon
    }
  }
  return SiReact
}

export const SKILL_ICON_OPTIONS = [
  { value: '', label: 'Auto-detect' },
  { value: 'SiPython', label: 'Python' },
  { value: 'SiOpenjdk', label: 'Java / OpenJDK' },
  { value: 'SiJavascript', label: 'JavaScript' },
  { value: 'SiC', label: 'C' },
  { value: 'SiCplusplus', label: 'C++' },
  { value: 'SiMysql', label: 'MySQL' },
  { value: 'SiPostgresql', label: 'PostgreSQL' },
  { value: 'SiReact', label: 'React' },
  { value: 'SiNodedotjs', label: 'Node.js' },
  { value: 'SiSpringboot', label: 'Spring Boot' },
  { value: 'SiTailwindcss', label: 'Tailwind CSS' },
  { value: 'SiGit', label: 'Git' },
  { value: 'SiGithub', label: 'GitHub' },
  { value: 'SiDocker', label: 'Docker' },
  { value: 'SiTypescript', label: 'TypeScript' },
  { value: 'SiNextdotjs', label: 'Next.js' },
  { value: 'SiExpress', label: 'Express' },
  { value: 'SiMongodb', label: 'MongoDB' },
  { value: 'SiFirebase', label: 'Firebase' },
  { value: 'SiFigma', label: 'Figma' },
  { value: 'SiLinux', label: 'Linux' },
  { value: 'SiPostman', label: 'Postman' },
  { value: 'SiGraphql', label: 'GraphQL' },
  { value: 'SiKubernetes', label: 'Kubernetes' },
  { value: 'SiGooglecloud', label: 'Google Cloud' },
  { value: 'SiAngular', label: 'Angular' },
  { value: 'SiVuedotjs', label: 'Vue.js' },
  { value: 'SiSass', label: 'Sass' },
  { value: 'SiRedux', label: 'Redux' },
  { value: 'DiPhotoshop', label: 'Adobe Photoshop' },
  { value: 'DiIllustrator', label: 'Adobe Illustrator' },
  { value: 'FaPalette', label: 'Canva' },
  { value: 'FaMicrosoft', label: 'Microsoft Office' },
]
