export type ContentType = 'food' | 'hotel'
export type Platform = 'instagram' | 'tiktok' | 'youtube_shorts'

interface BriefInput {
  contentType: ContentType
  subject: string        // dish name or hotel name
  location: string
  angle?: string         // optional user-provided angle
  platforms: Platform[]
}

export function buildBriefPrompt(input: BriefInput): string {
  if (input.contentType === 'food') {
    return `You are a viral food review content strategist for short-form video (Reels/TikTok/Shorts).

Create a complete content brief for a food review reel with these details:
- Dish/Restaurant: ${input.subject}
- Location: ${input.location}
- Preferred angle: ${input.angle || "creator's choice"}
- Platforms: ${input.platforms.join(', ')}

Respond in this exact JSON structure:
{
  "concept": "one-sentence reel concept",
  "hook": "first 3 seconds spoken line to stop the scroll",
  "storyline": {
    "act1": "0-5s: setup (what and where)",
    "act2": "5-25s: the experience (taste, texture, vibe, price)",
    "act3": "25-30s: verdict + CTA"
  },
  "talkingPoints": ["point 1", "point 2", "point 3", "point 4"],
  "cta": "closing call to action",
  "captions": {
    "instagram": "caption with line breaks and emojis, max 150 chars before 'more'",
    "tiktok": "punchy caption max 100 chars",
    "youtube_shorts": "SEO-friendly caption with keywords"
  },
  "hashtags": {
    "instagram": ["#tag1", "#tag2", "#tag3", "#tag4", "#tag5"],
    "tiktok": ["#tag1", "#tag2", "#tag3", "#tag4", "#tag5"],
    "youtube_shorts": ["#tag1", "#tag2", "#tag3"]
  },
  "b_roll_shots": ["shot idea 1", "shot idea 2", "shot idea 3", "shot idea 4"]
}`
  }

  return `You are a viral hotel review content strategist for short-form video (Reels/TikTok/Shorts).

Create a complete content brief for a hotel review reel with these details:
- Hotel: ${input.subject}
- Location: ${input.location}
- Preferred angle: ${input.angle || "creator's choice"}
- Platforms: ${input.platforms.join(', ')}

Respond in this exact JSON structure:
{
  "concept": "one-sentence reel concept",
  "hook": "first 3 seconds spoken line to stop the scroll",
  "storyline": {
    "act1": "0-5s: arrival moment or exterior first impression",
    "act2": "5-20s: room tour highlights (view, bathroom, amenities)",
    "act3": "20-28s: standout feature or surprise element",
    "act4": "28-30s: verdict (worth it or not) + CTA"
  },
  "talkingPoints": ["point 1", "point 2", "point 3", "point 4", "point 5"],
  "cta": "closing call to action",
  "captions": {
    "instagram": "caption with line breaks and emojis, max 150 chars before 'more'",
    "tiktok": "punchy caption max 100 chars",
    "youtube_shorts": "SEO-friendly caption with keywords"
  },
  "hashtags": {
    "instagram": ["#tag1", "#tag2", "#tag3", "#tag4", "#tag5"],
    "tiktok": ["#tag1", "#tag2", "#tag3", "#tag4", "#tag5"],
    "youtube_shorts": ["#tag1", "#tag2", "#tag3"]
  },
  "b_roll_shots": ["shot idea 1", "shot idea 2", "shot idea 3", "shot idea 4", "shot idea 5"]
}`
}

interface HookInput {
  contentType: ContentType
  subject: string
  angle?: string
}

export function buildHookPrompt(input: HookInput): string {
  return `You are a viral short-form video hook writer specializing in ${input.contentType} reviews.

Generate 5 different attention-grabbing hooks (first 3 seconds) for a ${input.contentType} review reel about: ${input.subject}
${input.angle ? `Angle: ${input.angle}` : ''}

Use these hook styles: curiosity gap, bold claim, relatable problem, surprising fact, question.

Respond in this exact JSON structure:
{
  "hooks": [
    { "style": "curiosity gap", "text": "hook text here" },
    { "style": "bold claim", "text": "hook text here" },
    { "style": "relatable problem", "text": "hook text here" },
    { "style": "surprising fact", "text": "hook text here" },
    { "style": "question", "text": "hook text here" }
  ]
}`
}
