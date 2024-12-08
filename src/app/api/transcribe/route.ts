import { NextResponse } from 'next/server';
import { Deepgram } from '@deepgram/sdk';

export async function POST(request: Request) {
  try {
    const { audio } = await request.json();
    const audioBuffer = Buffer.from(audio, 'base64');

    const deepgram = new Deepgram(process.env.DEEPGRAM_API_KEY);

    const response = await deepgram.transcription.preRecorded(
      {
        buffer: audioBuffer,
        mimetype: 'audio/webm',
      },
      {
        model: 'nova-2',
        smart_format: true,
        punctuate: true,
        utterances: true,
        language: 'en',
        diarize: false,
        filler_words: false,
        numerals: true,
        search: true,
      }
    );

    const transcription = response.results?.channels[0]?.alternatives[0]?.transcript || '';

    return NextResponse.json({ 
      transcription,
      confidence: response.results?.channels[0]?.alternatives[0]?.confidence
    });
  } catch (error) {
    console.error('Transcription error:', error);
    return NextResponse.json(
      { error: 'Failed to transcribe audio' },
      { status: 500 }
    );
  }
} 