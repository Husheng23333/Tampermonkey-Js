// ==UserScript==
// @name                soTab - 搜索引擎快速切换
// @author              HuSheng
// @icon                http://q.qlogo.cn/qqapp/100229475/F1260A6CECA521F6BE517A08C4294D8A/100
// @match               *.baidu.com/*
// @exclude             *.baidu.com/link?*
// @match               *.bing.com/*
// @match               *.sogou.com/*
// @match               https://*.google.com/*
// @match               https://*.google.com.hk/*
// @grant               GM_addStyle
// @grant               window.onurlchange
// @run-at              document_end
// ==/UserScript==
(function () {
    function soTabInit() {
        if (top !== window) {
            console.log('soTab! not top window');
            return;
        }

        // 判断搜索引擎，将仅使用hostname适配
        const sites = [
            'baidu',
            'bing',
            'google',
            'bilibili',
            'csdn',
            'metaso',
        ];
        const sitesName = [
            '百度',
            '必应',
            '谷歌',
            'B站',
            'CSDN',
            '秘塔AI',
        ];
        let siteID = -1;

        for (const site of sites) {
            if (site && location.hostname.includes(site)) {
                siteID = sites.indexOf(site);
                break;
            }
        }

        if (siteID === -1) {
            console.log("soTab can't match site.");
            return;
        }

        // 判断搜索类型，使用href适配
        let kind = [];
        // eslint-disable-next-line default-case
        switch (siteID) {
            case 0:
                kind = [
                    'www.baidu',
                    'image.baidu',
                    'zhidao.baidu.com/search',
                    'v.baidu',
                    'xueshu.baidu.com/s',
                ];
                break;
            case 1: // bing
                kind = [
                    '.com/search',
                    '.com/images',
                    '.com/knows/search',
                    '.com/videos',
                    '/academic/search',
                ];
                break;
            case 2: // google
                kind = ['', 'tbm=isch', '', 'tbm=vid', 'scholar.google'];
                break;
            case 3: // bilibili
                kind = ['search.bilibili.com/all'];
                break;
            case 4: // csdn
                kind = ['so.csdn.net/so/search'];
                break;
            case 5: // metaso
                kind = ['metaso.cn/?q='];
                break;
        }
        // 0:normal  1:pic  2:zhidao  3:video  4:xueshu
        let kindID = -1;
        for (let i = 0; i < kind.length; i++) {
            if (Array.isArray(kind[i])) {
                // 数组形式
                for (let j = 0; j < kind[i].length; j++) {
                    if (location.href.includes(kind[i][j])) {
                        kindID = i;
                        break;
                    }
                }
                if (kindID !== -1) break;
            } else if (location.href.indexOf(kind[i]) >= 0) {
                kindID = i;
                break;
            }
        }
        // 谷歌特殊处理
        if (siteID === 2 && kindID === -1) {
            if (location.href.indexOf('q=') >= 0) kindID = 0;
        }
        if (kindID === -1) {
            console.log('soTab! no kind found');
            return;
        }

        // 初始化搜索路径
        // "百度", "必应", "谷歌", "B站", "CSDN", "秘塔AI"
        let links = []; // link[siteID]
        if (kindID === 0) {
            // normal
            links = [
                'https://www.baidu.com/s?wd=',
                'https://cn.bing.com/search?q=',
                'https://www.google.com/search?q=',
                'https://search.bilibili.com/all?keyword=',
                'https://so.csdn.net/so/search?q=',
                'https://metaso.cn/?q=',
            ];
        } else if (kindID === 1) {
            // pic
            links = [
                'https://image.baidu.com/search/index?tn=baiduimage&word=',
                'https://cn.bing.com/images/search?q=',
                'https://www.google.com/search?tbm=isch&q=',
            ];
        } else if (kindID === 2) {
            // zhidao
            links = [
                'https://zhidao.baidu.com/search?word=',
                'https://cn.bing.com/knows/search?q=',
            ];
        } else if (kindID === 3) {
            // video
            links = [
                'https://v.baidu.com/v?ie=utf-8&word=',
                '',
                'https://www.google.com/search?tbm=vid&q=',
            ];
        } else if (kindID === 4) {
            // xueshu
            links = [
                'https://xueshu.baidu.com/s?wd=',
                'https://cn.bing.com/academic/search?q=',
                '',
                'https://scholar.google.com/scholar?q=',
            ];
        }

        // 从url的searchParams中获取搜索关键词
        const searchParams = new URLSearchParams(location.search);
        const searchKeyWords = ['wd', 'word', 'w', 'q', 'query', 'search', 'keyword'];
        let searchWords = '';
        searchKeyWords.forEach((keyWord) => {
            if (searchParams.has(keyWord)) {
                let initialWords = searchParams.get(keyWord);
                searchWords = encodeURIComponent(initialWords);
            }
        });

        // 加载css
        const styleText = `
              .soTab {
                  position: fixed;
                  background-color: #000;
                  opacity: 0.3;
                  border-radius: 40px;
                  color: #fff;
                  padding: 15px 20px;
                  bottom: 100px;
                  height: 40px;
                  left: -320px;
                  width: 300px;
                  z-index: 9999999;
                  transition: all 400ms;
                  font-size: 14px;
                  cursor: pointer;
              }
              .soTab.expanded {
                  left: 0px;
                  opacity: 1;
                  border-radius: 10px;
                  box-shadow: 5px -5px 10px #777;
              }
              .soTab p {
                  margin: 0;
              }
              p.soTab_title {
                  font-weight: bold;
                  margin-bottom: 3px;
              }
              a.soTabA {
                  color: #0cf;
                  margin-right: 25px;
              }
              a.soTabA:link, a.soTabA:visited {
                  color: #0cf;
              }
              `;

        // 生成切换框
        const bodyDOM = document.getElementsByTagName('body')[0];
        const soTabPanelDOM = document.createElement('div');
        soTabPanelDOM.id = 'soTab';
        let str = "<p class='soTab_title'>soTab 一键切换引擎：</p><p>";
        for (const link of links) {
            if (link && links.indexOf(link) !== siteID) {
                str += `<a class="soTabA" href='${link}${searchWords}' target='_blank'>${sitesName[links.indexOf(link)]}</a>`;
            }
        }

        soTabPanelDOM.innerHTML = `${str}</p>`;
        soTabPanelDOM.className = `b_soTab soTab soTab_site${siteID} soTab_kind${kindID}`;// b_必须放在className首位，否则bing会监听增加的DOM并删除增加的元素

        // 点击事件
        soTabPanelDOM.addEventListener('click', function () {
            this.classList.toggle('expanded');
        });

        // 移出事件
        bodyDOM.addEventListener('click', function (e) {
            if (!soTabPanelDOM.contains(e.target)) {
                soTabPanelDOM.classList.remove('expanded');
            }
        });

        const oldSoTabDOM = document.getElementById('soTab');
        if (oldSoTabDOM) {
            oldSoTabDOM.remove();
        }
        const style = GM_addStyle(styleText);
        style.dataset.for = "result"; // 给style标签加上data-for= "result"属性，防止被百度删除
        bodyDOM.prepend(soTabPanelDOM);// 将dom添加到body前面，防止被百度和BING删除
    }
    if (window.onurlchange === null) {
        // feature is supported
        window.addEventListener('urlchange', () => {
            console.log('url has changed');
            soTabInit();
        });
    }
    if (top === window) {
        console.log('init sotab here');
        soTabInit();
    }
}());
