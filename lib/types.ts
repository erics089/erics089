export type Slide = {
  role: "hook" | "pain" | "solution" | "proof" | "cta";
  headline: string;
  body: string;
  imageBrief: string;
};

export type ReelScene = {
  scene: number;
  direction: string;
  voiceover: string;
};

export type PostContent = {
  slides: Slide[];
  reelScenes?: ReelScene[];
  captions: { short: string; medium: string; storytelling: string };
  hashtags: string[];
  bestTime: string;
  reasoning: string;
};

export type PostContentJson = {
  activeLanguage: string;
  languages: Record<string, PostContent>;
};

export function parsePostContent(raw: string): PostContentJson {
  try {
    const parsed = JSON.parse(raw);
    if (parsed && parsed.languages) return parsed as PostContentJson;
    return { activeLanguage: "DE", languages: { DE: parsed as PostContent } };
  } catch {
    return {
      activeLanguage: "DE",
      languages: {
        DE: { slides: [], captions: { short: "", medium: "", storytelling: "" }, hashtags: [], bestTime: "", reasoning: "" },
      },
    };
  }
}
