(function () {
    // 从 script 标签的 data-src 属性获取音乐路径
    const script = document.currentScript;
    const audioSrc = script && script.dataset.src ? script.dataset.src : 'music.mp3';

    // 创建 audio 元素
    const audio = new Audio(audioSrc);
    audio.loop = true;
    audio.volume = 0.4;

    // 从 localStorage 读取开关状态与播放进度
    let musicOn = localStorage.getItem('sakura-music-on') !== 'off';
    const savedTime = parseFloat(localStorage.getItem('sakura-music-time') || '0');
    if (!isNaN(savedTime) && savedTime > 0) {
        // 等待元数据加载后再设置播放位置
        audio.addEventListener('loadedmetadata', function () {
            try { audio.currentTime = savedTime; } catch (e) {}
        });
    }

    // 创建开关按钮
    const btn = document.createElement('button');
    btn.id = 'music-toggle';
    btn.type = 'button';
    btn.title = '音乐开关';
    document.body.appendChild(btn);

    function updateButton() {
        btn.innerHTML = musicOn ? 'Ⅱ' : '▷';
        btn.classList.toggle('muted', !musicOn);
    }

    // 尝试播放
    function tryPlay() {
        if (!musicOn) return;
        audio.play().catch(function () {
            // 自动播放被浏览器拦截，等用户第一次交互
        });
    }

    // 首次用户交互时播放（解决自动播放限制）
    function onFirstInteraction() {
        if (musicOn && audio.paused) {
            audio.play().catch(function () {});
        }
        document.removeEventListener('click', onFirstInteraction);
        document.removeEventListener('touchstart', onFirstInteraction);
        document.removeEventListener('keydown', onFirstInteraction);
    }
    document.addEventListener('click', onFirstInteraction);
    document.addEventListener('touchstart', onFirstInteraction);
    document.addEventListener('keydown', onFirstInteraction);

    // 切换开关
    btn.addEventListener('click', function (e) {
        e.stopPropagation();
        musicOn = !musicOn;
        localStorage.setItem('sakura-music-on', musicOn ? 'on' : 'off');
        if (musicOn) {
            audio.play().catch(function () {});
        } else {
            audio.pause();
        }
        updateButton();
    });

    // 记录播放进度，便于换页续播
    audio.addEventListener('timeupdate', function () {
        localStorage.setItem('sakura-music-time', audio.currentTime);
    });

    updateButton();
    tryPlay();
})();
