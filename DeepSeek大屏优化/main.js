// ==UserScript==
// @name         DeepSeek大屏优化
// @namespace    http://tampermonkey.net/
// @version      2.4.0
// @description  优化DeepSeek页面样式
// @author       HuSheng
// @match        https://chat.deepseek.com/**
// @icon         https://chat.deepseek.com/favicon.svg
// @grant        none
// ==/UserScript==

(function () {
    'use strict';

    // xpath选择器修改
    const xpaths_css = [];

    // CSS选择器修改
    const css_css = [
        {key: '.ebaea5d2', value: 'display: none', sleep: 0},
        {key: '.a1e75851', value: 'display: none', sleep: 0},
        {key: '._2be88ba', value: 'display: none', sleep: 0},

        {key: '._9a2f8e4', value: 'width: 100%; max-width: 100%', sleep: 0},
        {key: '.dad65929', value: 'width: 100%; max-width: 100%', sleep: 0},
        {key: '._9a2f8e4 .aaff8b8f', value: 'width: 80%; max-width: 1000px', sleep: 0},

        {key: '._8f60047 .b13855df', value: 'min-height: 30px', sleep: 0},
        {key: '._8f60047 .aaff8b8f', value: 'width: 90%; max-width: 100%', sleep: 0},
    ];


    function delay(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    function applyCSSStyles(element, cssText) {
        const styles = cssText.split(';').filter(style => style.trim() !== '');

        styles.forEach(style => {
            const [property, value] = style.split(':').map(s => s.trim());
            if (property && value) {
                // 处理CSS自定义属性
                if (property.startsWith('--')) {
                    element.style.setProperty(property, value);
                } else {
                    // 转换CSS属性名到JS格式（如background-color -> backgroundColor）
                    const jsProperty = property.replace(/-([a-z])/g, (g) => g[1].toUpperCase());
                    element.style[jsProperty] = value;
                }
            }
        });
    }

    // 修改元素样式
    async function modifyElementStyles() {
        // xpath方式
        for (const xpath of xpaths_css) {
            if (xpath.sleep > 0) {
                await delay(xpath.sleep);
            }

            try {
                const element = document.evaluate(
                    xpath.key,
                    document,
                    null,
                    XPathResult.FIRST_ORDERED_NODE_TYPE,
                    null
                ).singleNodeValue;

                if (element) {
                    applyCSSStyles(element, xpath.value);
                } else if (xpath.key) { // 只有key不为空时才报错
                    console.error(`未找到XPath目标元素：${xpath.key}`);
                }
            } catch (e) {
                console.error(`XPath查询错误：${xpath.key}`, e);
            }
        }

        // CSS方式
        for (const css of css_css) {
            if (css.sleep > 0) {
                await delay(css.sleep);
            }

            try {
                const elements = document.querySelectorAll(css.key);
                if (elements.length > 0) {
                    elements.forEach(element => {
                        applyCSSStyles(element, css.value);
                    });
                } else if (css.key) { // 只有key不为空时才报错
                    console.error(`未找到CSS目标元素：${css.key}`);
                }
            } catch (e) {
                console.error(`CSS查询错误：${css.key}`, e);
            }
        }
    }

    // 监听URL变化
    function observeUrlChanges() {
        let lastUrl = location.href;

        const urlChangeHandler = function() {
            if (location.href !== lastUrl) {
                lastUrl = location.href;
                modifyElementStyles();
            }
        };

        window.addEventListener('popstate', urlChangeHandler);
        window.addEventListener('hashchange', urlChangeHandler);

        const originalPushState = history.pushState;
        const originalReplaceState = history.replaceState;

        history.pushState = function() {
            originalPushState.apply(this, arguments);
            urlChangeHandler();
        };

        history.replaceState = function() {
            originalReplaceState.apply(this, arguments);
            urlChangeHandler();
        };
    }

    // 页面加载时执行
    function init() {
        modifyElementStyles();
        observeUrlChanges();

        // 监听DOM变化
        const observer = new MutationObserver(function(mutations) {
            const shouldUpdate = mutations.some(mutation => {
                return Array.from(mutation.addedNodes).some(node => {
                    if (node.nodeType === Node.ELEMENT_NODE) {
                        return css_css.some(css => node.matches(css.key) || node.querySelector(css_css.map(c => c.key).join(',')));
                    }
                    return false;
                });
            });

            if (shouldUpdate) {
                modifyElementStyles();
            }
        });

        observer.observe(document.body, {
            childList: true,
            subtree: true
        });
    }

    // 根据页面加载状态决定如何初始化
    if (document.readyState === 'complete' || document.readyState === 'interactive') {
        setTimeout(init, 0);
    } else {
        document.addEventListener('DOMContentLoaded', init);
        window.addEventListener('load', init);
    }
})();