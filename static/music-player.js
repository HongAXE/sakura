(function() {
    // ==========================================
    // 1. 基础配置
    // ==========================================
    const scriptTag = document.currentScript;
    let JSON_PATH = '/sakura/static/data/playlist.json'; 
    let BASE_URL = '/sakura'; 

    if (scriptTag && scriptTag.src) {
        JSON_PATH = scriptTag.src.replace('music-player.js', 'data/playlist.json');
        BASE_URL = scriptTag.src.substring(0, scriptTag.src.indexOf('/static/music-player.js'));
    }

    let playList = []; 
    let isReady = false; 
    let currentSongIndex = parseInt(localStorage.getItem('sakura-music-index')) || 0;
    let isPlaying = localStorage.getItem('sakura-music-on') === 'true';
    let currentTime = parseFloat(localStorage.getItem('sakura-music-time')) || 0;
    const audio = new Audio();

    // ==========================================
    // 2. 动态注入 HTML 和 CSS
    // ==========================================
    const style = document.createElement('style');
    style.textContent = `
        /* 主播放器与侧边栏基础样式保持不变 */
        #kgri-player { position: fixed; top: 20px; right: 20px; z-index: 1000; background: var(--bg-color, #f6f1e9); border: 2px solid var(--border-dark, #b5a99a); box-shadow: 3px 3px 0 rgba(0, 0, 0, 0.08); display: flex; flex-direction: column; width: 260px; transition: width 0.2s, height 0.2s; font-family: 'Zpix', sans-serif; user-select: none; }
        #kgri-player.collapsed { width: 44px; height: 44px; cursor: pointer; }
        #kgri-player.collapsed .kgri-player-body, #kgri-player.collapsed .kgri-player-btn, #kgri-player.collapsed .kgri-player-header { display: none; }
        #kgri-player.collapsed .kgri-toggle-btn { border: none; box-shadow: none; }
        .kgri-player-header { display: flex; align-items: center; padding: 10px; gap: 10px; background: #fff; border-bottom: 1px dashed var(--border-color, #d3c9bd); }
        .kgri-cover { width: 40px; height: 40px; object-fit: cover; border: 1px solid var(--border-dark, #b5a99a); }
        .kgri-info { flex: 1; min-width: 0; }
        .kgri-title { font-size: 0.85rem; font-weight: 600; color: var(--text-main, #2b2725); white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
        .kgri-artist { font-size: 0.75rem; color: var(--text-sub, #6b6159); white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
        .kgri-toggle-btn { position: absolute; top: -2px; left: -2px; width: 24px; height: 24px; background: var(--bg-color, #f6f1e9); border: 2px solid var(--border-dark, #b5a99a); color: var(--text-main, #2b2725); font-size: 0.8rem; cursor: pointer; display: flex; align-items: center; justify-content: center; z-index: 2; }
        .kgri-player-body { display: flex; align-items: center; justify-content: space-between; padding: 8px 10px; background: var(--bg-color, #f6f1e9); }
        .kgri-controls { display: flex; gap: 8px; align-items: center; }
        .kgri-btn { background: #fff; border: 1px solid var(--border-dark, #b5a99a); color: var(--text-main, #2b2725); cursor: pointer; font-size: 0.9rem; padding: 4px 8px; box-shadow: 1px 1px 0 rgba(0,0,0,0.1); transition: all 0.1s; }
        .kgri-btn:active { transform: translate(1px, 1px); box-shadow: none; }
        .kgri-btn-play { background: var(--sakura-pink, #b04e62); color: #fff; border-color: var(--sakura-dark, #853545); padding: 4px 16px; }
        .kgri-settings-btn { background: transparent; border: none; color: var(--text-sub, #6b6159); font-size: 1.1rem; cursor: pointer; padding: 4px; }
        .kgri-settings-btn:hover { color: var(--sakura-pink, #b04e62); }
        
        #kgri-sidebar { position: fixed; top: 0; right: -360px; width: 340px; height: 100vh; background: var(--bg-color, #f6f1e9); border-left: 2px solid var(--border-dark, #b5a99a); box-shadow: -4px 0 0 rgba(0,0,0,0.05); z-index: 1001; transition: right 0.3s ease; display: flex; flex-direction: column; font-family: 'Zpix', sans-serif; }
        #kgri-sidebar.open { right: 0; }
        .kgri-sidebar-header { display: flex; justify-content: space-between; align-items: center; padding: 16px 20px; border-bottom: 2px solid var(--border-dark, #b5a99a); background: #fff; }
        .kgri-sidebar-header h2 { font-size: 1.1rem; color: var(--text-main, #2b2725); margin: 0; }
        .kgri-close-btn { background: transparent; border: none; font-size: 1.2rem; cursor: pointer; color: var(--text-sub, #6b6159); }
        .kgri-sidebar-content { padding: 20px; overflow-y: auto; flex: 1; }
        .kgri-section-title { font-size: 0.95rem; color: var(--sakura-dark, #853545); margin-bottom: 12px; border-left: 3px solid var(--sakura-pink, #b04e62); padding-left: 8px; font-weight: 600; }
        
        .kgri-playlist { list-style: none; padding: 0; margin: 0 0 24px 0; border: 1px solid var(--border-color, #d3c9bd); background: #fff; min-height: 50px; }
        .kgri-playlist-item { padding: 10px 12px; border-bottom: 1px dashed var(--border-color, #d3c9bd); cursor: pointer; font-size: 0.85rem; color: var(--text-sub, #6b6159); transition: all 0.2s; }
        .kgri-playlist-item:last-child { border-bottom: none; }
        .kgri-playlist-item:hover { background: var(--bg-color, #f6f1e9); color: var(--text-main, #2b2725); }
        .kgri-playlist-item.active { color: var(--sakura-pink, #b04e62); font-weight: 600; background: rgba(176, 78, 98, 0.05); }
        
        #kgri-overlay { position: fixed; inset: 0; background: rgba(0,0,0,0.3); z-index: 1000; display: none; opacity: 0; transition: opacity 0.3s; }
        #kgri-overlay.show { display: block; opacity: 1; }
        
        /* 存储管理 UI */
        .kgri-cache-box { border: 1px solid var(--border-color, #d3c9bd); background: #fff; padding: 12px; margin-bottom: 16px; }
        .kgri-cache-info { font-size: 0.85rem; color: var(--text-sub, #6b6159); margin-bottom: 12px; display: flex; justify-content: space-between; }
        .kgri-clear-btn { width: 100%; padding: 8px; background: var(--bg-color, #f6f1e9); border: 1px solid var(--border-dark, #b5a99a); color: var(--text-main, #2b2725); font-family: inherit; cursor: pointer; box-shadow: 2px 2px 0 rgba(0,0,0,0.05); transition: all 0.1s; }
        .kgri-clear-btn:active { transform: translate(2px, 2px); box-shadow: none; }
        .kgri-clear-btn:hover { border-color: var(--sakura-pink, #b04e62); color: var(--sakura-pink, #b04e62); }
        
        /* ======= 树状图核心样式 ======= */
        .kgri-tree-container { border: 1px solid var(--border-color, #d3c9bd); background: #fff; padding: 10px; max-height: 350px; overflow-y: auto; }
        .kgri-tree-root { list-style: none; padding: 0; margin: 0; font-size: 0.85rem; }
        
        /* 隐藏默认箭头 */
        .kgri-tree details > summary { list-style: none; cursor: pointer; user-select: none; outline: none; }
        .kgri-tree details > summary::-webkit-details-marker { display: none; }
        
        .kgri-tree summary { display: flex; align-items: center; padding: 4px 0; color: var(--text-main); gap: 6px; font-weight: 600; }
        .kgri-tree summary:hover { background: var(--bg-color); }
        
        /* 自定义加减号 */
        .kgri-tree summary::before { content: '+'; display: inline-block; width: 14px; text-align: center; color: var(--text-sub); font-family: monospace; }
        .kgri-tree details[open] > summary::before { content: '-'; }
        
        .kgri-tree ul { list-style: none; padding-left: 20px; margin: 0; border-left: 1px dashed var(--border-color); }
        
        /* 文件节点 */
        .kgri-tree-file { display: flex; align-items: center; justify-content: space-between; padding: 4px 0 4px 20px; color: var(--text-sub); border-bottom: 1px dashed rgba(0,0,0,0.03); }
        .kgri-tree-file:hover { background: var(--bg-color); }
        .kgri-tree-file-left { display: flex; align-items: center; gap: 6px; overflow: hidden; }
        .kgri-tree-type { font-family: monospace; font-size: 0.75rem; color: var(--sakura-pink); background: rgba(176, 78, 98, 0.1); padding: 1px 4px; border-radius: 2px; }
        
        .kgri-tree-name { white-space: nowrap; overflow: hidden; text-overflow: ellipsis; max-width: 150px; }
        
        /* 删除按钮 */
        .kgri-file-del, .kgri-dir-del { background: transparent; border: none; color: #d9534f; cursor: pointer; font-size: 0.8rem; padding: 2px 6px; opacity: 0; transition: opacity 0.2s; }
        .kgri-tree-file:hover .kgri-file-del, .kgri-tree summary:hover .kgri-dir-del { opacity: 1; }
        .kgri-file-del:hover, .kgri-dir-del:hover { text-decoration: underline; }
        
        .kgri-tree-empty { text-align: center; padding: 20px; font-size: 0.85rem; color: var(--text-sub); }
    `;
    document.head.appendChild(style);

    const playerHTML = `
        <div id="kgri-player">
            <button class="kgri-toggle-btn" aria-label="折叠/展开播放器">−</button>
            <div class="kgri-player-header" id="kgri-header-content">
                <div class="kgri-status-text">加载中...</div>
            </div>
            <div class="kgri-player-body">
                <div class="kgri-controls">
                    <button class="kgri-btn kgri-prev" aria-label="上一首">⏮</button>
                    <button class="kgri-btn kgri-btn-play kgri-play" aria-label="播放/暂停">▷</button>
                    <button class="kgri-btn kgri-next" aria-label="下一首">⏭</button>
                </div>
                <button class="kgri-settings-btn kgri-open-settings" aria-label="打开设置">≡</button>
            </div>
        </div>

        <div id="kgri-overlay"></div>

        <div id="kgri-sidebar">
            <div class="kgri-sidebar-header">
                <h2>音乐设置</h2>
                <button class="kgri-close-btn" aria-label="关闭设置">✕</button>
            </div>
            <div class="kgri-sidebar-content">
                <div class="kgri-section-title">播放列表</div>
                <ul class="kgri-playlist" id="kgri-playlist">
                    <li class="kgri-status-text">加载中...</li>
                </ul>

                <div class="kgri-section-title">存储管理</div>
                <div class="kgri-cache-box">
                    <div class="kgri-cache-info">
                        <span>已用空间:</span>
                        <span id="kgri-cache-size">计算中...</span>
                    </div>
                    <button class="kgri-clear-btn" id="kgri-clear-all">清空所有缓存</button>
                </div>
                
                <div class="kgri-tree-container" id="kgri-cache-container">
                    <!-- 树状图动态生成区域 -->
                </div>
            </div>
        </div>
    `;
    document.body.insertAdjacentHTML('beforeend', playerHTML);

    // ==========================================
    // 3. 核心逻辑与数据拉取
    // ==========================================
    const playerEl = document.getElementById('kgri-player');
    const headerContent = document.getElementById('kgri-header-content');
    const playBtn = playerEl.querySelector('.kgri-play');
    const toggleBtn = playerEl.querySelector('.kgri-toggle-btn');
    const sidebar = document.getElementById('kgri-sidebar');
    const overlay = document.getElementById('kgri-overlay');
    const playlistEl = document.getElementById('kgri-playlist');

    async function loadPlaylist() {
        if (window.location.protocol === 'file:') { showStatus('本地预览需启动服务器'); return; }
        try {
            const response = await fetch(JSON_PATH);
            if (!response.ok) throw new Error('网络请求失败');
            playList = await response.json();
            if (!playList || playList.length === 0) { showStatus('暂无歌曲'); return; }
            if (currentSongIndex >= playList.length) currentSongIndex = 0;
            isReady = true;
            initPlayer();
            renderPlaylist();
        } catch (error) {
            console.error('加载歌单失败:', error);
            showStatus('加载失败，请刷新重试');
            playlistEl.innerHTML = '<li class="kgri-status-text" style="color:var(--sakura-pink);">加载失败</li>';
        }
    }

    function showStatus(msg) {
        headerContent.innerHTML = `<div class="kgri-status-text">${msg}</div>`;
        playlistEl.innerHTML = `<li class="kgri-status-text">${msg}</li>`;
    }

    function escapeHTML(str) {
        return str.replace(/[&<>'"]/g, tag => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;' }[tag] || tag));
    }

    function renderPlaylist() {
        playlistEl.innerHTML = playList.map((song, i) => `
            <li class="kgri-playlist-item ${i === currentSongIndex ? 'active' : ''}" data-index="${i}">
                ${i + 1}. ${escapeHTML(song.title)} - ${escapeHTML(song.artist)}
            </li>
        `).join('');
    }

    function updateUIAndLoad() {
        const song = playList[currentSongIndex];
        let coverSrc = song.cover;
        if (coverSrc && !coverSrc.startsWith('http')) {
            const cleanPath = coverSrc.startsWith('/') ? coverSrc.slice(1) : coverSrc;
            coverSrc = `${BASE_URL}/${cleanPath}`;
        }
        const fallbackCover = `${BASE_URL}/static/image/sakura.png`;

        headerContent.innerHTML = `
            <img src="${coverSrc}" alt="封面" class="kgri-cover" onerror="this.onerror=null; this.src='${fallbackCover}'">
            <div class="kgri-info">
                <div class="kgri-title" title="${escapeHTML(song.title)}">${escapeHTML(song.title)}</div>
                <div class="kgri-artist" title="${escapeHTML(song.artist)}">${escapeHTML(song.artist)}</div>
            </div>
        `;
        audio.src = `https://music.163.com/song/media/outer/url?id=${song.id}.mp3`;
        playBtn.textContent = isPlaying ? 'Ⅱ' : '▷';
        renderPlaylist();
    }

    function tryPlay() {
        if (!isReady) return;
        audio.play().then(() => {
            isPlaying = true;
            localStorage.setItem('sakura-music-on', 'true');
            playBtn.textContent = 'Ⅱ';
        }).catch(e => {
            isPlaying = false;
            playBtn.textContent = '▷';
        });
    }

    function initPlayer() {
        updateUIAndLoad();
        if (currentTime > 0) audio.currentTime = currentTime;
        if (isPlaying) tryPlay();
    }

    playBtn.addEventListener('click', () => {
        if (!isReady) return;
        if (isPlaying) { audio.pause(); isPlaying = false; localStorage.setItem('sakura-music-on', 'false'); } 
        else { tryPlay(); }
        playBtn.textContent = isPlaying ? 'Ⅱ' : '▷';
    });

    function changeSong(index) {
        if (!isReady) return;
        currentSongIndex = index;
        localStorage.setItem('sakura-music-index', currentSongIndex);
        currentTime = 0; localStorage.setItem('sakura-music-time', 0);
        updateUIAndLoad();
        if (isPlaying) tryPlay();
    }

    playerEl.querySelector('.kgri-prev').addEventListener('click', () => { if (isReady) changeSong((currentSongIndex - 1 + playList.length) % playList.length); });
    playerEl.querySelector('.kgri-next').addEventListener('click', () => { if (isReady) changeSong((currentSongIndex + 1) % playList.length); });
    playlistEl.addEventListener('click', (e) => {
        if (!isReady) return;
        if (e.target.classList.contains('kgri-playlist-item')) {
            const index = parseInt(e.target.dataset.index);
            if (index !== currentSongIndex) changeSong(index);
        }
    });

    audio.addEventListener('timeupdate', () => {
        if (!audio.paused) {
            currentTime = audio.currentTime;
            if (Math.floor(currentTime) % 1 === 0) localStorage.setItem('sakura-music-time', currentTime);
        }
    });

    function toggleSidebar(open) {
        if (open) {
            sidebar.classList.add('open');
            overlay.classList.add('show');
            updateCacheSize();
            renderCacheManager();
        } else {
            sidebar.classList.remove('open');
            overlay.classList.remove('show');
        }
    }

    playerEl.querySelector('.kgri-open-settings').addEventListener('click', () => toggleSidebar(true));
    document.querySelector('.kgri-close-btn').addEventListener('click', () => toggleSidebar(false));
    overlay.addEventListener('click', () => toggleSidebar(false));
    toggleBtn.addEventListener('click', (e) => { e.stopPropagation(); playerEl.classList.toggle('collapsed'); toggleBtn.textContent = playerEl.classList.contains('collapsed') ? '+' : '−'; });
    playerEl.addEventListener('click', () => { if (playerEl.classList.contains('collapsed')) { playerEl.classList.remove('collapsed'); toggleBtn.textContent = '−'; } });

    // ==========================================
    // 4. 树状图缓存管理器逻辑
    // ==========================================
    const cacheContainer = document.getElementById('kgri-cache-container');

    async function updateCacheSize() {
        const sizeEl = document.getElementById('kgri-cache-size');
        if (navigator.storage && navigator.storage.estimate) {
            const estimate = await navigator.storage.estimate();
            sizeEl.textContent = `${(estimate.usage / (1024 * 1024)).toFixed(2)} MB`;
        }
    }

    // 将缓存请求转化为树状数据
    function buildCacheTree(requests) {
        const root = {};
        
        requests.forEach(req => {
            const urlObj = new URL(req.url);
            // 将路径 /sakura/static/image/logo.png 拆分成 ['sakura', 'static', 'image', 'logo.png']
            const parts = urlObj.pathname.split('/').filter(p => p); 
            
            let current = root;
            parts.forEach((part, index) => {
                const isFile = index === parts.length - 1;
                
                if (!current[part]) {
                    current[part] = {
                        name: part,
                        isFile: isFile,
                        url: req.url,
                        children: {}
                    };
                }
                if (!isFile) {
                    current = current[part].children;
                }
            });
        });
        
        return root;
    }

    // 递归渲染树状 HTML
    function renderTreeDOM(treeNodes, isRoot = false) {
        let html = isRoot ? '<ul class="kgri-tree-root">' : '<ul>';
        
        // 文件夹在前，文件在后；按字母排序
        const sortedKeys = Object.keys(treeNodes).sort((a, b) => {
            if (treeNodes[a].isFile === treeNodes[b].isFile) return a.localeCompare(b);
            return treeNodes[a].isFile ? 1 : -1;
        });

        sortedKeys.forEach(key => {
            const node = treeNodes[key];
            if (node.isFile) {
                html += `
                    <li class="kgri-tree-file">
                        <div class="kgri-tree-file-left">
                            <span class="kgri-tree-type">[F]</span>
                            <span class="kgri-tree-name" title="${node.url}">${node.name}</span>
                        </div>
                        <button class="kgri-file-del" data-url="${node.url}" data-cache="sakura-cache-v2">删除</button>
                    </li>
                `;
            } else {
                // 递归生成子目录。判断子目录里是否包含了当前页面的 html 等
                html += `
                    <li class="kgri-tree-folder">
                        <details open>
                            <summary>
                                <span class="kgri-tree-name">${node.name}</span>
                                <button class="kgri-dir-del" data-path="/${key}/">删目录</button>
                            </summary>
                            ${renderTreeDOM(node.children)}
                        </details>
                    </li>
                `;
            }
        });
        html += '</ul>';
        return html;
    }

    async function renderCacheManager() {
        if (!('caches' in window)) {
            cacheContainer.innerHTML = '<div class="kgri-tree-empty">当前浏览器不支持缓存查询</div>';
            return;
        }

        try {
            const cacheNames = await caches.keys();
            // 我们主要处理 sw 生成的 sakura-cache-v2
            const targetCacheName = cacheNames.find(n => n.includes('sakura-cache')) || cacheNames[0];

            if (!targetCacheName) {
                cacheContainer.innerHTML = '<div class="kgri-tree-empty">暂无缓存数据</div>';
                return;
            }

            const cache = await caches.open(targetCacheName);
            const requests = await cache.keys();

            if (requests.length === 0) {
                cacheContainer.innerHTML = '<div class="kgri-tree-empty">暂无缓存文件</div>';
                return;
            }

            const treeData = buildCacheTree(requests);
            cacheContainer.innerHTML = `<div class="kgri-tree">${renderTreeDOM(treeData, true)}</div>`;

            // 绑定事件：阻止按钮点击触发折叠
            document.querySelectorAll('.kgri-dir-del').forEach(btn => {
                btn.addEventListener('click', (e) => {
                    e.preventDefault();
                    e.stopPropagation();
                });
            });
            document.querySelectorAll('.kgri-file-del').forEach(btn => {
                btn.addEventListener('click', (e) => {
                    e.stopPropagation();
                });
            });

            // 使用事件委托绑定删除动作
            cacheContainer.onclick = async (e) => {
                // 删除单个文件
                if (e.target.classList.contains('kgri-file-del')) {
                    const url = e.target.dataset.url;
                    const cacheName = e.target.dataset.cache;
                    const c = await caches.open(cacheName);
                    await c.delete(url);
                    renderCacheManager();
                    updateCacheSize();
                }
                
                // 删除整个目录
                if (e.target.classList.contains('kgri-dir-del')) {
                    const pathPrefix = e.target.dataset.path;
                    if (!confirm(`确定要清除目录 ${pathPrefix} 下的所有文件吗？`)) return;
                    
                    const c = await caches.open(targetCacheName);
                    const reqs = await c.keys();
                    let count = 0;
                    
                    for (const req of reqs) {
                        const reqPath = new URL(req.url).pathname;
                        if (reqPath.includes(pathPrefix)) {
                            await c.delete(req);
                            count++;
                        }
                    }
                    renderCacheManager();
                    updateCacheSize();
                }
            };

        } catch (error) {
            console.error('读取缓存失败:', error);
            cacheContainer.innerHTML = '<div class="kgri-tree-empty" style="color:#d9534f;">读取缓存失败</div>';
        }
    }

    document.getElementById('kgri-clear-all').addEventListener('click', async () => {
        if (!confirm('⚠️ 确定要清空所有缓存吗？下次访问将重新下载所有文件。')) return;
        if ('caches' in window) {
            const cacheNames = await caches.keys();
            await Promise.all(cacheNames.map(name => caches.delete(name)));
        }
        alert('所有缓存已清空，即将刷新页面。');
        window.location.reload();
    });

    // 启动
    loadPlaylist();
})();