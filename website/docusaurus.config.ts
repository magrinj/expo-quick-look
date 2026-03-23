import { themes as prismThemes } from "prism-react-renderer";
import type { Config } from "@docusaurus/types";
import type * as Preset from "@docusaurus/preset-classic";

const config: Config = {
  title: "expo-quick-look",
  tagline: "Native file preview for Expo",
  url: "https://magrinj.github.io",
  baseUrl: "/expo-quick-look/",

  organizationName: "magrinj",
  projectName: "expo-quick-look",

  onBrokenLinks: "throw",

  i18n: {
    defaultLocale: "en",
    locales: ["en"],
  },

  plugins: [
    [
      "docusaurus-plugin-typedoc",
      {
        entryPoints: ["../src/index.ts"],
        tsconfig: "../tsconfig.json",
        out: "docs/api",
        readme: "none",
        excludePrivate: true,
        excludeInternal: true,
        intentionallyNotExported: ["ExpoQuickLookModule"],
        blockTags: [
          "@defaultValue",
          "@deprecated",
          "@example",
          "@param",
          "@platform",
          "@remarks",
          "@returns",
          "@see",
          "@throws",
          "@typeParam",
        ],
        sidebar: {
          autoConfiguration: true,
          pretty: true,
        },
      },
    ],
  ],

  presets: [
    [
      "classic",
      {
        docs: {
          sidebarPath: "./sidebars.ts",
          editUrl:
            "https://github.com/magrinj/expo-quick-look/tree/main/website/",
        },
        theme: {
          customCss: ["./src/css/custom.css", "./src/css/hero.css"],
        },
      } satisfies Preset.Options,
    ],
  ],

  themeConfig: {
    navbar: {
      title: "expo-quick-look",
      items: [
        {
          type: "docSidebar",
          sidebarId: "docsSidebar",
          position: "left",
          label: "Docs",
        },
        {
          to: "/docs/api",
          label: "API",
          position: "left",
        },
        {
          href: "https://github.com/magrinj/expo-quick-look",
          label: "GitHub",
          position: "right",
        },
      ],
    },
    footer: {
      style: "dark",
      links: [
        {
          title: "Docs",
          items: [
            { label: "Getting Started", to: "/docs/getting-started" },
            { label: "API Reference", to: "/docs/api" },
          ],
        },
        {
          title: "More",
          items: [
            {
              label: "npm",
              href: "https://www.npmjs.com/package/@magrinj/expo-quick-look",
            },
            {
              label: "GitHub",
              href: "https://github.com/magrinj/expo-quick-look",
            },
          ],
        },
      ],
      copyright: `Copyright © ${new Date().getFullYear()} Jérémy Magrin. MIT License.`,
    },
    prism: {
      theme: prismThemes.github,
      darkTheme: prismThemes.dracula,
    },
  } satisfies Preset.ThemeConfig,
};

export default config;
