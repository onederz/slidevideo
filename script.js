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

  let hasStarted = false;
  let currentIframe = 'A';
  let loopTimeoutId = null;

  function buildYouTubeEmbedURL(videoId) {
    return `https://www.youtube.com/embed/${videoId}?autoplay=1&mute=1&controls=0&modestbranding=1&rel=0&showinfo=0`;
  }

  function switchToVideo(videoId) {
    const url = buildYouTubeEmbedURL(videoId);

    const nextIframe = currentIframe === 'A' ? iframeB : iframeA;
    const prevIframe = currentIframe === 'A' ? iframeA : iframeB;

    nextIframe.src = url;
    nextIframe.classList.add('active');

    prevIframe.classList.remove('active');
    prevIframe.src = '';

    currentIframe = currentIframe === 'A' ? 'B' : 'A';
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
      playExtraThenAccommodation(); // 👈 loop back to extra video
    }, daily.duration * 1000);
  }

  // ▶️ Start with Extra video
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
      playExtraThenAccommodation(); // 👈 start cycle
    }
  });

  document.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'visible' && !hasStarted) {
      loadingOverlay.classList.remove('hidden');
    }
  });
});


