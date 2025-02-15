// ==UserScript==
// @name         DeepSeek大屏优化
// @namespace    http://tampermonkey.net/
// @version      1.0.0
// @description  优化DeepSeek页面样式
// @author       HuSheng
// @match        https://chat.deepseek.com/**
// @icon         https://chat.deepseek.com/favicon.svg
// @grant        none
// ==/UserScript==

(function () {
    'use strict';

    // 需修改width的完整XPath路径
    const xpaths_width = [
        {key: '/html/body/div[1]/div/div[2]/div[2]/div/div[2]/div/div/div[1]', value: '100%', sleep: 0},
        {key: '/html/body/div[1]/div/div[2]/div[2]/div/div[2]/div/div/div[3]/div[1]', value: '100%', sleep: 0},
        {key: '/html/body/div[1]/div/div[2]/div[2]/div/div/div[2]/div[2]', value: '100%', sleep: 0},
    ];

    // 需修改width的CSS选择器
    const css_width = [];

    // 需修改padding的完整XPath路径
    const xpaths_padding = [
        {key: '/html/body/div[1]/div/div[2]/div[2]/div/div/div[2]', value: '0 0 0 0', sleep: 500},
    ];

    // 需修改padding的CSS选择器
    const css_padding = [];

    function modifyElementStyles() {
        // 修改width
        xpaths_width.forEach(xpath => {
            setTimeout(() => {
                let element = document.evaluate(
                    xpath.key,
                    document,
                    null,
                    XPathResult.FIRST_ORDERED_NODE_TYPE,
                    null
                ).singleNodeValue;

                if (element) {
                    element.style.width = xpath.value;
                    element.style.maxWidth = xpath.value;
                } else {
                    console.error(`未找到目标元素：${xpath.key}`);
                }
            }, xpath.sleep);
        });

        css_width.forEach(css => {
            let element = document.querySelector(css);
            if (element) {
                element.style.width = '100%';
                element.style.maxWidth = '100%';
            } else {
                console.error(`未找到目标元素：${css}`);
            }
        });

        // 修改padding
        xpaths_padding.forEach(xpath => {
            setTimeout(() => {
                let element = document.evaluate(
                    xpath.key,
                    document,
                    null,
                    XPathResult.FIRST_ORDERED_NODE_TYPE,
                    null
                ).singleNodeValue;

                if (element) {
                    element.style.padding = xpath.value;
                } else {
                    console.error(`未找到目标元素：${xpath.key}`);
                }
            }, xpath.sleep);
        });

        css_padding.forEach(css => {
            let element = document.querySelector(css);
            if (element) {
                element.style.padding = '0 0 0 0';
            } else {
                console.error(`未找到目标元素：${css}`);
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