document.addEventListener('DOMContentLoaded', () => {
  const videoContainer = document.getElementById('videoContainer');
  const loadingOverlay = document.getElementById('loadingOverlay');

  // 🖼️ Promotion image (displayed indefinitely)
  const PROMOTION_IMAGE_SRC = 'promotion.jfif';

  let hasStarted = false;
  let promotionElement = null; // 🖼️ promotion image

  // 🧹 Remove any local media currently on screen
  function clearLocalMedia() {
    if (promotionElement) {
      promotionElement.remove();
      promotionElement = null;
    }
  }

  // 🖼️ Show the promotion image (persists until replaced)
  function showPromotionImage() {
    clearLocalMedia();

    promotionElement = document.createElement('img');
    promotionElement.id = 'promotionImage';
    promotionElement.src = PROMOTION_IMAGE_SRC;
    promotionElement.alt = 'Promotion';
    videoContainer.appendChild(promotionElement);
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
      showPromotionImage();
    }
  });

  document.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'visible' && !hasStarted) {
      loadingOverlay.classList.remove('hidden');
    }
  });
});
