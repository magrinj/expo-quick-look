import type { SidebarsConfig } from "@docusaurus/plugin-content-docs";

const sidebars: SidebarsConfig = {
  docsSidebar: [
    "getting-started",
    {
      type: "category",
      label: "Guides",
      items: [
        "guides/remote-files",
        "guides/authenticated-downloads",
        "guides/multi-file-preview",
        "guides/editing-markup",
        "guides/thumbnails",
        "guides/platform-differences",
      ],
    },
  ],
};

export default sidebars;
