document.addEventListener('DOMContentLoaded', () => {
    
    /* --- VARIABLES GLOBALES --- */
    const playlist = [
        { 
            // Se usa un ID válido de ejemplo
            id: "ZbZSe6N_BXs", 
            title: "Happy - Pharrell Williams", 
            artist: "Fiesta y alegría" 
        },
        { 
            id: "x9JZifJ7kR0", // Stevie Wonder
            title: "Happy Birthday", 
            artist: "Stevie Wonder" 
        },
        { 
            id: "y6Sxv-sUYtM", // Las Mañanitas
            title: "Las Mañanitas", 
            artist: "Luis Miguel" 
        }
    ];

    let player;
    let currentVideoIndex = 0;
    let isPlaying = false;
    let isPlayerReady = false;

    /* --- ELEMENTOS DOM --- */
    const startOverlay = document.getElementById('start-overlay');
    const startBtn = document.getElementById('start-btn');
    const menuBtn = document.getElementById('menu-btn');
    const navLinks = document.getElementById('navLinks');
    const lightbox = document.getElementById('lightbox');
    const lightboxImg = document.getElementById('lightbox-img');
    const lightboxCaption = document.getElementById('lightbox-caption');
    const closeLightboxBtn = document.getElementById('close-lightbox');
    
    /* --- 1. INICIALIZACIÓN --- */
    startBtn.addEventListener('click', () => {
        startOverlay.style.opacity = '0';
        setTimeout(() => { startOverlay.style.display = 'none'; }, 500);

        if (isPlayerReady) {
            player.playVideo();
        } else {
            console.log("Reproductor cargando...");
        }

        // Generar confeti inicial
        for(let i=0; i<50; i++) {
            setTimeout(createConfetti, i * 20);
        }
    });

    /* --- 2. MENÚ --- */
    menuBtn.addEventListener('click', () => {
        navLinks.classList.toggle('active');
    });

    /* --- 3. CONFETI --- */
    const colors = ['#e91e63', '#ff9800', '#2196f3', '#4caf50', '#ffeb3b', '#9c27b0'];
    
    function createConfetti() {
        const container = document.getElementById('confetti-container');
        const confetti = document.createElement('div');
        confetti.classList.add('confetti');
        confetti.style.left = Math.random() * 100 + 'vw';
        confetti.style.backgroundColor = colors[Math.floor(Math.random() * colors.length)];
        const duration = Math.random() * 3 + 2; 
        confetti.style.animationDuration = duration + 's';
        container.appendChild(confetti);
        setTimeout(() => { confetti.remove(); }, duration * 1000);
    }
    setInterval(createConfetti, 400);

    /* --- 4. LIGHTBOX --- */
    // Función global para poder ser llamada desde el HTML
    window.openLightbox = (element) => {
        const img = element.querySelector('img');
        const caption = element.querySelector('.photo-caption');
        lightboxImg.src = img.src;
        lightboxImg.alt = img.alt;
        lightboxCaption.textContent = caption.textContent;
        lightbox.classList.add('active');
        document.body.style.overflow = 'hidden';
    };

    function closeLightbox() {
        lightbox.classList.remove('active');
        document.body.style.overflow = '';
    }

    closeLightboxBtn.addEventListener('click', closeLightbox);
    lightbox.addEventListener('click', (e) => {
        if (e.target === lightbox) closeLightbox();
    });

    /* --- 5. YOUTUBE API --- */
    
    // Definimos la función en el objeto window explícitamente para que YouTube la encuentre
    window.onYouTubeIframeAPIReady = function() {
        console.log("API de YouTube lista");
        player = new YT.Player('player', {
            height: '100%', 
            width: '100%', 
            videoId: playlist[0].id,
            playerVars: { 
                'playsinline': 1, 
                'controls': 0, 
                'rel': 0,
                'autoplay': 0,
                'origin': window.location.origin,
                'disablekb': 1
            },
            events: { 
                'onReady': onPlayerReady, 
                'onStateChange': onPlayerStateChange,
                'onError': onPlayerError
            }
        });
    };

    function onPlayerReady(event) {
        isPlayerReady = true;
        updateUI(); 
    }

    function onPlayerError(event) {
        console.error("Error en video:", event.data);
        // Si hay error, salta al siguiente
        nextSong();
    }

    function onPlayerStateChange(event) {
        if (event.data == YT.PlayerState.PLAYING) {
            isPlaying = true;
            updatePlayButton();
        } 
        else if (event.data == YT.PlayerState.PAUSED) {
            isPlaying = false;
            updatePlayButton();
        } 
        else if (event.data == YT.PlayerState.ENDED) {
            nextSong();
        }
        updatePlaylistHighlight();
    }

    /* --- 6. CONTROLES --- */
    
    function updateUI() {
        const song = playlist[currentVideoIndex];
        document.getElementById('song-title').innerText = song.title;
        document.getElementById('song-artist').innerText = song.artist;
        renderPlaylist();
        updatePlaylistHighlight();
    }

    function renderPlaylist() {
        const listEl = document.getElementById('playlist');
        listEl.innerHTML = '';
        
        playlist.forEach((item, index) => {
            const div = document.createElement('div');
            div.classList.add('playlist-item');
            div.onclick = () => { 
                currentVideoIndex = index; 
                player.loadVideoById(playlist[currentVideoIndex].id); 
                updateUI(); 
            };
            div.innerHTML = `
                <div style="flex-grow:1">
                    <div style="font-size:0.9rem; font-weight:bold;">${item.title}</div>
                    <div style="font-size:0.8rem; color:#666;">${item.artist}</div>
                </div>
                ${index === currentVideoIndex ? '<i class="fas fa-volume-up" style="color:var(--primary-color)"></i>' : ''}
            `;
            listEl.appendChild(div);
        });
    }

    function updatePlaylistHighlight() {
        const items = document.querySelectorAll('.playlist-item');
        items.forEach((item, index) => {
            if (index === currentVideoIndex) item.classList.add('active');
            else item.classList.remove('active');
        });
    }

    function updatePlayButton() {
        const btn = document.getElementById('play');
        btn.innerHTML = isPlaying ? '<i class="fas fa-pause"></i>' : '<i class="fas fa-play"></i>';
    }

    // Listeners de botones de música
    document.getElementById('play').addEventListener('click', () => {
        if (!isPlayerReady) return;
        if (isPlaying) player.pauseVideo();
        else player.playVideo();
    });

    document.getElementById('next').addEventListener('click', nextSong);
    document.getElementById('prev').addEventListener('click', prevSong);

    function nextSong() { 
        currentVideoIndex++; 
        if (currentVideoIndex >= playlist.length) currentVideoIndex = 0; 
        player.loadVideoById(playlist[currentVideoIndex].id); 
        updateUI(); 
    }

    function prevSong() { 
        currentVideoIndex--; 
        if (currentVideoIndex < 0) currentVideoIndex = playlist.length - 1; 
        player.loadVideoById(playlist[currentVideoIndex].id); 
        updateUI(); 
    }
});