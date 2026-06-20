 /*******************************************************
 * FILE: js/notifications.js
 * Responsabilité : Gérer le titre de l'onglet et les Notifications natives
 *******************************************************/
const Notifier = {
    requestPermission() {
        if ('Notification' in window && Notification.permission === 'default') {
            Notification.requestPermission();
        }
    },

    // Met à jour le titre de l'onglet (très utile quand on change de page)
    updateTitle(timeString, loopName = '') {
        if (timeString) {
            document.title = `(${timeString}) ${loopName} - Timers`;
        } else {
            document.title = 'Timers Séquentiels';
        }
    },

    // Envoie une notification native (OS) avec le Service Worker
    sendNativeAlert(title, body) {
        if ('Notification' in window && Notification.permission === 'granted') {
            navigator.serviceWorker.getRegistration().then(reg => {
                const options = {
                    body: body,
                    icon: "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='%2310b981'%3E%3Cpath d='M12 2C6.486 2 2 6.486 2 12s4.486 10 10 10 10-4.486 10-10S17.514 2 12 2zm0 18c-4.411 0-8-3.589-8-8s3.589-8 8-8 8 3.589 8 8-3.589 8-8 8z'/%3E%3Cpath d='M13 7h-2v6h6v-2h-4z'/%3E%3C/svg%3E",
                    requireInteraction: true, // Force la notification à rester à l'écran
                    vibrate: [200, 100, 200, 100, 200]
                };

                if (reg && reg.showNotification) {
                    reg.showNotification(title, options);
                } else {
                    // Fallback si le SW n'est pas prêt
                    const n = new Notification(title, options);
                    n.onclick = () => window.focus();
                }
            });
        }
    }
};
