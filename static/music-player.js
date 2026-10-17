(function () {
    // 1. 获取音乐路径
    const script = document.currentScript;
    const audioSrc = script && script.dataset.src ? script.dataset.src : 'music.mp3';

    // 2. 创建 audio 元素
    const audio = new Audio(audioSrc);
    audio.loop = true;
    audio.volume = 0.4;

    // 3. 读取配置
    let musicOn = localStorage.getItem('sakura-music-on') !== 'off';
    const savedTime = parseFloat(localStorage.getItem('sakura-music-time') || '0');
    if (!isNaN(savedTime) && savedTime > 0) {
        audio.addEventListener('loadedmetadata', function () {
            try { audio.currentTime = savedTime; } catch (e) {}
        });
    }

    // 4. 创建按钮
    const btnMusic = document.createElement('button');
    btnMusic.id = 'music-toggle';
    btnMusic.type = 'button';
    btnMusic.title = '音乐开关';
    document.body.appendChild(btnMusic);

    function updateMusicButton() {
        btnMusic.innerHTML = musicOn ? 'Ⅱ' : '▷';
        btnMusic.classList.toggle('muted', !musicOn);
    }

    function tryPlay() {
        if (!musicOn) return;
        audio.play().catch(function () {});
    }

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

    btnMusic.addEventListener('click', function (e) {
        e.stopPropagation();
        musicOn = !musicOn;
        localStorage.setItem('sakura-music-on', musicOn ? 'on' : 'off');
        if (musicOn) {
            audio.play().catch(function () {});
        } else {
            audio.pause();
        }
        updateMusicButton();
    });

    audio.addEventListener('timeupdate', function () {
        localStorage.setItem('sakura-music-time', audio.currentTime);
    });

    updateMusicButton();
    tryPlay();
})();