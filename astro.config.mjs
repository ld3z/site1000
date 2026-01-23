import { defineConfig } from "astro/config";
import starlight from "@astrojs/starlight";
import UnoCSS from "@unocss/astro";
import remarkIconShorthand from "./emojis.mjs";
import { starlightKatex } from "starlight-katex";
import starlightBlog from "starlight-blog";
import starlightImageZoom from "starlight-image-zoom";

import vue from "@astrojs/vue";

export default defineConfig({
  site: "https://ld3z.github.io",
  base: "/site1000",

  integrations: [
    starlight({
      title: "Site1k",
      customCss: [
        "./src/styles/custom.css",
        "@fontsource-variable/lexend",
        "@fontsource-variable/jetbrains-mono",
        "./src/styles/inline.css",
        "./src/styles/table.css",
      ],
      sidebar: [
        { label: "Home", link: "/" },
        {
          label: "Math Notes",
          autogenerate: { directory: "math-notes" },
        },
      ],
      social: [
        {
          icon: "github",
          label: "GitHub",
          href: "https://github.com/ld3z/site1000",
        },
      ],
      logo: { src: "./src/assets/docusaurus.png", replacesTitle: true },
      favicon: "/favicon.ico",
      plugins: [
        starlightKatex(),
        starlightBlog({
          title: "Blog",
          metrics: {
            readingTime: true,
            words: "total",
          },
          authors: {
            ld3z: {
              name: "ld3z",
              title: "Developer",
              picture: "https://github.com/ld3z.png",
              url: "https://github.com/ld3z",
            },
            math: {
              name: "Math",
              picture: "https://static.vecteezy.com/system/resources/previews/028/074/822/non_2x/math-diagrams-and-tools-math-class-concept-illustration-vector.jpg",
            },
          },
        }),
        starlightImageZoom(),
      ],
    }),
    UnoCSS(),
    vue({
      appEntrypoint: "/src/vue-setup.js",
    }),
  ],

  markdown: {
    remarkPlugins: [remarkIconShorthand],
  },
  vite: {
    ssr: {
      noExternal: ["@fontsource-variable/inter"],
    },
  },
});
