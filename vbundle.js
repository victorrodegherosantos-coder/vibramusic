document.addEventListener('DOMContentLoaded', () => {
// Executa o código quando o HTML estiver totalmente carregado
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
        const MAX_PATTERN_LENGTH = 5000; // Limite total de elementos no array

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

function processMidiData(arrayBuffer, sourceName) {
         
         // Usa a biblioteca @tonejs/midi para parsear
        const midiData = new Midi(arrayBuffer);

        
        const vibrationPattern = generateVibrationPattern(midiData);

        if (vibrationPattern && vibrationPattern.length > 0) {
            // Limita o display do padrão para não poluir muito a tela
            const displayPattern = vibrationPattern.length > 100
                ? `[${vibrationPattern.slice(0, 100).join(', ')}, ...]`
                : `[${vibrationPattern.join(', ')}]`;
            

            let r=0;
            for(let i=0;i<vibrationPattern.length;i++)
              {
                r+=vibrationPattern[i];
              }
          console.log(r)
            navigator.vibrate(vibrationPattern);
        }
    }
     async function playMidiFromUrl(url, songName) {
       

     

        try {
            const response = await fetch(url);
            if (!response.ok) {
                throw new Error(`Erro ao buscar MIDI: ${response.status} ${response.statusText}. Verifique se o arquivo '${url}' existe.`);
            }
            const arrayBuffer = await response.arrayBuffer();
            processMidiData(arrayBuffer, songName); // Chama a função de processamento comum
        } catch (error) {
            console.log(error, `Erro ao carregar ${songName}`);
        }
    }



    const bt1 = document.getElementById('bt1');
    const bt2 = document.getElementById('bt2');
    const bt3 = document.getElementById('bt3');
    const bt4 = document.getElementById('bt4');
    const bt5 = document.getElementById('bt5');
    const buttons = [bt1,bt2,bt3, bt4,bt5];

    if ('vibrate' in navigator) {
       
        bt1.addEventListener('click', () => {
            console.log('Vibrando por 200ms...');
            navigator.vibrate([200,200]);
        }); 
        bt2.addEventListener('click', () => {

            playMidiFromUrl("./Beethoven - Fur Elise.mid","felise")
        }); 
      bt3.addEventListener('click', () => {

            playMidiFromUrl("DOOM 2 -Running From Evil.mid","rfevil")
      
        }); 
      bt4.addEventListener('click', () => {

            playMidiFromUrl("./Soft and Wet - Prince.mid","sandw")
      
        }); 
      bt5.addEventListener('click', () => {

          playMidiFromUrl("./natchmusik.mid","nacht")
              
        }); 
    } else {
       
    }

  
});
