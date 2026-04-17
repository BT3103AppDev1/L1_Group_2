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

  const byTypeExample = optionTypes
    .map(
      (t) =>
        `"${t}": { "alternatives": [ { "name": "<string>", "price": <number>, "savingsPerMonth": <number>, "note": "<string>" } ], "recommendation": "<string>" }`,
    )
    .join(', ');

  return `You are a subscription cost optimization advisor.
For each subscription listed, analyse ONLY these option types: ${optionTypes.join(', ')}.

Option type definitions:
${definitionLines}

Rules:
- Only include alternatives genuinely cheaper than the user's current price.
- Use real, current USD pricing (2024–2025). Omit any alternative you are not confident about.
- savingsPerMonth = currentMonthlyPrice - alternative price, rounded to 2 decimal places.
- For family plans, price = per-person cost (total plan cost / 4).
- The "byType" object MUST contain a key for EVERY requested option type, even if no alternatives exist.
- If no cheaper alternatives exist for a type, use alternatives: [] and recommendation: "Already on best value plan for this category."

Return a JSON object with this exact structure:
{ "analyses": [ { "subId": "<string>", "serviceName": "<string>", "byType": { ${byTypeExample} } } ] }

Subscriptions to analyse:
${JSON.stringify(subscriptions, null, 2)}`;
}

/**
 * Calls the Gemini REST API directly from the browser.
 * Returns the parsed analyses array.
 *
 * @param {Array} subscriptions - [{ id, name, category, userPrice }]
 * @param {string[]} optionTypes - subset of ['competitors','student','family','cheaper_tier']
 * @returns {Promise<Array>} analyses
 */
export async function analyzeSubscriptions(subscriptions, optionTypes) {
  const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
  if (!apiKey) throw new Error('VITE_GEMINI_API_KEY is not set in your .env file.');

  const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`;

  const prompt = buildPrompt(
    subscriptions.map((s) => ({
      subId: s.id,
      serviceName: s.name,
      category: s.category || 'Other',
      currentMonthlyPrice: s.userPrice,
    })),
    optionTypes,
  );

  const response = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      contents: [{ parts: [{ text: prompt }] }],
      generationConfig: {
        temperature: 0.1,          // Low temp = consistent structured output
        responseMimeType: 'application/json',  // Forces Gemini to return raw JSON
      },
    }),
  });

  if (!response.ok) {
    const err = await response.json().catch(() => ({}));
    throw new Error(err.error?.message || `Gemini API error ${response.status}`);
  }

  const data = await response.json();
  const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
  if (!text) throw new Error('Empty response from Gemini.');

  const parsed = JSON.parse(text);
  if (!Array.isArray(parsed.analyses)) throw new Error('Unexpected Gemini response structure.');

  return parsed.analyses;
}
