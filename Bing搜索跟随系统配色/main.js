// ==UserScript==
// @name         Bing搜索跟随系统配色（需手动）
// @namespace    http://tampermonkey.net/
// @version      1.0.0
// @match        *://*.bing.com/*
// @grant        none
// @author       HuSheng
// @icon         https://www.google.com/s2/favicons?sz=64&domain=bing.com
// ==/UserScript==

(function () {
    'use strict';

    function waitForElement(selector, callback) {
        const found = document.querySelector(selector);
        if (found) return callback(found);

        const observer = new MutationObserver(() => {
            const el = document.querySelector(selector);
            if (el) {
                observer.disconnect();
                callback(el);
            }
        });

        observer.observe(document.body, { childList: true, subtree: true });
    }

    function needSyncTheme() {
        const systemDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
        const bingDark = document.body.classList.contains('b_drk') ||
            document.body.classList.contains('b_dark') ||
            document.body.classList.contains('dark');
        console.log('系统暗色:', systemDark, '  Bing暗色:', bingDark);
        return systemDark !== bingDark;
    }
    if (!needSyncTheme()) {
        console.log("系统与Bing主题一致，无需切换");
        return;
    }

    console.log("123")

    let id = 'dmrdiodef';
    function isMobile() {
        const ua = navigator.userAgent || navigator.vendor || window.opera;
        return /Android|webOS|iPhone|iPad|iPod|BlackBerry|Windows Phone/i.test(ua);
    }
    if (isMobile()) {
        id = 'dmrdiodef';
    }else{
        id = 'rdiodef';
    }

    waitForElement('#hbradiobtn', () => {
        try {
            const defaultInput = document.getElementById(id);
            if (!defaultInput) {
                console.log('未找到 #' + id + '，无法切换');
                return;
            }

            const defaultA = defaultInput.closest('a.hb_section');
            const isSelected = defaultA && defaultA.getAttribute('aria-checked') === 'true';

            if (!isSelected) {
                defaultInput.click();
            }
        } catch (err) {
            console.error("切换主题时发生异常：", err);
        }
    });

})();
