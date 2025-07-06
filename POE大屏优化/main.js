// ==UserScript==
// @name         POE大屏优化
// @namespace    http://tampermonkey.net/
// @version      1.0.0
// @description  优化POE页面样式
// @author       HuSheng
// @match        https://poe.com/**
// @icon         https://psc2.cf2.poecdn.net/assets/favicon.svg
// @grant        none
// @run-at       document-body
// @license      GPL-2.0-only
// @downloadURL  https://raw.githubusercontent.com/Husheng23333/Tampermonkey-Js/refs/heads/main/POE%E5%A4%A7%E5%B1%8F%E4%BC%98%E5%8C%96/main.js
// @updateURL    https://raw.githubusercontent.com/Husheng23333/Tampermonkey-Js/refs/heads/main/POE%E5%A4%A7%E5%B1%8F%E4%BC%98%E5%8C%96/main.js
// ==/UserScript==

(function () {
    'use strict';

    // CSS规则
    const cssRules = `
        /* 净化大屏 */
        .InfiniteScroll_container__PHsd4:not(.InfiniteScroll_horizontal__i7SXE) {
            width: 95% !important;
        }
        .ChatPageMainFooter_footerInner__BEj26 {
            width: 100% !important;
        }

        /* 字体大小 */
        .Markdown_markdownContainer__Tz3HQ {
            font-size: 16px !important;
        }

        /* 头部显示 */
        .BotInfoCard_sectionContainer__S96Qf {
            display: none !important;
        }

        /* 文本框大小 */
        .Message_botMessageBubble__aYctV, .Message_humanMessageBubble__DtRxA {
            max-width: none !important;
        }

        /* 首页净化 */
        .ChatHomeMain_exploreBotsCarousel__wddju,
        .ExploreBotsCarousel_carouselContainer__VcB_u {
            display: none !important;
        }
    `;

    function applyStyles() {
        let styleElement = document.createElement("style");
        styleElement.innerHTML = cssRules;
        document.head.appendChild(styleElement);
        console.log('样式已应用');
    }

    // 监听URL变化
    function observeUrlChanges() {
        let lastUrl = location.href;

        window.addEventListener('popstate', function () {
            if (location.href !== lastUrl) {
                lastUrl = location.href;
                applyStyles();
            }
        });

        window.addEventListener('hashchange', function () {
            if (location.href !== lastUrl) {
                lastUrl = location.href;
                applyStyles();
            }
        });

        const originalPushState = history.pushState;
        const originalReplaceState = history.replaceState;

        history.pushState = function () {
            originalPushState.apply(this, arguments);
            if (location.href !== lastUrl) {
                lastUrl = location.href;
                applyStyles();
            }
        };

        history.replaceState = function () {
            originalReplaceState.apply(this, arguments);
            if (location.href !== lastUrl) {
                lastUrl = location.href;
                applyStyles();
            }
        };
    }

    // 页面加载时执行
    window.addEventListener('load', function () {
        applyStyles();
        observeUrlChanges();
    });

    const observer = new MutationObserver(function () {
        applyStyles();
    });

    observer.observe(document.body, {
        childList: true,
        subtree: true,
    });
})();