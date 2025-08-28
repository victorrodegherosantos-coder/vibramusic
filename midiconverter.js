// Espera o DOM carregar para adicionar listeners
document.addEventListener('DOMContentLoaded', () => {

    // Elementos da UI
    const fileInput = document.getElementById('midiFile');
    const convertButton = document.getElementById('convertButton');
    const statusDiv = document.getElementById('status');
    const outputPre = document.getElementById('output');
    const songButtons = document.querySelectorAll('.song-button'); // Seleciona todos os botões de música

    // Verifica suporte à Vibração
    const supportsVibration = 'vibrate' in navigator;
    if (!supportsVibration) {
        statusDiv.textContent = 'Seu navegador não suporta a API de Vibração.';
        // Desabilita todos os botões que dependem da vibração
        if(convertButton) convertButton.disabled = true;
        if(fileInput) fileInput.disabled = true;
        songButtons.forEach(button => button.disabled = true);
        // O botão de parar não precisa ser desabilitado, pois não fará nada
    } else {
         statusDiv.textContent = 'Pronto. Selecione uma música ou faça upload.';
    }

    // Event Listener para o botão de UPLOAD
    if(convertButton) {
        convertButton.addEventListener('click', handleFileUploadConversion);
    }

    // Event Listeners para os botões de MÚSICAS PRÉ-DEFINIDAS
    songButtons.forEach(button => {
        button.addEventListener('click', () => {
            const midiUrl = button.getAttribute('data-midi-src');
            const songName = button.getAttribute('data-song-name') || 'música selecionada';
            if (midiUrl) {
                playMidiFromUrl(midiUrl, songName);
            } else {
                statusDiv.textContent = 'Erro: URL do MIDI não encontrada no botão.';
            }
        });
    });

    /**
     * Lida com a seleção de arquivo via INPUT e inicia a conversão.
     */
    async function handleFileUploadConversion() {
        const file = fileInput.files[0];
        if (!file) {
            statusDiv.textContent = 'Por favor, selecione um arquivo MIDI para upload.';
            return;
        }
        if (!supportsVibration) return; // Checagem extra

        statusDiv.textContent = 'Lendo arquivo local...';
        outputPre.textContent = '';

        try {
            const arrayBuffer = await readFileAsArrayBuffer(file);
            processMidiData(arrayBuffer, file.name); // Chama a função de processamento comum
        } catch (error) {
            handleError(error, 'Erro ao ler arquivo local');
        }
    }

    /**
     * Carrega um arquivo MIDI de uma URL (para músicas pré-definidas) e inicia a conversão.
     * @param {string} url - Caminho relativo ou absoluto para o arquivo .mid.
     * @param {string} songName - Nome da música para exibição.
     */
    async function playMidiFromUrl(url, songName) {
        if (!supportsVibration) return; // Checagem extra

        statusDiv.textContent = `Carregando ${songName}...`;
        outputPre.textContent = '';

        try {
            const response = await fetch(url);
            if (!response.ok) {
                throw new Error(`Erro ao buscar MIDI: ${response.status} ${response.statusText}. Verifique se o arquivo '${url}' existe.`);
            }
            const arrayBuffer = await response.arrayBuffer();
            processMidiData(arrayBuffer, songName); // Chama a função de processamento comum
        } catch (error) {
            handleError(error, `Erro ao carregar ${songName}`);
        }
    }

    /**
     * Função central que processa o ArrayBuffer do MIDI (seja de upload ou fetch).
     * @param {ArrayBuffer} arrayBuffer - Os dados binários do MIDI.
     * @param {string} sourceName - Nome da música ou arquivo para exibição.
     */
    function processMidiData(arrayBuffer, sourceName) {
         statusDiv.textContent = `Analisando ${sourceName}...`;
         // Usa a biblioteca @tonejs/midi para parsear
        const midiData = new Midi(arrayBuffer);

        statusDiv.textContent = `Gerando padrão de vibração para ${sourceName}...`;
        const vibrationPattern = generateVibrationPattern(midiData);

        if (vibrationPattern && vibrationPattern.length > 0) {
            // Limita o display do padrão para não poluir muito a tela
            const displayPattern = vibrationPattern.length > 100
                ? `[${vibrationPattern.slice(0, 100).join(', ')}, ...]`
                : `[${vibrationPattern.join(', ')}]`;
            outputPre.textContent = `Padrão Gerado (${vibrationPattern.length} passos):\n${displayPattern}`;

            statusDiv.textContent = `Vibrando ${sourceName}!`;
            console.log(`Vibrando padrão para ${sourceName}:`, vibrationPattern);
            navigator.vibrate(vibrationPattern);
        } else {
            statusDiv.textContent = `Não foi possível gerar um padrão de vibração para ${sourceName}. Verifique o arquivo MIDI.`;
             outputPre.textContent = '';
        }
    }

    /**
     * Função auxiliar para ler arquivo local.
     * @param {File} file
     * @returns {Promise<ArrayBuffer>}
     */
    function readFileAsArrayBuffer(file) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = () => resolve(reader.result);
            reader.onerror = () => reject(reader.error);
            reader.readAsArrayBuffer(file);
        });
    }

   /**
    * Gera o padrão [vibra, pausa, vibra, ...] a partir dos dados MIDI.
    * Processa apenas a primeira trilha com notas encontradas.
    * @param {Midi} midiData - O objeto MIDI parseado por @tonejs/midi.
    * @returns {number[] | null} - O array de padrão de vibração, ou null.
    */
    function generateVibrationPattern(midiData) {
        let targetTrack = null;
        for (const track of midiData.tracks) {
            if (track.notes && track.notes.length > 0) {
                targetTrack = track;
                console.log(`Processando trilha ${track.channelNumber === -1 ? '(sem canal)' : track.channelNumber} com ${track.notes.length} notas.`);
                break; // Usa a primeira que encontrar
            }
        }

        if (!targetTrack) {
            console.log("Nenhuma trilha com notas encontrada.");
            return null;
        }

        const notes = targetTrack.notes.sort((a, b) => a.time - b.time);
        if (notes.length === 0) return null;

        const vibrationPattern = [];
        const minDurationMs = 20;
        const maxSegmentValue = 15000; // Limite para durações/pausas individuais (15s)
        const MAX_PATTERN_LENGTH = 1500; // Limite total de elementos no array

        // 1. Handle initial silence
        const firstNoteStartMs = Math.round(notes[0].time * 1000);
        if (firstNoteStartMs > minDurationMs) {
            vibrationPattern.push(0);
            vibrationPattern.push(Math.min(firstNoteStartMs, maxSegmentValue));
        }

        // 2. Iterate through notes for [vibration, pause] pairs
        for (let i = 0; i < notes.length; i++) {
            if (vibrationPattern.length >= MAX_PATTERN_LENGTH) {
                 console.warn(`Padrão truncado em ${MAX_PATTERN_LENGTH} elementos.`);
                 break;
            }

            const currentNote = notes[i];
            let vibDurationMs = Math.max(minDurationMs, Math.min(Math.round(currentNote.duration * 1000), maxSegmentValue));
            vibrationPattern.push(vibDurationMs);

            // Calculate pause until the next note (if exists)
            if (i < notes.length - 1) {
                 if (vibrationPattern.length >= MAX_PATTERN_LENGTH) break; // Check again before adding pause

                const currentNoteEndMs = Math.round(currentNote.time * 1000) + vibDurationMs;
                const nextNoteStartMs = Math.round(notes[i+1].time * 1000);
                let pauseDurationMs = nextNoteStartMs - currentNoteEndMs;

                // Only add pause if it's significant
                if (pauseDurationMs >= minDurationMs) {
                     vibrationPattern.push(Math.min(pauseDurationMs, maxSegmentValue));
                } else {
                     // If gap is too small or negative (overlap), add minimum pause to ensure alternation
                     vibrationPattern.push(minDurationMs);
                }
            } else {
                // Add a final pause after the last note
                 if (vibrationPattern.length < MAX_PATTERN_LENGTH) {
                    vibrationPattern.push(500); // Default final pause
                 }
            }
        }
         // Ensure the pattern length is even (ends with a pause)
         if (vibrationPattern.length % 2 !== 0 && vibrationPattern.length < MAX_PATTERN_LENGTH ) {
             vibrationPattern.push(500); // Add final pause if last element was a vibration
         }


        console.log(`Padrão gerado com ${vibrationPattern.length} elementos.`);
        // Return null if pattern is empty after processing, though unlikely with checks
        return vibrationPattern.length > 0 ? vibrationPattern : null;
    }


    /**
     * Função auxiliar para lidar com erros.
     * @param {Error} error
     * @param {string} contextMessage
     */
    function handleError(error, contextMessage) {
         console.error(contextMessage + ':', error);
         statusDiv.textContent = `${contextMessage}: ${error.message}`;
         outputPre.textContent = '';
    }


}); // Fim do DOMContentLoaded

/**
 * Função GLOBAL para parar qualquer vibração em andamento (chamada pelo onclick).
 */
function stopVibration() {
    if ('vibrate' in navigator) {
        navigator.vibrate(0);
        // Atualiza o status independentemente, pois o botão está sempre visível
        const statusDiv = document.getElementById('status');
        if (statusDiv) statusDiv.textContent = 'Vibração parada.';
        console.log('Vibração parada pelo usuário.');
    }
}