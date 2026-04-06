import { GoogleGenerativeAI } from "@google/generative-ai";
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

export const generateSupremeLearning = async (req, res) => {
  try {
    const { subject, topic, difficulty, examPreparing } = req.body;

    if (!subject || !topic) {
      return res.status(400).json({ error: "Subject and topic are required" });
    }

    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

    // Generate YouTube video recommendation
    const videoPrompt = `You are an expert learning resource curator. Based on the following details, recommend the BEST YouTube video for learning this topic.

Subject: ${subject}
Topic: ${topic}
Difficulty Level: ${difficulty}
Exam Preparing For: ${examPreparing}

Please respond with ONLY valid JSON in this exact format (no markdown, no extra text):
{
  "videoTitle": "Exact title of the YouTube video",
  "videoUrl": "YouTube video URL (format: https://www.youtube.com/watch?v=VIDEO_ID or https://youtu.be/VIDEO_ID)",
  "videoChannel": "Creator/Channel name",
  "description": "One-line description of why this video is perfect for this topic"
}

Make sure the URL is a valid YouTube URL. If recommending, use realistic URLs.`;

    const videoResponse = await model.generateContent(videoPrompt);
    const videoText = videoResponse.response.text();

    let videoData = {};
    try {
      const jsonMatch = videoText.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        videoData = JSON.parse(jsonMatch[0]);
      }
    } catch (e) {
      console.error("Error parsing video JSON:", e);
      videoData = {
        videoTitle: "Learning Resource",
        videoUrl: "https://www.youtube.com/embed/dQw4w9WgXcQ",
        videoChannel: "YouTube",
        description: "Educational video on the topic",
      };
    }

    // Generate comprehensive notes
    const notesPrompt = `You are an expert teacher creating comprehensive study notes. Generate detailed, well-organized notes for the following:

Subject: ${subject}
Topic: ${topic}
Difficulty Level: ${difficulty}
Exam Preparing For: ${examPreparing}

Create notes with:
1. **Key Concepts** - Main ideas and definitions
2. **Detailed Explanation** - In-depth coverage of each concept
3. **Important Points** - Highlight critical information
4. **Formulas/Laws** (if applicable) - Relevant formulas or scientific laws
5. **Examples** - Real-world or practical examples
6. **Common Misconceptions** - Things students often get wrong
7. **Tips for Exam** - How to apply this knowledge in exams
8. **Quick Summary** - Bullet-point overview

Use clear markdown formatting with headers, bullet points, and emphasis. Make it comprehensive but easy to understand.`;

    const notesResponse = await model.generateContent(notesPrompt);
    const notesText = notesResponse.response.text();

    // Extract video ID for embedding
    let videoId = "";
    if (videoData.videoUrl) {
      const urlObj = new URL(videoData.videoUrl);
      videoId =
        urlObj.searchParams.get("v") || urlObj.pathname.split("/").pop();
    }

    res.status(200).json({
      success: true,
      video: {
        title: videoData.videoTitle || "Learning Resource",
        url: videoData.videoUrl || "",
        videoId: videoId,
        channel: videoData.videoChannel || "YouTube",
        description: videoData.description || "",
      },
      notes: notesText,
    });
  } catch (error) {
    console.error("Supreme Learning Error:", error);
    res.status(500).json({
      error: "Failed to generate learning materials",
      message: error.message,
    });
  }
};
