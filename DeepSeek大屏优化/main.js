// ==UserScript==
// @name         DeepSeek大屏优化
// @namespace    http://tampermonkey.net/
// @version      1.0.0
// @description  优化DeepSeek页面样式
// @author       HuSheng
// @match        https://chat.deepseek.com/a/chat/**
// @icon         https://chat.deepseek.com/favicon.svg
// @grant        none
// ==/UserScript==

(function () {
    'use strict';

    // 需修改样式的完整XPath路径
    const xpaths = [
        '/html/body/div[1]/div/div[2]/div[2]/div/div[2]/div/div/div[1]',
        '/html/body/div[1]/div/div[2]/div[2]/div/div[2]/div/div/div[3]/div[1]'
    ];

    function modifyElementStyles() {
        xpaths.forEach(xpath => {
            let element = document.evaluate(
                xpath,
                document,
                null,
                XPathResult.FIRST_ORDERED_NODE_TYPE,
                null
            ).singleNodeValue;

            if (element) {
                element.style.width = '100%';
                element.style.maxWidth = '100%';
            } else {
                console.err(`未找到目标元素：${xpath}`);
            }
        });
    }

    // 监听URL变化
    function observeUrlChanges() {
        let lastUrl = location.href;
        window.addEventListener('popstate', function () {
            if (location.href !== lastUrl) {
                lastUrl = location.href;
                modifyElementStyles();
            }
        });
        window.addEventListener('hashchange', function () {
            if (location.href !== lastUrl) {
                lastUrl = location.href;
                modifyElementStyles();
            }
        });
        const originalPushState = history.pushState;
        const originalReplaceState = history.replaceState;

        history.pushState = function () {
            originalPushState.apply(this, arguments);
            if (location.href !== lastUrl) {
                lastUrl = location.href;
                modifyElementStyles();
            }
        };

        history.replaceState = function () {
            originalReplaceState.apply(this, arguments);
            if (location.href !== lastUrl) {
                lastUrl = location.href;
                modifyElementStyles();
            }
        };
    }

    // 页面加载时执行一次
    window.addEventListener('load', function () {
        modifyElementStyles();
        observeUrlChanges();
    });

    const observer = new MutationObserver(function () {
        modifyElementStyles();
    });

    observer.observe(document.body, {
        childList: true,
        subtree: true,
    });
})();