      /*******************************************************
         * FILE: js/ui.js
         * Responsabilité : Manipuler le DOM (Affichage, formulaires)
         *******************************************************/
        const UI = {
            formatTime(totalSeconds) {
                const h = Math.floor(totalSeconds / 3600);
                const m = Math.floor((totalSeconds % 3600) / 60);
                const s = totalSeconds % 60;
                return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
            },

            showView(viewName) {
                document.getElementById('dashboard-view').classList.add('hidden');
                document.getElementById('runner-view').classList.add('hidden');
                document.getElementById(`${viewName}-view`).classList.remove('hidden');
            },

            renderDashboard(timers, loops) {
                this.renderTimers(timers);
                this.renderLoops(timers, loops);
            },

            renderTimers(timers) {
                const container = document.getElementById('timers-list');
                if (timers.length === 0) {
                    container.innerHTML = '<p class="text-slate-400 text-center italic mt-4">Aucun minuteur.</p>';
                    return;
                }
                container.innerHTML = timers.map(t => `
                    <div class="flex justify-between items-center p-3 bg-slate-50 border border-slate-100 rounded-xl">
                        <div class="flex-1">
                            <div class="font-bold text-slate-800">${t.name}</div>
                            <div class="text-sm font-mono text-slate-500">${this.formatTime(t.totalSeconds)}</div>
                        </div>
                        <div class="flex items-center gap-1 sm:gap-2">
                            <button onclick="App.startSingleTimer('${t.id}')" class="px-2 py-1 sm:px-3 sm:py-1.5 bg-emerald-100 text-emerald-700 rounded-lg text-xs font-bold transition-colors">▶ Jouer</button>
                            <button onclick="App.openTimerModal('${t.id}')" class="p-2 text-slate-400 hover:text-blue-500 bg-white rounded-lg shadow-sm">✎</button>
                            <button onclick="App.deleteTimer('${t.id}')" class="p-2 text-slate-400 hover:text-rose-500 bg-white rounded-lg shadow-sm">✕</button>
                        </div>
                    </div>
                `).join('');
            },

            renderLoops(timers, loops) {
                const container = document.getElementById('loops-list');
                if (loops.length === 0) {
                    container.innerHTML = '<p class="text-slate-400 text-center italic mt-4">Aucune boucle.</p>';
                    return;
                }
                
                let optionsHtml = '<option value="" disabled selected>Ajouter un minuteur...</option>';
                timers.forEach(t => { optionsHtml += `<option value="${t.id}">${t.name} (${this.formatTime(t.totalSeconds)})</option>`; });

                container.innerHTML = loops.map(loop => {
                    const canPlay = loop.timerIds.length > 0;
                    let itemsHtml = loop.timerIds.length === 0 ? '<p class="text-xs text-slate-400 italic mb-2">Boucle vide.</p>' : '<ul class="mb-3 space-y-1">';
                    
                    if(loop.timerIds.length > 0) {
                        loop.timerIds.forEach((tId, index) => {
                            const t = Store.getTimer(tId);
                            if(t) itemsHtml += `<li class="text-sm bg-white border p-2 rounded flex justify-between"><span><span class="text-slate-400 mr-2">${index + 1}.</span>${t.name}</span> <button onclick="App.removeTimerFromLoop('${loop.id}', ${index})" class="text-rose-400">✕</button></li>`;
                        });
                        itemsHtml += '</ul>';
                    }

                    return `
                        <div class="p-4 bg-slate-50 border rounded-xl">
                            <div class="flex justify-between items-center mb-3">
                                <h3 class="font-bold text-slate-800 text-lg cursor-pointer hover:text-emerald-600" onclick="App.renameLoop('${loop.id}')">${loop.name} <span class="text-xs font-normal text-slate-400">✎</span></h3>
                                <div class="flex gap-2">
                                    <button onclick="App.startLoopRunner('${loop.id}')" class="px-3 py-1 bg-emerald-500 text-white rounded-lg text-sm font-bold disabled:opacity-50" ${canPlay ? '' : 'disabled'}>▶ Jouer</button>
                                    <button onclick="App.deleteLoop('${loop.id}')" class="p-1.5 text-slate-400 hover:text-rose-500 bg-white rounded-lg shadow-sm">✕</button>
                                </div>
                            </div>
                            ${itemsHtml}
                            <div class="flex gap-2">
                                <select id="select-timer-${loop.id}" class="flex-1 text-sm border-slate-300 rounded-lg p-2">${optionsHtml}</select>
                                <button onclick="App.addTimerToLoop('${loop.id}')" class="bg-slate-800 text-white px-3 py-1.5 rounded-lg text-sm">Ajouter</button>
                            </div>
                        </div>
                    `;
                }).join('');
            },

            // --- Formulaires et Modales ---
            openTimerModal(timer = null) {
                document.getElementById('timer-modal-title').innerText = timer ? 'Éditer le minuteur' : 'Nouveau Minuteur';
                document.getElementById('timer-id').value = timer ? timer.id : '';
                document.getElementById('timer-name').value = timer ? timer.name : `Timer ${Store.timers.length + 1}`;
                document.getElementById('timer-h').value = timer ? Math.floor(timer.totalSeconds / 3600) : 0;
                document.getElementById('timer-m').value = timer ? Math.floor((timer.totalSeconds % 3600) / 60) : 0;
                document.getElementById('timer-s').value = timer ? timer.totalSeconds % 60 : 0;
                document.getElementById('timer-modal').classList.remove('hidden');
            },

            closeTimerModal() { document.getElementById('timer-modal').classList.add('hidden'); },

            getTimerFormData() {
                return {
                    id: document.getElementById('timer-id').value,
                    name: document.getElementById('timer-name').value.trim() || 'Minuteur',
                    h: parseInt(document.getElementById('timer-h').value) || 0,
                    m: parseInt(document.getElementById('timer-m').value) || 0,
                    s: parseInt(document.getElementById('timer-s').value) || 0,
                }
            },

            getTimerSelectionForLoop(loopId) {
                return document.getElementById(`select-timer-${loopId}`).value;
            },

            // --- Runner Interface ---
            updateRunnerDisplay(state) {
                document.getElementById('runner-loop-name').innerText = state.loopName;
                document.getElementById('runner-time-display').innerText = this.formatTime(state.remainingSeconds);
                
                const currentTimer = state.sequence[state.currentIndex];
                const timerNameEl = document.getElementById('runner-timer-name');
                const btnStart = document.getElementById('btn-start');
                const btnStop = document.getElementById('btn-stop');
                const display = document.getElementById('runner-time-display');

                if (state.loopId === 'single') {
                    timerNameEl.innerText = currentTimer.name;
                    document.getElementById('runner-sequence-container').classList.add('hidden');
                } else {
                    timerNameEl.innerText = `Étape ${state.currentIndex + 1} / ${state.sequence.length} : ${currentTimer.name}`;
                    document.getElementById('runner-sequence-container').classList.remove('hidden');
                    this.renderRunnerSequence(state);
                }

                // UI Styles basés sur l'état
                btnStop.classList.remove('btn-ringing');
                display.classList.remove('text-rose-500');
                display.classList.add('text-slate-800');

                if (state.status === 'idle' || state.status === 'paused') {
                    btnStart.disabled = false; btnStop.disabled = true;
                } else if (state.status === 'running') {
                    btnStart.disabled = true; btnStop.disabled = false;
                } else if (state.status === 'ringing') {
                    btnStart.disabled = true; btnStop.disabled = false;
                    btnStop.classList.add('btn-ringing');
                    display.classList.replace('text-slate-800', 'text-rose-500');
                }
            },

            renderRunnerSequence(state) {
                document.getElementById('runner-sequence-list').innerHTML = state.sequence.map((t, idx) => {
                    const isCurrent = idx === state.currentIndex;
                    const classes = isCurrent ? 'bg-emerald-100 border-emerald-300 font-bold text-emerald-800' : 'bg-slate-50 text-slate-500 border-transparent';
                    return `<li class="p-3 rounded-lg flex justify-between border transition-colors ${classes}">
                        <span>${isCurrent ? '▶ ' : ''}${idx + 1}. ${t.name}</span>
                        <span class="font-mono text-sm">${this.formatTime(t.totalSeconds)}</span>
                    </li>`;
                }).join('');
            }
        };
