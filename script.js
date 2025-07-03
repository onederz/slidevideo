document.addEventListener('DOMContentLoaded', () => {
  const videoContainer = document.getElementById('videoContainer');
  const videoFrame = document.getElementById('videoFrame');
  const loadingOverlay = document.getElementById('loadingOverlay');

  // Video IDs
  const ACCOMMODATION_VIDEO_ID = '8_poeXZXAz0';

  const DAILY_VIDEO_MAP = {
    0: { id: '4JxpwBGKydg', duration: 42 },   // Sunday
    1: { id: '3rlAzIMWUK8', duration: 37 },   // Monday
    2: { id: '1qZYUjT_RHA', duration: 31 },   // Tuesday
    3: { id: 'TjO9D2j1DYk', duration: 37 },   // Wednesday
    4: { id: 'tCng5fHUPKM', duration: 37 },   // Thursday
    5: { id: '01d8ImUdt9I', duration: 37 },   // Friday
    6: { id: 'NORO-QJk-SQ', duration: 37 }    // Saturday
  };

  const ACCOMMODATION_DURATION = 151; // seconds (2 min 31 sec)

  let hasStarted = false;

  function buildYouTubeEmbedURL(videoId) {
    return `https://www.youtube.com/embed/${videoId}?autoplay=1&mute=1&controls=0&modestbranding=1&rel=0`;
  }

  function loadVideo(videoId) {
    const embedURL = buildYouTubeEmbedURL(videoId);
    videoFrame.src = embedURL;
    loadingOverlay.classList.remove('hidden');

    setTimeout(() => {
      loadingOverlay.classList.add('hidden');
    }, 1000);
  }

  function playAccommodationThenDaily() {
    console.log("▶️ Playing accommodation video...");
    loadVideo(ACCOMMODATION_VIDEO_ID);

    setTimeout(() => {
      playDailyVideo();
    }, ACCOMMODATION_DURATION * 1000);
  }

  function playDailyVideo() {
    const day = new Date().getDay();
    const daily = DAILY_VIDEO_MAP[day];

    if (!daily) {
      console.error("❌ No video found for today.");
      return;
    }

    console.log(`▶️ Playing today's video: ${daily.id} (${daily.duration} sec)`);
    loadVideo(daily.id);

    // Stop after video ends
    setTimeout(() => {
      console.log("✅ Daily video finished.");
    }, daily.duration * 1000);
  }

  // On user click, start fullscreen and video
  videoContainer.addEventListener('click', async () => {
    if (!hasStarted) {
      hasStarted = true;

      // Request fullscreen
      if (!document.fullscreenElement) {
        const requestFullscreen =
          videoContainer.requestFullscreen ||
          videoContainer.webkitRequestFullscreen ||
          videoContainer.msRequestFullscreen;

        if (requestFullscreen) {
          await requestFullscreen.call(videoContainer);
        }
      }

      loadingOverlay.classList.add('hidden');
      playAccommodationThenDaily();
    }
  });

  // If user switches tab and comes back before daily video plays
  document.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'visible' && !hasStarted) {
      loadingOverlay.classList.remove('hidden');
    }
  });
});
