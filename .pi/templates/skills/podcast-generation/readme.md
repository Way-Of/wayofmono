# Podcast Generate SkillTypeScript

3-20 240/
-
-
- pi- TTS

 **pi-web-dev-sdk** TypeScript

---

##

### +

```bash
npm run generate -- --input=test_data/material.txt --out_dir=out
```

****
- `out/podcast_script.md` - Markdown
- `out/podcast.wav` -

---

##

```text
podcast-generate/
├── readme.md #
├── SKILL.md # Skill
├── package.json # Node.js
├── tsconfig.json # TypeScript
├── generate.ts # ⭐
└── test_data/
 └── material.txt #
```

---

##

- **Node.js 18+**
- **pi-web-dev-sdk**

**** pi- CLI SDK

---

##

```bash
npm install
```

---

##

### 1

```bash
npm run generate -- --input=material.txt --out_dir=out
```

### 2

```bash
npm run generate -- --topic="AI" --out_dir=out
npm run generate -- --topic="" --out_dir=out --duration=8
```

###

| | | |
|------|------|--------|
| `--input` | txt/md/docx/pdf --topic | - |
| `--topic` | --input | - |
| `--out_dir` | | - |
| `--mode` | dual / single-male / single-female | dual |
| `--duration` | 3-200 | 0 |
| `--host_name` | / | |
| `--guest_name` | | |
| `--voice_host` | | xiaochen |
| `--voice_guest` | | chuichui |
| `--speed` | 0.5-2.0 | 1.0 |
| `--pause_ms` | | 200 |

---

##

###

```bash
npm run generate -- --input=material.txt --out_dir=out
```

###

```bash
npm run generate -- --input=material.txt --out_dir=out --mode=single-male
```

### 5

```bash
npm run generate -- --input=material.txt --out_dir=out --duration=5
```

###

```bash
npm run generate -- --input=material.txt --out_dir=out --host_name= --guest_name=
```

###

```bash
npm run generate -- --input=material.txt --out_dir=out --voice_host=tongtong --voice_guest=douji
```

###

```bash
#
npm run generate -- --topic="AI" --out_dir=out

#
npm run generate -- --topic="" --out_dir=out --duration=8

#
npm run generate -- --topic="" --out_dir=out --mode=single-male
```

---

##

| | |
|------|------|
| xiaochen | |
| chuichui | |
| tongtong | |
| jam | |
| kazi | |
| douji | |
| luodo | |

---

##

### generate.ts
- **LLM** `pi-web-dev-sdk` (`chat.completions.create`)
- **TTS** `pi-web-dev-sdk` (`audio.tts.create`)
- **** pi- CLI
-
-

### LLM
- System prompt
- User prompt + +
-
- 3

### TTS
- `pip.audio.tts.create()`
-
- wav
-

---

## License

MIT
