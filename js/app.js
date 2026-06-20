        /*******************************************************
         * FILE: js/app.js
         * Responsabilité : Contrôleur Principal. Fait le lien entre
         * l'UI, le Store et le Runner. Expose les fonctions globales.
         *******************************************************/
        const App = {
            init() {
                // Enregistrement manuel du Service Worker pour la PWA
                if ('serviceWorker' in navigator) {
                    navigator.serviceWorker.register('./sw.js').catch(err => {
                        console.info("Info PWA : L'enregistrement du Service Worker a échoué. Si vous n'êtes pas encore sur GitHub Pages ou un environnement sécurisé HTTPS, c'est normal.", err);
                    });
                }
                
                Store.load();
                UI.renderDashboard(Store.timers, Store.loops);
                
                // On attache la méthode de l'UI à l'événement de tick du Runner
                Runner.onTick = (state) => UI.updateRunnerDisplay(state);
            },

            // --- ACTIONS TIMERS ---
            openTimerModal(id = null) {
                const timer = id ? Store.getTimer(id) : null;
                UI.openTimerModal(timer);
            },
            closeTimerModal() { UI.closeTimerModal(); },
            
            saveTimer(event) {
                event.preventDefault();
                const data = UI.getTimerFormData();
                const totalSeconds = (data.h * 3600) + (data.m * 60) + data.s;

                if (totalSeconds <= 0) return Dialog.show({ type: 'alert', message: "Le minuteur doit durer au moins 1 seconde." });

                if (data.id) {
                    const idx = Store.timers.findIndex(t => t.id === data.id);
                    if(idx > -1) Store.timers[idx] = { id: data.id, name: data.name, totalSeconds };
                } else {
                    Store.timers.push({ id: Store.generateId(), name: data.name, totalSeconds });
                }

                Store.save();
                UI.renderDashboard(Store.timers, Store.loops);
                UI.closeTimerModal();
            },
            
            deleteTimer(id) {
                Dialog.show({
                    type: 'confirm', message: "Supprimer ce minuteur ? Il sera retiré des boucles existantes.",
                    onConfirm: () => { Store.deleteTimer(id); UI.renderDashboard(Store.timers, Store.loops); }
                });
            },

            // --- ACTIONS BOUCLES ---
            createNewLoop() {
                Dialog.show({
                    type: 'prompt', title: 'Nouvelle Boucle', message: 'Nom de la boucle :', defaultValue: `Boucle ${Store.loops.length + 1}`,
                    onConfirm: (name) => {
                        Store.loops.push({ id: Store.generateId(), name: name.trim() || 'Boucle', timerIds: [] });
                        Store.save();
                        UI.renderDashboard(Store.timers, Store.loops);
                    }
                });
            },
            renameLoop(id) {
                const loop = Store.getLoop(id);
                Dialog.show({
                    type: 'prompt', title: 'Renommer', message: 'Nouveau nom :', defaultValue: loop.name,
                    onConfirm: (name) => {
                        if(name) { loop.name = name.trim(); Store.save(); UI.renderDashboard(Store.timers, Store.loops); }
                    }
                });
            },
            deleteLoop(id) {
                Dialog.show({
                    type: 'confirm', message: "Voulez-vous supprimer cette boucle ?",
                    onConfirm: () => { Store.deleteLoop(id); UI.renderDashboard(Store.timers, Store.loops); }
                });
            },
            addTimerToLoop(loopId) {
                const timerId = UI.getTimerSelectionForLoop(loopId);
                if (timerId) {
                    Store.getLoop(loopId).timerIds.push(timerId);
                    Store.save();
                    UI.renderDashboard(Store.timers, Store.loops);
                }
            },
            removeTimerFromLoop(loopId, index) {
                Store.getLoop(loopId).timerIds.splice(index, 1);
                Store.save();
                UI.renderDashboard(Store.timers, Store.loops);
            },

            // --- ACTIONS RUNNER ---
            startSingleTimer(timerId) {
                const timer = Store.getTimer(timerId);
                if(!timer) return;
                
                Runner.startSequence('single', 'Timer Indépendant', [timer]);
                UI.showView('runner');
                UI.updateRunnerDisplay(Runner.state);
            },

            startLoopRunner(loopId) {
                const loop = Store.getLoop(loopId);
                const sequence = loop.timerIds.map(id => Store.getTimer(id)).filter(t => t !== undefined);
                
                if (sequence.length === 0) return Dialog.show({ type: 'alert', message: "Boucle invalide." });

                Runner.startSequence(loop.id, loop.name, sequence);
                UI.showView('runner');
                UI.updateRunnerDisplay(Runner.state);
            },

            exitRunner() {
                Runner.stopEverything();
                UI.showView('dashboard');
                UI.renderDashboard(Store.timers, Store.loops);
            },

            handleRunnerStart() {
                AudioService.init(); // Requis par les navigateurs au premier clic
                Runner.play();
            },

            handleRunnerStop() {
                if (Runner.state.status === 'running') {
                    Runner.pause();
                } else if (Runner.state.status === 'ringing') {
                    Runner.acknowledgeAlarm();
                }
            }
        };

        // ==========================================
        // Démarrage de l'application
        // ==========================================
        window.App = App; // Expose l'App pour les attributs onclick du HTML
        App.init();
