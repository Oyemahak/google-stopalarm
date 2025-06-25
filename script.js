let map;
let userMarker;
let destinationMarker;
let destinationLatLng = null;
let watchId;

// DOM Elements
const distanceSpan = document.getElementById("distance");
const alarmAudio = document.getElementById("alarmAudio");
const stopAlarmBtn = document.getElementById("stopAlarm");

// Initialize Google Map
function initMap() {
  map = new google.maps.Map(document.getElementById("map"), {
    center: { lat: 43.65107, lng: -79.347015 }, // Toronto default
    zoom: 15,
    disableDefaultUI: true,
  });

  // Tap on map to set destination
  map.addListener("click", (e) => {
    setDestination(e.latLng);
  });

  startTrackingUser();
}

// Set destination marker
function setDestination(latLng) {
  if (destinationMarker) destinationMarker.setMap(null);

  destinationLatLng = latLng;

  destinationMarker = new google.maps.Marker({
    position: destinationLatLng,
    map,
    label: "🎯",
    title: "Your Stop",
  });
}

// Track user with GPS
function startTrackingUser() {
  if (navigator.geolocation) {
    watchId = navigator.geolocation.watchPosition(
      (position) => {
        const userLatLng = {
          lat: position.coords.latitude,
          lng: position.coords.longitude,
        };

        if (userMarker) {
          userMarker.setPosition(userLatLng);
        } else {
          userMarker = new google.maps.Marker({
            position: userLatLng,
            map,
            label: "🧍",
            title: "You",
          });
        }

        map.setCenter(userLatLng);

        // Check distance to destination
        if (destinationLatLng) {
          const dist = getDistanceInMeters(
            userLatLng.lat,
            userLatLng.lng,
            destinationLatLng.lat(),
            destinationLatLng.lng()
          );

          distanceSpan.innerText = Math.round(dist);

          if (dist <= 200) {
            triggerAlarm();
          }
        }
      },
      (error) => {
        alert("Location access denied or unavailable.");
      },
      {
        enableHighAccuracy: true,
        maximumAge: 0,
        timeout: 10000,
      }
    );
  } else {
    alert("Geolocation is not supported by your browser.");
  }
}

// Haversine formula: Get distance in meters
function getDistanceInMeters(lat1, lon1, lat2, lon2) {
  const R = 6371e3;
  const φ1 = (lat1 * Math.PI) / 180;
  const φ2 = (lat2 * Math.PI) / 180;
  const Δφ = ((lat2 - lat1) * Math.PI) / 180;
  const Δλ = ((lon2 - lon1) * Math.PI) / 180;

  const a =
    Math.sin(Δφ / 2) ** 2 +
    Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) ** 2;

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return R * c;
}

// Trigger alarm
function triggerAlarm() {
  if (alarmAudio.paused) {
    alarmAudio.play().catch((err) => {
      console.log("Autoplay blocked. User interaction needed.", err);
    });
    if ("vibrate" in navigator) {
      navigator.vibrate([500, 300, 500, 300, 500]);
    }
    alert("You’re at your destination!");
  }
}

// Stop alarm manually
stopAlarmBtn.addEventListener("click", () => {
  alarmAudio.pause();
  alarmAudio.currentTime = 0;
  navigator.vibrate?.(0);
});