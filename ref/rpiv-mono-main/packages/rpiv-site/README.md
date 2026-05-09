# @juicesharp/rpiv-site

Marketing site for `rpiv-pi`. Live at https://rpiv-pi.com.

Static Astro build deployed to GitHub Pages on `push` to `main` filtered to changes under `packages/rpiv-site/**`. Workspace package, `private: true`, never published to npm.

## Develop

```sh
npm install                                          # at monorepo root
npm run dev --workspace=@juicesharp/rpiv-site        # http://localhost:4321/
npm run build:site                                   # → packages/rpiv-site/dist/
npm run preview --workspace=@juicesharp/rpiv-site    # serve dist/
```

## Content sources

Skills, agents, and sibling metadata are read at build time from on-disk truth:

- `packages/rpiv-pi/skills/*/SKILL.md` (frontmatter)
- `packages/rpiv-pi/agents/*.md` (frontmatter)
- `packages/<sibling>/package.json` + `packages/<sibling>/docs/`
- `packages/rpiv-pi/package.json` + `packages/rpiv-pi/CHANGELOG.md` (compatibility line)

There is no manifest file. Adding a sibling card is `update src/lib/siblings.ts`.

## Deploy

Triggered by `.github/workflows/deploy-site.yml` on `push` to `main` with `paths: 'packages/rpiv-site/**'`. Uses `actions/deploy-pages@v4` artifact-upload model.
