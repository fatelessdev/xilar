import { createOpenAICompatible } from "@ai-sdk/openai-compatible";

// NVIDIA NIM provider configuration
export const nim = createOpenAICompatible({
  name: "nim",
  baseURL: "https://integrate.api.nvidia.com/v1",
  headers: {
    Authorization: `Bearer ${process.env.NIM_API_KEY}`,
  },
});

// Default model for Bargain AI
export const bargainModel = nim.chatModel("qwen/qwen3-next-80b-a3b-instruct");
