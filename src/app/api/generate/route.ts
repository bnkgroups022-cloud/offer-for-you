import { NextRequest, NextResponse } from "next/server";
import { getOpenAIClient, OPENAI_MODEL } from "@/lib/openai/server";
import { SYSTEM_PROMPT, buildUserPrompt } from "@/lib/openai/prompt";
import { generateRequestSchema, adKitSchema, adKitJsonSchema } from "@/lib/openai/schema";

// Vision + structured-output generation can take 15-30s. Extend beyond
// the platform default so it doesn't get cut off mid-request. Vercel's
// free tier caps this lower than paid tiers — raise your plan or this
// value if you still see timeouts in production.
export const maxDuration = 60;

export async function POST(request: NextRequest) {
  let payload: unknown;
  try {
    payload = await request.json();
  } catch {
    return NextResponse.json({ success: false, error: "Invalid request body." }, { status: 400 });
  }

  const parsed = generateRequestSchema.safeParse(payload);
  if (!parsed.success) {
    return NextResponse.json(
      { success: false, error: parsed.error.issues[0]?.message ?? "Invalid input." },
      { status: 400 }
    );
  }

  let client;
  try {
    client = getOpenAIClient();
  } catch (error) {
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : "OpenAI isn't configured." },
      { status: 500 }
    );
  }

  const input = parsed.data;

  try {
    const completion = await client.chat.completions.create({
      model: OPENAI_MODEL,
      temperature: 0.8,
      messages: [
        { role: "system", content: SYSTEM_PROMPT },
        {
          role: "user",
          content: [
            { type: "text", text: buildUserPrompt(input) },
            { type: "image_url", image_url: { url: input.imageUrl, detail: "auto" } },
          ],
        },
      ],
      response_format: { type: "json_schema", json_schema: adKitJsonSchema },
    });

    const raw = completion.choices[0]?.message?.content;
    if (!raw) {
      return NextResponse.json(
        { success: false, error: "The AI returned an empty response. Please try again." },
        { status: 502 }
      );
    }

    let json: unknown;
    try {
      json = JSON.parse(raw);
    } catch {
      return NextResponse.json(
        { success: false, error: "Couldn't parse the AI's response. Please try again." },
        { status: 502 }
      );
    }

    const result = adKitSchema.safeParse(json);
    if (!result.success) {
      console.error("[api/generate] schema mismatch:", result.error.issues);
      return NextResponse.json(
        {
          success: false,
          error: "The AI's response didn't match the expected format. Please try again.",
        },
        { status: 502 }
      );
    }

    return NextResponse.json({ success: true, result: result.data });
  } catch (error) {
    console.error("[api/generate]", error);
    const message = error instanceof Error ? error.message : "Unexpected error while generating.";
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
