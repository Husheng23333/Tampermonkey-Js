// ==UserScript==
// @name         Gemini大屏优化
// @namespace    http://tampermonkey.net/
// @version      1.0.0
// @description  优化Gemini页面样式
// @author       HuSheng
// @match        https://gemini.google.com/app/**
// @icon         https://www.google.com/s2/favicons?sz=64&domain=google.com
// @grant        none
// @run-at       document-body
// @license       GPL-2.0-only
// ==/UserScript==

(function () {
    'use strict';

    // xpath
    const xpaths_css = [];

    // CSS
    const css_css = [
        {key: '.conversation-container', value: 'max-width: 100%', sleep: 0},
        {key: '.conversation-container user-query', value: 'max-width: 100%', sleep: 0},
        {key: '.input-area-container', value: 'max-width: 100%', sleep: 0},
        {key: 'hallucination-disclaimer', value: 'display: none', sleep: 0},
        {key: 'input-container', value: 'margin-bottom: 10px', sleep: 0},
    ];


    function delay(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    function applyCSSStyles(element, cssText) {
        const styles = cssText.split(';').filter(style => style.trim() !== '');

        styles.forEach(style => {
            const [property, value] = style.split(':').map(s => s.trim());
            if (property && value) {
                // CSS自定义属性
                if (property.startsWith('--')) {
                    element.style.setProperty(property, value);
                } else {
                    // CSS转JS格式
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
                } else if (xpath.key) {
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
                } else if (css.key) {
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

        const urlChangeHandler = function () {
            if (location.href !== lastUrl) {
                lastUrl = location.href;
                modifyElementStyles();
            }
        };

        window.addEventListener('popstate', urlChangeHandler);
        window.addEventListener('hashchange', urlChangeHandler);

        const originalPushState = history.pushState;
        const originalReplaceState = history.replaceState;

        history.pushState = function () {
            originalPushState.apply(this, arguments);
            urlChangeHandler();
        };

        history.replaceState = function () {
            originalReplaceState.apply(this, arguments);
            urlChangeHandler();
        };
    }

    // 页面加载时执行
    function init() {
        modifyElementStyles();
        observeUrlChanges();

        const observer = new MutationObserver(function (mutations) {
            const shouldUpdate = mutations.some(mutation => {
                return true;
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

    if (document.readyState === 'complete' || document.readyState === 'interactive') {
        setTimeout(init, 0);
    } else {
        document.addEventListener('DOMContentLoaded', init);
        window.addEventListener('load', init);
    }
})();