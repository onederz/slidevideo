document.addEventListener('DOMContentLoaded', () => {
  const videoContainer = document.getElementById('videoContainer');
  const iframeA = document.getElementById('iframeA');
  const iframeB = document.getElementById('iframeB');
  const loadingOverlay = document.getElementById('loadingOverlay');

  // ▶️ Extra video (repeat before promotion each cycle)
  const EXTRA_VIDEO_ID = 'WqOJmF1QNWA'; // 25 sec video
  const EXTRA_DURATION = 25;

  // 🖼️ Promotion image (2 minutes)
  const PROMOTION_IMAGE_SRC = 'promotion.jfif';
  const PROMOTION_DURATION = 120; // 2 minutes

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
  let videoElement = null;      // 🎥 local video (if needed in future)
  let promotionElement = null;  // 🖼️ promotion image

  function buildYouTubeEmbedURL(videoId) {
    return `https://www.youtube.com/embed/${videoId}?autoplay=1&mute=1&controls=0&modestbranding=1&rel=0&showinfo=0`;
  }

  // 🧹 Remove any local video / promo image currently on screen
  function clearLocalMedia() {
    if (videoElement) {
      videoElement.pause();
      videoElement.remove();
      videoElement = null;
    }
    if (promotionElement) {
      promotionElement.remove();
      promotionElement = null;
    }
  }

  function switchToVideo(videoId) {
    clearLocalMedia();

    const nextIframe = currentIframe === 'A' ? iframeB : iframeA;
    const prevIframe = currentIframe === 'A' ? iframeA : iframeB;

    nextIframe.src = buildYouTubeEmbedURL(videoId);
    nextIframe.classList.add('active');
    prevIframe.classList.remove('active');
    prevIframe.src = 'about:blank';
    currentIframe = currentIframe === 'A' ? 'B' : 'A';
  }

  // 🖼️ Show the promotion image for PROMOTION_DURATION seconds
  function switchToPromotionImage() {
    clearLocalMedia();

    // Hide both iframes
    iframeA.classList.remove('active');
    iframeB.classList.remove('active');
    iframeA.src = 'about:blank';
    iframeB.src = 'about:blank';

    promotionElement = document.createElement('img');
    promotionElement.id = 'promotionImage';
    promotionElement.src = PROMOTION_IMAGE_SRC;
    promotionElement.alt = 'Promotion';
    videoContainer.appendChild(promotionElement);
  }

  // ▶️ Extra video → Promotion image → Accommodation → Daily → repeat
  function playExtraThenPromotion() {
    console.log("▶️ Playing extra video...");
    switchToVideo(EXTRA_VIDEO_ID);

    if (loopTimeoutId) clearTimeout(loopTimeoutId);
    loopTimeoutId = setTimeout(() => {
      playPromotionThenAccommodation();
    }, EXTRA_DURATION * 1000);
  }

  // 🖼️ Promotion image for 2 minutes
  function playPromotionThenAccommodation() {
    console.log("🖼️ Showing promotion image...");
    switchToPromotionImage();

    if (loopTimeoutId) clearTimeout(loopTimeoutId);
    loopTimeoutId = setTimeout(() => {
      playAccommodationThenDailyLoop();
    }, PROMOTION_DURATION * 1000);
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
      playExtraThenPromotion();
    }, daily.duration * 1000);
  }

  // 🖱️ Hide cursor after 2s of inactivity (TV / kiosk friendly)
  let cursorHideTimeout = null;
  function scheduleHideCursor() {
    if (cursorHideTimeout) clearTimeout(cursorHideTimeout);
    videoContainer.classList.remove('hide-cursor');
    cursorHideTimeout = setTimeout(() => {
      videoContainer.classList.add('hide-cursor');
    }, 2000);
  }

  // Show cursor on any mouse movement / touch / key, then re-schedule hiding
  ['mousemove', 'mousedown', 'touchstart', 'keydown'].forEach(evt => {
    document.addEventListener(evt, scheduleHideCursor, { passive: true });
  });
  scheduleHideCursor(); // start hiding right away

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
      playExtraThenPromotion();
    }
  });

  document.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'visible' && !hasStarted) {
      loadingOverlay.classList.remove('hidden');
    }
  });
});