// ==UserScript==
// @name         访问限制（自律）
// @namespace    http://tampermonkey.net/
// @version      1.0.0
// @description  访问限制（自律）
// @author       HuSHeng
// @match        *://*/*
// @grant        GM_registerMenuCommand
// @grant        GM_setValue
// @grant        GM_getValue
// @grant        GM_addStyle
// ==/UserScript==

(function () {
    'use strict';

    let domains = GM_getValue('domains', []);

    GM_registerMenuCommand('管理列表', openDomainManager);

    const currentHost = window.location.hostname;
    const matched = domains.some(domain => currentHost.includes(domain));
    if (matched) {
        console.log(`✅ 当前域名匹配配置：${currentHost}`);
        const mask = document.createElement('div');
        mask.className = 'domain-block-mask';
        mask.innerHTML = `
            <div class="domain-block-text">🚫 页面禁止访问</div>
        `;
        document.documentElement.appendChild(mask);
        addStyle();
    }

    function openDomainManager() {
        // 防止重复打开弹窗
        if (document.querySelector('.domain-modal')) {
            return;
        }

        const modal = document.createElement('div');
        modal.className = 'domain-modal';
        modal.innerHTML = `
            <div class="domain-modal-overlay"></div>
            <div class="domain-modal-content">
                <div class="domain-modal-header">
                    <h2>🌐 页面访问管理</h2>
                    <p class="domain-modal-subtitle">管理需要限制访问的网站域名</p>
                </div>

                <div class="domain-modal-body">
                    <div class="domain-input-section">
                        <div class="input-group">
                            <input type="text"
                                   placeholder="输入域名，如：example.com"
                                   class="domain-input"
                                   value="${window.location.hostname}" />
                            <button class="domain-btn domain-btn-primary domain-add">
                                <span class="btn-icon">+</span>
                                添加域名
                            </button>
                        </div>
                        <p class="input-hint">当前页面域名已自动填充，可直接添加</p>
                    </div>

                    <div class="domain-list-section">
                        <div class="section-header">
                            <h3>已管理的域名列表</h3>
                            <span class="domain-count">${domains.length} 个域名</span>
                        </div>
                        <div class="domain-list-container">
                            <ul class="domain-list"></ul>
                        </div>
                    </div>
                </div>

                <div class="domain-modal-footer">
                    <button class="domain-btn domain-btn-secondary domain-close">
                        完成
                    </button>
                </div>
            </div>
        `;

        document.body.appendChild(modal);
        document.body.style.overflow = 'hidden';

        const list = modal.querySelector('.domain-list');
        const input = modal.querySelector('.domain-input');
        const addBtn = modal.querySelector('.domain-add');
        const closeBtn = modal.querySelector('.domain-close');
        const domainCount = modal.querySelector('.domain-count');

        function refreshList() {
            list.innerHTML = '';

            if (domains.length === 0) {
                list.innerHTML = `
                    <li class="domain-empty-state">
                        <div class="empty-icon">📝</div>
                        <div class="empty-text">暂无管理的域名</div>
                        <div class="empty-hint">添加的域名将显示在这里</div>
                    </li>
                `;
                domainCount.textContent = '0 个域名';
                return;
            }

            domainCount.textContent = `${domains.length} 个域名`;

            domains.forEach((domain, i) => {
                const li = document.createElement('li');
                li.className = 'domain-item';
                li.innerHTML = `
                    <div class="domain-info">
                        <span class="domain-icon">🌐</span>
                        <span class="domain-text">${domain}</span>
                    </div>
                    <button class="domain-btn domain-btn-danger domain-del" title="删除域名">
                        <span class="btn-icon">×</span>
                        删除
                    </button>
                `;

                li.querySelector('.domain-del').onclick = () => {
                    domains.splice(i, 1);
                    GM_setValue('domains', domains);
                    refreshList();
                };

                list.appendChild(li);
            });
        }

        refreshList();

        function addDomain() {
            const val = input.value.trim();
            if (!val) {
                showMessage('请输入域名', 'error');
                input.focus();
                return;
            }

            if (!isValidDomain(val)) {
                showMessage('请输入有效的域名格式', 'error');
                input.focus();
                return;
            }

            if (!domains.includes(val)) {
                domains.push(val);
                GM_setValue('domains', domains);
                refreshList();
                input.value = '';
                showMessage('域名添加成功', 'success');
            } else {
                showMessage('该域名已存在', 'warning');
            }
        }

        addBtn.onclick = addDomain;

        input.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                addDomain();
            }
        });

        function closeModal() {
            modal.classList.add('closing');
            setTimeout(() => {
                modal.remove();
                document.body.style.overflow = '';
            }, 300);
        }

        closeBtn.onclick = closeModal;
        modal.querySelector('.domain-modal-overlay').onclick = closeModal;

        // ESC键关闭
        document.addEventListener('keydown', function escHandler(e) {
            if (e.key === 'Escape') {
                closeModal();
                document.removeEventListener('keydown', escHandler);
            }
        });

        input.focus();
        addStyle();
    }

    /** 简单的域名验证 */
    function isValidDomain(domain) {
        return domain.length > 0 && domain.length < 253 && /^[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(domain);
    }

    function showMessage(message, type = 'info') {
        const existingMsg = document.querySelector('.domain-message');
        if (existingMsg) {
            existingMsg.remove();
        }

        const messageEl = document.createElement('div');
        messageEl.className = `domain-message domain-message-${type}`;
        messageEl.textContent = message;

        document.body.appendChild(messageEl);

        // 显示动画
        setTimeout(() => messageEl.classList.add('show'), 10);

        // 自动隐藏
        setTimeout(() => {
            messageEl.classList.remove('show');
            setTimeout(() => messageEl.remove(), 300);
        }, 3000);
    }

    /** 注入样式 */
    function addStyle() {
        if (document.getElementById('domain-style')) {
            return;
        }

        const style = document.createElement('style');
        style.id = 'domain-style';
        style.textContent = `
            .domain-modal {
                position: fixed;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                z-index: 10000;
                display: flex;
                justify-content: center;
                align-items: center;
                animation: domainFadeIn 0.3s ease-out;
                font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'PingFang SC', 'Microsoft YaHei', sans-serif;
            }

            .domain-modal.closing {
                animation: domainFadeOut 0.3s ease-in forwards;
            }

            .domain-modal-overlay {
                position: absolute;
                inset: 0;
                background: rgba(0, 0, 0, 0.5);
                backdrop-filter: blur(8px);
            }

            .domain-modal-content {
                position: relative;
                background: #ffffff;
                border-radius: 16px;
                padding: 0;
                width: 90%;
                max-width: 500px;
                max-height: 85vh;
                overflow: hidden;
                box-shadow: 0 20px 60px rgba(0, 0, 0, 0.2);
                z-index: 1;
                animation: domainSlideIn 0.3s ease-out;
                display: flex;
                flex-direction: column;
            }

            .domain-modal.closing .domain-modal-content {
                animation: domainSlideOut 0.3s ease-in forwards;
            }

            .domain-modal-header {
                padding: 24px 24px 16px;
                background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                color: white;
            }

            .domain-modal-header h2 {
                margin: 0 0 4px;
                font-size: 20px;
                font-weight: 600;
            }

            .domain-modal-subtitle {
                margin: 0;
                opacity: 0.9;
                font-size: 14px;
            }

            .domain-modal-body {
                padding: 24px;
                flex: 1;
                overflow-y: auto;
            }

            .domain-input-section {
                margin-bottom: 24px;
            }

            .input-group {
                display: flex;
                gap: 12px;
                margin-bottom: 8px;
            }

            .domain-input {
                flex: 1;
                padding: 12px 16px;
                border: 2px solid #e1e5e9;
                border-radius: 10px;
                font-size: 14px;
                transition: all 0.2s ease;
                background: #f8f9fa;
            }

            .domain-input:focus {
                outline: none;
                border-color: #667eea;
                background: white;
                box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
            }

            .input-hint {
                margin: 0;
                font-size: 12px;
                color: #6c757d;
            }

            .domain-list-section {
                border-top: 1px solid #e9ecef;
                padding-top: 20px;
            }

            .section-header {
                display: flex;
                justify-content: space-between;
                align-items: center;
                margin-bottom: 16px;
            }

            .section-header h3 {
                margin: 0;
                font-size: 16px;
                font-weight: 600;
                color: #2d3748;
            }

            .domain-count {
                font-size: 12px;
                color: #6c757d;
                background: #f8f9fa;
                padding: 4px 8px;
                border-radius: 12px;
            }

            .domain-list-container {
                max-height: 300px;
                overflow-y: auto;
                border-radius: 10px;
                background: #f8f9fa;
            }

            .domain-list {
                list-style: none;
                padding: 0;
                margin: 0;
            }

            .domain-item {
                display: flex;
                justify-content: space-between;
                align-items: center;
                padding: 12px 16px;
                background: white;
                margin: 8px;
                border-radius: 8px;
                box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
                transition: all 0.2s ease;
            }

            .domain-item:hover {
                box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
                transform: translateY(-1px);
            }

            .domain-info {
                display: flex;
                align-items: center;
                gap: 8px;
            }

            .domain-icon {
                font-size: 16px;
            }

            .domain-text {
                font-weight: 500;
                color: #2d3748;
            }

            .domain-empty-state {
                padding: 40px 20px;
                text-align: center;
                color: #6c757d;
            }

            .empty-icon {
                font-size: 48px;
                margin-bottom: 12px;
                opacity: 0.5;
            }

            .empty-text {
                font-size: 16px;
                font-weight: 500;
                margin-bottom: 4px;
            }

            .empty-hint {
                font-size: 14px;
                opacity: 0.7;
            }

            .domain-modal-footer {
                padding: 20px 24px;
                background: #f8f9fa;
                border-top: 1px solid #e9ecef;
                text-align: right;
            }

            .domain-btn {
                padding: 10px 20px;
                border: none;
                border-radius: 10px;
                cursor: pointer;
                font-size: 14px;
                font-weight: 500;
                transition: all 0.2s ease;
                display: inline-flex;
                align-items: center;
                gap: 6px;
            }

            .domain-btn:disabled {
                opacity: 0.6;
                cursor: not-allowed;
            }

            .domain-btn-primary {
                background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                color: white;
            }

            .domain-btn-primary:hover:not(:disabled) {
                transform: translateY(-1px);
                box-shadow: 0 4px 12px rgba(102, 126, 234, 0.3);
            }

            .domain-btn-secondary {
                background: #6c757d;
                color: white;
            }

            .domain-btn-secondary:hover:not(:disabled) {
                background: #5a6268;
                transform: translateY(-1px);
            }

            .domain-btn-danger {
                background: #e53e3e;
                color: white;
                padding: 6px 12px;
                font-size: 12px;
            }

            .domain-btn-danger:hover:not(:disabled) {
                background: #c53030;
                transform: translateY(-1px);
            }

            .btn-icon {
                font-weight: bold;
            }

            .domain-message {
                position: fixed;
                top: 20px;
                left: 50%;
                transform: translateX(-50%) translateY(-20px);
                padding: 12px 20px;
                border-radius: 10px;
                color: white;
                font-weight: 500;
                z-index: 10001;
                opacity: 0;
                transition: all 0.3s ease;
                box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
            }

            .domain-message.show {
                transform: translateX(-50%) translateY(0);
                opacity: 1;
            }

            .domain-message-success {
                background: #38a169;
            }

            .domain-message-error {
                background: #e53e3e;
            }

            .domain-message-warning {
                background: #dd6b20;
            }

            @keyframes domainFadeIn {
                from { opacity: 0; }
                to { opacity: 1; }
            }

            @keyframes domainFadeOut {
                from { opacity: 1; }
                to { opacity: 0; }
            }

            @keyframes domainSlideIn {
                from {
                    transform: scale(0.9) translateY(-20px);
                    opacity: 0;
                }
                to {
                    transform: scale(1) translateY(0);
                    opacity: 1;
                }
            }

            @keyframes domainSlideOut {
                from {
                    transform: scale(1) translateY(0);
                    opacity: 1;
                }
                to {
                    transform: scale(0.9) translateY(20px);
                    opacity: 0;
                }
            }

            /* 滚动条样式 */
            .domain-list-container::-webkit-scrollbar {
                width: 6px;
            }

            .domain-list-container::-webkit-scrollbar-track {
                background: #f1f1f1;
                border-radius: 3px;
            }

            .domain-list-container::-webkit-scrollbar-thumb {
                background: #c1c1c1;
                border-radius: 3px;
            }

            .domain-list-container::-webkit-scrollbar-thumb:hover {
                background: #a8a8a8;
            }

            .domain-block-mask {
                position: fixed;
                top: 0; left: 0;
                width: 100vw; height: 100vh;
                background: rgba(0, 0, 0, 0.6);
                backdrop-filter: blur(8px);
                z-index: 2147483647;
                display: flex;
                justify-content: center;
                align-items: center;
                color: white;
                font-size: 28px;
                font-weight: bold;
                font-family: "Segoe UI", "PingFang SC", sans-serif;
                animation: fadeIn 0.3s ease-out;
            }
            .domain-block-text {
                background: rgba(0,0,0,0.4);
                padding: 20px 40px;
                border-radius: 12px;
                box-shadow: 0 0 20px rgba(255,255,255,0.2);
            }
            @keyframes fadeIn {
                from {opacity: 0;}
                to {opacity: 1;}
            }
            @keyframes slideIn {
                from {transform: translateY(-10px); opacity: 0;}
                to {transform: translateY(0); opacity: 1;}
            }
        `;

        document.head.appendChild(style);
    }
})();