const GeminiService = require('../services/geminiService'); 
const YouTubeService = require('../services/youtubeService'); 

/**
 * Generate Supreme Learning content (YouTube video + detailed notes)
 * Endpoint: POST /api/learning/supreme
 */
exports.generateSupremeLearning = async (req, res) => {
  try {
    const { topic, subject, examType, videoLanguage, notesLanguage } = req.body; 

    // Validate input
    if (!topic || !subject) {
      return res.status(400).json({
        success: false,
        message: 'Topic and subject are required',
      }); 
    }

    // Validate language options
    const validVideoLanguages = ['english', 'hindi']; 
    const validNotesLanguages = ['english', 'hinglish', 'brocode']; 

    const videoLang = videoLanguage && validVideoLanguages.includes(videoLanguage) ? videoLanguage : 'english'; 
    const notesLang = notesLanguage && validNotesLanguages.includes(notesLanguage) ? notesLanguage : 'english'; 

    console.log('Request parameters:', { topic, subject, examType, videoLang, notesLang }); 

    // Generate detailed notes using Gemini with language preference
    let languageInstructions = ''; 
    
    if (notesLang === 'hinglish') {
      languageInstructions = `Write the notes in Hinglish (Hindi + English mix). Use English technical terms with Hindi explanations. For example: "Photosynthesis ek process hai jo plants mein hota hai..."`; 
    } else if (notesLang === 'brocode') {
      languageInstructions = `Write the notes in BroCode style - casual, friendly, and fun Hindi-English mix. Use slang, jokes, and relatable examples. Make it entertaining while keeping it educational. For example: "Bro, photosynthesis is basically plants ka energy drink banana..."`; 
    } else {
      languageInstructions = `Write the notes in English.`; 
    }

    const prompt = `You are an expert educator creating comprehensive learning material for ${examType === 'neet' ? 'NEET' : examType === 'jee' ? 'JEE' : examType === 'gate' ? 'GATE' : examType === 'board' ? 'Board Exams' : 'Competitive Exams'}.

Create detailed, structured notes for the following:
Topic: ${topic}
Subject: ${subject}
Exam Type: ${examType}

Language Style: ${languageInstructions}

Requirements:
1. Start with key concepts and definitions
2. Include important formulas and theorems with explanations
3. Add worked examples with step-by-step solutions
4. Include common mistakes and how to avoid them
5. Add tips and tricks for solving problems quickly
6. Use bullet points and structured formatting
7. Include mathematical expressions in LaTeX format (enclosed in $ for inline and $$ for display math)
8. Add summary points at the end

Format the response as a complete study guide with markdown formatting. Use # for main headings, ## for subheadings, and ### for sub-points.`; 

    console.log('Generating notes with Gemini...'); 
    const notesContent = await GeminiService.generateContent(prompt); 
    console.log('Notes generated successfully'); 

    // Generate YouTube video ID with language preference
    console.log('Searching for YouTube video in', videoLang); 
    const videoId = await YouTubeService.searchVideo(topic, subject, videoLang); 
    console.log('Video search result:', videoId); 

    // Prepare response with video ID and language preferences
    res.status(200).json({
      success: true,
      topic,
      subject,
      examType,
      notes: notesContent,
      videoId: videoId || null, // Return video ID, frontend will construct the embed URL
      videoLanguage: videoLang,
      notesLanguage: notesLang,
    }); 

  } catch (error) {
    console.error('Error generating supreme learning content:', error); 
    res.status(500).json({
      success: false,
      message: 'Error generating learning material. Please try again.',
      error: error.message,
    }); 
  }
}; 
 