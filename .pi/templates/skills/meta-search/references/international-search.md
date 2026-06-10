# 

## 🔍 Google 

### 1.1 

|  |  |  | URL |
|--------|------|------|-----|
| `""` |  | `"machine learning"` | `https://www.google.com/search?q=%22machine+learning%22` |
| `-` |  | `python -snake` | `https://www.google.com/search?q=python+-snake` |
| `OR` |  | `machine learning OR deep learning` | `https://www.google.com/search?q=machine+learning+OR+deep+learning` |
| `*` |  | `machine * algorithms` | `https://www.google.com/search?q=machine+*+algorithms` |
| `()` |  | `(apple OR microsoft) phones` | `https://www.google.com/search?q=(apple+OR+microsoft)+phones` |
| `..` |  | `laptop $500..$1000` | `https://www.google.com/search?q=laptop+%24500..%241000` |

### 1.2 

|  |  |  |
|--------|------|------|
| `site:` |  | `site:github.com python projects` |
| `filetype:` |  | `filetype:pdf annual report` |
| `inurl:` | URL | `inurl:login admin` |
| `intitle:` |  | `intitle:"index of" mp3` |
| `intext:` |  | `intext:password filetype:txt` |
| `cache:` |  | `cache:example.com` |
| `related:` |  | `related:github.com` |
| `info:` |  | `info:example.com` |

### 1.3 

|  |  | URL |
|------|------|---------|
| `tbs=qdr:h` | 1 | `https://www.google.com/search?q=news&tbs=qdr:h` |
| `tbs=qdr:d` | 24 | `https://www.google.com/search?q=news&tbs=qdr:d` |
| `tbs=qdr:w` | 1 | `https://www.google.com/search?q=news&tbs=qdr:w` |
| `tbs=qdr:m` | 1 | `https://www.google.com/search?q=news&tbs=qdr:m` |
| `tbs=qdr:y` | 1 | `https://www.google.com/search?q=news&tbs=qdr:y` |
| `tbs=cdr:1,cd_min:1/1/2024,cd_max:12/31/2024` |  | 2024 |

### 1.4 

|  |  |  |
|------|------|------|
| `hl=en` |  | `https://www.google.com/search?q=test&hl=en` |
| `lr=lang_zh-CN` |  | `https://www.google.com/search?q=test&lr=lang_zh-CN` |
| `cr=countryCN` | / | `https://www.google.com/search?q=test&cr=countryCN` |
| `gl=us` |  | `https://www.google.com/search?q=test&gl=us` |

### 1.5 

|  | URL |  |
|------|-----|------|
|  | `https://www.google.com/search?q={keyword}&tbm=isch` | `tbm=isch`  |
|  | `https://www.google.com/search?q={keyword}&tbm=nws` | `tbm=nws`  |
|  | `https://www.google.com/search?q={keyword}&tbm=vid` | `tbm=vid`  |
|  | `https://www.google.com/search?q={keyword}&tbm=map` | `tbm=map`  |
|  | `https://www.google.com/search?q={keyword}&tbm=shop` | `tbm=shop`  |
|  | `https://www.google.com/search?q={keyword}&tbm=bks` | `tbm=bks`  |
|  | `https://scholar.google.com/scholar?q={keyword}` | Google Scholar |

### 1.6 Google 

```javascript
// 1. GitHubPython
web_fetch({"url": "https://www.google.com/search?q=site:github.com+python+machine+learning"})

// 2. 2024PDF
web_fetch({"url": "https://www.google.com/search?q=machine+learning+tutorial+filetype:pdf&tbs=cdr:1,cd_min:1/1/2024"})

// 3. "tutorial"Python
web_fetch({"url": "https://www.google.com/search?q=intitle:tutorial+python"})

// 4. 
web_fetch({"url": "https://www.google.com/search?q=AI+breakthrough&tbs=qdr:w&tbm=nws"})

// 5. 
web_fetch({"url": "https://www.google.com/search?q=&lr=lang_zh-CN&hl=en"})

// 6. 
web_fetch({"url": "https://www.google.com/search?q=laptop+%241000..%242000+best+rating"})

// 7. Wikipedia
web_fetch({"url": "https://www.google.com/search?q=python+programming+-wikipedia"})

// 8. 
web_fetch({"url": "https://scholar.google.com/scholar?q=deep+learning+optimization"})

// 9. 
web_fetch({"url": "https://webcache.googleusercontent.com/search?q=cache:example.com"})

// 10. 
web_fetch({"url": "https://www.google.com/search?q=related:stackoverflow.com"})
```

---

## 🦆 DuckDuckGo 

### 2.1 DuckDuckGo 

|  |  |  |
|------|------|------|
| **Bangs ** | `!` | `!g python` → Google |
| **** | `password` | `https://duckduckgo.com/?q=password+20` |
| **** | `color` | `https://duckduckgo.com/?q=+%23FF5733` |
| **** | `shorten` | `https://duckduckgo.com/?q=shorten+example.com` |
| **** | `qr` | `https://duckduckgo.com/?q=qr+hello+world` |
| **UUID** | `uuid` | `https://duckduckgo.com/?q=uuid` |
| **Base64** | `base64` | `https://duckduckgo.com/?q=base64+hello` |

### 2.2 DuckDuckGo Bangs 

#### 

| Bang |  |  |
|------|---------|------|
| `!g` | Google | `!g python tutorial` |
| `!b` | Bing | `!b weather` |
| `!y` | Yahoo | `!y finance` |
| `!sp` | Startpage | `!sp privacy` |
| `!brave` | Brave Search | `!brave tech` |

#### 

| Bang |  |  |
|------|---------|------|
| `!gh` | GitHub | `!gh tensorflow` |
| `!so` | Stack Overflow | `!so javascript error` |
| `!npm` | npmjs.com | `!npm express` |
| `!pypi` | PyPI | `!pypi requests` |
| `!mdn` | MDN Web Docs | `!mdn fetch api` |
| `!docs` | DevDocs | `!docs python` |
| `!docker` | Docker Hub | `!docker nginx` |

#### 

| Bang |  |  |
|------|---------|------|
| `!w` | Wikipedia | `!w machine learning` |
| `!wen` | Wikipedia | `!wen artificial intelligence` |
| `!wt` | Wiktionary | `!wt serendipity` |
| `!imdb` | IMDb | `!imdb inception` |

#### 

| Bang |  |  |
|------|---------|------|
| `!a` | Amazon | `!a wireless headphones` |
| `!e` | eBay | `!e vintage watch` |
| `!ali` | AliExpress | `!ali phone case` |

#### 

| Bang |  |  |
|------|---------|------|
| `!m` | Google Maps | `!m Beijing` |
| `!maps` | OpenStreetMap | `!maps Paris` |

### 2.3 DuckDuckGo 

|  |  |  |
|------|------|------|
| `kp=1` |  | `https://duckduckgo.com/html/?q=test&kp=1` |
| `kp=-1` |  | `https://duckduckgo.com/html/?q=test&kp=-1` |
| `kl=cn` |  | `https://duckduckgo.com/html/?q=news&kl=cn` |
| `kl=us-en` |  | `https://duckduckgo.com/html/?q=news&kl=us-en` |
| `ia=web` |  | `https://duckduckgo.com/?q=test&ia=web` |
| `ia=images` |  | `https://duckduckgo.com/?q=test&ia=images` |
| `ia=news` |  | `https://duckduckgo.com/?q=test&ia=news` |
| `ia=videos` |  | `https://duckduckgo.com/?q=test&ia=videos` |

### 2.4 DuckDuckGo 

```javascript
// 1. BangGoogle
web_fetch({"url": "https://duckduckgo.com/html/?q=!g+machine+learning"})

// 2. GitHub
web_fetch({"url": "https://duckduckgo.com/html/?q=!gh+react"})

// 3. Stack Overflow
web_fetch({"url": "https://duckduckgo.com/html/?q=!so+python+list+comprehension"})

// 4. 
web_fetch({"url": "https://duckduckgo.com/?q=password+16"})

// 5. Base64
web_fetch({"url": "https://duckduckgo.com/?q=base64+hello+world"})

// 6. 
web_fetch({"url": "https://duckduckgo.com/?q=%23FF5733"})

// 7. YouTube
web_fetch({"url": "https://duckduckgo.com/html/?q=!yt+python+tutorial"})

// 8. Wikipedia
web_fetch({"url": "https://duckduckgo.com/html/?q=!w+artificial+intelligence"})

// 9. 
web_fetch({"url": "https://duckduckgo.com/html/?q=!a+laptop"})

// 10. 
web_fetch({"url": "https://duckduckgo.com/?q=qr+https://github.com"})
```

---

## 🔎 Brave Search 

### 3.1 Brave Search 

|  |  |  |
|------|------|------|
| **** | Google/Bing |  |
| **Goggles** |  |  |
| **Discussions** |  | Reddit |
| **News** |  |  |

### 3.2 Brave Search 

|  |  |  |
|------|------|------|
| `tf=pw` |  | `https://search.brave.com/search?q=news&tf=pw` |
| `tf=pm` |  | `https://search.brave.com/search?q=tech&tf=pm` |
| `tf=py` |  | `https://search.brave.com/search?q=AI&tf=py` |
| `safesearch=strict` |  | `https://search.brave.com/search?q=test&safesearch=strict` |
| `source=web` |  |  |
| `source=news` |  | `https://search.brave.com/search?q=tech&source=news` |
| `source=images` |  | `https://search.brave.com/search?q=cat&source=images` |
| `source=videos` |  | `https://search.brave.com/search?q=music&source=videos` |

### 3.3 Brave Search Goggles

Goggles 

```
$discard  // 
$boost,site=stackoverflow.com  // Stack Overflow
$boost,site=github.com  // GitHub
$boost,site=docs.python.org  // Python
```

### 3.4 Brave Search 

```javascript
// 1. 
web_fetch({"url": "https://search.brave.com/search?q=technology&tf=pw&source=news"})

// 2. AI
web_fetch({"url": "https://search.brave.com/search?q=artificial+intelligence&tf=pm"})

// 3. 
web_fetch({"url": "https://search.brave.com/search?q=machine+learning&source=images"})

// 4. 
web_fetch({"url": "https://search.brave.com/search?q=python+tutorial&source=videos"})

// 5. 
web_fetch({"url": "https://search.brave.com/search?q=privacy+tools"})
```

---

## 📊 WolframAlpha 

### 4.1 WolframAlpha 

|  |  | URL |
|------|---------|-----|
| **** | `integrate x^2 dx` | `https://www.wolframalpha.com/input?i=integrate+x%5E2+dx` |
| **** | `100 miles to km` | `https://www.wolframalpha.com/input?i=100+miles+to+km` |
| **** | `100 USD to CNY` | `https://www.wolframalpha.com/input?i=100+USD+to+CNY` |
| **** | `AAPL stock` | `https://www.wolframalpha.com/input?i=AAPL+stock` |
| **** | `weather in Beijing` | `https://www.wolframalpha.com/input?i=weather+in+Beijing` |
| **** | `population of China` | `https://www.wolframalpha.com/input?i=population+of+China` |
| **** | `properties of gold` | `https://www.wolframalpha.com/input?i=properties+of+gold` |
| **** | `nutrition of apple` | `https://www.wolframalpha.com/input?i=nutrition+of+apple` |
| **** | `days between Jan 1 2020 and Dec 31 2024` |  |
| **** | `10am Beijing to New York` |  |
| **IP** | `8.8.8.8` | IP |
| **** | `scan barcode 123456789` |  |
| **** | `flight AA123` |  |

### 4.2 WolframAlpha 

```javascript
// 1. 
web_fetch({"url": "https://www.wolframalpha.com/input?i=integrate+sin%28x%29+from+0+to+pi"})

// 2. 
web_fetch({"url": "https://www.wolframalpha.com/input?i=solve+x%5E2-5x%2B6%3D0"})

// 3. 
web_fetch({"url": "https://www.wolframalpha.com/input?i=100+USD+to+CNY"})

// 4. 
web_fetch({"url": "https://www.wolframalpha.com/input?i=Apple+stock+price"})

// 5. 
web_fetch({"url": "https://www.wolframalpha.com/input?i=weather+in+Shanghai+tomorrow"})

// 6. 
web_fetch({"url": "https://www.wolframalpha.com/input?i=GDP+of+China+vs+USA"})

// 7. 
web_fetch({"url": "https://www.wolframalpha.com/input?i=molar+mass+of+H2SO4"})

// 8. 
web_fetch({"url": "https://www.wolframalpha.com/input?i=speed+of+light"})

// 9. 
web_fetch({"url": "https://www.wolframalpha.com/input?i=calories+in+banana"})

// 10. 
web_fetch({"url": "https://www.wolframalpha.com/input?i=events+on+July+20+1969"})
```

---

## 🔧 Startpage 

### 5.1 Startpage 

|  |  | URL |
|------|------|-----|
| **** |  | "" |
| **** |  |  |
| **EU** |  |  |
| **** |  | IP |

### 5.2 Startpage 

|  |  |  |
|------|------|------|
| `cat=web` |  |  |
| `cat=images` |  | `...&cat=images` |
| `cat=video` |  | `...&cat=video` |
| `cat=news` |  | `...&cat=news` |
| `language=english` |  | `...&language=english` |
| `time=day` | 24 | `...&time=day` |
| `time=week` |  | `...&time=week` |
| `time=month` |  | `...&time=month` |
| `time=year` |  | `...&time=year` |
| `nj=0` |  family filter | `...&nj=0` |

### 5.3 Startpage 

```javascript
// 1. 
web_fetch({"url": "https://www.startpage.com/sp/search?query=privacy+tools"})

// 2. 
web_fetch({"url": "https://www.startpage.com/sp/search?query=nature&cat=images"})

// 3. 
web_fetch({"url": "https://www.startpage.com/sp/search?query=tech+news&time=week&cat=news"})

// 4. 
web_fetch({"url": "https://www.startpage.com/sp/search?query=machine+learning&language=english"})
```

---

## 🌍 

### 6.1 

|  |  |  |  |
|---------|---------|---------|------|
| **** | Google Scholar | Google, Brave |  |
| **** | Google | GitHub(DuckDuckGo bang) |  |
| **** | DuckDuckGo | Startpage, Brave |  |
| **** | Brave News | Google News |  |
| **** | WolframAlpha | Google |  |
| **** | Google HK | Bing |  |
| **** | Qwant | Startpage |  |
| **** | Ecosia | DuckDuckGo |  |
| **** | Brave | Startpage |  |

### 6.2 

```javascript
// 
const keyword = "climate change 2024";

// 
const searches = [
  { engine: "Google", url: `https://www.google.com/search?q=${keyword}&tbs=qdr:m` },
  { engine: "Brave", url: `https://search.brave.com/search?q=${keyword}&tf=pm` },
  { engine: "DuckDuckGo", url: `https://duckduckgo.com/html/?q=${keyword}` },
  { engine: "Ecosia", url: `https://www.ecosia.org/search?q=${keyword}` }
];

// 
```

### 6.3 

|  |  |  |
|-----------|---------|---------|
| **** | Google News, Brave News | `tbs=qdr:h`, `tf=pw` |
| **** | Google, Brave | `tbs=qdr:d`, `time=day` |
| **** |  | `tbs=qdr:w`, `tf=pw` |
| **** |  | `tbs=qdr:m`, `tf=pm` |
| **** | Google Scholar |  |

### 6.4 

#### 

```javascript
// GitHub 
web_fetch({"url": "https://duckduckgo.com/html/?q=!gh+tensorflow+stars:%3E1000"})

// Stack Overflow 
web_fetch({"url": "https://duckduckgo.com/html/?q=!so+python+memory+leak"})

// MDN 
web_fetch({"url": "https://duckduckgo.com/html/?q=!mdn+javascript+async+await"})

// PyPI 
web_fetch({"url": "https://duckduckgo.com/html/?q=!pypi+requests"})

// npm 
web_fetch({"url": "https://duckduckgo.com/html/?q=!npm+express"})
```

#### 

```javascript
// Google Scholar 
web_fetch({"url": "https://scholar.google.com/scholar?q=deep+learning+2024"})

// PDF
web_fetch({"url": "https://www.google.com/search?q=machine+learning+filetype:pdf+2024"})

// arXiv 
web_fetch({"url": "https://duckduckgo.com/html/?q=site:arxiv.org+quantum+computing"})
```

#### 

```javascript
// 
web_fetch({"url": "https://www.wolframalpha.com/input?i=AAPL+stock"})

// 
web_fetch({"url": "https://www.wolframalpha.com/input?i=EUR+to+USD"})

// PDF
web_fetch({"url": "https://www.google.com/search?q=Apple+Q4+2024+earnings+filetype:pdf"})
```

#### 

```javascript
// Google
web_fetch({"url": "https://www.google.com/search?q=breaking+news&tbm=nws&tbs=qdr:h"})

// Brave
web_fetch({"url": "https://search.brave.com/search?q=world+news&source=news"})

// DuckDuckGo
web_fetch({"url": "https://duckduckgo.com/html/?q=tech+news&ia=news"})
```

---

## 🛠️ 

### URL

```javascript
// URL
function encodeKeyword(keyword) {
  return encodeURIComponent(keyword);
}

// 
const keyword = "machine learning";
const encoded = encodeKeyword(keyword); // "machine%20learning"
```

### 

```javascript
// 
function generateSearchUrls(keyword) {
  const encoded = encodeURIComponent(keyword);
  return {
    google: `https://www.google.com/search?q=${encoded}`,
    google_hk: `https://www.google.com.hk/search?q=${encoded}`,
    duckduckgo: `https://duckduckgo.com/html/?q=${encoded}`,
    brave: `https://search.brave.com/search?q=${encoded}`,
    startpage: `https://www.startpage.com/sp/search?query=${encoded}`,
    bing_intl: `https://cn.bing.com/search?q=${encoded}&ensearch=1`,
    yahoo: `https://search.yahoo.com/search?p=${encoded}`,
    ecosia: `https://www.ecosia.org/search?q=${encoded}`,
    qwant: `https://www.qwant.com/?q=${encoded}`
  };
}

// 
const urls = generateSearchUrls("artificial intelligence");
```

### 

```javascript
// GoogleURL
function googleTimeSearch(keyword, period) {
  const periods = {
    hour: 'qdr:h',
    day: 'qdr:d',
    week: 'qdr:w',
    month: 'qdr:m',
    year: 'qdr:y'
  };
  return `https://www.google.com/search?q=${encodeURIComponent(keyword)}&tbs=${periods[period]}`;
}

// 
const recentNews = googleTimeSearch("AI breakthrough", "week");
```

---

## 📝 

```javascript
// ====================  ====================

// 1. GitHubStarPython
web_fetch({"url": "https://www.google.com/search?q=site:github.com+python+stars:%3E1000"})

// 2. Stack Overflow
web_fetch({"url": "https://duckduckgo.com/html/?q=!so+best+way+to+learn+python"})

// 3. MDN
web_fetch({"url": "https://duckduckgo.com/html/?q=!mdn+promises"})

// 4. npm
web_fetch({"url": "https://duckduckgo.com/html/?q=!npm+axios"})

// ====================  ====================

// 5. Google Scholar
web_fetch({"url": "https://scholar.google.com/scholar?q=transformer+architecture"})

// 6. PDF
web_fetch({"url": "https://www.google.com/search?q=attention+is+all+you+need+filetype:pdf"})

// 7. arXiv
web_fetch({"url": "https://duckduckgo.com/html/?q=site:arxiv.org+abs+quantum"})

// ====================  ====================

// 8. Google1
web_fetch({"url": "https://www.google.com/search?q=breaking+news&tbs=qdr:h&tbm=nws"})

// 9. Brave
web_fetch({"url": "https://search.brave.com/search?q=technology&tf=pw&source=news"})

// 10. DuckDuckGo
web_fetch({"url": "https://duckduckgo.com/html/?q=world+news&ia=news"})

// ====================  ====================

// 11. 
web_fetch({"url": "https://www.wolframalpha.com/input?i=Tesla+stock"})

// 12. 
web_fetch({"url": "https://www.wolframalpha.com/input?i=1+BTC+to+USD"})

// 13. PDF
web_fetch({"url": "https://www.google.com/search?q=Microsoft+annual+report+2024+filetype:pdf"})

// ====================  ====================

// 14. 
web_fetch({"url": "https://www.wolframalpha.com/input?i=derivative+of+x%5E3+sin%28x%29"})

// 15. 
web_fetch({"url": "https://www.wolframalpha.com/input?i=convert+100+miles+to+kilometers"})

// 16. 
web_fetch({"url": "https://www.wolframalpha.com/input?i=protein+in+chicken+breast"})

// ====================  ====================

// 17. DuckDuckGo
web_fetch({"url": "https://duckduckgo.com/html/?q=privacy+tools"})

// 18. Startpage
web_fetch({"url": "https://www.startpage.com/sp/search?query=secure+messaging"})

// 19. Brave
web_fetch({"url": "https://search.brave.com/search?q=encryption+software"})

// ====================  ====================

// 20. Google
web_fetch({"url": "https://www.google.com/search?q=%22machine+learning%22+site:github.com+filetype:pdf+2024"})

// 21. 
web_fetch({"url": "https://www.google.com/search?q=python+tutorial+-wikipedia+-w3schools"})

// 22. 
web_fetch({"url": "https://www.google.com/search?q=laptop+%24800..%241200+best+review"})

// 23. Bangs
web_fetch({"url": "https://duckduckgo.com/html/?q=!g+site:medium.com+python"})

// 24. Google
web_fetch({"url": "https://www.google.com/search?q=beautiful+landscape&tbm=isch"})

// 25. 
web_fetch({"url": "https://scholar.google.com/scholar?q=author:%22Geoffrey+Hinton%22"})
```

---

## 🔐 

### 

|  |  |  |  |  |
|------|---------|---------|------|---------|
| **DuckDuckGo** |  |  |  |  |
| **Startpage** |  |  |  | Google |
| **Brave** |  |  |  |  |
| **Qwant** |  |  |  |  |
| **Google** |  |  |  |  |
| **Bing** |  |  |  |  |

### 

1. ****: DuckDuckGo  Brave
2. **Google**: Startpage
3. ****: Google Scholar
4. ****: Tor + DuckDuckGo onion
5. ****: 

---

## 📚 

- [Google](https://support.google.com/websearch/answer/...)
- [DuckDuckGo Bangs](https://duckduckgo.com/bang)
- [Brave Search](https://search.brave.com/help/...)
- [WolframAlpha](https://www.wolframalpha.com/examples/)
