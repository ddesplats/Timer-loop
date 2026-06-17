        /*******************************************************
         * FILE: js/audio.js
         * Responsabilité : Gérer les sons (Web Audio API)
         *******************************************************/
        const AudioService = {
            ctx: null,
            interval: null,

            init() {
                if (!this.ctx) this.ctx = new (window.AudioContext || window.webkitAudioContext)();
                if (this.ctx.state === 'suspended') this.ctx.resume();
            },

            playAlarm() {
                this.init();
                this.stopAlarm(); // Clear any existing
                this.interval = setInterval(() => {
                    const osc = this.ctx.createOscillator();
                    const gain = this.ctx.createGain();
                    osc.connect(gain);
                    gain.connect(this.ctx.destination);
                    osc.type = 'square';
                    osc.frequency.value = 800;
                    gain.gain.setValueAtTime(0, this.ctx.currentTime);
                    gain.gain.linearRampToValueAtTime(1, this.ctx.currentTime + 0.05);
                    gain.gain.linearRampToValueAtTime(0, this.ctx.currentTime + 0.3);
                    osc.start(this.ctx.currentTime);
                    osc.stop(this.ctx.currentTime + 0.3);
                }, 600);
            },

            stopAlarm() {
                if (this.interval) {
                    clearInterval(this.interval);
                    this.interval = null;
                }
            }
        };
