/*******************************************************
 * FILE: js/runner.js
 * Responsabilité : Moteur du chronomètre et de la séquence
 *******************************************************/
const Runner = {
    state: {
        loopId: null, loopName: '', sequence: [], currentIndex: 0,
        remainingSeconds: 0, status: 'idle', intervalId: null
    },
    onTick: null, 

    startSequence(loopId, loopName, timersArray) {
        this.state.loopId = loopId;
        this.state.loopName = loopName;
        this.state.sequence = timersArray;
        this.state.currentIndex = 0;
        this.state.status = 'idle';
        this.stopInterval();
        this.loadCurrentTimer();
    },

    loadCurrentTimer() {
        const current = this.state.sequence[this.state.currentIndex];
        this.state.remainingSeconds = current.totalSeconds;
    },

    play() {
        Notifier.requestPermission(); // Demande la permission système au premier Play
        if (this.state.status === 'idle' || this.state.status === 'paused') {
            this.state.status = 'running';
            this.state.intervalId = setInterval(() => this.tick(), 1000);
            if (this.onTick) this.onTick(this.state);
        }
    },

    pause() {
        if (this.state.status === 'running') {
            this.stopInterval();
            this.state.status = 'paused';
            if (this.onTick) this.onTick(this.state);
        }
    },

    acknowledgeAlarm() {
        AudioService.stopAlarm();
        if (this.state.loopId === 'single') {
            this.state.status = 'idle'; 
            this.loadCurrentTimer();
            if (this.onTick) this.onTick(this.state); 
        } else {
            this.state.status = 'idle'; 
            this.state.currentIndex = (this.state.currentIndex + 1) % this.state.sequence.length;
            this.loadCurrentTimer();
            this.play(); 
        }
    },

    stopEverything() {
        this.stopInterval();
        AudioService.stopAlarm();
        this.state.status = 'idle';
        Notifier.updateTitle(''); // Reset du titre
    },

    stopInterval() {
        if (this.state.intervalId) { clearInterval(this.state.intervalId); this.state.intervalId = null; }
    },

    tick() {
        this.state.remainingSeconds--;
        
        // Hook Notifier: Mise à jour du titre
        const currentTimer = this.state.sequence[this.state.currentIndex];
        Notifier.updateTitle(UI.formatTime(this.state.remainingSeconds), currentTimer.name);

        if (this.state.remainingSeconds <= 0) {
            this.stopInterval();
            this.state.remainingSeconds = 0;
            this.state.status = 'ringing';
            AudioService.playAlarm();
            
            // Hook Notifier: Notification native de fin
            Notifier.sendNativeAlert("Minuteur terminé !", `Étape : ${currentTimer.name}\nCliquez pour arrêter l'alarme.`);
        }
        if (this.onTick) this.onTick(this.state);
    }
};
