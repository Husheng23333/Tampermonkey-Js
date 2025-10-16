// ==UserScript==
// @name         Dify聊天框
// @version      0.1.0
// @description  在任意网页右下角显示 Dify 聊天组件
// @match        *://*/*
// @author       HuSheng
// @run-at       document-end
// @license       GPL-2.0-only
// @grant        none
// @noframes
// ==/UserScript==

(function () {
    'use strict';

    const DIFY_API_URL = "http://localhost/v1";
    const DIFY_API_KEY = "app-zzhclPAWHGq4hucUM8N7jMXG";

    // CDN 依赖
    const MARKED_JS = "https://cdn.jsdelivr.net/npm/marked/marked.min.js";
    const HLJS_CSS = "https://cdnjs.cloudflare.com/ajax/libs/highlight.js/11.9.0/styles/github-dark.min.css";
    const HLJS_CORE = "https://cdnjs.cloudflare.com/ajax/libs/highlight.js/11.9.0/highlight.min.js";
    const HLJS_LANGS = [
        "https://cdnjs.cloudflare.com/ajax/libs/highlight.js/11.9.0/languages/python.min.js",
        "https://cdnjs.cloudflare.com/ajax/libs/highlight.js/11.9.0/languages/javascript.min.js",
        "https://cdnjs.cloudflare.com/ajax/libs/highlight.js/11.9.0/languages/java.min.js",
        "https://cdnjs.cloudflare.com/ajax/libs/highlight.js/11.9.0/languages/cpp.min.js",
        "https://cdnjs.cloudflare.com/ajax/libs/highlight.js/11.9.0/languages/xml.min.js"
    ];

    // ---------------- 工具函数 ----------------
    function loadScript(src) {
        return new Promise((resolve, reject) => {
            if (document.querySelector(`script[src="${src}"]`)) return resolve();
            const s = document.createElement('script');
            s.src = src;
            s.onload = () => resolve();
            s.onerror = () => reject(new Error(`加载脚本失败: ${src}`));
            document.head.appendChild(s);
        });
    }

    function loadCss(href) {
        return new Promise((resolve, reject) => {
            if (document.querySelector(`link[href="${href}"]`)) return resolve();
            const l = document.createElement('link');
            l.rel = 'stylesheet';
            l.href = href;
            l.onload = () => resolve();
            l.onerror = () => reject(new Error(`加载样式失败: ${href}`));
            document.head.appendChild(l);
        });
    }

    function injectStyle(cssText) {
        const style = document.createElement('style');
        style.textContent = cssText;
        document.head.appendChild(style);
    }

    function onReady(fn) {
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', fn);
        } else {
            fn();
        }
    }

    // ---------------- 样式注入 ----------------
    const cssText = `
        * { margin: 0; padding: 0; box-sizing: border-box; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; }
        #difyChatBtn { position: fixed; bottom: 25px; right: 25px; width: 60px; height: 60px; background: linear-gradient(135deg, #4361ee, #3a0ca3); border-radius: 50%; box-shadow: 0 6px 20px rgba(67, 97, 238, 0.4); display: flex; align-items: center; justify-content: center; color: white; font-size: 26px; cursor: pointer; transition: all 0.3s ease; z-index: 2147483647; border: none; }
        #difyChatBtn:hover { transform: scale(1.1) rotate(10deg); box-shadow: 0 8px 25px rgba(67, 97, 238, 0.6); }
        #difyChatBox { position: fixed; bottom: 100px; right: 25px; width: 380px; height: 560px; background: #fff; border-radius: 16px; box-shadow: 0 10px 30px rgba(0, 0, 0, 0.2); display: none; flex-direction: column; overflow: hidden; z-index: 2147483646; animation: fadeInUp 0.3s ease; border: 1px solid rgba(0, 0, 0, 0.05); }
        @keyframes fadeInUp { from { opacity: 0; transform: translateY(20px);} to { opacity: 1; transform: translateY(0);} }
        #difyChatHeader { background: linear-gradient(135deg, #4361ee, #3a0ca3); color: white; padding: 16px; font-weight: 600; text-align: center; position: relative; display: flex; align-items: center; justify-content: center; gap: 8px; }
        #difyChatClose { position: absolute; right: 16px; top: 50%; transform: translateY(-50%); cursor: pointer; font-size: 18px; width: 28px; height: 28px; display: flex; align-items: center; justify-content: center; border-radius: 50%; transition: background 0.2s; }
        #difyChatClose:hover { background: rgba(255, 255, 255, 0.2); }
        #difyChatBody { flex: 1; padding: 16px; overflow-y: auto; background: #f8f9fa; display: flex; flex-direction: column; gap: 16px; }
        .dify-msg { display: flex; margin-bottom: 0; }
        .dify-user { justify-content: flex-end; }
        .dify-bot { justify-content: flex-start; }
        .dify-msg-content { max-width: 80%; padding: 12px 16px; border-radius: 18px; line-height: 1.5; word-wrap: break-word; box-shadow: 0 2px 5px rgba(0, 0, 0, 0.05); }
        .dify-user .dify-msg-content { background: linear-gradient(135deg, #4361ee, #3a0ca3); color: white; border-bottom-right-radius: 6px; }
        .dify-bot .dify-msg-content { background: white; color: #333; border: 1px solid #e9ecef; border-bottom-left-radius: 6px; }
        .dify-bot .dify-msg-content h1, .dify-bot .dify-msg-content h2, .dify-bot .dify-msg-content h3 { margin-top: 8px; margin-bottom: 8px; color: #4361ee; }
        .dify-bot .dify-msg-content p { margin-bottom: 8px; }
        .dify-bot .dify-msg-content pre { background: #1e1e1e; padding: 12px; border-radius: 8px; overflow-x: auto; margin: 8px 0; position: relative; }
        .dify-bot .dify-msg-content code { background: #f1f3f4; padding: 2px 6px; border-radius: 4px; font-family: 'Courier New', Courier, monospace; color: #d63384; font-size: 0.9em; }
        .dify-bot .dify-msg-content pre code { background: none; padding: 0; color: inherit; font-size: 0.85em; }
        .dify-bot .dify-msg-content blockquote { border-left: 4px solid #4361ee; padding-left: 12px; margin: 8px 0; color: #6c757d; font-style: italic; }
        .dify-bot .dify-msg-content ul, .dify-bot .dify-msg-content ol { margin-left: 20px; margin-bottom: 8px; }
        .dify-bot .dify-msg-content li { margin-bottom: 4px; }
        .dify-bot .dify-msg-content table { width: 100%; border-collapse: collapse; margin: 8px 0; font-size: 0.9em; }
        .dify-bot .dify-msg-content th, .dify-bot .dify-msg-content td { border: 1px solid #dee2e6; padding: 8px 12px; text-align: left; }
        .dify-bot .dify-msg-content th { background: #f8f9fa; font-weight: 600; }
        #difyChatInput { display: flex; border-top: 1px solid #e9ecef; background: white; padding: 12px; gap: 8px; }
        #difyInput { flex: 1; padding: 12px; border: 1px solid #e9ecef; border-radius: 24px; resize: none; outline: none; font-size: 14px; transition: border 0.3s; max-height: 120px; line-height: 1.4; overflow-y: auto; -ms-overflow-style: none; scrollbar-width: none; }
        #difyInput::-webkit-scrollbar { display: none; }
        #difyInput:focus { border-color: #4361ee; box-shadow: 0 0 0 2px rgba(67, 97, 238, 0.1); }
        #difySendBtn { background: linear-gradient(135deg, #4361ee, #3a0ca3); color: white; border: none; border-radius: 50%; width: 44px; height: 44px; cursor: pointer; font-size: 16px; transition: all 0.3s; display: flex; align-items: center; justify-content: center; }
        #difySendBtn:hover { transform: scale(1.05); box-shadow: 0 4px 10px rgba(67, 97, 238, 0.3); }
        #difySendBtn:disabled { background: #adb5bd; cursor: not-allowed; transform: none; box-shadow: none; }
        .typing-indicator { display: flex; align-items: center; gap: 4px; padding: 8px 16px; color: #6c757d; font-style: italic; }
        .typing-dot { width: 8px; height: 8px; background: #4361ee; border-radius: 50%; animation: typing 1.4s infinite ease-in-out; }
        .typing-dot:nth-child(1) { animation-delay: -0.32s; }
        .typing-dot:nth-child(2) { animation-delay: -0.16s; }
        @keyframes typing { 0%, 80%, 100% { transform: scale(0.8); opacity: 0.5; } 40% { transform: scale(1); opacity: 1; } }
        .empty-state { text-align: center; color: #6c757d; padding: 40px 20px; flex: 1; display: flex; flex-direction: column; justify-content: center; align-items: center; }
        .empty-state i { font-size: 48px; margin-bottom: 16px; color: #dee2e6; }
        .empty-state p { margin-bottom: 8px; line-height: 1.5; }
        #difyChatBody::-webkit-scrollbar { width: 6px; }
        #difyChatBody::-webkit-scrollbar-track { background: #f1f1f1; border-radius: 10px; }
        #difyChatBody::-webkit-scrollbar-thumb { background: #c1c1c1; border-radius: 10px; }
        #difyChatBody::-webkit-scrollbar-thumb:hover { background: #a8a8a8; }
        .code-language { position: absolute; top: 0; right: 8px; background: rgba(255, 255, 255, 0.1); color: #ccc; padding: 2px 8px; font-size: 0.7em; border-radius: 0 0 4px 4px; font-family: 'Courier New', Courier, monospace; }
        #difyChatBtn::before { content: "Ai"; }
        #difySendBtn::before { content: "➤"; }
        #difyChatClose::before { content: "✖"; }
    `;

    // ---------------- 逻辑 ----------------
    async function ensureDeps() {
        await loadCss(HLJS_CSS);
        await loadScript(MARKED_JS);
        await loadScript(HLJS_CORE);
        for (const lang of HLJS_LANGS) {
            try { // 语言可选，失败不中断
                // eslint-disable-next-line no-await-in-loop
                await loadScript(lang);
            } catch (e) {}
        }
        if (window.hljs) {
            window.hljs.configure({ tabReplace: '    ', classPrefix: 'hljs-' });
        }
        if (window.marked) {
            window.marked.setOptions({
                breaks: true,
                gfm: true,
                highlight: function (code, lang) {
                    if (lang && window.hljs && window.hljs.getLanguage(lang)) {
                        try { return window.hljs.highlight(code, { language: lang }).value; } catch (err) {}
                    }
                    return window.hljs ? window.hljs.highlightAuto(code).value : code;
                }
            });
        }
    }

    function buildUI() {
        // 按钮
        const btn = document.createElement('button');
        btn.id = 'difyChatBtn';

        // 对话框
        const box = document.createElement('div');
        box.id = 'difyChatBox';

        const header = document.createElement('div');
        header.id = 'difyChatHeader';
        header.appendChild(document.createTextNode('Dify AI助手'));

        const close = document.createElement('span');
        close.id = 'difyChatClose';
        header.appendChild(close);

        const body = document.createElement('div');
        body.id = 'difyChatBody';

        const empty = document.createElement('div');
        empty.className = 'empty-state';
        const p1 = document.createElement('p'); p1.textContent = '您好！我是您的AI助手';
        const p2 = document.createElement('p'); p2.textContent = '有什么我可以帮助您的吗？';
        empty.appendChild(p1); empty.appendChild(p2);
        body.appendChild(empty);

        const inputBox = document.createElement('div');
        inputBox.id = 'difyChatInput';

        const textarea = document.createElement('textarea');
        textarea.id = 'difyInput';
        textarea.rows = 1;
        textarea.placeholder = '输入您的问题...';

        const sendBtn = document.createElement('button');
        sendBtn.id = 'difySendBtn';

        inputBox.appendChild(textarea);
        inputBox.appendChild(sendBtn);

        box.appendChild(header);
        box.appendChild(body);
        box.appendChild(inputBox);

        document.body.appendChild(btn);
        document.body.appendChild(box);

        return { btn, box, close, body, textarea, sendBtn };
    }

    function appendMessage(bodyEl, sender, text) {
        const div = document.createElement('div');
        div.classList.add('dify-msg', `dify-${sender}`);

        const contentDiv = document.createElement('div');
        contentDiv.classList.add('dify-msg-content');

        if (sender === 'user') {
            contentDiv.textContent = text;
        } else {
            if (window.marked) {
                contentDiv.innerHTML = window.marked.parse(text);
            } else {
                contentDiv.textContent = text;
            }
        }

        div.appendChild(contentDiv);
        bodyEl.appendChild(div);
        bodyEl.scrollTop = bodyEl.scrollHeight;
        return div;
    }

    async function sendMessage(ctx) {
        const { textarea, body, sendBtn } = ctx;
        const msg = textarea.value.trim();
        if (!msg) return;

        // 如果是第一次发送消息，移除欢迎信息
        const empty = body.querySelector('.empty-state');
        if (empty) empty.remove();

        appendMessage(body, 'user', msg);
        textarea.value = '';
        textarea.style.height = 'auto';
        textarea.disabled = true;
        sendBtn.disabled = true;

        try {
            let difyUserId = localStorage.getItem('dify_user_id');
            if (!difyUserId) {
                difyUserId = 'web-' + Math.random().toString(36).substring(2, 10);
                localStorage.setItem('dify_user_id', difyUserId);
            }

            const resp = await fetch(`${DIFY_API_URL}/chat-messages`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${DIFY_API_KEY}`
                },
                body: JSON.stringify({ inputs: {}, query: msg, response_mode: 'streaming', user: difyUserId })
            });

            if (!resp.ok) throw new Error(`API请求失败: ${resp.status}`);

            const botDiv = appendMessage(body, 'bot', '');
            const botContent = botDiv.querySelector('.dify-msg-content');

            const reader = resp.body.getReader();
            const decoder = new TextDecoder('utf-8');
            let buffer = '';
            let fullAnswer = '';

            while (true) {
                const { done, value } = await reader.read();
                if (done) break;
                buffer += decoder.decode(value, { stream: true });
                const parts = buffer.split("\n\n");
                buffer = parts.pop();
                for (const part of parts) {
                    if (part.startsWith('data: ')) {
                        const jsonStr = part.slice(6).trim();
                        if (jsonStr === '[DONE]') break;
                        try {
                            const data = JSON.parse(jsonStr);
                            if (data.answer) {
                                fullAnswer += data.answer;
                                botContent.innerHTML = window.marked ? window.marked.parse(fullAnswer) : fullAnswer;
                                botContent.querySelectorAll('pre code').forEach((block) => {
                                    const pre = block.parentElement;
                                    const lang = (block.className || '').replace('language-', '') || 'text';
                                    if (!pre.querySelector('.code-language')) {
                                        const langLabel = document.createElement('div');
                                        langLabel.className = 'code-language';
                                        langLabel.textContent = lang;
                                        pre.appendChild(langLabel);
                                    }
                                });
                                body.scrollTop = body.scrollHeight;
                            }
                        } catch (e) {
                            // 忽略单条解析错误
                        }
                    }
                }
            }
        } catch (err) {
            appendMessage(body, 'bot', '抱歉，请求失败，请稍后重试。');
            // 控制台输出错误
            try { console.error('Dify API 请求错误:', err); } catch (_) {}
        } finally {
            textarea.disabled = false;
            sendBtn.disabled = false;
            textarea.focus();
        }
    }

    onReady(async () => {
        try {
            injectStyle(cssText);
            await ensureDeps();

            const ctx = buildUI();

            const { btn, box, close, body, textarea, sendBtn } = ctx;

            btn.addEventListener('click', () => {
                box.style.display = 'flex';
                btn.style.display = 'none';
                textarea.focus();
            });

            close.addEventListener('click', () => {
                box.style.display = 'none';
                btn.style.display = 'flex';
            });

            sendBtn.addEventListener('click', () => sendMessage(ctx));
            textarea.addEventListener('keydown', (e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    sendMessage(ctx);
                }
            });
            textarea.addEventListener('input', function () {
                this.style.height = 'auto';
                this.style.height = this.scrollHeight + 'px';
            });
        } catch (e) {
            try { console.error('Dify Chat Widget 初始化失败:', e); } catch (_) {}
        }
    });
})();


