const { onCall, HttpsError } = require('firebase-functions/v2/https');
const { GoogleGenerativeAI } = require('@google/generative-ai');

const OPTION_DEFINITIONS = {
  competitors:
    'Suggest 1–2 direct competitor services that offer similar features at a lower price.',
  student:
    'List student pricing if it exists. Note verification requirements (e.g. .edu email, UNiDAYS, SheerID).',
  family:
    'List family or group plan pricing. Show the per-person monthly cost assuming 4 people sharing the plan.',
  cheaper_tier:
    'List any cheaper ad-supported or feature-limited tier plans available for this service.',
};

function buildPrompt(subscriptions, optionTypes) {
  const definitionLines = optionTypes
    .map((t) => `- ${t}: ${OPTION_DEFINITIONS[t]}`)
    .join('\n');

  // Build the byType schema example for the requested types only
  const byTypeExample = optionTypes
    .map(
      (t) =>
        `"${t}": {\n          "alternatives": [\n            { "name": "<string>", "price": <number>, "savingsPerMonth": <number>, "note": "<string>" }\n          ],\n          "recommendation": "<string>"\n        }`,
    )
    .join(',\n        ');

  return `You are a subscription cost optimization advisor.
For each subscription listed below, analyse ONLY these option types: ${optionTypes.join(', ')}.

Option type definitions:
${definitionLines}

Rules:
- Only include alternatives that are genuinely cheaper than the user's current price.
- Use real, current USD pricing (2024–2025). Omit any alternative you are not confident about.
- savingsPerMonth = currentMonthlyPrice - alternative price, rounded to 2 decimal places.
- For family plans, the price must be the per-person cost (total plan / 4).
- The "byType" object MUST contain a key for EVERY requested option type, even if no alternatives exist.
- If no cheaper alternatives exist for a type, use an empty alternatives array and set recommendation to "Already on best value plan for this category."

Return ONLY valid JSON — no markdown fences, no explanation. Use exactly this schema:
{
  "analyses": [
    {
      "subId": "<string>",
      "serviceName": "<string>",
      "byType": {
        ${byTypeExample}
      }
    }
  ]
}

Subscriptions to analyse:
${JSON.stringify(subscriptions, null, 2)}`;
}

function extractJSON(text) {
  // Strip markdown code fences if Gemini wraps its response
  const fenced = text.match(/```(?:json)?\s*([\s\S]*?)```/);
  const raw = fenced ? fenced[1] : text;
  return JSON.parse(raw.trim());
}

exports.analyzeSubscriptions = onCall(
  { secrets: ['GEMINI_API_KEY'], cors: true },
  async (request) => {
    if (!request.auth) {
      throw new HttpsError('unauthenticated', 'Must be signed in.');
    }

    const { subscriptions, optionTypes } = request.data;

    if (!Array.isArray(subscriptions) || subscriptions.length === 0) {
      throw new HttpsError('invalid-argument', 'subscriptions must be a non-empty array.');
    }
    if (!Array.isArray(optionTypes) || optionTypes.length === 0) {
      throw new HttpsError('invalid-argument', 'optionTypes must be a non-empty array.');
    }

    const validTypes = ['competitors', 'student', 'family', 'cheaper_tier'];
    for (const t of optionTypes) {
      if (!validTypes.includes(t)) {
        throw new HttpsError('invalid-argument', `Invalid option type: "${t}"`);
      }
    }

    const input = subscriptions.map((s) => ({
      subId: s.id,
      serviceName: s.name,
      category: s.category || 'Other',
      currentMonthlyPrice: s.userPrice,
    }));

    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

    const prompt = buildPrompt(input, optionTypes);

    let result;
    try {
      result = await model.generateContent(prompt);
    } catch (err) {
      console.error('Gemini API error:', err);
      throw new HttpsError('internal', 'Failed to reach Gemini API.');
    }

    const text = result.response.text();

    let parsed;
    try {
      parsed = extractJSON(text);
    } catch (err) {
      console.error('JSON parse error. Raw Gemini response:', text);
      throw new HttpsError('internal', 'Gemini returned malformed JSON.');
    }

    if (!parsed.analyses || !Array.isArray(parsed.analyses)) {
      throw new HttpsError('internal', 'Unexpected response structure from Gemini.');
    }

    return { analyses: parsed.analyses };
  },
);
