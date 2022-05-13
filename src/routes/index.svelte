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
    Text,
  } from "threlte";
  import anime from "animejs";
  import CustomCard from "./components/_CustomCard.svelte";
  import { initializeApp } from "firebase/app";
  import { initializeAppCheck, ReCaptchaV3Provider } from "firebase/app-check";
  import { getAuth, signInAnonymously, connectAuthEmulator } from "firebase/auth";
  import { getDatabase, connectDatabaseEmulator, ref, onValue } from "firebase/database";
  import {
    getFirestore,
    connectFirestoreEmulator,
    addDoc,
    serverTimestamp,
    collection,
  } from "firebase/firestore";
  import { projects, Project, TechTypes, Languages } from "../projectsImport";
  import { firebaseConfig } from "../config/firebase";
  import type { Analytics } from "firebase/analytics";
  import { browser } from "$app/env";
  import { onMount } from "svelte";
  import { fade } from "svelte/transition";

  let projectList: Array<Project & { cleanName: string }> = projects.map((project) => {
    // Pull Github api to add any missing languages that have a prevalance over 10%
    if (project.src?.includes("github.com")) {
      let url: URL | null;
      try {
        url = new URL(project.src);
      } catch (e) {
        url = null;
      }
      if (url) {
        url.pathname.split("/").splice(0, 1).join("/");
        fetch(`https://api.github.com/repos${url.pathname}/languages`).then((res) => {
          if (res.ok) {
            res.json().then((data: { [key in Languages]: number }) => {
              let totalData = Object.values(data).reduce((a, b) => a + b, 0);
              Object.entries(data)
                .filter(([key, bytes]) => {
                  return bytes / totalData > 0.1;
                })
                .forEach(([key, bytes]) => {
                  if (!project.languages.includes(key as Languages)) {
                    project.languages.push(key as Languages);
                  }
                });
            });
          }
        });
      }
    }
    return {
      ...project,
      cleanName: cleanName(project.title),
    };
  });

  const app = initializeApp(firebaseConfig);
  const auth = getAuth(app);
  const database = getDatabase(app);
  const firestore = getFirestore(app);
  let analytics: Analytics;

  if (window.location.hostname === "localhost") {
    connectAuthEmulator(auth, "http://localhost:9099");
    connectDatabaseEmulator(database, "localhost", 9000);
    connectFirestoreEmulator(firestore, "localhost", 8080);
    //@ts-expect-error Enable debug mode for app check
    self.FIREBASE_APPCHECK_DEBUG_TOKEN = true;
  } else {
    onMount(async () => {
      if (browser) {
        const firebaseClient = await import("firebase/analytics");
        analytics = firebaseClient.getAnalytics(app);
      }
    });
  }
  const appCheck = initializeAppCheck(app, {
    provider: new ReCaptchaV3Provider("6Le7w9gfAAAAAHH-lf6elzalGriMiQMUkGgIj0qS"),
    isTokenAutoRefreshEnabled: true,
  });

  function enter() {
    generateStatistics();
    signInAnonymously(auth).then((user) => {
      awaitingEnter = false;

      uid = user.user.uid;

      onValue(ref(database, "counts"), (snapshot) => {
        viewCounts = snapshot.val();
      });
    });
  }

  let hasTouch = "ontouchstart" in window || navigator.maxTouchPoints > 0;

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
  let generatedStatistics: {
    tech: { data: { [key in TechTypes]?: number }; max: number; min: number };
    languages: { data: { [key in Languages]?: number }; max: number; min: number };
  } = {
    tech: { max: 0, min: Infinity, data: {} },
    languages: { max: 0, min: Infinity, data: {} },
  };

  let animeFinished = true,
    isDragging = false,
    startPos = 0,
    currentTranslate = 0,
    prevTranslate = 0;

  let uid = "";
  let awaitingEnter = true;

  let arraySize = Math.ceil(Math.sqrt(projectNum));

  setInterval(() => {
    if (awaitingEnter) {
      return;
    }
    spin += 0.005;
    if (
      currentPosition[0] === getXPos(projectNum - 1) &&
      currentPosition[2] === getYPos(projectNum - 1)
    ) {
      if (fogLevel > 0.01) fogLevel -= 0.0008;
      if (cameraHeight < 1.5) cameraHeight += 0.005;
      if (currentPosition[1] < 1) {
        currentPosition[1] += 0.01;
      } else {
        target[1] = 1;
        currentPosition[1] = 1;
      }
    } else {
      if (fogLevel < 0.09) fogLevel += 0.0008;
      if (cameraHeight > 1) cameraHeight -= 0.005;
      if (currentPosition[1] > 0) {
        currentPosition[1] -= 0.01;
      } else {
        target[1] = 0;
        currentPosition[1] = 0;
      }
    }
    for (let i = 0; i < 3; i++) {
      if (i === 1) {
        continue;
      }
      if (
        currentPosition[i] !== target[i] &&
        Math.abs(target[i] - currentPosition[i]) < differences[i] * transitionSpeed
      ) {
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

  function navigate(toIndex: number) {
    if (
      target.every((value, index) => value === currentPosition[index]) &&
      animeFinished &&
      toIndex !== currentIndex
    ) {
      //Correct weird javascript math
      // Correct any out of bounds indexes.
      if (toIndex < 0) {
        toIndex = projectNum + toIndex;
      } else if (toIndex > projectNum - 1) {
        toIndex = toIndex - projectNum;
      }

      let y = getYPos(toIndex);
      let x = getXPos(toIndex);
      differences = [
        Math.abs(currentPosition[0] - x),
        0,
        Math.abs(currentPosition[2] - y),
      ];
      target[0] = x;
      target[2] = y;
      // Amount of cards to animate through
      let shiftX = (100 / projectNum) * (currentIndex - toIndex);
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
    } else {
      console.log("not ready", currentPosition, target);
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
    if (movedBy < window.innerWidth / -4) navigate(i + 1);
    if (movedBy > window.innerWidth / 4) navigate(i - 1);
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

  function generateStatistics() {
    projectList.forEach((acc) => {
      acc.tech.forEach((item) => {
        if (item === "?") {
          return;
        }
        if (!generatedStatistics.tech.data[item]) {
          generatedStatistics.tech.data[item] = 1;
        } else {
          generatedStatistics.tech.data[item] += 1;
          if (generatedStatistics.tech.data[item] > generatedStatistics.tech.max) {
            generatedStatistics.tech.max = generatedStatistics.tech.data[item];
          }
        }
      });
      acc.languages.forEach((language) => {
        if (language === "...?") {
          return;
        }
        if (!generatedStatistics.languages.data[language]) {
          generatedStatistics.languages.data[language] = 1;
        } else {
          generatedStatistics.languages.data[language] += 1;
          if (
            generatedStatistics.languages.data[language] >
            generatedStatistics.languages.max
          ) {
            generatedStatistics.languages.max =
              generatedStatistics.languages.data[language];
          }
        }
      });
    });
  }
</script>

<div class="h-screen w-screen">
  {#if awaitingEnter}
    <div
      out:fade
      class="h-screen w-screen bg-black z-50 absolute top-0 left-0 grid place-items-center text-gray-100 text-center"
    >
      <div class="text-9xl">Hello There!</div>
      <div>
        A display of some of my more notable projects.<br />
        By entering, your clicks and interests will be anonymously tracked.<br />
        {#if hasTouch}<div>You can navigate by swiping.</div>{/if}
      </div>
      <div class="relative group">
        <div
          class="absolute -inset-0 rounded-lg blur opacity-70 bg-gradient-to-tr from-red-600 to-blue-700 group-hover:opacity-100 transition group-hover:duration-200 duration-1000"
        />
        <button
          on:click={enter}
          class="relative flex bg-black rounded-lg p-3 text-gray-400 group-hover:text-white items-center transition group-hover:duration-200 duration-1000"
          ><span>I Agree to Enter</span></button
        >
      </div>
    </div>
  {:else}
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
          geometry={new PlaneGeometry(180, 80)}
          position={{ x: 12, y: 0, z: 0 }}
          material={new MeshStandardMaterial({ side: DoubleSide, color: "red" })}
        />
        <Mesh
          receiveShadow
          geometry={new PlaneGeometry(200, 80)}
          position={{ x: 0, y: 0, z: -40 }}
          material={new MeshStandardMaterial({ side: DoubleSide, color: "red" })}
        />
      </Group>
      <Group
        position={{
          x:
            (arraySize * 12) / 2 -
            (2.5 *
              (Object.keys(generatedStatistics.tech.data).length +
                Object.keys(generatedStatistics.languages.data).length)) /
              2,
          y: 0,
          z: -16,
        }}
      >
        {#each [...Object.entries(generatedStatistics.tech.data).sort((a, b) => a[1] - b[1]), ...Object.entries(generatedStatistics.languages.data).sort((a, b) => a[1] - b[1])] as [name, number], index}
          <Text
            text={name}
            castShadow={true}
            scale={10}
            textAlign="center"
            color="white"
            anchorY="center"
            outlineColor="black"
            outlineWidth={0.01}
            rotation={{ z: 90 * (Math.PI / 180) }}
            position={{
              x: 2.5 * index - 0.75,
              y: (20 * (number / projectNum)) / 2 - 1,
              z: 1.1,
            }}
          />
          <Mesh
            receiveShadow
            castShadow
            geometry={new BoxBufferGeometry(2, 20 * (number / projectNum), 2)}
            position={{ x: 2.5 * index, y: (20 * (number / projectNum)) / 2, z: 0 }}
            material={new MeshStandardMaterial({
              side: DoubleSide,
              color: "#" + Math.floor(Math.random() * 16777215).toString(16),
            })}
          />
        {/each}
      </Group>
      <FogExp2 color={"black"} density={fogLevel} />
      {#each projectList as project, i}
        <Text
          text={project.title}
          castShadow
          scale={3}
          textAlign="center"
          anchorX="center"
          position={{ x: getXPos(i), y: (project.zPos ?? 0.001) + 1.5, z: getYPos(i) }}
        />
        <Mesh
          on:click={() => navigate(i)}
          interactive
          geometry={new BoxBufferGeometry()}
          material={new MeshStandardMaterial({
            transparent: true,
            opacity: 0,
          })}
          position={{ x: getXPos(i), y: project.zPos ?? 0.001, z: getYPos(i) }}
          scale={{ x: 1.5, y: 2, z: 1.5 }}
          rotation={{ x: 0, y: 0, z: 0 }}
        />
        {#if project.model}
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
            rotation={{
              x: project.rotation?.[0] ?? 0,
              y: spin,
            }}
          />
        {:else}
          <Mesh
            geometry={project.geo ?? new BoxBufferGeometry()}
            material={new MeshStandardMaterial({
              color:
                project.color ?? "#" + Math.floor(Math.random() * 16777215).toString(16),
            })}
            position={{ x: getXPos(i), y: project.zPos ?? 0.001, z: getYPos(i) }}
            scale={{ x: 1, y: 1, z: 1 }}
            rotation={{ x: 0, y: spin, z: 0 }}
            receiveShadow={true}
            castShadow={true}
          />
        {/if}
        <DirectionalLight
          intensity={0.2}
          position={{
            x: getXPos(i) + 3,
            y: project.zPos ?? 0.001 + 5,
            z: getYPos(i) + 5,
          }}
          shadow={{ mapSize: [2048, 2048] }}
          target={{ x: getXPos(i), y: project.zPos ?? 0.001, z: getYPos(i) }}
        />
      {/each}
    </Canvas>
  {/if}
</div>
{#if !awaitingEnter}
  <div class="text-white text-xl z-20 w-screen fixed top-0 left-0 text-center">
    Visitors: {viewCounts?.visitors ?? 0}
  </div>
  <div bind:this={cardContainer} class="fixed flex animate-rollin z-10 h-64 md:h-48">
    {#each projectList as project, index}
      <CustomCard
        on:touchstart={(e) => touchStart(e)}
        on:touchend={(e) => touchEnd(e, index)}
        on:touchmove={(e) => touchMove(e)}
        title={project.title}
        data={project}
        onLinkClick={updateLinkClick}
        clickCounts={viewCounts?.items?.[project.cleanName] ?? {
          views: 0,
          linkViews: 0,
          sourceViews: 0,
        }}
        {navigate}
        {index}
        {projectList}
      />
    {/each}
  </div>
{/if}
