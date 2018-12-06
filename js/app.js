if ('serviceWorker' in navigator) {
  navigator.serviceWorker.register('./service-worker.js', {scope: './'})
    .then(function (registration) {
      console.log(registration, registration.scope);
    })
    .catch(function (e) {
      console.error(e);
    })
} else {
    console.log('Service Worker is not supported in this browser.')
}