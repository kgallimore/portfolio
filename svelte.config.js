import adapter from "@sveltejs/adapter-static";
import preprocess from "svelte-preprocess";
import ObjFileImport from "unplugin-obj/vite";

/** @type {import('@sveltejs/kit').Config} */
const config = {
  // Consult https://github.com/sveltejs/svelte-preprocess
  // for more information about preprocessors
  preprocess: [
    preprocess({
      postcss: true,
    }),
  ],

  kit: {
    prerender: {
      enabled: false,
    },
    adapter: adapter({
      fallback: "400.html",
    }),
    vite: {
      /* ... */
      plugins: [ObjFileImport()],
      ssr: {
        noExternal: ["three"],
      },
    },
  },
  ssr: {},
};

export default config;
