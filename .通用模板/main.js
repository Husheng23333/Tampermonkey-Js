(function () {
    'use strict';

    // xpath
    const xpaths_css = [];
    const xpaths_del = [];
    const xpaths_set = [];

    // CSS
    const css_css = [
        {key: '#test', value: 'display: none; color: red;', sleep: 0},
    ];
    const css_del = [
        {key: '#test', clazzList: ['class1', 'class2'], sleep: 0},
    ];
    const css_set = [
        {key: '#test', value: {attr1: 'value1', attr2: 'value2'}, sleep: 0},
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

    function debounce(func, wait) {
        let timeout;
        return function (...args) {
            const context = this;
            clearTimeout(timeout);
            timeout = setTimeout(() => func.apply(context, args), wait);
        };
    }

    // 修改元素样式
    async function modifyElementStyles() {
        // xpath方式
        for (const xpath of xpaths_css) {
            if (xpath.sleep > 0) {
                await delay(xpath.sleep);
            }

            try {
                const snapshot = document.evaluate(
                    xpath.key,
                    document,
                    null,
                    XPathResult.ORDERED_NODE_SNAPSHOT_TYPE,
                    null
                );

                for (let i = 0; i < snapshot.snapshotLength; i++) {
                    const element = snapshot.snapshotItem(i);
                    if (element) {
                        applyCSSStyles(element, xpath.value);
                    }
                }

                if (snapshot.snapshotLength === 0 && xpath.key) {
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

    // 删除 class
    async function deleteClazz() {
        // xpath 删除 class
        for (const item of xpaths_del) {
            if (item.sleep > 0) {
                await delay(item.sleep);
            }

            try {
                const snapshot = document.evaluate(
                    item.key,
                    document,
                    null,
                    XPathResult.ORDERED_NODE_SNAPSHOT_TYPE,
                    null
                );

                for (let i = 0; i < snapshot.snapshotLength; i++) {
                    const element = snapshot.snapshotItem(i);
                    if (element && item.clazzList && item.clazzList.length > 0) {
                        item.clazzList.forEach(clazz => {
                            element.classList.remove(clazz);
                        });
                    }
                }
            } catch (e) {
                console.error(`XPath删除class错误：${item.key}`, e);
            }
        }

        // CSS 删除 class
        for (const item of css_del) {
            if (item.sleep > 0) {
                await delay(item.sleep);
            }

            try {
                const elements = document.querySelectorAll(item.key);
                if (elements.length > 0) {
                    elements.forEach(element => {
                        if (item.clazzList && item.clazzList.length > 0) {
                            item.clazzList.forEach(clazz => {
                                element.classList.remove(clazz);
                            });
                        }
                    });
                }
            } catch (e) {
                console.error(`CSS删除class错误：${item.key}`, e);
            }
        }
    }

    // 设置元素属性
    async function setAttributes() {
        // xpath 方式设置属性
        for (const item of xpaths_set) {
            if (item.sleep > 0) {
                await delay(item.sleep);
            }

            try {
                const snapshot = document.evaluate(
                    item.key,
                    document,
                    null,
                    XPathResult.ORDERED_NODE_SNAPSHOT_TYPE,
                    null
                );

                for (let i = 0; i < snapshot.snapshotLength; i++) {
                    const element = snapshot.snapshotItem(i);
                    if (element && item.value) {
                        Object.keys(item.value).forEach(attr => {
                            element.setAttribute(attr, item.value[attr]);
                        });
                    }
                }
            } catch (e) {
                console.error(`XPath设置属性错误：${item.key}`, e);
            }
        }

        // CSS 方式设置属性
        for (const item of css_set) {
            if (item.sleep > 0) {
                await delay(item.sleep);
            }

            try {
                const elements = document.querySelectorAll(item.key);
                if (elements.length > 0) {
                    elements.forEach(element => {
                        if (item.value) {
                            Object.keys(item.value).forEach(attr => {
                                element.setAttribute(attr, item.value[attr]);
                            });
                        }
                    });
                }
            } catch (e) {
                console.error(`CSS设置属性错误：${item.key}`, e);
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
                deleteClazz();
                setAttributes();
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
        deleteClazz();
        setAttributes();
        observeUrlChanges();

        const debouncedModify = debounce(() => {
            modifyElementStyles();
            deleteClazz();
            setAttributes();
        }, 100);

        const observer = new MutationObserver(function (mutations) {
            debouncedModify();
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