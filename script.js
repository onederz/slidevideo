document.addEventListener('DOMContentLoaded', () => {
  const videoContainer = document.getElementById('videoContainer');
  const iframeA = document.getElementById('iframeA');
  const iframeB = document.getElementById('iframeB');
  const loadingOverlay = document.getElementById('loadingOverlay');

  // ▶️ Extra video (repeat before accommodation each cycle)
  const EXTRA_VIDEO_ID = 'WqOJmF1QNWA'; // 25 sec video
  const EXTRA_DURATION = 25;

  // Accommodation video
  const ACCOMMODATION_VIDEO_ID = '8_poeXZXAz0';
  const ACCOMMODATION_DURATION = 151;

  // Daily videos
  const DAILY_VIDEO_MAP = {
    0: { id: '4JxpwBGKydg', duration: 42 },   // Sunday
    1: { id: '3rlAzIMWUK8', duration: 37 },   // Monday
    2: { id: '1qZYUjT_RHA', duration: 31 },   // Tuesday
    3: { id: 'TjO9D2j1DYk', duration: 37 },   // Wednesday
    4: { id: 'tCng5fHUPKM', duration: 37 },   // Thursday
    5: { id: '01d8ImUdt9I', duration: 37 },   // Friday
    6: { id: 'NORO-QJk-SQ', duration: 37 }    // Saturday
  };

  // 🎃 Halloween videos (local MP4s)
  const HALLOWEEN_VIDEOS = [
    { src: 'Halloweem Party01.mp4' },
    { src: 'Halloweem Party02.mp4' }
  ];

  let hasStarted = false;
  let currentIframe = 'A';
  let loopTimeoutId = null;
  let videoElement = null; // 🎥 for local videos

  function buildYouTubeEmbedURL(videoId) {
    return `https://www.youtube.com/embed/${videoId}?autoplay=1&mute=1&controls=0&modestbranding=1&rel=0&showinfo=0`;
  }

  function switchToVideo(videoId, isLocal = false) {
    // Stop & remove local video if it exists
    if (videoElement) {
      videoElement.pause();
      videoElement.remove();
      videoElement = null;
    }

    const nextIframe = currentIframe === 'A' ? iframeB : iframeA;
    const prevIframe = currentIframe === 'A' ? iframeA : iframeB;

    if (isLocal) {
      nextIframe.classList.remove('active');
      prevIframe.classList.remove('active');
      prevIframe.src = '';
      nextIframe.src = '';

      // Create and play <video> tag dynamically
      videoElement = document.createElement('video');
      videoElement.src = videoId;
      videoElement.autoplay = true;
      videoElement.muted = true;
      videoElement.playsInline = true;
      videoElement.className = 'active';
      videoElement.style.width = '100%';
      videoElement.style.height = '100%';
      videoElement.style.objectFit = 'cover';
      videoContainer.appendChild(videoElement);
    } else {
      nextIframe.src = buildYouTubeEmbedURL(videoId);
      nextIframe.classList.add('active');
      prevIframe.classList.remove('active');
      prevIframe.src = '';
      currentIframe = currentIframe === 'A' ? 'B' : 'A';
    }
  }

  // 🎃 Check if it’s still Halloween night (Oct 31)
  function isHalloweenNight() {
    const now = new Date();
    return now.getMonth() === 9 && now.getDate() === 31 && now.getHours() < 24;
  }

  // 🎃 Loop through Halloween videos continuously until midnight
  function playHalloweenLoop(index = 0) {
    if (!isHalloweenNight()) {
      console.log("🎃 Midnight reached — ending Halloween loop");
      if (videoElement) {
        videoElement.pause();
        videoElement.remove();
      }
      playExtraThenAccommodation();
      return;
    }

    const video = HALLOWEEN_VIDEOS[index];
    console.log(`🎃 Playing Halloween video ${index + 1}: ${video.src}`);
    switchToVideo(video.src, true);

    // When the local video finishes, switch to next
    if (videoElement) {
      videoElement.onended = () => {
        const nextIndex = (index + 1) % HALLOWEEN_VIDEOS.length;
        playHalloweenLoop(nextIndex);
      };
    }
  }

  // ▶️ Play Extra video then Accommodation
  function playExtraThenAccommodation() {
    console.log("▶️ Playing extra video...");
    switchToVideo(EXTRA_VIDEO_ID);

    if (loopTimeoutId) clearTimeout(loopTimeoutId);
    loopTimeoutId = setTimeout(() => {
      playAccommodationThenDailyLoop();
    }, EXTRA_DURATION * 1000);
  }

  function playAccommodationThenDailyLoop() {
    console.log("▶️ Playing accommodation video...");
    switchToVideo(ACCOMMODATION_VIDEO_ID);

    if (loopTimeoutId) clearTimeout(loopTimeoutId);
    loopTimeoutId = setTimeout(() => {
      playDailyVideoLoop();
    }, ACCOMMODATION_DURATION * 1000);
  }

  function playDailyVideoLoop() {
    const day = new Date().getDay();
    const daily = DAILY_VIDEO_MAP[day];
    if (!daily) {
      console.error("❌ No daily video found for today.");
      return;
    }

    console.log(`▶️ Playing today's video: ${daily.id} (${daily.duration} sec)`);
    switchToVideo(daily.id);

    if (loopTimeoutId) clearTimeout(loopTimeoutId);
    loopTimeoutId = setTimeout(() => {
      playExtraThenAccommodation();
    }, daily.duration * 1000);
  }

  // ▶️ Start on click
  videoContainer.addEventListener('click', async () => {
    if (!hasStarted) {
      hasStarted = true;

      if (!document.fullscreenElement) {
        const requestFullscreen =
          videoContainer.requestFullscreen ||
          videoContainer.webkitRequestFullscreen ||
          videoContainer.msRequestFullscreen;
        if (requestFullscreen) {
          try {
            await requestFullscreen.call(videoContainer);
          } catch (e) {
            console.warn('Fullscreen request failed or was denied.', e);
          }
        }
      }

      loadingOverlay.classList.add('hidden');

      if (isHalloweenNight()) {
        playHalloweenLoop();
      } else {
        playExtraThenAccommodation();
      }
    }
  });

  document.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'visible' && !hasStarted) {
      loadingOverlay.classList.remove('hidden');
    }
  });
});



