        /*******************************************************
         * FILE: js/runner.js
         * Responsabilité : Moteur du chronomètre et de la séquence
         *******************************************************/
        const Runner = {
            state: {
                loopId: null,
                loopName: '',
                sequence: [],
                currentIndex: 0,
                remainingSeconds: 0,
                status: 'idle', // 'idle', 'running', 'paused', 'ringing'
                intervalId: null
            },
            onTick: null, // Hook pour alerter l'UI

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
                // Passe au timer suivant (boucle à zéro si c'est le dernier)
                this.state.currentIndex = (this.state.currentIndex + 1) % this.state.sequence.length;
                this.loadCurrentTimer();
                this.play(); // Redémarre automatiquement
            },

            stopEverything() {
                this.stopInterval();
                AudioService.stopAlarm();
                this.state.status = 'idle';
            },

            stopInterval() {
                if (this.state.intervalId) {
                    clearInterval(this.state.intervalId);
                    this.state.intervalId = null;
                }
            },

            tick() {
                this.state.remainingSeconds--;
                if (this.state.remainingSeconds <= 0) {
                    this.stopInterval();
                    this.state.remainingSeconds = 0;
                    this.state.status = 'ringing';
                    AudioService.playAlarm();
                }
                if (this.onTick) this.onTick(this.state);
            }
        };
