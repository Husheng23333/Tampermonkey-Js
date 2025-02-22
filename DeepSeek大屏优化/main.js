// ==UserScript==
// @name         DeepSeek大屏优化
// @namespace    http://tampermonkey.net/
// @version      1.1.0
// @description  优化DeepSeek页面样式
// @author       HuSheng
// @match        https://chat.deepseek.com/**
// @icon         https://chat.deepseek.com/favicon.svg
// @grant        none
// ==/UserScript==

(function () {
    'use strict';

    // 需隐藏元素
    const xpaths_hide = [
        {key: '/html/body/div[1]/div/div[2]/div[1]/div[1]/div[4]/div[1]', value: '', sleep: 0},
        {key: '/html/body/div[1]/div/div[2]/div[1]/div[1]/div[2]', value: '', sleep: 0},
    ];

    const css_hide = [];

    // 需修改width元素
    const xpaths_width = [
        {key: '/html/body/div[1]/div/div[2]/div[2]/div/div[2]/div/div/div[1]', value: '100%', sleep: 0},
        {key: '/html/body/div[1]/div/div[2]/div[2]/div/div[2]/div/div/div[3]/div[1]', value: '100%', sleep: 0},
        {key: '/html/body/div[1]/div/div[2]/div[2]/div/div/div[2]/div[2]', value: '100%', sleep: 0},
        {key: '/html/body/div[1]/div/div[2]/div[2]/div/div/div[2]', value: '85%', sleep: 0},
    ];

    const css_width = [];

    // 需修改padding元素
    const xpaths_padding = [];

    const css_padding = [];

    // 需修改margin元素
    const xpaths_margin = [
        {key: '/html/body/div[1]/div/div[2]/div[2]/div/div/div[2]', value: '0 0 0 0', sleep: 0},
    ];

    const css_margin = [];

    // 封装setTimeout
    function delay(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    // 修改元素样式
    async function modifyElementStyles() {
        // 其他
        readMode();

        // 隐藏元素
        for (const xpath of xpaths_hide) {
            if (xpath.sleep > 0) {
                await delay(xpath.sleep); // 异步延迟
            }

            const element = document.evaluate(
                xpath.key,
                document,
                null,
                XPathResult.FIRST_ORDERED_NODE_TYPE,
                null
            ).singleNodeValue;

            if (element) {
                element.style.display = 'none';
            } else {
                console.error(`未找到目标元素：${xpath.key}`);
            }
        }

        for (const css of css_hide) {
            const element = document.querySelector(css);
            if (element) {
                element.style.display = 'none';
            } else {
                console.error(`未找到目标元素：${css}`);
            }
        }

        // 修改width
        for (const xpath of xpaths_width) {
            if (xpath.sleep > 0) {
                await delay(xpath.sleep); // 异步延迟
            }

            const element = document.evaluate(
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
        }

        for (const css of css_width) {
            const element = document.querySelector(css);
            if (element) {
                element.style.width = '100%';
                element.style.maxWidth = '100%';
            } else {
                console.error(`未找到目标元素：${css}`);
            }
        }

        // 修改padding
        for (const xpath of xpaths_padding) {
            if (xpath.sleep > 0) {
                await delay(xpath.sleep); // 异步延迟
            }

            const element = document.evaluate(
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
        }

        for (const css of css_padding) {
            const element = document.querySelector(css);
            if (element) {
                element.style.padding = '0 0 0 0';
            } else {
                console.error(`未找到目标元素：${css}`);
            }
        }
    }

    // 阅读模式(输入框隐藏)
    function readMode() {
        const xpath = "/html/body/div[1]/div/div[2]/div[2]/div/div[2]/div/div/div[3]/div[1]/div/div";
        const targetElement = document.evaluate(xpath, document, null, XPathResult.FIRST_ORDERED_NODE_TYPE, null).singleNodeValue;

        if (targetElement) {
            targetElement.style.display = 'none';

            // 监听鼠标移动事件
            window.addEventListener('mousemove', function(event) {
                // 获取浏览器窗口的高度和鼠标的位置
                const windowHeight = window.innerHeight;
                const mouseY = event.clientY;

                // 底部20%处显示，否则隐藏
                if (mouseY >= windowHeight * 0.8) {
                    targetElement.style.display = 'block';
                } else {
                    targetElement.style.display = 'none';
                }
            });
        } else {
            console.error(`未找到目标元素：${xpath}`);
        }
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

    // DOM加载完成后执行一次
    document.addEventListener('DOMContentLoaded', function () {
        modifyElementStyles();
    });

    const observer = new MutationObserver(function () {
        modifyElementStyles();
    });

    observer.observe(document.body, {
        childList: true,
        subtree: true,
    });
})();