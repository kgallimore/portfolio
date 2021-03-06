<script lang="ts">
  import type { Project } from "../../projectsImport";
  import TransitionButton from "./_TransitionButton.svelte";
  import { fly } from "svelte/transition";
  export let title: string;
  export let data: Project;
  export let projectList: Array<Project & { cleanName: string }>;
  export let navigate: (toIndex: number) => void;
  export let onLinkClick: (
    type: "linkViews" | "sourceViews",
    event: MouseEvent
  ) => void = () => {};
  export let index: number;
  export let clickCounts: { linkViews?: number; sourceViews?: number; views?: number } = {
    linkViews: 0,
    sourceViews: 0,
    views: 0,
  };

  let previousProjectNum = index == 0 ? projectList.length - 1 : index - 1;
  let nextProjectNum = index == projectList.length - 1 ? 0 : index + 1;

  data.imageAlt = data.imageAlt ? data.imageAlt : title + " Logo";
</script>

<div on:touchstart on:touchend on:touchmove class="flex justify-center pb-1 w-screen">
  <div class="lg:w-10/12 flex md:w-11/12 sm:w-full w-full xl:w-9/12 items-center">
    <TransitionButton
      slot="back"
      title={projectList[previousProjectNum].title}
      on:click={() => {
        navigate(index - 1);
      }}
    />
    <div
      class="hidden md:block h-48 lg:h-auto lg:w-48 flex-none bg-cover rounded-t lg:rounded-t-none lg:rounded-l aspect-square text-center overflow-visible"
      style="background-color: grey"
    >
      <img
        src={data.image}
        class="object-cover h-full w-full block m-auto"
        alt={data.imageAlt}
      />
    </div>
    <div
      class="border-r border-b border-l border-gray-400 lg:border-l-0 lg:border-t lg:border-gray-400 bg-white rounded-b lg:rounded-b-none lg:rounded-r p-4 flex flex-col justify-between leading-normal h-full w-full pt-2 pb-4"
    >
      <div class="relative h-full">
        <div class="text-gray-900 font-bold w-full items-center flex">
          <div
            class="inline-block right-0 md:hidden h-8 flex-none bg-cover rounded-t lg:rounded-t-none lg:rounded-l aspect-square text-center overflow-visible"
          >
            <img
              src={data.image}
              class="object-cover h-full w-full block m-auto"
              alt={data.imageAlt}
            />
          </div>
          {title}
          {#if data.link}
            <button
              on:click={(event) => {
                onLinkClick("linkViews", event);
                window.open(data.link, "_blank").focus();
              }}
              class="rounded bg-gradient-to-br from-green-600 to-blue-600 p-2 m-2 hover:from-green-300 hover:to-blue-300 hover:text-gray-400"
              >View</button
            >
          {/if}
          {#if data.src}
            <button
              on:click={(event) => {
                onLinkClick("sourceViews", event);
                window.open(data.src, "_blank").focus();
              }}
              class="rounded bg-gradient-to-br from-green-600 to-blue-600 p-2 m-2 hover:from-green-300 hover:to-blue-300 hover:text-gray-400"
              >Source</button
            >
          {/if}
        </div>

        <p class="text-gray-700 text-xs md:text-sm h-24 md:h-3/4 overflow-auto">
          {@html data.description}
        </p>
        <div class="absolute bottom-0 text-xs md:text-sm">
          <p><strong>Languages:</strong> {data.languages}</p>
          <p><strong>Notable Tech:</strong> {data.tech}</p>
        </div>
      </div>
    </div>
    <TransitionButton
      slot="forward"
      title={projectList[nextProjectNum].title}
      reverseDir={true}
      on:click={() => {
        navigate(index + 1);
      }}
    />
  </div>
</div>
