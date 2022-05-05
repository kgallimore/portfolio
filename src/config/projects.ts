import * as THREE from "three";
import { OBJLoader } from "three/examples/jsm/loaders/OBJLoader.js";

import questionMark from "./../models/questionMark.obj";
import remoteGo from "./../models/remoteGo.obj";

const remoteGoObj = new OBJLoader().parse(remoteGo);
const remoteGoColors = [
  "black",
  "black",
  "black",
  "#046307",
  "teal",
  "black",
  "black",
  "gray",
  "gray",
];
for (const [i, child] of (remoteGoObj.children as THREE.Mesh[]).entries()) {
  child.castShadow = true;
  child.material = new THREE.MeshPhongMaterial({
    color: remoteGoColors[i],
    flatShading: true,
    shininess: 0,
    specular: 0x000000,
    side: THREE.DoubleSide,
  });
}
const questionMarkObj = new OBJLoader().parse(questionMark);

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

export const projects: Array<Project> = [
  {
    title: "WC3 Multi-Tool",
    image: "wc3_auto_balancer_v2.png",
    description:
      "A highly versatile tool for the custom map making scene of Warcraft III. With tools to implement ELO based balanced matchmaking, autohosting, integrating chat into discord, and more. (Partial Source)",
    src: "https://github.com/kgallimore/wc3MultiToolSite",
    link: "https://war.trenchguns.com",
    languages: ["Typescript"],
    tech: ["Electron", "Svelte", "Websockets"],
  },
  {
    title: "MeetManage",
    image: "meetManage.png",
    description: "An extension that cleans the user interface for Google Meet.",
    link: "https://galli.dev",
    languages: ["Typescript"],
    tech: [
      "Chrome Extension",
      "Svelte",
      "Node",
      "Express",
      "MariaDB",
      "Websockets",
      "Firebase",
      "Docker",
    ],
  },
  {
    title: "Remote Go!",
    image: "meetManage.png",
    description:
      "A hardware and software solution in order to click through a presentation on a remote computer from anywhere in the world through a simple web page, or with a custom designed, 4g connected, remote clicker.",
    model: remoteGoObj,
    rotation: [0, 1],
    scale: 0.015,
    zPos: 0.5,
    link: "https://go.galli.dev/",
    languages: ["Javascript", "Python", "Arduino"],
    tech: [
      "Node",
      "Express",
      "MariaDB",
      "SocketIO",
      "KiCad",
      "Autodesk Fusion 360",
      "Docker",
    ],
  },
  {
    title: "LuckyLP",
    image: "smiley.svg",
    description: "A web application for users to vote on Lucky Patcher patchable apps.",

    geo: new THREE.SphereGeometry(0.5, 16, 16),
    //model: luckylp,
    scale: 0.5,
    color: "yellow",
    link: "https://googlelp.com",
    languages: ["PHP", "Javascript"],
    tech: [],
  },
  {
    title: "Simple RTC",
    image: "telephone-inbound-fill.svg",
    description:
      "A simple calling site for 1 to 1 calls, developed to experiment for a virtual show business. Call recording and automatic upload of source video after call ends. (Partial Source)",
    link: "https://call.gallimo.com",
    src: "https://github.com/kgallimore/simpleRTC",
    languages: ["Javascript", "PHP"],
    tech: ["WebRTC", "Node", "Express", "MariaDB", "SocketIO", "RecordRTC"],
  },
  {
    title: "This Site",
    image: "site.png",
    src: "https://github.com/kgallimore/portfolio",
    description: "A portfolio of my biggest projects to date.",
    languages: ["Typescript"],
    tech: ["Svelte", "three.js", "animejs", "tailwind", "Firebase"],
  },
  {
    title: "Your Next Project?",
    image: "question-diamond.svg",
    description:
      "Currently in the job market searching for work! Click \"View\" to view a redacted resume, and <a href='mailto:keith@gallimo.com'>feel free to email me at keith@gallimo.com</a> for a full resume or to get in touch!",
    model: questionMarkObj,
    languages: ["Typescript", "Javascript", "Python", "Java", "C++", "...?"],
    tech: ["?"],
    link: "/resume.jpg",
  },
];
