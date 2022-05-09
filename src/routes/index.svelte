<script lang="ts">
  import {
    MeshStandardMaterial,
    BoxBufferGeometry,
    DoubleSide,
    PlaneGeometry,
  } from "three";
  import {
    GLTF,
    AmbientLight,
    Canvas,
    DirectionalLight,
    Group,
    FogExp2,
    Object3DInstance,
    Mesh,
    PerspectiveCamera,
  } from "threlte";
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
  import { projects, Project } from "../projectsImport";
  import { firebaseConfig } from "../config/firebase";
  import { getAnalytics } from "firebase/analytics";

  let projectList: Array<Project & { cleanName: string }> = projects.map((project) => ({
    ...project,
    cleanName: cleanName(project.title),
  }));

  const app = initializeApp(firebaseConfig);
  const auth = getAuth(app);
  const database = getDatabase(app);
  const firestore = getFirestore(app);

  if (window.location.hostname === "localhost") {
    connectAuthEmulator(auth, "http://localhost:9099");
    connectDatabaseEmulator(database, "localhost", 9000);
    connectFirestoreEmulator(firestore, "localhost", 8080);
  } else {
    const analytics = getAnalytics(app);
  }
  signInAnonymously(auth).then((user) => {
    uid = user.user.uid;

    onValue(ref(database, "counts"), (snapshot) => {
      viewCounts = snapshot.val();
    });
  });

  let viewCounts: {
    visitors: number;
    items: {
      [key: string]: { views?: number; linkViews?: number; sourceViews?: number };
    };
  } = { visitors: 0, items: {} };

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
  $: projectNum = projectList.length;

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

  async function updateLinkClick(
    type: "linkViews" | "sourceViews" | "views",
    e?: MouseEvent
  ) {
    if (e) {
      e.preventDefault();
    }
    let cleanName = getCleanIndexName(currentIndex);
    if (cleanName && uid) {
      try {
        addDoc(collection(firestore, "clicks"), {
          uid,
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

<div class="h-screen w-screen">
  <Canvas shadows={true}>
    <PerspectiveCamera
      position={{ x: currentPosition[0], y: cameraHeight, z: currentPosition[2] + 5 }}
      lookAt={{ x: currentPosition[0], y: currentPosition[1], z: currentPosition[2] }}
    />
    <AmbientLight intensity={0.2} />
    <Group position={{ x: 0, y: -1 / 2, z: 0 }}>
      <Mesh
        receiveShadow
        rotation={{ x: -90 * (Math.PI / 180) }}
        geometry={new PlaneGeometry(120, 80)}
        position={{ x: 12, y: 0, z: 0 }}
        material={new MeshStandardMaterial({ side: DoubleSide, color: "red" })}
      />
      <Mesh
        receiveShadow
        geometry={new PlaneGeometry(180, 80)}
        position={{ x: 0, y: 0, z: -40 }}
        material={new MeshStandardMaterial({ side: DoubleSide, color: "red" })}
      />
    </Group>
    <FogExp2 color={"black"} density={fogLevel} />
    {#each projectList as project, i}
      {#if i === projectNum - 1}
        <Object3DInstance
          object={project.model}
          position={{ x: getXPos(i), y: project.zPos ?? 0.001, z: getYPos(i) }}
          scale={project.scale
            ? { x: project.scale, y: project.scale, z: project.scale }
            : { x: 0.05, y: 0.05, z: 0.05 }}
          rotation={{
            x: project.rotation?.[0] ?? 0,
            y: spin,
            z: project.rotation?.[1] ?? 0,
          }}
          castShadow
          receiveShadow
        />
      {:else if project.model}
        <Object3DInstance
          object={project.model}
          position={{ x: getXPos(i), y: project.zPos ?? 0.001, z: getYPos(i) }}
          scale={project.scale
            ? { x: project.scale, y: project.scale, z: project.scale }
            : { x: 0.05, y: 0.05, z: 0.05 }}
          rotation={{
            x: project.rotation?.[0] ?? 0,
            y: spin,
            z: project.rotation?.[1] ?? 0,
          }}
          castShadow
          receiveShadow
        />
      {:else if project.glbFile}
        <GLTF
          castShadow
          receiveShadow
          url={"/models/" + project.glbFile}
          position={{ x: getXPos(i), y: project.zPos ?? 0.001, z: getYPos(i) }}
          scale={project.scale
            ? { x: project.scale, y: project.scale, z: project.scale }
            : { x: 0.05, y: 0.05, z: 0.05 }}
        />
      {:else}
        <Mesh
          interactive
          on:click={() => alert("hey")}
          geometry={project.geo ?? new BoxBufferGeometry()}
          material={new MeshStandardMaterial({
            color:
              project.color ?? "#" + Math.floor(Math.random() * 16777215).toString(16),
          })}
          position={{ x: getXPos(i), y: project.zPos ?? 0.001, z: getYPos(i) }}
          scale={{ x: 1, y: 1, z: 1 }}
          rotation={{ x: 0, y: spin, z: 0 }}
          receiveShadow
          castShadow
        />
      {/if}
      <DirectionalLight
        intensity={0.2}
        position={{ x: getXPos(i) + 3, y: project.zPos ?? 0.001 + 5, z: getYPos(i) + 5 }}
        shadow={{ mapSize: [2048, 2048] }}
        target={{ x: getXPos(i), y: project.zPos ?? 0.001, z: getYPos(i) }}
      />
    {/each}
  </Canvas>
</div>

<div class="text-white text-xl z-50 w-screen fixed top-0 left-0 text-center">
  Visitors: {viewCounts?.visitors ?? 0}
</div>
<div
  bind:this={cardContainer}
  style="top:100%"
  class="fixed flex animate-rollin z-40 h-64 md:h-48"
>
  {#each projectList as project, i}
    <CustomCard
      on:touchstart={(e) => touchStart(e)}
      on:touchend={(e) => touchEnd(e, i)}
      on:touchmove={(e) => touchMove(e)}
      title={project.title}
      data={project}
      onLinkClick={updateLinkClick}
      clickCounts={viewCounts?.items?.[project.cleanName] ?? {
        views: 0,
        linkViews: 0,
        sourceViews: 0,
      }}
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
