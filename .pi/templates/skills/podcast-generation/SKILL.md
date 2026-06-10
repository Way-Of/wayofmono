---
name: podcast-generation
description: Generate podcast episodes from user-provided content or by searching the web for specified topics. If user uploads a text file/article, creates a dual-host dialogue podcast (or single-host upon request). If no content is provided, searches the web for information about the user-specified topic and generates a podcast. Duration scales with content size (3-20 minutes, ~240 chars/min). Uses z-ai-web-dev-sdk for LLM script generation and TTS audio synthesis. Outputs both a podcast script (Markdown) and a complete audio file (WAV).
license: MIT
---

# Podcast Generate Skill（TypeScript ）

，。

 Skill ：
- 
- 
- 
- 

---

## 

###  Skill 
- ****：（txt/md/docx/pdf），
- ****：，，
- ，（3-20 ）
-  Markdown （）
-  z-ai TTS 

###  Skill 
-  mp3 /  / 
- 
- 

---

## 

 Skill ：

- `generate.ts`
  （）
  - ****： → 
  - ****： web-search skill  → 
  -  z-ai-web-dev-sdk  LLM 
  -  z-ai-web-dev-sdk  TTS 
  - 
  - 

- `readme.md`
  

- `SKILL.md`
  ， Skill 、

- `package.json`
  Node.js 

- `tsconfig.json`
  TypeScript 

---

## 

### （）

** 1：**
- （txt / md / docx / pdf ）
- ，Skill 

** 2：**
- 
-  web-search skill 
- 

### （ 2 ）

- `podcast_script.md`
  （Markdown ，）

- `podcast.wav`
  

****（ segments.jsonl、meta.json ）

---

## 

### 
- Node.js 18+
- z-ai-web-dev-sdk（）
- web-search skill（）

**** z-ai CLI

### 
```bash
npm install
```

---

## 

### 

```bash
npm run generate -- --input=test_data/material.txt --out_dir=out
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

|  |  |  |
|------|------|--------|
| `--input` | （ --topic ） | - |
| `--topic` | （ --input ） | - |
| `--out_dir` | （） | - |
| `--mode` | ：dual / single-male / single-female | dual |
| `--duration` | （3-20）；0  | 0 |
| `--host_name` | / |  |
| `--guest_name` |  |  |
| `--voice_host` |  | xiaochen |
| `--voice_guest` |  | chuichui |
| `--speed` | （0.5-2.0） | 1.0 |
| `--pause_ms` |  | 200 |

---

## 

|  |  |
|------|------|
| xiaochen |  |
| chuichui |  |
| tongtong |  |
| jam |  |
| kazi |  |
| douji |  |
| luodo |  |

---

## 

### generate.ts（）
- ****： → 
- ****： web-search skill →  → 
- **LLM**： `z-ai-web-dev-sdk` (`chat.completions.create`)
- **TTS**： `z-ai-web-dev-sdk` (`audio.tts.create`)
- **** z-ai CLI
- 
- ，

### LLM 
- System prompt：
- User prompt： +  + 
- ：、、
- ： 3 

### TTS 
-  `zai.audio.tts.create()`
- 、
-  wav 
- 

---

## 

### podcast_script.md（）
```markdown
****：，。……

****：，。……

****：，……
```

---

## License

MIT
