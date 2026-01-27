import {
  type JobContext,
  type JobProcess,
  ServerOptions,
  cli,
  defineAgent,
  inference,
  metrics,
  voice,
} from '@livekit/agents';
import * as livekit from '@livekit/agents-plugin-livekit';
import * as silero from '@livekit/agents-plugin-silero';
import { BackgroundVoiceCancellation } from '@livekit/noise-cancellation-node';
import dotenv from 'dotenv';
import { fileURLToPath } from 'node:url';

dotenv.config({ path: '.env.local' });

// Voice configuration mapping
const VOICE_CONFIGS = {
  // English voices
  'en-male': {
    voice: '79a125e8-cd45-4c13-8a67-188112f4dd22', // British male
    language: 'en',
    instructions: `You are a helpful British voice AI assistant. The user is interacting with you via voice, even if you perceive the conversation as text.
      You eagerly assist users with their questions by providing information from your extensive knowledge.
      Your responses are concise, to the point, and without any complex formatting or punctuation including emojis, asterisks, or other symbols.
      You are curious, friendly, and have a sense of humor.`,
  },
  'en-female': {
    voice: 'a0e99841-438c-4a64-b679-ae501e7d6091', // American female
    language: 'en',
    instructions: `You are a helpful voice AI assistant. The user is interacting with you via voice, even if you perceive the conversation as text.
      You eagerly assist users with their questions by providing information from your extensive knowledge.
      Your responses are concise, to the point, and without any complex formatting or punctuation including emojis, asterisks, or other symbols.
      You are curious, friendly, and have a sense of humor.`,
  },
  // Polish voice
  'pl-male': {
    voice: 'b7d50908-b17c-442d-ad8d-810c63997ed9', // Polish male
    language: 'pl',
    instructions: `Jesteś pomocnym asystentem głosowym AI. Użytkownik wchodzi z Tobą w interakcję za pomocą głosu, nawet jeśli postrzegasz rozmowę jako tekst.
      Chętnie pomagasz użytkownikom w ich pytaniach, wykorzystując swoją rozległą wiedzę.
      Twoje odpowiedzi są zwięzłe, konkretne i pozbawione skomplikowanego formatowania lub interpunkcji, w tym emoji, gwiazdek i innych symboli.
      Jesteś ciekawski, przyjazny i masz poczucie humoru.`,
  },
  // Default fallback
  'default': {
    voice: '9626c31c-bec5-4cca-baa8-f8ba9e84c8bc', // Original voice
    language: 'en',
    instructions: `You are a helpful voice AI assistant. The user is interacting with you via voice, even if you perceive the conversation as text.
      You eagerly assist users with their questions by providing information from your extensive knowledge.
      Your responses are concise, to the point, and without any complex formatting or punctuation including emojis, asterisks, or other symbols.
      You are curious, friendly, and have a sense of humor.`,
  },
};

class Assistant extends voice.Agent {
  constructor(instructions: string) {
    super({
      instructions,
    });
  }
}

export default defineAgent({
  prewarm: async (proc: JobProcess) => {
    proc.userData.vad = await silero.VAD.load();
  },
  entry: async (ctx: JobContext) => {
    // Read voice preference from room metadata
    let voiceKey = 'default';
    try {
      if (ctx.room.metadata) {
        const metadata = JSON.parse(ctx.room.metadata);
        voiceKey = metadata.voice || 'default';
      }
    } catch (error) {
      console.warn('Failed to parse room metadata, using default voice', error);
    }

    // Get voice configuration
    const voiceConfig = VOICE_CONFIGS[voiceKey as keyof typeof VOICE_CONFIGS] || VOICE_CONFIGS['default'];
    
    console.log(`🎙️ Starting agent with voice: ${voiceKey}`);
    console.log(`🗣️ Language: ${voiceConfig.language}`);
    console.log(`🎵 Voice ID: ${voiceConfig.voice}`);

    // Set up a voice AI pipeline using OpenAI, Cartesia, AssemblyAI, and the LiveKit turn detector
    const session = new voice.AgentSession({
      // Speech-to-text (STT) is your agent's ears, turning the user's speech into text that the LLM can understand
      // See all available models at https://docs.livekit.io/agents/models/stt/
      stt: new inference.STT({
        model: 'assemblyai/universal-streaming',
        language: voiceConfig.language,
      }),

      // A Large Language Model (LLM) is your agent's brain, processing user input and generating a response
      // See all providers at https://docs.livekit.io/agents/models/llm/
      llm: new inference.LLM({
        model: 'openai/gpt-4o-mini',
      }),

      // Text-to-speech (TTS) is your agent's voice, turning the LLM's text into speech that the user can hear
      // See all available models as well as voice selections at https://docs.livekit.io/agents/models/tts/
      tts: new inference.TTS({
        model: 'cartesia/sonic-3',
        voice: voiceConfig.voice,
      }),

      // VAD and turn detection are used to determine when the user is speaking and when the agent should respond
      // See more at https://docs.livekit.io/agents/build/turns
      turnDetection: new livekit.turnDetector.MultilingualModel(),
      vad: ctx.proc.userData.vad! as silero.VAD,
      voiceOptions: {
        // Allow the LLM to generate a response while waiting for the end of turn
        preemptiveGeneration: true,
      },
    });

    // Metrics collection, to measure pipeline performance
    // For more information, see https://docs.livekit.io/agents/build/metrics/
    const usageCollector = new metrics.UsageCollector();
    session.on(voice.AgentSessionEventTypes.MetricsCollected, (ev) => {
      metrics.logMetrics(ev.metrics);
      usageCollector.collect(ev.metrics);
    });

    const logUsage = async () => {
      const summary = usageCollector.getSummary();
      console.log(`Usage: ${JSON.stringify(summary)}`);
    };

    ctx.addShutdownCallback(logUsage);

    // Start the session, which initializes the voice pipeline and warms up the models
    await session.start({
      agent: new Assistant(voiceConfig.instructions),
      room: ctx.room,
      inputOptions: {
        // LiveKit Cloud enhanced noise cancellation
        // - If self-hosting, omit this parameter
        // - For telephony applications, use `BackgroundVoiceCancellationTelephony` for best results
        noiseCancellation: BackgroundVoiceCancellation(),
      },
    });

    // Join the room and connect to the user
    await ctx.connect();
  },
});

cli.runApp(new ServerOptions({ agent: fileURLToPath(import.meta.url) }));
