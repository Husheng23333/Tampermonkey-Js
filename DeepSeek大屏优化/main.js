// ==UserScript==
// @name         DeepSeek大屏优化
// @namespace    http://tampermonkey.net/
// @version      2.3.0
// @description  优化DeepSeek页面样式
// @author       HuSheng
// @match        https://chat.deepseek.com/**
// @icon         https://chat.deepseek.com/favicon.svg
// @grant        none
// ==/UserScript==

(function () {
    'use strict';

    // 需隐藏元素
    const xpaths_hide = [];
    const css_hide = [
        {key: '.ebaea5d2', value: '', sleep: 0},
        {key: '.a1e75851', value: '', sleep: 0},
        {key: '._2be88ba', value: '', sleep: 0},
    ];

    // 需修改width元素
    const xpaths_width = [];
    const css_width = [
        {key: '._9a2f8e4', value: '100%', sleep: 0},
        {key: '.dad65929', value: '100%', sleep: 0},
        {key: '.aaff8b8f', value: '100%', sleep: 0},
    ];

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
            const element = document.querySelector(css.key);
            if (element) {
                element.style.display = 'none';
            } else {
                console.error(`未找到目标元素：${css.key}`);
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
            const element = document.querySelector(css.key);
            if (element) {
                element.style.width = '100%';
                element.style.maxWidth = '100%';
            } else {
                console.error(`未找到目标元素：${css.key}`);
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
            const element = document.querySelector(css.key);
            if (element) {
                element.style.padding = '0 0 0 0';
            } else {
                console.error(`未找到目标元素：${css.key}`);
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
            const element = document.querySelector(css.key);
            if (element) {
                element.style.margin = '0 0 0 0';
            } else {
                console.error(`未找到目标元素：${css.key}`);
            }
        }

        // 其他 - 暂时移除阅读模式
        // readMode();
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

        const xpath = "/html/body/div[1]/div/div[2]/div[3]/div/div[2]/div/div/div[3]";
        const targetElement = document.evaluate(xpath, document, null, XPathResult.FIRST_ORDERED_NODE_TYPE, null).singleNodeValue;

        if (targetElement) {

            // 元素位置计算
            let elementTop, elementBottom, elementLeft, elementRight;
            function updateElementPosition() {
                const elementRect = targetElement.getBoundingClientRect();
                elementTop = elementRect.top + window.scrollY; // 相对于文档顶部的位置
                elementBottom = elementRect.bottom + window.scrollY; // 相对于文档底部的位置
                elementLeft = elementRect.left + window.scrollX; // 相对于文档左侧的位置
                elementRight = elementRect.right + window.scrollX; // 相对于文档右侧的位置
            }

            updateElementPosition();
            window.addEventListener('scroll', updateElementPosition);
            window.addEventListener('resize', updateElementPosition);

            // 首次隐藏输入框
            isReadMode = true;
            targetElement.style.display = 'none';

            // 鼠标移动
            window.addEventListener('mousemove', function(event) {
                const mouseX = event.clientX + window.scrollX;
                const mouseY = event.clientY + window.scrollY;

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
        resetMode();
    });

    // DOM加载完成后执行一次
    document.addEventListener('DOMContentLoaded', function () {
        modifyElementStyles();
        resetMode();
    });

    const observer = new MutationObserver(function () {
        modifyElementStyles();
    });

    observer.observe(document.body, {
        childList: true,
        subtree: true,
    });
})();