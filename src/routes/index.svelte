<script lang="ts">
  import * as THREE from "three";
  import * as SC from "svelte-cubed";
  import anime from "animejs";
  import CustomCard from "./components/_CustomCard.svelte";
  import TransitionButton from "./components/_TransitionButton.svelte";
  import { OBJLoader } from "three/examples/jsm/loaders/OBJLoader";
  import questionMark from "./../models/questionMark.obj";
  let spin = 0;
  let currentPosition = [-12, 0, 0];
  let target = [0, 0, 0];
  let cardContainer: HTMLElement;
  let transitionSpeed = 0.015;
  let fogLevel = 0.1;
  let cameraHeight = 1;
  let differences = [12, 0, 12];
  let projects: Array<{
    title: string;
    image: string;
    description: string;
    xPos: number;
    yPos: number;
    tech: string;
    languages: string;
    src?: string;
    model?: string;
    link?: string;
    scale?: number;
    geo?: THREE.BufferGeometry;
    color?: string;
  }> = [
    {
      title: "WC3 Multi-Tool",
      image: "wc3_auto_balancer_v2.png",
      description:
        "A highly versatile tool for the custom map making scene of Warcraft III. With tools to implement ELO based balanced matchmaking, autohosting, integrating chat into discord, and more. (Partial Source)",
      xPos: 0,
      yPos: 0,
      model: "",
      src: "https://github.com/kgallimore/wc3MultiToolSite",
      link: "https://war.trenchguns.com",
      languages: "Typescript",
      tech: "Electron, Svelte, Websockets",
    },
    {
      title: "MeetManage",
      image: "meetManage.png",
      description: "An extension that cleans the user interface for Google Meet.",
      xPos: 12,
      yPos: 0,
      model: "",
      link: "https://galli.dev",
      languages: "Typescript",
      tech: "Google Extension, Svelte, Node, Express, MariaDB, Websockets",
    },
    {
      title: "Remote Go!",
      image: "meetManage.png",
      description:
        "(Comssioned work) A hardware and software solution in order to click through a presentation on a remote computer from anywhere in the world. Accessible through a simple web page, or through a custom designed 4g connected remote clicker.",
      xPos: 24,
      yPos: 0,
      model: "",
      link: "https://go.galli.dev/",
      languages: "Javascript, Python, Arduino",
      tech: "Node, Express, MariaDB, SocketIO, KiCad, Autodesk Fusion 360",
    },
    {
      title: "LuckyLP",
      image: "smiley.svg",
      description: "A web application for users to vote on Lucky Patcher patchable apps.",
      xPos: 0,
      yPos: 12,
      geo: new THREE.SphereGeometry(0.5, 16, 16),
      //model: luckylp,
      model: "",
      scale: 0.5,
      color: "yellow",
      link: "https://googlelp.com",
      languages: "PHP, Javascript",
      tech: "",
    },
    {
      title: "Simple RTC",
      image: "telephone-inbound-fill.svg",
      description:
        "A simple calling site for 1 to 1 calls, developed to experiment for a virtual show business. Call recording and automatic upload of source video after call ends. (Partial Source)",
      xPos: 12,
      yPos: 12,
      link: "https://call.gallimo.com",
      src: "https://github.com/kgallimore/simpleRTC",
      model: "",
      languages: "Javascript, PHP",
      tech: "WebRTC, Node, Express, MariaDB, SocketIO, RecordRTC",
    },
    {
      title: "This site",
      image: "site.png",
      description: "A portfolio of my biggest projects to date.",
      xPos: 24,
      yPos: 12,
      model: "",
      languages: "Typescript",
      tech: "Svelte, three.js, animejs, tailwind",
    },
    {
      title: "Your next project?",
      image: "question-diamond.svg",
      description:
        "Currently in the job market searching for work! Click \"View\" to view a redacted resume, and <a href='mailto:keith@gallimo.com'>feel free to email me at keith@gallimo.com</a> for a full resume or to get in touch!",
      xPos: 12,
      yPos: 24,
      model: questionMark,
      languages: "Typescript, Javascript, Python, Java, C++, ...?",
      tech: "?",
      link: "/resume.jpg",
    },
  ];
  SC.onFrame(() => {
    spin += 0.005;
    if (
      currentPosition[0] === projects[projects.length - 1].xPos &&
      currentPosition[2] === projects[projects.length - 1].yPos
    ) {
      if (fogLevel > 0.03) fogLevel -= 0.0002;
      if (cameraHeight > 0.75) cameraHeight -= 0.0008;
    } else {
      if (fogLevel < 0.1) fogLevel += 0.0002;
      if (cameraHeight < 1) cameraHeight += 0.0008;
    }
    for (let i = 0; i < 3; i++) {
      if (Math.abs(target[i] - currentPosition[i]) < differences[i] * transitionSpeed) {
        currentPosition[i] = target[i];
      } else if (target[i] > currentPosition[i]) {
        currentPosition[i] += differences[i] * transitionSpeed;
      } else if (target[i] < currentPosition[i]) {
        currentPosition[i] -= differences[i] * transitionSpeed;
      }
    }
  });
  function navigate(x: number, y: number, shiftX: number) {
    if (target.every((value, index) => value === currentPosition[index])) {
      differences = [
        Math.abs(currentPosition[0] - x),
        0,
        Math.abs(currentPosition[2] - y),
      ];
      console.log(differences);
      target[0] = x;
      target[2] = y;
      anime({
        targets: cardContainer,
        translateX: (shiftX < 0 ? "-" : "+") + "=" + Math.abs(shiftX).toString() + "%",
        easing: "easeInOutSine",
        duration: 10 / transitionSpeed,
      });
    }
  }
</script>

<SC.Canvas antialias shadows fog={new THREE.FogExp2("black", fogLevel)}>
  {#each projects as project}
    {#if project.model}
      <SC.Primitive
        object={new OBJLoader().parse(project.model)}
        position={[project.xPos, 0.001, project.yPos]}
        scale={project.scale
          ? [project.scale, project.scale, project.scale]
          : [0.05, 0.05, 0.05]}
        rotation={[0, spin, 0]}
      />
    {:else if project.geo}
      <SC.Mesh
        geometry={project.geo}
        material={new THREE.MeshStandardMaterial({
          color: project.color ?? "#" + Math.floor(Math.random() * 16777215).toString(16),
        })}
        position={[project.xPos, 0.001, project.yPos]}
        scale={[1, 1, 1]}
        rotation={[0, spin, 0]}
        castShadow
      />
    {:else}
      <SC.Mesh
        geometry={new THREE.BoxGeometry()}
        material={new THREE.MeshStandardMaterial({
          color: project.color ?? "#" + Math.floor(Math.random() * 16777215).toString(16),
        })}
        position={[project.xPos, 0.001, project.yPos]}
        scale={[1, 1, 1]}
        rotation={[0, spin, 0]}
        castShadow
      />
    {/if}
  {/each}

  <SC.Group position={[0, -1 / 2, 0]}>
    <SC.Mesh
      geometry={new THREE.PlaneGeometry(80, 80)}
      material={new THREE.MeshStandardMaterial({ color: "red" })}
      rotation={[-Math.PI / 2, 0, 0]}
      receiveShadow
    />
  </SC.Group>

  <SC.PerspectiveCamera
    position={[currentPosition[0], cameraHeight, currentPosition[2] + 5]}
    target={currentPosition}
  />
  <SC.AmbientLight intensity={0.6} />
  <SC.DirectionalLight
    intensity={0.8}
    position={[36, 3, 24]}
    shadow={{ mapSize: [2048, 2048] }}
  />
  <SC.DirectionalLight
    intensity={0.8}
    position={[0, 3, 24]}
    shadow={{ mapSize: [2048, 2048] }}
  />
  <SC.DirectionalLight
    intensity={0.8}
    position={[24, 3, 0]}
    shadow={{ mapSize: [2048, 2048] }}
  />
</SC.Canvas>
<div
  bind:this={cardContainer}
  style="bottom:-100%"
  class="absolute flex animate-rollin z-50 h-48"
>
  {#each projects as project, i}
    {#if i === 0}
      <CustomCard data={project}>
        <TransitionButton
          slot="back"
          title={projects[projects.length - 1].title}
          on:click={() => {
            navigate(
              projects[projects.length - 1].xPos,
              projects[projects.length - 1].yPos,
              -100 + 100 / projects.length
            );
          }}
        />
        <TransitionButton
          slot="forward"
          title={projects[i + 1].title}
          reverseDir={true}
          on:click={() => {
            navigate(projects[i + 1].xPos, projects[i + 1].yPos, -100 / projects.length);
          }}
        />
      </CustomCard>
    {:else if i === projects.length - 1}
      <CustomCard data={project}>
        <TransitionButton
          slot="back"
          title={projects[i - 1].title}
          on:click={() => {
            navigate(projects[i - 1].xPos, projects[i - 1].yPos, 100 / projects.length);
          }}
        />
        <TransitionButton
          slot="forward"
          title={projects[0].title}
          reverseDir={true}
          on:click={() => {
            navigate(projects[0].xPos, projects[0].yPos, 100 - 100 / projects.length);
          }}
        />
      </CustomCard>
    {:else}
      <CustomCard data={project}>
        <TransitionButton
          slot="back"
          title={projects[i - 1].title}
          on:click={() => {
            navigate(projects[i - 1].xPos, projects[i - 1].yPos, 100 / projects.length);
          }}
        />
        <TransitionButton
          slot="forward"
          title={projects[i + 1].title}
          reverseDir={true}
          on:click={() => {
            navigate(projects[i + 1].xPos, projects[i + 1].yPos, -100 / projects.length);
          }}
        />
      </CustomCard>
    {/if}
  {/each}
</div>
