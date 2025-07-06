// ==UserScript==
// @name         复制限制解除
// @namespace    http://tampermonkey.net/
// @version      1.0
// @description  恢复被网站禁用的复制功能，例如飞书、钉钉、百度文库等。支持右键菜单复制，支持ctrl+c、command+c复制
// @author       HuSheng
// @match        *://*/*
// @grant        none
// @run-at       document-start
// @license      GPL-2.0-only
// @downloadURL  https://raw.githubusercontent.com/Husheng23333/Tampermonkey-Js/refs/heads/main/%E5%A4%8D%E5%88%B6%E9%99%90%E5%88%B6%E8%A7%A3%E9%99%A4/mian.js
// @updateURL    https://raw.githubusercontent.com/Husheng23333/Tampermonkey-Js/refs/heads/main/%E5%A4%8D%E5%88%B6%E9%99%90%E5%88%B6%E8%A7%A3%E9%99%A4/mian.js
// ==/UserScript==

(function() {
    'use strict';

    const originalAddEventListener = EventTarget.prototype.addEventListener;
    const originalPreventDefault = Event.prototype.preventDefault;
    const originalStopPropagation = Event.prototype.stopPropagation;
    const originalStopImmediatePropagation = Event.prototype.stopImmediatePropagation;

    // 覆盖addEventListener
    EventTarget.prototype.addEventListener = function(type, listener, options) {
        if (type === 'copy' || type === 'keydown') {
            return;
        }
        originalAddEventListener.call(this, type, listener, options);
    };

    // 覆盖事件方法
    Event.prototype.preventDefault = function() {
        if (this.type === 'copy' || (this.type === 'keydown' && this.keyCode === 67 && (this.ctrlKey || this.metaKey))) {
            return;
        }
        originalPreventDefault.call(this);
    };

    Event.prototype.stopPropagation = function() {
        if (this.type === 'copy' || (this.type === 'keydown' && this.keyCode === 67 && (this.ctrlKey || this.metaKey))) {
            return;
        }
        originalStopPropagation.call(this);
    };

    Event.prototype.stopImmediatePropagation = function() {
        if (this.type === 'copy' || (this.type === 'keydown' && this.keyCode === 67 && (this.ctrlKey || this.metaKey))) {
            return;
        }
        originalStopImmediatePropagation.call(this);
    };

    // 添加右键菜单复制支持
    document.addEventListener('contextmenu', function(e) {
        e.stopImmediatePropagation();
    }, true);
})();