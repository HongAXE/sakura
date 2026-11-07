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
        /* ... 保留原有的主播放器和侧边栏基础样式 ... */
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
        
        /* 文件管理器 UI */
        .kgri-cache-box { border: 1px solid var(--border-color, #d3c9bd); background: #fff; padding: 12px; margin-bottom: 24px; }
        .kgri-cache-info { font-size: 0.85rem; color: var(--text-sub, #6b6159); margin-bottom: 12px; display: flex; justify-content: space-between; }
        .kgri-clear-btn { width: 100%; padding: 8px; background: var(--bg-color, #f6f1e9); border: 1px solid var(--border-dark, #b5a99a); color: var(--text-main, #2b2725); font-family: inherit; cursor: pointer; box-shadow: 2px 2px 0 rgba(0,0,0,0.05); transition: all 0.1s; }
        .kgri-clear-btn:active { transform: translate(2px, 2px); box-shadow: none; }
        .kgri-clear-btn:hover { border-color: var(--sakura-pink, #b04e62); color: var(--sakura-pink, #b04e62); }
        
        /* 缓存文件列表 */
        .kgri-cache-group { margin-bottom: 16px; border: 1px solid var(--border-dark); background: #fff; }
        .kgri-cache-group-header { background: var(--bg-color); padding: 8px 10px; border-bottom: 1px solid var(--border-dark); display: flex; justify-content: space-between; align-items: center; font-size: 0.85rem; font-weight: 600; color: var(--text-main); }
        .kgri-cache-group-header button { background: transparent; border: none; color: #d9534f; font-size: 0.75rem; cursor: pointer; text-decoration: underline; }
        .kgri-cache-file-list { list-style: none; padding: 0; margin: 0; max-height: 150px; overflow-y: auto; }
        .kgri-cache-file-item { display: flex; justify-content: space-between; align-items: center; padding: 6px 10px; font-size: 0.75rem; border-bottom: 1px dashed var(--border-color); color: var(--text-sub); }
        .kgri-cache-file-item:last-child { border-bottom: none; }
        .kgri-file-name { white-space: nowrap; overflow: hidden; text-overflow: ellipsis; max-width: 200px; }
        .kgri-file-del { background: transparent; border: none; color: var(--text-sub); cursor: pointer; font-weight: bold; }
        .kgri-file-del:hover { color: #d9534f; }
        .kgri-empty-cache { text-align: center; padding: 20px; font-size: 0.85rem; color: var(--text-sub); }
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
                
                <div id="kgri-cache-container">
                    <!-- 缓存文件管理器动态生成区域 -->
                </div>
            </div>
        </div>
    `;
    document.body.insertAdjacentHTML('beforeend', playerHTML);

    // ==========================================
    // 3. 核心逻辑与数据拉取（保留原有逻辑）
    // ==========================================
    // (这里省略了和上一版完全一样的 loadPlaylist, showStatus, escapeHTML, renderPlaylist, updateUIAndLoad, tryPlay, initPlayer 和事件绑定的代码，请直接将上一版的这部分完整复制过来)
    // 👇👇 下面是必须替换的交互部分 👇👇

    const playerEl = document.getElementById('kgri-player');
    const headerContent = document.getElementById('kgri-header-content');
    const playBtn = playerEl.querySelector('.kgri-play');
    const toggleBtn = playerEl.querySelector('.kgri-toggle-btn');
    const sidebar = document.getElementById('kgri-sidebar');
    const overlay = document.getElementById('kgri-overlay');
    const playlistEl = document.getElementById('kgri-playlist');

    // 拉取歌单
    async function loadPlaylist() {
        if (window.location.protocol === 'file:') {
            showStatus('本地预览需启动服务器');
            return;
        }
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

    // 绑定播放控制
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

    // 侧边栏开关
    function toggleSidebar(open) {
        if (open) {
            sidebar.classList.add('open');
            overlay.classList.add('show');
            updateCacheSize();
            renderCacheManager(); // 打开时渲染缓存列表
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
    // 4. 文件管理器式缓存管理逻辑
    // ==========================================
    const cacheContainer = document.getElementById('kgri-cache-container');

    async function updateCacheSize() {
        const sizeEl = document.getElementById('kgri-cache-size');
        if (navigator.storage && navigator.storage.estimate) {
            const estimate = await navigator.storage.estimate();
            sizeEl.textContent = `${(estimate.usage / (1024 * 1024)).toFixed(2)} MB`;
        }
    }

    async function renderCacheManager() {
        if (!('caches' in window)) {
            cacheContainer.innerHTML = '<div class="kgri-empty-cache">当前浏览器不支持缓存查询</div>';
            return;
        }

        try {
            const cacheNames = await caches.keys();
            if (cacheNames.length === 0) {
                cacheContainer.innerHTML = '<div class="kgri-empty-cache">暂无缓存数据</div>';
                return;
            }

            let html = '';
            for (const name of cacheNames) {
                const cache = await caches.open(name);
                const requests = await cache.keys();

                // 按页面路径分组
                const groups = {};
                requests.forEach(req => {
                    const url = new URL(req.url);
                    let path = url.pathname;
                    // 如果是以 .html 或 / 结尾，算作主页
                    let groupName = path.includes('.html') || path.endsWith('/') ? path : path.substring(0, path.lastIndexOf('/') + 1);
                    
                    if (!groups[groupName]) groups[groupName] = [];
                    groups[groupName].push(req);
                });

                // 渲染分组
                for (const [groupName, reqs] of Object.entries(groups)) {
                    html += `<div class="kgri-cache-group">
                        <div class="kgri-cache-group-header">
                            <span title="${groupName}">${groupName.length > 20 ? '...' + groupName.slice(-15) : groupName}</span>
                            <button data-group="${groupName}" data-cache="${name}" class="kgri-del-group">清除此页</button>
                        </div>
                        <ul class="kgri-cache-file-list">`;
                    
                    reqs.forEach(req => {
                        const url = new URL(req.url);
                        const fileName = url.pathname.split('/').pop() || 'index.html';
                        html += `<li class="kgri-cache-file-item">
                            <span class="kgri-file-name" title="${url.pathname}">${fileName}</span>
                            <button class="kgri-file-del" data-url="${req.url}" data-cache="${name}">✕</button>
                        </li>`;
                    });
                    html += `</ul></div>`;
                }
            }
            cacheContainer.innerHTML = html;

            // 绑定删除单个文件的事件
            document.querySelectorAll('.kgri-file-del').forEach(btn => {
                btn.addEventListener('click', async (e) => {
                    const url = e.target.dataset.url;
                    const cacheName = e.target.dataset.cache;
                    const cache = await caches.open(cacheName);
                    await cache.delete(url);
                    renderCacheManager(); // 刷新列表
                    updateCacheSize();
                });
            });

            // 绑定删除某个分组的事件
            document.querySelectorAll('.kgri-del-group').forEach(btn => {
                btn.addEventListener('click', async (e) => {
                    if (!confirm('确定要清除该页面下的所有缓存文件吗？')) return;
                    const groupName = e.target.dataset.group;
                    const cacheName = e.target.dataset.cache;
                    const cache = await caches.open(cacheName);
                    const requests = await cache.keys();
                    
                    for (const req of requests) {
                        const url = new URL(req.url);
                        const path = url.pathname;
                        let reqGroup = path.includes('.html') || path.endsWith('/') ? path : path.substring(0, path.lastIndexOf('/') + 1);
                        if (reqGroup === groupName) {
                            await cache.delete(req);
                        }
                    }
                    renderCacheManager(); // 刷新列表
                    updateCacheSize();
                });
            });

        } catch (error) {
            console.error('读取缓存失败:', error);
            cacheContainer.innerHTML = '<div class="kgri-empty-cache" style="color:#d9534f;">读取缓存失败</div>';
        }
    }

    // 清空全部缓存
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