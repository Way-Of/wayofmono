import { defineConfig } from "astro/config";
import sitemap from "@astrojs/sitemap";

export default defineConfig({
	site: "https://rpiv-pi.com",
	output: "static",
	trailingSlash: "ignore",
	build: {
		assets: "_astro",
		inlineStylesheets: "always",
	},
	integrations: [sitemap()],
});
