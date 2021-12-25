<script lang="ts">
  import * as THREE from "three";
  import * as SC from "svelte-cubed";
  import anime from "animejs";
  import CustomCard from "./components/_CustomCard.svelte";
  import TransitionButton from "./components/_TransitionButton.svelte";
  import { OBJLoader } from "three/examples/jsm/loaders/OBJLoader.js";
  import questionMark from "./../models/questionMark.obj";
  import remoteGo from "./../models/remoteGo.obj";
  let remoteGoObj = new OBJLoader().parse(remoteGo);
  let remoteGoColors = [
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
  let questionMarkObj = new OBJLoader().parse(questionMark);

  let spin = 0;
  let currentPosition = [-12, 0, 0];
  let target = [0, 0, 0];
  let cardContainer: HTMLElement;
  let transitionSpeed = 0.025;
  let fogLevel = 0.1;
  let cameraHeight = 1;
  let differences = [12, 0, 12];
  let projects: Array<{
    title: string;
    image: string;
    description: string;
    tech: string;
    languages: string;
    src?: string;
    model?: THREE.Group;
    link?: string;
    scale?: number;
    zPos?: number;
    rotation?: Array<number>;
    geo?: THREE.BufferGeometry;
    color?: string;
  }> = [
    {
      title: "WC3 Multi-Tool",
      image: "wc3_auto_balancer_v2.png",
      description:
        "A highly versatile tool for the custom map making scene of Warcraft III. With tools to implement ELO based balanced matchmaking, autohosting, integrating chat into discord, and more. (Partial Source)",
      src: "https://github.com/kgallimore/wc3MultiToolSite",
      link: "https://war.trenchguns.com",
      languages: "Typescript",
      tech: "Electron, Svelte, Websockets",
    },
    {
      title: "MeetManage",
      image: "meetManage.png",
      description: "An extension that cleans the user interface for Google Meet.",
      link: "https://galli.dev",
      languages: "Typescript",
      tech: "Google Extension, Svelte, Node, Express, MariaDB, Websockets",
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
      languages: "Javascript, Python, Arduino",
      tech: "Node, Express, MariaDB, SocketIO, KiCad, Autodesk Fusion 360",
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
      languages: "PHP, Javascript",
      tech: "",
    },
    {
      title: "Simple RTC",
      image: "telephone-inbound-fill.svg",
      description:
        "A simple calling site for 1 to 1 calls, developed to experiment for a virtual show business. Call recording and automatic upload of source video after call ends. (Partial Source)",
      link: "https://call.gallimo.com",
      src: "https://github.com/kgallimore/simpleRTC",
      languages: "Javascript, PHP",
      tech: "WebRTC, Node, Express, MariaDB, SocketIO, RecordRTC",
    },
    {
      title: "This site",
      image: "site.png",
      src: "https://github.com/kgallimore/portfolio",
      description: "A portfolio of my biggest projects to date.",
      languages: "Typescript",
      tech: "Svelte, three.js, animejs, tailwind",
    },
    {
      title: "Your next project?",
      image: "question-diamond.svg",
      description:
        "Currently in the job market searching for work! Click \"View\" to view a redacted resume, and <a href='mailto:keith@gallimo.com'>feel free to email me at keith@gallimo.com</a> for a full resume or to get in touch!",
      model: questionMarkObj,
      languages: "Typescript, Javascript, Python, Java, C++, ...?",
      tech: "?",
      link: "/resume.jpg",
    },
  ];
  let arraySize = Math.ceil(Math.sqrt(projects.length));

  setInterval(() => {
    spin += 0.005;
    if (
      currentPosition[0] === getXPos(projects.length - 1) &&
      currentPosition[2] === getYPos(projects.length - 1)
    ) {
      if (fogLevel > 0.02) fogLevel -= 0.0004;
      if (cameraHeight > 0.75) cameraHeight -= 0.0008;
    } else {
      if (fogLevel < 0.1) fogLevel += 0.0004;
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
  }, 20);

  function getXPos(index: number) {
    if (index < 0) {
      index = projects.length + index;
    } else if (index > projects.length - 1) {
      index = index - projects.length;
    }
    if (index === projects.length - 1) {
      return ((arraySize - 1) * 12) / 2;
    }
    return (index % arraySize) * 12;
  }
  function getYPos(index: number) {
    if (index < 0) {
      index = projects.length + index;
    } else if (index > projects.length - 1) {
      index = index - projects.length;
    }
    if (index === projects.length - 1) {
      return (
        (arraySize - (arraySize - Math.ceil((projects.length - 1) / arraySize))) * 12
      );
    }
    return (Math.floor(index / arraySize) || 0) * 12;
  }
  function navigate(x: number, y: number, shiftX: number) {
    if (
      target.every((value, index) => value === currentPosition[index]) &&
      animeFinished
    ) {
      differences = [
        Math.abs(currentPosition[0] - x),
        0,
        Math.abs(currentPosition[2] - y),
      ];
      target[0] = x;
      target[2] = y;
      anime({
        targets: cardContainer,
        translateX: (shiftX < 0 ? "-" : "+") + "=" + Math.abs(shiftX).toString() + "%",
        easing: "easeInOutSine",
        duration: 20 / transitionSpeed,
        begin: () => {
          isDragging = true;
          animeFinished = false;
        },
        complete: () => {
          isDragging = false;
          animeFinished = true;
        },
      });
    }
  }

  let animeFinished = true,
    isDragging = false,
    startPos = 0,
    currentTranslate = 0,
    prevTranslate = 0;

  // Event callbacks
  function touchStart(e: TouchEvent | MouseEvent) {
    e.preventDefault();
    startPos = getPositionX(e);
    isDragging = true;
  }

  function touchEnd(e: TouchEvent | MouseEvent, i: number) {
    e.preventDefault();
    isDragging = false;
    const movedBy = currentTranslate - prevTranslate;
    if (movedBy < window.innerWidth / -4)
      navigate(
        getXPos(i + 1),
        getYPos(i + 1),
        i === projects.length - 1 ? 100 - 100 / projects.length : -100 / projects.length
      );
    if (movedBy > window.innerWidth / 4)
      navigate(
        getXPos(i - 1),
        getYPos(i - 1),
        i === 0 ? -100 + 100 / projects.length : 100 / projects.length
      );
  }

  function touchMove(e: TouchEvent | MouseEvent) {
    e.preventDefault();
    if (isDragging) {
      const currentPosition = getPositionX(e);
      currentTranslate = prevTranslate + currentPosition - startPos;
    }
  }

  // Helper functions
  function getPositionX(event: TouchEvent | MouseEvent) {
    if (event instanceof TouchEvent) {
      return event.touches[0].clientX;
    } else {
      return event.pageX;
    }
  }
</script>

<SC.Canvas antialias shadows fog={new THREE.FogExp2("black", fogLevel)}>
  {#each projects as project, i}
    {#if i === projects.length - 1}
      <SC.Primitive
        object={project.model}
        position={[getXPos(i), project.zPos ?? 0.001, getYPos(i)]}
        scale={project.scale
          ? [project.scale, project.scale, project.scale]
          : [0.05, 0.05, 0.05]}
        rotation={[project.rotation?.[0] ?? 0, spin, project.rotation?.[1] ?? 0]}
      />
    {:else if project.model}
      <SC.Primitive
        object={project.model}
        position={[getXPos(i), project.zPos ?? 0.001, getYPos(i)]}
        scale={project.scale
          ? [project.scale, project.scale, project.scale]
          : [0.05, 0.05, 0.05]}
        rotation={[project.rotation?.[0] ?? 0, spin, project.rotation?.[1] ?? 0]}
      />
    {:else}
      <SC.Mesh
        geometry={project.geo ?? new THREE.BoxGeometry()}
        material={new THREE.MeshStandardMaterial({
          color: project.color ?? "#" + Math.floor(Math.random() * 16777215).toString(16),
        })}
        position={[getXPos(i), project.zPos ?? 0.001, getYPos(i)]}
        scale={[1, 1, 1]}
        rotation={[0, spin, 0]}
        castShadow
      />
    {/if}
  {/each}

  <SC.Group position={[0, -1 / 2, 0]}>
    <SC.Mesh
      geometry={new THREE.PlaneGeometry(120, 80)}
      material={new THREE.MeshStandardMaterial({ color: "red" })}
      rotation={[-Math.PI / 2, 0, 0]}
      position={[12, 0, 0]}
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
    position={[24, 3, -3]}
    shadow={{ mapSize: [2048, 2048] }}
  />
</SC.Canvas>
<div
  bind:this={cardContainer}
  style="top:100%"
  class="fixed flex animate-rollin z-50 h-64 md:h-48"
>
  {#each projects as project, i}
    <CustomCard
      on:touchstart={(e) => touchStart(e)}
      on:mousedown={(e) => touchStart(e)}
      on:touchend={(e) => touchEnd(e, i)}
      on:mouseup={(e) => touchEnd(e, i)}
      on:mouseleave={(e) => touchEnd(e, i)}
      on:touchmove={(e) => touchMove(e)}
      on:mousemove={(e) => touchMove(e)}
      data={project}
    >
      <TransitionButton
        slot="back"
        title={projects[i === 0 ? projects.length - 1 : i - 1].title}
        on:click={() => {
          navigate(
            getXPos(i - 1),
            getYPos(i - 1),
            i === 0 ? -100 + 100 / projects.length : 100 / projects.length
          );
        }}
      />
      <TransitionButton
        slot="forward"
        title={projects[i === projects.length - 1 ? 0 : i + 1].title}
        reverseDir={true}
        on:click={() => {
          navigate(
            getXPos(i + 1),
            getYPos(i + 1),
            i === projects.length - 1
              ? 100 - 100 / projects.length
              : -100 / projects.length
          );
        }}
      />
    </CustomCard>
  {/each}
</div>
