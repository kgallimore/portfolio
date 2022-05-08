import { projects as data } from "./config/projects";
type TechTypes =
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

type Languages =
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
  link?: string;
  scale?: number;
  zPos?: number;
  rotation?: Array<number>;
  geo?: THREE.BufferGeometry;
  color?: string;
};
// @ts-expect-error The types string and techtypes are compatible
export const projects: Array<Project> = data;
