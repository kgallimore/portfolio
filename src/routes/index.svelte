<script lang="ts">
  import * as THREE from "three";
  import * as SC from "svelte-cubed";
  import type { Project } from "../config/projects";
  import anime from "animejs";
  import CustomCard from "./components/_CustomCard.svelte";
  import TransitionButton from "./components/_TransitionButton.svelte";
  import { initializeApp } from "firebase/app";
  import { getAuth, signInAnonymously, connectAuthEmulator } from "firebase/auth";
  import { getDatabase, connectDatabaseEmulator, ref, onValue } from "firebase/database";
  import {
    getFirestore,
    connectFirestoreEmulator,
    addDoc,
    serverTimestamp,
    collection,
  } from "firebase/firestore";
  import { projects } from "../config/projects";

  let projectList: Array<Project & { cleanName: string }> = projects.map((project) => ({
    ...project,
    cleanName: cleanName(project.title),
  }));

  const firebaseConfig = {
    apiKey: "AIzaSyAYIuZUTcCzyH8LwSIRZuwtJ5_SJjxvRgA",
    authDomain: "portfolio-c4d81.firebaseapp.com",
    databaseURL: "https://portfolio-c4d81-default-rtdb.firebaseio.com",
    projectId: "portfolio-c4d81",
    storageBucket: "portfolio-c4d81.appspot.com",
    messagingSenderId: "851128987202",
    appId: "1:851128987202:web:d43372f27084b63089c7db",
    measurementId: "G-VP40VH30BW",
  };

  const app = initializeApp(firebaseConfig);
  const auth = getAuth(app);
  const database = getDatabase(app);
  const firestore = getFirestore(app);

  if (window.location.hostname === "localhost") {
    connectAuthEmulator(auth, "http://localhost:9099");
    connectDatabaseEmulator(database, "localhost", 9000);
    connectFirestoreEmulator(firestore, "localhost", 8080);
  }
  signInAnonymously(auth).then((user) => {
    uid = user.user.uid;
  });

  let viewCounts: {
    visitors: number;
    items: { [key: string]: { views: number; linkViews: number; sourceViews: number } };
  } = { visitors: 0, items: {} };
  onValue(ref(database, "counts/visitors"), (snapshot) => {
    viewCounts.visitors = snapshot.val();
  });
  onValue(ref(database, "counts/items"), (snapshot) => {
    viewCounts.items = snapshot.val();
    console.log("viewCounts", viewCounts);
  });

  let spin = 0;
  let currentPosition = [-12, 0, 0];
  let currentIndex = 0;
  let target = [0, 0, 0];
  let cardContainer: HTMLElement;
  let transitionSpeed = 0.025;
  let fogLevel = 0.1;
  let cameraHeight = 1;
  let differences = [12, 0, 12];
  let projectNum = projectList.length;

  let animeFinished = true,
    isDragging = false,
    startPos = 0,
    currentTranslate = 0,
    prevTranslate = 0;

  let uid = "";

  let arraySize = Math.ceil(Math.sqrt(projectNum));

  setInterval(() => {
    spin += 0.005;
    if (
      currentPosition[0] === getXPos(projectNum - 1) &&
      currentPosition[2] === getYPos(projectNum - 1)
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
    if (index === projectNum - 1) {
      return ((arraySize - 1) * 12) / 2;
    }
    return (index % arraySize) * 12;
  }

  function getYPos(index: number) {
    if (index === projectNum - 1) {
      return (arraySize - (arraySize - Math.ceil((projectNum - 1) / arraySize))) * 12;
    }
    return (Math.floor(index / arraySize) || 0) * 12;
  }

  function navigate(toIndex: number, shiftX: number) {
    if (
      target.every((value, index) => value === currentPosition[index]) &&
      animeFinished
    ) {
      if (toIndex < 0) {
        toIndex = projectNum + toIndex;
      } else if (toIndex > projectNum - 1) {
        toIndex = toIndex - projectNum;
      }
      let y = getYPos(toIndex);
      let x = getXPos(toIndex);
      console.log("navigating to", toIndex);
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
          currentIndex = toIndex;
          updateLinkClick("views");
        },
      });
    }
  }

  function getCleanIndexName(index: number) {
    return cleanName(projectList[index].title);
  }

  function cleanName(name: string) {
    return name.replace(/[^a-zA-Z0-9]/g, "");
  }

  async function updateLinkClick(type: "linkViews" | "sourceViews" | "views") {
    let cleanName = getCleanIndexName(currentIndex);
    if (cleanName && uid) {
      console.log("updating", type, cleanName);
      try {
        addDoc(collection(firestore, "users/" + uid + "/clicks"), {
          type: type,
          item: cleanName,
          timestamp: serverTimestamp(),
        });
      } catch (e) {
        console.log(e);
      }
    } else {
      console.log("no uid or cleanName?");
    }
  }

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
      navigate(i + 1, i === projectNum - 1 ? 100 - 100 / projectNum : -100 / projectNum);
    if (movedBy > window.innerWidth / 4)
      navigate(i - 1, i === 0 ? -100 + 100 / projectNum : 100 / projectNum);
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
  {#each projectList as project, i}
    {#if i === projectNum - 1}
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
  {#each projectList as project, i}
    <CustomCard
      on:touchstart={(e) => touchStart(e)}
      on:touchend={(e) => touchEnd(e, i)}
      on:touchmove={(e) => touchMove(e)}
      title={project.title}
      data={project}
      onLinkClick={updateLinkClick}
    >
      <TransitionButton
        slot="back"
        title={projectList[i === 0 ? projectNum - 1 : i - 1].title}
        on:click={() => {
          navigate(i - 1, i === 0 ? -100 + 100 / projectNum : 100 / projectNum);
        }}
      />
      <TransitionButton
        slot="forward"
        title={projectList[i === projectNum - 1 ? 0 : i + 1].title}
        reverseDir={true}
        on:click={() => {
          navigate(
            i + 1,
            i === projectNum - 1 ? 100 - 100 / projectNum : -100 / projectNum
          );
        }}
      />
    </CustomCard>
  {/each}
</div>
