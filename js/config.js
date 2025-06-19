// js/config.js
const PHOTO_CONFIG = {
  BASE_PATH: 'http://localhost:9000/photos/',
  DEFAULT_IMAGE: 'defimg.png',
  EXTENSION: 'png'
};

function getEmployeePhotoUrl(empid) {
  return `${PHOTO_CONFIG.BASE_PATH}${empid}.${PHOTO_CONFIG.EXTENSION}`;
}

function getDefaultPhotoUrl() {
  return `${PHOTO_CONFIG.BASE_PATH}${PHOTO_CONFIG.DEFAULT_IMAGE}`;
}

// Export as global object
window.PhotoConfig = {
  getEmployeePhotoUrl,
  getDefaultPhotoUrl
};