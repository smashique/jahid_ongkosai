import { supabase, checkSubscription } from './payment.js';

// Global Player Tracker
let players = {};
let userIsPremium = false;

// DOM Elements
const videoGrid = document.getElementById('videoGrid');
const modal = document.getElementById('premiumModal');
const classSelect = document.getElementById('classSelect');

// Initialize
async function init() {
    console.log("🚀 System Initializing...");
    
    // Check Subscription Status
    userIsPremium = await checkSubscription();
    updateUserStatusUI(userIsPremium);

    // Load initial videos (Demo: Class 9)
    loadVideos('9'); 
}

// Update UI based on status
function updateUserStatusUI(isPremium) {
    const badge = document.getElementById('subStatus');
    if(isPremium) {
        badge.innerText = "Premium Student 🎓";
        badge.style.background = "#22c55e"; // Green
    }
}

// Fetch Videos from Supabase
async function loadVideos(className) {
    videoGrid.innerHTML = '<p style="text-align:center; width:100%">Loading Math Problems...</p>';
    
    const { data, error } = await supabase
        .from('videos')
        .select('*')
        .eq('class_level', className);

    if (error) {
        console.error("Error loading videos:", error);
        return;
    }

    renderVideos(data);
}

// Render Videos with YouTube API Logic
function renderVideos(videos) {
    videoGrid.innerHTML = '';
    videos.forEach((video, index) => {
        const videoId = extractVideoID(video.youtube_url);
        const uniqueId = `player-${video.id}`;
        
        const card = document.createElement('div');
        card.className = 'video-card glass-card';
        card.innerHTML = `
            <div class="video-wrapper">
                <div id="${uniqueId}"></div>
            </div>
            <div style="padding:15px;">
                <h3>${video.chapter_name} - অংক নং: ${video.math_no}</h3>
                <small>Class: ${video.class_level}</small>
            </div>
        `;
        videoGrid.appendChild(card);

        // Init YouTube Player for this video
        players[uniqueId] = new YT.Player(uniqueId, {
            height: '100%',
            width: '100%',
            videoId: videoId,
            events: {
                'onStateChange': (event) => onPlayerStateChange(event, video.free_duration_sec)
            }
        });
    });
}

// Monitor Playback Time
function onPlayerStateChange(event, freeLimit) {
    if (userIsPremium) return; // Premium users have no limits

    if (event.data == YT.PlayerState.PLAYING) {
        const player = event.target;
        
        const timer = setInterval(() => {
            const currentTime = player.getCurrentTime();
            if (currentTime >= freeLimit) {
                player.pauseVideo();
                clearInterval(timer);
                showPaywall();
            }
        }, 1000);
    }
}

function showPaywall() {
    modal.classList.remove('hidden');
}

window.closeModal = () => {
    modal.classList.add('hidden');
}

// Utility: Get ID from URL
function extractVideoID(url) {
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
    const match = url.match(regExp);
    return (match && match[2].length === 11) ? match[2] : null;
}

// YouTube API Ready Listener
window.onYouTubeIframeAPIReady = init;

// Filter Event
document.getElementById('searchBtn').addEventListener('click', () => {
    const cls = classSelect.value;
    if(cls) loadVideos(cls);
});
