# Alex — Frontend Portfolio

Crafted interfaces, visual concepts, and frontend experiments.

**→ [alex.github.io](https://alex.github.io)**

---

## About

Curated collection of frontend projects spanning landing pages, dashboards, visual concepts, prototypes, and tools. Every project is self-contained, statically deployable, and audited for quality and security.

---

## Structure

```
├── index.html              ← Portfolio index (dynamic, reads projects.json)
├── assets/
│   ├── css/
│   │   └── main.css        ← Shared styles
│   ├── js/
│   └── images/
│       ├── thumbnails/
│       └── screenshots/
├── data/
│   └── projects.json       ← Central project registry
├── proyectos/              ← Published projects (one subdirectory each)
│   ├── tattoo-studio-brutalist/
│   ├── fintech-luxury-black/
│   ├── digital-nomads-synthwave/
│   └── ...                 ← 26 projects total
├── experiments/            ← Experimental / WIP
├── ai/                     ← AI-related projects
├── tools/                  ← Reusable utilities
├── CNAME                  ← Custom domain (optional)
├── LICENSE                ← MIT
└── README.md              ← You are here
```

---

## Adding a new project

1. Add your project directory under `proyectos/<slug>/`
2. Add an entry to `data/projects.json`

```json
{
  "slug": "your-project-slug",
  "title": "Your Project",
  "description": "Short, compelling description.",
  "category": "landing-page",
  "tags": ["tag1", "tag2"],
  "techs": ["HTML/CSS", "Vanilla JS"],
  "featured": false,
  "date": "2026-05-27",
  "thumbnail": "",
  "url": "https://alex.github.io/proyectos/your-project-slug/"
}
```

3. Optional: add a preview screenshot to `assets/images/thumbnails/<slug>.jpg`

---

## Conventions

| Rule | Standard |
|---|---|
| Directory names | `kebab-case`, no dates |
| Project slugs | English, descriptive, short |
| Dates | Metadata only (`data/projects.json`) |
| Assets | Relative paths (`./assets/`, not `/assets/`) |
| Code | No console.log in production |
| Security | CSP, no innerHTML, no eval |
| External deps | Minimal, justified |

---

## Tech

- Pure HTML/CSS/JS — no framework overhead
- Static deployment — GitHub Pages
- Vanilla, portable, zero dependencies

---

## License

MIT — see [LICENSE](./LICENSE).
