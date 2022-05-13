import * as THREE from "three";
import { OBJLoader } from "three/examples/jsm/loaders/OBJLoader.js";
import type { Project } from "../projectsImport";

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
for (const [i, child] of Object.entries(remoteGoObj.children)) {
  child.castShadow = true;
  // @ts-expect-error Only broken in js
  child.material = new THREE.MeshPhongMaterial({
    color: remoteGoColors[i],
    flatShading: true,
    shininess: 0,
    specular: 0x000000,
    side: THREE.DoubleSide,
  });
}
const questionMarkObj = new OBJLoader().parse(questionMark);
export const projects: Array<Project> = [
  {
    title: "WC3 Multi-Tool",
    image: "wc3_auto_balancer_v2.png",
    description:
      "A tool that integrates into Warcraft 3 that implements many extra features: Permanent blacklist, whitelisting, autohosting, discord chat and rich presence integration, chat translator, custom map ELO and balancer, Twitch donation integration, OBS scene switcher, and more.",
    src: "https://github.com/kgallimore/wc3MultiTool",
    link: "https://www.hiveworkshop.com/threads/wc3-multi-tool.335492/",
    languages: ["Svelte", "TypeScript"],
    tech: ["Electron", "Websockets"],
  },
  {
    title: "MeetManage",
    image: "meetManage.png",
    description: "An extension that cleans the user interface for Google Meet.",
    link: "https://meetmanage.ferum.tech",
    languages: ["Svelte", "TypeScript"],
    tech: [
      "Chrome Extension",
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
    languages: ["JavaScript", "Python", "Arduino"],
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
    glbFile: "smiley.glb",
    rotation: [0, 1],
    //model: luckylp,
    scale: 0.5,
    color: "yellow",
    link: "https://googlelp.com",
    languages: ["PHP", "JavaScript"],
    tech: [],
  },
  {
    title: "Simple RTC",
    image: "telephone-inbound-fill.svg",
    description:
      "A simple calling site for 1 to 1 calls, developed to experiment for a virtual show business. Call recording and automatic upload of source video after call ends. (Partial Source)",
    link: "https://call.gallimo.com",
    src: "https://github.com/kgallimore/simpleRTC",
    languages: ["JavaScript", "PHP"],
    tech: ["WebRTC", "Node", "Express", "MariaDB", "SocketIO", "RecordRTC", "Docker"],
  },
  {
    title: "Merchant Market",
    description:
      "Something similar to Fiverr for merchants to offer services, created as an experiment in PHP",
    src: "https://github.com/kgallimore/merchantmarket",
    image: "meetManage.png",
    languages: ["PHP", "JavaScript"],
    tech: ["MariaDB"],
  },
  {
    title: "ShowSheet",
    description:
      "An experiment at creating an online calendar for live shows and events in PHP",
    src: "https://github.com/kgallimore/showSheet",
    image: "meetManage.png",
    languages: ["PHP"],
    tech: ["MariaDB"],
  },
  {
    title: "Yevolve",
    description:
      "A MVP for an idea for a service that would automatically stream random clients youtube videos to their youtube channels",
    src: "https://github.com/kgallimore/Yevolve",
    image: "meetManage.png",
    languages: ["Python"],
    tech: [],
  },
  {
    title: "Telebot",
    description:
      "A Telegram group giveaway bot, authorized merchant manager, and other misc admin tasks",
    src: "https://github.com/kgallimore/telebot",
    image: "meetManage.png",
    languages: ["Python"],
    tech: ["MariaDB"],
  },
  {
    title: "Discord PrivateTicket",
    description:
      "A bot that would create private channels for merchants to provide services to their customers. Could also automatically accept BTC payments.",
    src: "https://github.com/kgallimore/DiscordPrivateTicket",
    image: "meetManage.png",
    languages: ["Python"],
    tech: [],
  },
  {
    title: "This Site",
    image: "site.png",
    src: "https://github.com/kgallimore/portfolio",
    description: "A portfolio of my biggest projects to date.",
    languages: ["Svelte", "TypeScript"],
    tech: ["three.js", "animejs", "tailwind", "Firebase"],
  },
  {
    title: "Your Next Project?",
    image: "question-diamond.svg",
    description:
      "Currently in the job market searching for work! Click \"View\" to view a redacted resume, and <a href='mailto:keith@gallimo.com'>feel free to email me at keith@gallimo.com</a> for a full resume or to get in touch! Click on the name of any previous project to jump to it.",
    model: questionMarkObj,
    languages: ["TypeScript", "JavaScript", "Python", "Java", "C++", "...?"],
    tech: ["?"],
    link: "/resume.jpg",
  },
];
