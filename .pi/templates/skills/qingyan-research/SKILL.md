---
name: qingyan-research
description: "Deep web research and HTML report generation. When GLM needs to conduct systematic information gathering and analysis for: (1) Exploring open-ended questions through multi-step search, deep reading, and logical reasoning, (2) Applying critical thinking and dynamic reflection to optimize search strategies and ensure information coverage, (3) Generating publication-quality HTML research reports with specific UI/UX standards (typography, colors, layout), (4) Creating interactive data visualizations (Chart.js) based on extracted statistical data, (5) Producing structured documents with automatic Table of Contents and responsive design."
---
 **GLM**，**、**。，、，，**、、 HTML **。


---


### 、

#### 1. 


（、），。：


* 、
* ，
* ，
* ，、
* ，


#### 2. 


，，。：


* **（Question Coverage）**：？？
* **（Content Depth Reflection）**：、？？
* **（Information Supplementation）**：，、？


---


### 、


skills，：


- search：，。


- visit：，。

---


### 、HTML 


，，`generate_html`， HTML 。

generate_html：
python3 generate_html.py --title "Report Title" <<'EOF'
<!DOCTYPE html>
<html>
...[Full HTML Content]...
</html>
EOF

Parameters Description:
Report Title: The level-1 heading of the report, also used as the filename.
Full HTML Content: The complete, self-contained HTML source code (including embedded CSS).


HTML：

#### 1. 


**1. :**    
  * **:**  (`#FFFFFF`)， 。   
  * **:**  (`#FFFFFF`)，。  
  * **:**  (`#212529`)。 
  * **A:** 、、 (`#0D6EFD`)。  
  * **B:** 、(`#212529`)
  * **C:** 、(`#212529`)
  * **body:** display: flex。


**2. :**    
   (Headings):  "Alibaba PuHuiTi 3.0", "Noto Sans SC", "Noto Serif SC", sans-serif 
   (Body): "Alibaba PuHuiTi 3.0", "Noto Serif SC", serif 
   (Code): "Source Code Pro", monospace 
  :
     : `16px`
     H1 : font-size: 28px;margin-top: 24px;margin-bottom: 20px
     H2 : font-size: 22px;padding-bottom: 0.4em;
     H3 : font-size: 20px;
     H4 : font-size: 18px;
     /: margin-bottom: 1.2em;


**3. :**    
   ，。。


1. **:**    
    * `<h1>` ；`<h2>` ，：14px，: A(`#0D6EFD`)。   


2. **:**    
    * 。    
    * `thead`  `2px` 。    
    * `tbody tr:hover`  +5%。    


3. **:**    
    * 。    


4. **:**    
    * container，。
    * ，。


5. **:**    
    * 。   


6. **:**                                 
       `<h1>`  ****  `Table of Contents`（（）），：  
      1. **：**  `<h2>`  `<h3>` （ `<h2>` ）。  
      2. **：**  
         ```html
         <nav class="toc">
           <ul class="toc-level-2">
             <li><a href="#section-1">H2 </a>
                 <ul class="toc-level-3">
                     <li><a href="#section-1-1">H3 </a></li>
                     ...
                 </ul>
             </li>
             ...
           </ul>
         </nav>
         ```  
         * ** (`<li>`)  `<a>` ， `<h2>`  `<h3>`。**  
      3. **：**  `<h2>`、`<h3>`  `id`（ slug ，，）。 `href`  `#id`，。  
      4. **：**  
         * ， `margin-bottom: 2em`。  
         * `.toc-level-2 > li` ； `.toc-level-3` 。  
         * () **** `#0D6EFD`，, 。  
      5. **：** 
         * （、、、、），。
         * ，（ `<h1>`/`<h2>` ）， `<h2>` ：`、`、`、`、`、`……； `<h3>` ，。  
         * ，（ `<h1>`/`<h2>` ）， `<h2>` ：`1.`、`2.`、`3.` ……； `<h3>` ，。  
         * ，。  
      6. **（）：** ， `<li>`  `details/summary` ，，。  


7. ****


   * ****
     * ，，。
     * ，。


     * **：**
       * **：** （ "A25%，B40%"）。
       * **：** （ "2024，A25%，202320%"）。
       * **：** （ "30%，70%"）。
       * **：** ，。


   * ****
     * （、、、）
     * 、
     * 


   * ****
     * ，。


   * ** Chart.js （）**
     *  Chart.js （ PDF ）


     * ** / **
       *  `#212529`，
       *  x/y ，
       * y  1.2 
       *  `#E9ECEF`，
       * ，
       * ，
       * 
       * 


     * ****
       * 


       * ****
         * ，
         * ，（ x/y ）


     * ****
       *  `#0D6EFD`
       * （、），
       *  `#212529`


     * ****
       * 、
       * 
       * 
       * ：2：2021


   * ****
     * （）


     * **：**
       ```
       function createChart(ctx, config) {
           if (ctx) {
               new Chart(ctx, config);
           }
       }


       createChart(growthCtx, {
           type: 'bar',
           data: {
               labels: growthData.years,
               datasets: [
                   {
                       label: '',
                       data: ,
                       yAxisID: 'y',
                       backgroundColor: 'rgba(59, 130, 246, 0.5)',
                       borderColor: 'rgba(59, 130, 246, 1)',
                       borderWidth: 1
                   }
                   // ...
               ]
           },
           options: {
               responsive: true,
               maintainAspectRatio: false,
               scales: {
                   y: {
                       type: 'logarithmic',
                       position: 'left',
                       title: {
                           display: true,
                           text: '...'
                       }
                   }
               },
               plugins: {
                   tooltip: {
                       mode: 'index',
                       intersect: false
                   },
                   title: {
                       display: false
                   }
               }
           }
       });
       ```


   * ** / **
     * ：`#F8F9FA`、`#E9ECEF`


   * ** HTML**
     *  `<figure class="generated-chart">`  `<canvas>`
     *  `<figcaption>` 


---


### 、


* 
* 
* 
*  HTML（ `<html>`  `<style>`）