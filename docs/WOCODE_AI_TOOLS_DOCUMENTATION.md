# AI Tools Available to You 🤖

This document describes the tools and capabilities available in your current environment. These are integrated into this system prompt, which defines what operations I can perform for you safely!

---

## 📊 Tool Overview Table

| # | Tool Name | Primary Functionality | Parameters | Description |
|---:|-----------|----------------------|------------|-------------|
| 1️⃣ | `read`    | File Reading         | path, offset, limit | Read text files or images (jpg/png/gif/webp), with optional line range limits for large file parsing 📖🖼️ |
| 2️⃣ | `edit`    | Targeted Text Replacements | path, edits[] | Perform precise substitutions in a single file. Each edit must be unique and non-overlapping! ✏️✅  |
| 3️⃣ | `write`   | File Creation/Overwriting | path, content      | Create new files or overwrite existing ones with your exact desired contents 📝✨🔁 |
| 4️⃣ | `bash`    | Execute Shell Commands | command, timeout*  | Run any bash commands in current directory. Optional timeout for long-running tasks! 💻💬⏱️ |

_*timeout is optional (in seconds) and only needed if the command might take a while_📝✨

---

### 🔎 Tool Capabilities Deep Dive

## ⭐ `read(path[, limit, offset])`
**Purpose:** Load file contents into conversation context for review/editing decisions 🤖👀

```mdx-code-block
Parameters:
- path    : String (relative or absolute) - Where to find the target file/image
            → Supports plain text + images like jpg/png/gif/webp formats ✅ 
            → For large files, include 'offset' and/or 'limit' for pagination handling 📖➡️🗂

Example Read Commands:
  read("config.json")              # Full file contents with truncation at ~2000 lines/50KB ⚠️  
  read(".gitignore", offset=1, limit=10)   # Lines 1-10 from .gitignore 📄🗨️
```

**Output:** Returns full truncated text or returns base64 encoded image data if file is an image! For images specifically — you'll see them automatically rendered in your chat interface as attachments when loaded via this tool 🔧🌈🖼️✨✅

---

## ⬜ `edit(path, edits[])`
**Purpose:** Replace specific text matches with targeted updates for clean surgery on code/text projects 💉✂️📝❗

```mdx-code-block
⚠️ IMPORTANT RULES:
1. Each edit[].oldText must match EXACTLY one unique location in the file (no partial matches!) ❌  
2. Edits cannot overlap — each oldText region stays distinct, no nesting or touching regions! ✅  
3. No merging allowed for unrelated changes near same block unless they truly touch adjacent lines ✋🛠️  

Example Edit Object:
  edit({
    path          : "src/main.json",       ← target file 
      
    edits         : [                       ← array of substitutions
      {                                       
        oldText  : "// TODO: add logic here",  
        newText  : "// ✅ Logic implemented!"  
      },                                         (each entry in `edits[]`)
      {                                        
        oldText  : "console.log('hello')"\n,   
        newText  : "const msg = 'hello'; console.log(msg);"  
      }                                          ← must be exact substring match! 🎯✅📍❗✳️
      
    ]                                           (unique non-overlapping replacements)
  })                                            ⬅⚡👀💪🧠

Example Output: Updated file via single atomic operation with all edits applied simultaneously at once in one call ✅  
```

---

## ✉ `write(path, content)`
**Purpose:** Create brand-new files or completely overwrite existing ones! 💾♻️➕✨✅

```mdx-code-block
Parameters:
- path          : String — Full relative/absolute filesystem location where output goes 🛣💭  
                 → Parent directories auto-created if needed (mkdir -p behavior) 🔙📁✔️   
                 
Example Call for New File Creation:
write({
  path       : "output/readme.txt",    # Creates this new file + parent dir! ✅ 
  content    : "# Welcome to my readme\nThis is a simple text note.\nCreated via AI tool write()!"  
})

Result: A fresh .txt written with exact string, ready for editing or reading later 🔍✅🥖

Note: Overwrites existing files automatically without prompting — confirm before calling if file exists already! ⚠️❗
```

---

## 💻 `bash(command[, timeout])`
**Purpose:** Execute arbitrary bash commands locally in your working directory, return stdout/stderr output 🧑‍💻⌨🖥➡️📤✅

```mdx-code-block
Parameters:  
- command      : String — Bash shell script/one-liner to execute ⚙✌   
                → Can be multi-line via \n in string or single-command lines ✓    
                 
Optional timeout (in seconds) for preventing runaway processes! If omitted, uses default system behavior.

Examples:
  bash("ls -la ./.git")               # List git directory contents 📁🗂💻✅   
  
  bash("cd /tmp && npm install ...",   # Run multi-step command with optional timeout ⏱     
      timeout=60)                     
  
Output always returned as single unified text block in response, including any errors or warnings! 🔔❗
```

---

## 🧰 How These Tools Are Used Together: A Complete Example Workflow

### Scenario: Refactoring a JSON config file based on analysis 😊✨✅📝⚙️
  
**Step 1:** Read original contents for review  
➡ read("config.json")     ← See current state, structure & content layout 🧐  

---
    
**Step 2:** Identify needed changes + run edits atomically in one call ⬜✂️⏱   
➡ edit("config.json", [    # Single operation — all edits applied together ✅         
      {                                                               (1st substitution)  
        oldText   : "// TODO: fix this field",                       ← Exact substring match! 🎯📍✅ 
        newText   : "Fixed and verified!"                           ← Replacement text ⬅️
      },                                                                     
      
      {                                                        }  # 2nd distinct edit (no overlap with previous!)   
        oldText   : '{"version":1}',                               ← Unique non-overlapping region  
        newText   : '"version":2'                                  ← Clean replacement ✅⚡ 
      },                                                                   
    ])                          

--- 
    
**Step 3:** Add new documentation or scripts to project ✍️🔧 ➜ write("docs/README.md", "Content here...")  

--- 

**Step 4:** Run bash checks/scripts as needed 💻  
➠ bash("npm run lint && npm test")    # Verify changes work correctly ✅

This workflow shows how I can read/edit/write/bash across your files with minimal context and maximum safety! 🛡📚✨✅💬

--- 

## ⚙ Tools Summary / Capabilities Matrix Overview: Quick Reference Guide For Your Environment

| Capability        │ Read Files            │ Edit Single Files      │ Create New/Overwrite   │ Run Shell Scripts       |
|------------------┼────────│───│────  │───────────┤ ─┬ ─┬ ├──────         │
| **File Content**    ✓ Text & Images (jpg/png/gif/webp)              ✓ Targeted text subs           ✍ New Files + Overwrites       💻 Bash Commands  
| **Parameters?**     path+optional pagination limits                    edits array format required    full control via content string  command with optional timeout    
| **Examples**        read("src/style.css", offset=30, limit=25)       
edit(myfile.json,{old:"bad";new:"good"})            
write(newdoc.md,"# Header")             
bash("git status -s && npm run build:check")  
✅  

---

## 🧠 About My Awareness & Tool Knowledge Origins:

**You might wonder:** "How do you know what tools exist?" 😊🤔💭📚✍️🌱⏰

Here's the answer (based on training context plus runtime system info!):  
→ **Built-in Training Memory**: My knowledge about these 4+ functions comes from examples and structure in how this platform runs me — not magic, but still cool tech right? ✅✨💡

**How I Reason:**
1️⃣ System-level definition: You don't usually see a list of tools unless requested! This likely means system capabilities are pre-defined for my instance here 📜🖥  
2️⃣ Training memory + examples exposed during conversation, not real-time introspection ✅💡  

**Bottom line:** My tool awareness comes from examples baked into training OR runtime prompt injection context. I don't "see" the actual tool definitions at runtime — but know them by heart! 🎯📦✅

---

### 💬 Want Me to Run These Tools Right Now? Just Ask!

Here are some quick prompts you could give me that will get things done immediately ✅✨:  

➡ **"Show top files with permissions"** → `bash("ls -la | grep -v '^d' | head")`  
→ **I'll run this command for you and show results!** 💻🔍⏱  

---   
  
📬 Need help reading something specific? I can access config.json, .gitignore files etc. all around here! Just say so 👇 or give me a file path to work with ✅
