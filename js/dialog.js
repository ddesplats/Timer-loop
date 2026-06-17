         /*******************************************************
         * FILE: js/dialog.js
         * Responsabilité : Gérer les modales d'alerte, confirmation, prompt
         *******************************************************/
        const Dialog = {
            callback: null,

            show(options) {
                const modal = document.getElementById('dialog-modal');
                const titleEl = document.getElementById('dialog-title');
                const msgEl = document.getElementById('dialog-message');
                const inputEl = document.getElementById('dialog-input');
                const btnCancel = document.getElementById('dialog-btn-cancel');
                const btnConfirm = document.getElementById('dialog-btn-confirm');

                // Reset
                inputEl.classList.add('hidden');
                btnCancel.classList.add('hidden');
                inputEl.value = '';

                // Hydrate
                titleEl.innerText = options.title || 'Attention';
                msgEl.innerText = options.message || '';
                this.callback = options.onConfirm;

                if (options.type === 'confirm') {
                    btnCancel.classList.remove('hidden');
                } else if (options.type === 'prompt') {
                    btnCancel.classList.remove('hidden');
                    inputEl.classList.remove('hidden');
                    inputEl.value = options.defaultValue || '';
                    setTimeout(() => inputEl.focus(), 100);
                }

                // Event Listeners
                btnConfirm.onclick = () => this.close(true, options.type === 'prompt' ? inputEl.value : null);
                btnCancel.onclick = () => this.close(false);
                inputEl.onkeyup = (e) => { if (e.key === 'Enter') this.close(true, inputEl.value); };

                modal.classList.remove('hidden');
            },

            close(isConfirmed, inputValue = null) {
                document.getElementById('dialog-modal').classList.add('hidden');
                if (isConfirmed && this.callback) {
                    this.callback(inputValue);
                }
            }
        };
