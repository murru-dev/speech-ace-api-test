<template>
  <div class="wrapper">
    <template v-if="!loading">
      <!-- Unsupported browser message -->
      <template v-if="!supports">
        <h1>Audio recording feature is not supported in this browser</h1>
      </template>
  
      <!-- App -->
      <template v-else>

        <div v-if="processing">
          Evaluating score...
        </div>
  
        <template v-else>
          <!-- Sentence -->
          <div class="sentence-wrapper w3-padding w3-center">
            <button
              v-if="!isRecording"
              class="w3-button w3-circle w3-indigo small-circle-btn"
              @click="nextSentence()"
            >
              <i class="fa-solid fa-arrow-rotate-right"></i>
            </button>
            <h1 class="sentence">{{ sentence }}</h1>
          </div>
    
          <!-- Recording Button -->
          <div>
            <button
              v-if="isRecording"
              class="w3-button w3-circle w3-teal w3-xlarge circle-btn"
              @click="stop()"
            >
              <i class="fa-solid fa-stop"></i>
            </button>
            <button
              v-else
              class="w3-button w3-circle w3-teal w3-xlarge circle-btn"
              @click="start()"
            >
              <i class="fa-solid fa-microphone"></i>
            </button>
          </div>
  
          <!-- Recording State -->
          <div class="w3-panel w3-black recording-wrapper">
            <p v-if="isRecording" class="w3-circle recording-circle"></p>
            <p>{{ isRecording ? 'Recording...' : 'Start recording' }}</p>
          </div>
    
          <!-- Audio track -->
          <audio v-if="audioURL" controls :src="audioURL"></audio>
  
          <div v-if="score">
            Your score is: {{ score }}
          </div>
        </template>
      </template>
    </template>
  </div>
</template>
<script setup lang="ts">
import { Client, Databases, Query, Storage, ID } from 'appwrite';

const config = useRuntimeConfig()

// Vars
let stream: MediaStream | null = null;
let mediaRecorder: MediaRecorder | null = null;
let chunks: BlobPart[] = [];
const constraints = {
  video: false,
  audio: {
    channelCount: 1,
    sampleRate: 48000
  }
};

// Reactive props
const loading = ref<boolean>(true);
const processing = ref<boolean>(false);
const supports = ref<boolean>(false);
const isRecording = ref<boolean>(false);
const audioURL = ref<string>('');
const sentences = ref<string[]>([]);
const sentence = ref<string>('');
const score = ref<number | null>(null);

const getSentences = async () => {
  const client = new Client()
    .setEndpoint(config.public.appwriteEndpoint)
    .setProject(config.public.appwriteProject);
  const databases = new Databases(client);
  
  try {
    const { documents } = await databases.listDocuments(config.public.appwriteDb, config.public.appwriteVocabularyCollection, [
      Query.select(['sentences'])
    ]);
    setSentences(documents);
  } catch (error) { console.log(error); }
}

const shuffle = (array: string[]) => { 
  for (let i = array.length - 1; i > 0; i--) { 
    const j = Math.floor(Math.random() * (i + 1)); 
    [array[i], array[j]] = [array[j], array[i]]; 
  } 
  //console.log(array)
  return array; 
}; 

const setSentences = (documents: any) => {
  let arr: string[] = []
  for (let i = 0; i < documents.length; i++) {
    const element = documents[i];
    if (element.sentences.length > 0) arr = arr.concat(element.sentences);
  }
  sentences.value = shuffle(arr);
}

const nextSentence = () => {
  stream = null;
  mediaRecorder = null;
  chunks = [];
  audioURL.value = '';
  score.value = null;
  sentence.value = sentences.value[Math.floor(Math.random() * sentences.value.length)];
}

const getUserMedia = async (): Promise<MediaStream> => {
  const n = await navigator.mediaDevices.getUserMedia(constraints);
  return n;
}

const toggleIsRecording = () => { isRecording.value = !isRecording.value; }

const start = async () => {
  toggleIsRecording();

  // Setup the media
  stream = await getUserMedia();

  // Create the recorder
  mediaRecorder = new MediaRecorder(stream);

  // Start recording
  mediaRecorder.start();

  // Collect audio data
  mediaRecorder.ondataavailable = (e) => {
    chunks.push(e.data);
  };

  // Register on stop event
  mediaRecorder.onstop = async (e) => {
    const blob = new Blob(chunks, { type: 'audio/wav' });
    chunks = [];
    audioURL.value = window.URL.createObjectURL(blob);

    // Convert blob to file
    const formData = new FormData();
    formData.append('text', sentence.value);
    formData.append('name', `murru-${Date.now()}.wav`);
    formData.append('file', blob);

    processing.value = true;

    const res = await useFetch('/api/getScore', {
      method: 'POST',
      body: formData
    });

    score.value = res.data.value.text_score.speechace_score.pronunciation;

    processing.value = false;
  }
}

const stop = async () => {
  toggleIsRecording();
  mediaRecorder!.stop();
}

// Prepare app
onMounted(async () => {
  const n = await getUserMedia();
  if (navigator.mediaDevices && n) {
    supports.value = true;
    await getSentences();
    nextSentence();
    setTimeout(() => {
      loading.value = false;
    }, 500);
  }
})
</script>
<style>
.wrapper {
  align-items: center;
  display: flex;
  flex-direction: column;
  gap: 1em;
  height: 100vh;
  justify-content: center;
  width: 100vw;
}

.circle-btn {
  height: 72px;
  width: 72px;
}

.small-circle-btn {
  height: 48px;
  width: 48px;
}

.recording-wrapper {
  display: flex;
  align-items: center;
  gap: .5em;
}

.recording-circle {
  animation: ease pulse 2s infinite;
  background-color: red;
  height: 16px;
  width: 16px;
}

.sentence-wrapper {
  display: flex;
  gap: .5em;
  align-items: center;
  justify-content: center;
}

.pointer {
  cursor: pointer;
}

@keyframes pulse {
  0% {
    background-color: red;
  }
  50% {
    background-color: #f06c6c;
  }
  100% {
    background-color: red;
  }
}

@media (max-width: 768px) {
  .sentence-wrapper {
    flex-direction: column;
  }

  .sentence {
    font-size: 24px;
  }
}
</style>