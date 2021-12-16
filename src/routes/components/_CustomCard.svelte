<script lang="ts">
  export let data: {
    title: string;
    image: string;
    description: string;
    alt?: string;
    link?: string;
    src?: string;
    languages: string;
    tech: string;
  };
  data.alt = data.alt ? data.alt : data.title + " Logo";
</script>

<div class="flex justify-center pb-1 w-screen h-full">
  <div class="lg:w-10/12 flex md:w-11/12 sm:w-full w-full xl:w-9/12 items-center">
    <slot name="back" />
    <div
      class="hidden md:block h-48 lg:h-auto lg:w-48 flex-none bg-cover rounded-t lg:rounded-t-none lg:rounded-l aspect-square text-center overflow-visible"
      style="background-color: grey"
    >
      <img
        src={data.image}
        class="object-cover h-full w-full block m-auto"
        alt={data.alt}
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
              alt={data.alt}
            />
          </div>
          {data.title}
          {#if data.link}
            <a
              href={data.link}
              target="_blank"
              class="rounded bg-gradient-to-br from-green-600 to-blue-600 p-2 m-2 hover:from-green-300 hover:to-blue-300 hover:text-gray-400"
              >View</a
            >
          {/if}
          {#if data.src}
            <a
              href={data.src}
              target="_blank"
              class="rounded bg-gradient-to-br from-green-600 to-blue-600 p-2 m-2 hover:from-green-300 hover:to-blue-300 hover:text-gray-400"
              >Source</a
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
    <slot name="forward" />
  </div>
</div>
