// ==UserScript==
// @name         DeepSeek大屏优化
// @namespace    http://tampermonkey.net/
// @version      2.0.1
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
    const xpaths_margin = [];
    const css_margin = [];

    // 封装setTimeout
    function delay(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    // 修改元素样式
    async function modifyElementStyles() {

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

        // 修改margin
        for (const xpath of xpaths_margin) {
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
                element.style.margin = xpath.value;
            } else {
                console.error(`未找到目标元素：${xpath.key}`);
            }
        }

        for (const css of css_margin) {
            const element = document.querySelector(css);
            if (element) {
                element.style.margin = '0 0 0 0';
            } else {
                console.error(`未找到目标元素：${css}`);
            }
        }

        // 其他
        readMode();
    }

    let isReadMode = false;

    function resetMode() {
        isReadMode = false;
    }

    // 阅读模式(输入框隐藏)
    function readMode() {
        if (isReadMode) {
            return;
        }

        const xpath = "/html/body/div[1]/div/div[2]/div[2]/div/div[2]/div/div/div[3]/div[1]/div/div";
        const targetElement = document.evaluate(xpath, document, null, XPathResult.FIRST_ORDERED_NODE_TYPE, null).singleNodeValue;

        if (targetElement) {

            // 计算目标元素在窗口中的位置范围
            const elementRect = targetElement.getBoundingClientRect();
            const elementTop = elementRect.top;
            const elementBottom = elementRect.bottom;
            const elementLeft = elementRect.left;
            const elementRight = elementRect.right;

            isReadMode = true;
            targetElement.style.display = 'none';

            // 鼠标移动
            window.addEventListener('mousemove', function(event) {
                const mouseX = event.clientX;
                const mouseY = event.clientY;

                // 判断鼠标是否在目标元素的范围内
                if (
                    mouseX >= elementLeft &&
                    mouseX <= elementRight &&
                    mouseY >= elementTop &&
                    mouseY <= elementBottom
                ) {
                    targetElement.style.display = 'block';
                }
            });

            // 全局点击
            document.addEventListener('click', function(event) {
                // 如果点击的不是目标元素或其子元素
                if (!targetElement.contains(event.target)) {
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
                resetMode();
            }
        });
        window.addEventListener('hashchange', function () {
            if (location.href !== lastUrl) {
                lastUrl = location.href;
                modifyElementStyles();
                resetMode();
            }
        });
        const originalPushState = history.pushState;
        const originalReplaceState = history.replaceState;

        history.pushState = function () {
            originalPushState.apply(this, arguments);
            if (location.href !== lastUrl) {
                lastUrl = location.href;
                modifyElementStyles();
                resetMode();
            }
        };

        history.replaceState = function () {
            originalReplaceState.apply(this, arguments);
            if (location.href !== lastUrl) {
                lastUrl = location.href;
                modifyElementStyles();
                resetMode();
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