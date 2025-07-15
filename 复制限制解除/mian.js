// ==UserScript==
// @name         为什么不让我复制？（解除如飞书、钉钉、百度文库等的复制限制）
// @namespace    http://tampermonkey.net/
// @version      2.0
// @description  恢复被网站禁用的复制功能，例如飞书、钉钉、百度文库等。支持右键菜单复制，支持ctrl+c、command+c复制
// @author       HuSheng
// @match        *://*/*
// @grant        GM_registerMenuCommand
// @grant        GM_getValue
// @grant        GM_setValue
// @run-at       document-start
// @license      GPL-2.0-only
// @downloadURL  https://raw.githubusercontent.com/Husheng23333/Tampermonkey-Js/refs/heads/main/%E5%A4%8D%E5%88%B6%E9%99%90%E5%88%B6%E8%A7%A3%E9%99%A4/mian.js
// @updateURL    https://raw.githubusercontent.com/Husheng23333/Tampermonkey-Js/refs/heads/main/%E5%A4%8D%E5%88%B6%E9%99%90%E5%88%B6%E8%A7%A3%E9%99%A4/mian.js
// ==/UserScript==

(function() {
    'use strict';

    // 获取用户设置
    let enabled = GM_getValue('enabled_114514', true);

    // 注册菜单
    GM_registerMenuCommand(enabled ? "已启用（点我可关闭）" : "已禁用（点我可开启）", function() {
        enabled = !enabled;
        GM_setValue('enabled_114514', enabled);
        location.reload();
    });

    // 原始事件
    const originalAddEventListener = EventTarget.prototype.addEventListener;
    const originalPreventDefault = Event.prototype.preventDefault;
    const originalStopPropagation = Event.prototype.stopPropagation;
    const originalStopImmediatePropagation = Event.prototype.stopImmediatePropagation;

    // 覆盖addEventListener
    EventTarget.prototype.addEventListener = function(type, listener, options) {
        if (!enabled) {
            return originalAddEventListener.call(this, type, listener, options);
        }

        if (type === 'copy') {
            return;
        }

        // 拦截Ctrl+C、Command+C
        if (type === 'keydown') {
            const listenerStr = listener.toString();
            if (listenerStr.includes('keyCode:67') ||
                listenerStr.includes('keyCode===67') ||
                listenerStr.includes('key:"c"') ||
                (listenerStr.includes('ctrlKey') && listenerStr.includes('67')) ||
                (listenerStr.includes('metaKey') && listenerStr.includes('67'))) {
                return;
            }
        }
        originalAddEventListener.call(this, type, listener, options);
    };

    // 覆盖事件方法
    Event.prototype.preventDefault = function() {
        if (!enabled) {
            return originalPreventDefault.call(this);
        }

        if (this.type === 'copy' || (this.type === 'keydown' && this.keyCode === 67 && (this.ctrlKey || this.metaKey))) {
            return;
        }
        originalPreventDefault.call(this);
    };

    Event.prototype.stopPropagation = function() {
        if (!enabled) {
            return originalStopPropagation.call(this);
        }

        if (this.type === 'copy' || (this.type === 'keydown' && this.keyCode === 67 && (this.ctrlKey || this.metaKey))) {
            return;
        }
        originalStopPropagation.call(this);
    };

    Event.prototype.stopImmediatePropagation = function() {
        if (!enabled) {
            return originalStopImmediatePropagation.call(this);
        }

        if (this.type === 'copy' || (this.type === 'keydown' && this.keyCode === 67 && (this.ctrlKey || this.metaKey))) {
            return;
        }
        originalStopImmediatePropagation.call(this);
    };

    // 添加右键菜单复制支持
    document.addEventListener('contextmenu', function(e) {
        if (!enabled) {
            return;
        }
        e.stopImmediatePropagation();
    }, true);
})();