// js/config.js
const PHOTO_CONFIG = {
  BASE_PATH: 'photos/',
  DEFAULT_IMAGE: 'defimg.jpg',
  EXTENSION: 'jpg'
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