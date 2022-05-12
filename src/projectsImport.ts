import { projects as data } from "./config/projects";
export type TechTypes =
  | "Docker"
  | "Firebase"
  | "Electron"
  | "Svelte"
  | "Websockets"
  | "Chrome Extension"
  | "Node"
  | "Express"
  | "MariaDB"
  | "SocketIO"
  | "KiCad"
  | "Autodesk Fusion 360"
  | "WebRTC"
  | "RecordRTC"
  | "tailwind"
  | "three.js"
  | "animejs"
  | "?";

export type Languages =
  | "Javascript"
  | "Typescript"
  | "PHP"
  | "Python"
  | "Arduino"
  | "Java"
  | "C++"
  | "...?";

export type Project = {
  title: string;
  image: string;
  description: string;
  tech: Array<TechTypes>;
  languages: Array<Languages>;
  imageAlt?: string;
  src?: string;
  model?: THREE.Group;
  glbFile?: string;
  link?: string;
  scale?: number;
  zPos?: number;
  rotation?: Array<number>;
  geo?: THREE.BufferGeometry;
  color?: string;
};

export const projects: Array<Project> = data;
