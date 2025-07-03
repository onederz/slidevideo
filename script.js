document.addEventListener('DOMContentLoaded', () => {
    const videoContainer = document.getElementById('videoContainer');
    const videoPlayer = document.getElementById('videoPlayer');
    const loadingOverlay = document.getElementById('loadingOverlay');

    // --- Configuration ---
    const VIDEO_BASE_PATH = './videos/';
    const ACCOMMODATION_VIDEO_FILENAME = 'Accommodation.mp4';
    const ACCOMMODATION_VIDEO_PATH = VIDEO_BASE_PATH + ACCOMMODATION_VIDEO_FILENAME;

    const DAILY_VIDEO_MAP = {
        0: 'sunday.mp4',
        1: 'monday.mp4',
        2: 'tuesday.mp4',
        3: 'wednesday.mp4',
        4: 'thursday.mp4',
        5: 'friday.mp4', // Today is Friday, so this should be the video
        6: 'saturday.mp4'
    };

    // --- State Variables ---
    let currentDayMainVideoPath = null; // The path to today's main video (e.g., friday.mp4)
    let lastProcessedDayString = null; // To track if the day has truly changed

    // --- Utility Functions ---

    function getTodaysMainVideoPath() {
        const now = new Date();
        const currentDayOfWeek = now.getDay();
        const videoFileName = DAILY_VIDEO_MAP[currentDayOfWeek];
        if (!videoFileName) {
            console.error(`Error: No main video defined for day of week: ${currentDayOfWeek}`);
            return null;
        }
        return VIDEO_BASE_PATH + videoFileName;
    }

    // Function to handle video loading and playing
    function loadAndPlayVideo(videoPath, shouldLoop) {
        console.log(`[LoadAndPlay] Attempting to load: ${videoPath}, loop: ${shouldLoop}`);
        loadingOverlay.classList.remove('hidden');
        loadingOverlay.querySelector('p').textContent = "Loading Video...";

        videoPlayer.src = videoPath;
        videoPlayer.loop = shouldLoop; // Control loop property via JS

        videoPlayer.oncanplay = () => {
            videoPlayer.play()
                .then(() => {
                    console.log(`[LoadAndPlay] Video started playing: ${videoPath}`);
                    loadingOverlay.classList.add('hidden');
                })
                .catch(error => {
                    console.warn(`[LoadAndPlay] Autoplay prevented for ${videoPath}. Waiting for click.`, error);
                    loadingOverlay.querySelector('p').textContent = "Click to Play Fullscreen";
                    loadingOverlay.classList.remove('hidden');
                });
        };

        videoPlayer.onerror = (e) => {
            console.error(`[LoadAndPlay] Error loading video: ${videoPath}. Event:`, e);
            loadingOverlay.querySelector('p').textContent = `Error loading: ${videoPath.split('/').pop()}. Check console.`;
            loadingOverlay.classList.remove('hidden');
        };
    }

    // --- Playback Sequence Functions ---

    function playDailyMainVideo() {
        if (!currentDayMainVideoPath) {
            console.error("[playDailyMainVideo] No main video path set. Aborting.");
            return;
        }
        console.log(`[Sequence] Playing daily main video: ${currentDayMainVideoPath}`);
        // *** THIS IS THE CRITICAL PART: Set loop to FALSE for the daily video ***
        loadAndPlayVideo(currentDayMainVideoPath, false); // Daily video plays once

        // *** When the daily video ends, call the function to play Accommodation again ***
        videoPlayer.onended = playAccommodationVideo;
    }

    function playAccommodationVideo() {
        console.log(`[Sequence] Playing Accommodation video: ${ACCOMMODATION_VIDEO_PATH}`);
        loadAndPlayVideo(ACCOMMODATION_VIDEO_PATH, false); // Accommodation video plays once
        // When Accommodation video ends, call the function to play the daily video
        videoPlayer.onended = playDailyMainVideo;
    }

    // --- Main Scheduling Logic ---

    function checkAndSwitchVideos() {
        const now = new Date();
        const todayString = now.toDateString(); // e.g., "Fri Jun 20 2025"

        const newMainVideoPath = getTodaysMainVideoPath();

        // If the day has changed OR it's the first time running (lastProcessedDayString is null)
        // OR the determined main video path has changed (e.g., config updated)
        if (lastProcessedDayString !== todayString || newMainVideoPath !== currentDayMainVideoPath) {
            console.log(`[CheckAndSwitch] New day or video path detected. Setting up initial sequence.`);
            currentDayMainVideoPath = newMainVideoPath; // Update today's main video path
            lastProcessedDayString = todayString; // Mark this day as processed
            
            // Start the sequence with the Accommodation video for the new day
            playAccommodationVideo();
        } else {
            console.log(`[CheckAndSwitch] Same day and main video. Current video source: ${videoPlayer.src}.`);
            // This 'else' block primarily handles cases where the browser tab might have been
            // inactive, paused, or if the user refreshed mid-sequence on the same day.
            if (videoPlayer.paused || videoPlayer.ended) {
                console.log("[CheckAndSwitch] Video paused or ended unexpectedly, re-attempting play.");
                // We need to figure out where in the sequence we were and restart appropriately.
                if (videoPlayer.src === ACCOMMODATION_VIDEO_PATH) {
                    // If the current video source is Accommodation, restart it and chain to daily.
                    playAccommodationVideo();
                } else if (videoPlayer.src === currentDayMainVideoPath) {
                    // If the current video source is the daily video, restart it and chain to Accommodation.
                    playDailyMainVideo();
                } else {
                    // Fallback for an unknown state or initial load: start the sequence from Accommodation.
                    console.warn("[CheckAndSwitch] Unknown video state, restarting sequence from Accommodation.");
                    playAccommodationVideo();
                }
            } else {
                loadingOverlay.classList.add('hidden'); // Ensure overlay is hidden if already playing
            }
        }
    }

    // --- Fullscreen Logic ---
    function toggleFullscreen() {
        if (!document.fullscreenElement) {
            if (videoContainer.requestFullscreen) {
                videoContainer.requestFullscreen();
            } else if (videoContainer.mozRequestFullScreen) {
                videoContainer.mozRequestFullScreen();
            } else if (videoContainer.webkitRequestFullscreen) {
                videoContainer.webkitRequestFullscreen();
            } else if (videoContainer.msRequestFullscreen) {
                videoContainer.msRequestFullscreen();
            }
        }
        // Always try to play the video on click, in case it was paused by browser policy
        videoPlayer.play()
            .then(() => {
                loadingOverlay.classList.add('hidden');
            })
            .catch(error => {
                console.warn("Manual play attempt failed:", error);
                loadingOverlay.querySelector('p').textContent = "Could not play. Browser might block. Check console.";
            });
    }

    // --- Event Listeners ---
    videoContainer.addEventListener('click', toggleFullscreen);

    // Initial check when the page loads
    checkAndSwitchVideos();

    // Set an interval to check for day changes every minute
    setInterval(checkAndSwitchVideos, 60 * 1000);

    // Handle tab visibility changes (e.g., when tab is minimized and reopened)
    document.addEventListener('visibilitychange', () => {
        if (document.visibilityState === 'visible') {
            console.log("Tab is visible. Re-checking video sequence.");
            checkAndSwitchVideos();
        }
    });

    // Listen for fullscreen changes to manage UI/playback state
    document.addEventListener('fullscreenchange', () => {
        if (document.fullscreenElement) {
            console.log("Entered fullscreen mode.");
            loadingOverlay.classList.add('hidden');
            videoPlayer.play(); // Ensure playback resumes after entering fullscreen
        } else {
            console.log("Exited fullscreen mode.");
        }
    });
});

// --- Fullscreen Logic ---
function toggleFullscreen() {
    if (!document.fullscreenElement) {
        if (videoContainer.requestFullscreen) {
            videoContainer.requestFullscreen();
        } else if (videoContainer.mozRequestFullScreen) {
            videoContainer.mozRequestFullScreen();
        } else if (videoContainer.webkitRequestFullscreen) {
            videoContainer.webkitRequestFullscreen();
        } else if (videoContainer.msRequestFullscreen) {
            videoContainer.msRequestFullscreen();
        }
    }
    
    // Hide cursor after 2 seconds of inactivity
    videoContainer.style.cursor = 'none';
    
    videoPlayer.play()
        .then(() => {
            loadingOverlay.classList.add('hidden');
        })
        .catch(error => {
            console.warn("Manual play attempt failed:", error);
            loadingOverlay.querySelector('p').textContent = "Could not play. Browser might block. Check console.";
        });
}

// --- Event Listeners ---
videoContainer.addEventListener('mousemove', () => {
    // Show cursor temporarily on mouse movement
    videoContainer.style.cursor = 'auto';
    clearTimeout(window.cursorTimeout);
    
    // Hide again after 2 seconds of inactivity
    window.cursorTimeout = setTimeout(() => {
        if (document.fullscreenElement) {
            videoContainer.style.cursor = 'none';
        }
    }, 2000);
});

// Update your existing fullscreenchange listener
document.addEventListener('fullscreenchange', () => {
    if (document.fullscreenElement) {
        console.log("Entered fullscreen mode.");
        loadingOverlay.classList.add('hidden');
        videoContainer.style.cursor = 'none'; // Hide cursor immediately
        videoPlayer.play();
    } else {
        console.log("Exited fullscreen mode.");
        videoContainer.style.cursor = 'auto'; // Restore cursor
    }
});