(function() {
    // ==========================================
    // 1. 基础配置
    // ==========================================
    const scriptTag = document.currentScript;
    let JSON_PATH = '/sakura/static/data/playlist.json'; 
    let BASE_URL = '/sakura'; // 默认线上根路径

    if (scriptTag && scriptTag.src) {
        JSON_PATH = scriptTag.src.replace('music-player.js', 'data/playlist.json');
        // 自动截取前端根目录（比如 https://hongaxe.github.io/sakura 或 http://localhost:8080）
        BASE_URL = scriptTag.src.substring(0, scriptTag.src.indexOf('/static/music-player.js'));
    }

    let playList = []; 
    let isReady = false; 

    let currentSongIndex = parseInt(localStorage.getItem('sakura-music-index')) || 0;
    let isPlaying = localStorage.getItem('sakura-music-on') === 'true';
    let currentTime = parseFloat(localStorage.getItem('sakura-music-time')) || 0;
    
    const audio = new Audio();

    // ==========================================
    // 2. 动态注入 HTML 和 CSS (添加了状态展示容器)
    // ==========================================
    const style = document.createElement('style');
    style.textContent = `
        /* ... (保持上一版的所有 CSS，这里省略以节省空间，实际使用时请保留上一版 style.textContent 的所有内容) ... */
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
        #kgri-sidebar { position: fixed; top: 0; right: -320px; width: 300px; height: 100vh; background: var(--bg-color, #f6f1e9); border-left: 2px solid var(--border-dark, #b5a99a); box-shadow: -4px 0 0 rgba(0,0,0,0.05); z-index: 1001; transition: right 0.3s ease; display: flex; flex-direction: column; font-family: 'Zpix', sans-serif; }
        #kgri-sidebar.open { right: 0; }
        .kgri-sidebar-header { display: flex; justify-content: space-between; align-items: center; padding: 16px 20px; border-bottom: 2px solid var(--border-dark, #b5a99a); background: #fff; }
        .kgri-sidebar-header h2 { font-size: 1.1rem; color: var(--text-main, #2b2725); margin: 0; }
        .kgri-close-btn { background: transparent; border: none; font-size: 1.2rem; cursor: pointer; color: var(--text-sub, #6b6159); }
        .kgri-close-btn:hover { color: var(--sakura-pink, #b04e62); }
        .kgri-sidebar-content { padding: 20px; overflow-y: auto; flex: 1; }
        .kgri-section-title { font-size: 0.95rem; color: var(--sakura-dark, #853545); margin-bottom: 12px; border-left: 3px solid var(--sakura-pink, #b04e62); padding-left: 8px; font-weight: 600; }
        .kgri-playlist { list-style: none; padding: 0; margin: 0 0 32px 0; border: 1px solid var(--border-color, #d3c9bd); background: #fff; min-height: 50px; }
        .kgri-playlist-item { padding: 10px 12px; border-bottom: 1px dashed var(--border-color, #d3c9bd); cursor: pointer; font-size: 0.85rem; color: var(--text-sub, #6b6159); transition: all 0.2s; }
        .kgri-playlist-item:last-child { border-bottom: none; }
        .kgri-playlist-item:hover { background: var(--bg-color, #f6f1e9); color: var(--text-main, #2b2725); }
        .kgri-playlist-item.active { color: var(--sakura-pink, #b04e62); font-weight: 600; background: rgba(176, 78, 98, 0.05); }
        .kgri-cache-box { border: 1px solid var(--border-color, #d3c9bd); background: #fff; padding: 16px; margin-bottom: 32px; }
        .kgri-cache-info { font-size: 0.85rem; color: var(--text-sub, #6b6159); margin-bottom: 12px; display: flex; justify-content: space-between; }
        .kgri-clear-btn { width: 100%; padding: 8px; background: var(--bg-color, #f6f1e9); border: 1px solid var(--border-dark, #b5a99a); color: var(--text-main, #2b2725); font-family: inherit; cursor: pointer; box-shadow: 2px 2px 0 rgba(0,0,0,0.05); transition: all 0.1s; }
        .kgri-clear-btn:active { transform: translate(2px, 2px); box-shadow: none; }
        .kgri-clear-btn:hover { border-color: var(--sakura-pink, #b04e62); color: var(--sakura-pink, #b04e62); }
        #kgri-overlay { position: fixed; inset: 0; background: rgba(0,0,0,0.3); z-index: 1000; display: none; opacity: 0; transition: opacity 0.3s; }
        #kgri-overlay.show { display: block; opacity: 1; }
        
        /* 加载状态文字 */
        .kgri-status-text { padding: 20px; text-align: center; font-size: 0.85rem; color: var(--text-sub); }
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
                        <span>已用缓存:</span>
                        <span id="kgri-cache-size">计算中...</span>
                    </div>
                    <button class="kgri-clear-btn" id="kgri-clear-cache">清除缓存数据</button>
                </div>

                <div class="kgri-section-title">其他设置</div>
                <div style="font-size: 0.8rem; color: #6b6159; text-align: center; padding: 20px 0;">
                    （预留板块）
                </div>
            </div>
        </div>
    `;
    const wrapper = document.createElement('div');
    wrapper.innerHTML = playerHTML;
    document.body.appendChild(wrapper);

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

    // 拉取歌单
    async function loadPlaylist() {
        // 环境检测：如果是 file:// 协议，直接报错提示
        if (window.location.protocol === 'file:') {
            console.error('⚠️ 本地直接打开 HTML 会触发浏览器跨域限制，无法加载 JSON。请使用 VS Code Live Server 或 Python 本地服务器预览。');
            showStatus('本地预览需启动服务器');
            return;
        }

        try {
            const response = await fetch(JSON_PATH);
            if (!response.ok) throw new Error('网络请求失败');
            playList = await response.json();

            if (!playList || playList.length === 0) {
                showStatus('暂无歌曲');
                return;
            }

            if (currentSongIndex >= playList.length) {
                currentSongIndex = 0;
            }

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

    // 安全渲染文本，防止 XSS (规范要求)
    function escapeHTML(str) {
        return str.replace(/[&<>'"]/g, 
            tag => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;' }[tag] || tag)
        );
    }

    // 渲染歌单
    function renderPlaylist() {
        playlistEl.innerHTML = playList.map((song, i) => `
            <li class="kgri-playlist-item ${i === currentSongIndex ? 'active' : ''}" data-index="${i}">
                ${i + 1}. ${escapeHTML(song.title)} - ${escapeHTML(song.artist)}
            </li>
        `).join('');
    }

    // 更新 UI 并加载音频
    function updateUIAndLoad() {
        const song = playList[currentSongIndex];
        
        // 动态拼接完整的封面图片 URL
        let coverSrc = song.cover;
        if (coverSrc && !coverSrc.startsWith('http')) {
            // 如果是相对路径，自动拼上根路径（处理了开头是否带有斜杠的情况）
            const cleanPath = coverSrc.startsWith('/') ? coverSrc.slice(1) : coverSrc;
            coverSrc = `${BASE_URL}/${cleanPath}`;
        }

        // 默认兜底图路径
        const fallbackCover = `${BASE_URL}/static/image/sakura.png`;

        headerContent.innerHTML = `
            <img src="${coverSrc}" alt="封面" class="kgri-cover" onerror="this.onerror=null; this.src='${fallbackCover}'">
            <div class="kgri-info">
                <div class="kgri-title" title="${escapeHTML(song.title)}">${escapeHTML(song.title)}</div>
                <div class="kgri-artist" title="${escapeHTML(song.artist)}">${escapeHTML(song.artist)}</div>
            </div>
        `;
        
        // 拼接网易云外链
        audio.src = `https://music.163.com/song/media/outer/url?id=${song.id}.mp3`;
        playBtn.textContent = isPlaying ? 'Ⅱ' : '▷';
        renderPlaylist();
    }

    // 播放逻辑
    function tryPlay() {
        if (!isReady) return;
        audio.play().then(() => {
            isPlaying = true;
            localStorage.setItem('sakura-music-on', 'true');
            playBtn.textContent = 'Ⅱ';
        }).catch(e => {
            console.log('自动播放被拦截或加载失败:', e);
            isPlaying = false;
            playBtn.textContent = '▷';
        });
    }

    function initPlayer() {
        updateUIAndLoad();
        if (currentTime > 0) {
            audio.currentTime = currentTime;
        }
        if (isPlaying) {
            tryPlay();
        }
    }

    // ==========================================
    // 4. 事件绑定
    // ==========================================
    playBtn.addEventListener('click', () => {
        if (!isReady) return;
        if (isPlaying) {
            audio.pause();
            isPlaying = false;
            localStorage.setItem('sakura-music-on', 'false');
        } else {
            tryPlay();
        }
        playBtn.textContent = isPlaying ? 'Ⅱ' : '▷';
    });

    function changeSong(index) {
        if (!isReady) return;
        currentSongIndex = index;
        localStorage.setItem('sakura-music-index', currentSongIndex);
        currentTime = 0;
        localStorage.setItem('sakura-music-time', 0);
        updateUIAndLoad();
        if (isPlaying) tryPlay();
    }

    playerEl.querySelector('.kgri-prev').addEventListener('click', () => {
        if (!isReady) return;
        let newIndex = currentSongIndex - 1;
        if (newIndex < 0) newIndex = playList.length - 1;
        changeSong(newIndex);
    });

    playerEl.querySelector('.kgri-next').addEventListener('click', () => {
        if (!isReady) return;
        let newIndex = (currentSongIndex + 1) % playList.length;
        changeSong(newIndex);
    });

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
            if (Math.floor(currentTime) % 1 === 0) {
                localStorage.setItem('sakura-music-time', currentTime);
            }
        }
    });

    // UI 交互
    toggleBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        if (playerEl.classList.contains('collapsed')) {
            playerEl.classList.remove('collapsed');
            toggleBtn.textContent = '−';
        } else {
            playerEl.classList.add('collapsed');
            toggleBtn.textContent = '+';
        }
    });

    playerEl.addEventListener('click', () => {
        if (playerEl.classList.contains('collapsed')) {
            playerEl.classList.remove('collapsed');
            toggleBtn.textContent = '−';
        }
    });

    function toggleSidebar(open) {
        if (open) {
            sidebar.classList.add('open');
            overlay.classList.add('show');
            updateCacheSize();
        } else {
            sidebar.classList.remove('open');
            overlay.classList.remove('show');
        }
    }

    playerEl.querySelector('.kgri-open-settings').addEventListener('click', () => toggleSidebar(true));
    document.querySelector('.kgri-close-btn').addEventListener('click', () => toggleSidebar(false));
    overlay.addEventListener('click', () => toggleSidebar(false));

    async function updateCacheSize() {
        const sizeEl = document.getElementById('kgri-cache-size');
        if (navigator.storage && navigator.storage.estimate) {
            try {
                const estimate = await navigator.storage.estimate();
                sizeEl.textContent = `${(estimate.usage / (1024 * 1024)).toFixed(2)} MB`;
            } catch (e) { sizeEl.textContent = '未知'; }
        }
    }

    document.getElementById('kgri-clear-cache').addEventListener('click', async () => {
        if (!confirm('确定要清除本地缓存的图片、音乐和页面数据吗？')) return;
        if ('caches' in window) {
            try {
                const cacheNames = await caches.keys();
                await Promise.all(cacheNames.map(name => caches.delete(name)));
            } catch (e) { console.error(e); }
        }
        alert('缓存已清除，即将刷新页面。');
        window.location.reload();
    });

    // 启动
    loadPlaylist();
})();