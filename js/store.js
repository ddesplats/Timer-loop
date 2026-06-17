        /*******************************************************
         * FILE: js/store.js
         * Responsabilité : Gérer les données (Timers, Loops, LocalStorage)
         *******************************************************/
        const Store = {
            timers: [],
            loops: [],

            load() {
                this.timers = JSON.parse(localStorage.getItem('app_timers')) || [];
                this.loops = JSON.parse(localStorage.getItem('app_loops')) || [];
            },

            save() {
                localStorage.setItem('app_timers', JSON.stringify(this.timers));
                localStorage.setItem('app_loops', JSON.stringify(this.loops));
            },

            generateId() {
                return Math.random().toString(36).substr(2, 9);
            },

            getTimer(id) { return this.timers.find(t => t.id === id); },
            getLoop(id) { return this.loops.find(l => l.id === id); },

            deleteTimer(id) {
                this.timers = this.timers.filter(t => t.id !== id);
                this.loops.forEach(loop => { loop.timerIds = loop.timerIds.filter(tId => tId !== id); });
                this.save();
            },
            
            deleteLoop(id) {
                this.loops = this.loops.filter(l => l.id !== id);
                this.save();
            }
        };
