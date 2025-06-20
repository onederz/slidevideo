document.addEventListener('DOMContentLoaded', () => {
    const videoContainer = document.getElementById('videoContainer');
    const videoPlayer = document.getElementById('videoPlayer');
    const loadingOverlay = document.getElementById('loadingOverlay');

    // --- Configuration ---
    // Make sure these Cloudinary URLs are correct and publicly accessible
    const ACCOMMODATION_VIDEO_PATH = 'https://res.cloudinary.com/dthx12rbs/video/upload/v1750411002/Accommodation_qwd9me.mp4';

    const DAILY_VIDEO_MAP = {
        0: 'https://res.cloudinary.com/dthx12rbs/video/upload/v1750409629/jl7759exlidggqgoeukv.mp4',    // Sunday video
        1: 'https://res.cloudinary.com/dthx12rbs/video/upload/v1750409632/kfshyircf4k88gbeabcz.mp4',    // Monday video
        2: 'https://res.cloudinary.com/dthx12rbs/video/upload/v1750409613/twtnlztswyxur0mhdkku.mp4',    // Tuesday video
        3: 'https://res.cloudinary.com/dthx12rbs/video/upload/v1750409635/bfc9xdrnreqc7uhjeyzz.mp4', // Wednesday video
        4: 'https://res.cloudinary.com/dthx12rbs/video/upload/v1750409625/y8kicywwuc5yu3s3k659.mp4',    // Thursday video
        5: 'https://res.cloudinary.com/dthx12rbs/video/upload/v1750409620/juinn4iz9b8bruxa0vpu.mp4',    // Friday video
        6: 'https://res.cloudinary.com/dthx12rbs/video/upload/v1750409633/vjo1niemj9beuy4wdkh0.mp4'    // Saturday video
    };

    // --- State Variables ---
    let currentDayMainVideoPath = null; // The path to today's main video (e.g., friday.mp4)
    let lastProcessedDayString = null; // To track if the day has truly changed

    // --- Utility Functions ---

    function getTodaysMainVideoPath() {
        const now = new Date();
        const currentDayOfWeek = now.getDay(); // 0 for Sunday, 1 for Monday, etc.
        const videoFileName = DAILY_VIDEO_MAP[currentDayOfWeek];
        if (!videoFileName) {
            console.error(`Error: No main video defined for day of week: ${currentDayOfWeek}`);
            return null;
        }
        // This is the corrected line: videoFileName already contains the full Cloudinary URL
        return videoFileName;
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
        // Daily video plays once
        loadAndPlayVideo(currentDayMainVideoPath, false);

        // When the daily video ends, call the function to play Accommodation again
        videoPlayer.onended = playAccommodationVideo;
    }

    function playAccommodationVideo() {
        console.log(`[Sequence] Playing Accommodation video: ${ACCOMMODATION_VIDEO_PATH}`);
        // Accommodation video plays once
        loadAndPlayVideo(ACCOMMODATION_VIDEO_PATH, false);
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
    setInterval(checkAndSwitchVideos, 60 * 1000); // Checks every 60 seconds

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