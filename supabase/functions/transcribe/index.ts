import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'

const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req: Request) => {
    if (req.method === 'OPTIONS') {
        return new Response(null, { headers: corsHeaders })
    }

    try {
        const { audioBase64, filename } = await req.json()

        if (!audioBase64) {
            return new Response(JSON.stringify({ error: 'No audio provided' }), {
                status: 400,
                headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            })
        }

        const openAiKey = Deno.env.get('OPENAI_API_KEY')
        if (!openAiKey) {
            return new Response(JSON.stringify({ error: 'OpenAI API key not configured' }), {
                status: 500,
                headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            })
        }

        // Decode base64 to binary
        const binaryData = Uint8Array.from(atob(audioBase64), (c) => c.charCodeAt(0))

        // Call OpenAI Whisper API
        const formData = new FormData()
        formData.append('file', new Blob([binaryData], { type: 'audio/m4a' }), filename || 'audio.m4a')
        formData.append('model', 'whisper-1')
        formData.append('response_format', 'text')

        const whisperResponse = await fetch('https://api.openai.com/v1/audio/transcriptions', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${openAiKey}`,
            },
            body: formData as any,
        })

        if (!whisperResponse.ok) {
            const errorText = await whisperResponse.text()
            console.error('Whisper API error:', errorText)
            return new Response(JSON.stringify({ error: 'Transcription failed' }), {
                status: 500,
                headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            })
        }

        const transcription = await whisperResponse.text()
        return new Response(JSON.stringify({ text: transcription || '' }), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        })
    } catch (error) {
        console.error('Transcribe Edge Function error:', error)
        return new Response(JSON.stringify({ error: 'Failed to transcribe audio' }), {
            status: 500,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        })
    }
})