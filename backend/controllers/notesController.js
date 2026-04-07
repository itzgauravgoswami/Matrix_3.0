const Note = require('../models/Note'); 
const axios = require('axios'); 

// Get all notes for the authenticated user
exports.getNotes = async (req, res) => {
  try {
    const notes = await Note.find({ userId: req.user.id })
      .sort({ isPinned: -1, updatedAt: -1 });  // Pinned notes first, then by recent

    res.json({
      success: true,
      notes,
    }); 
  } catch (error) {
    console.error('Error fetching notes:', error); 
    res.status(500).json({
      success: false,
      message: 'Error fetching notes',
    }); 
  }
}; 

// Create a new note
exports.createNote = async (req, res) => {
  try {
    const { title, content, subject, tags, color, isPinned, examType } = req.body; 

    // Validate required fields
    if (!title || !content) {
      return res.status(400).json({
        success: false,
        message: 'Title and content are required',
      }); 
    }

    // Validate examType if provided
    const validExamTypes = ['cbse', 'icse', 'state-board', 'jee', 'neet', 'upsc', 'gate', 'college', 'competitive']; 
    if (examType && !validExamTypes.includes(examType)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid exam type provided',
      }); 
    }

    const note = new Note({
      userId: req.user.id,
      title,
      content,
      subject: subject || '',
      examType: examType || 'competitive',
      tags: tags || [],
      color: color || '#ffffff',
      isPinned: isPinned || false,
    }); 

    await note.save(); 

    res.status(201).json({
      success: true,
      note,
    }); 
  } catch (error) {
    console.error('Error creating note:', error); 
    res.status(500).json({
      success: false,
      message: 'Error creating note',
    }); 
  }
}; 

// Update a note
exports.updateNote = async (req, res) => {
  try {
    const { title, content, subject, tags, color, isPinned, examType } = req.body; 

    const note = await Note.findOne({
      _id: req.params.noteId,
      userId: req.user.id,
    }); 

    if (!note) {
      return res.status(404).json({
        success: false,
        message: 'Note not found',
      }); 
    }

    // Validate examType if provided
    const validExamTypes = ['cbse', 'icse', 'state-board', 'jee', 'neet', 'upsc', 'gate', 'college', 'competitive']; 
    if (examType && !validExamTypes.includes(examType)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid exam type provided',
      }); 
    }

    // Update fields if provided
    if (title !== undefined) note.title = title; 
    if (content !== undefined) note.content = content; 
    if (subject !== undefined) note.subject = subject; 
    if (tags !== undefined) note.tags = tags; 
    if (color !== undefined) note.color = color; 
    if (isPinned !== undefined) note.isPinned = isPinned; 
    if (examType !== undefined) note.examType = examType; 

    note.updatedAt = Date.now(); 
    await note.save(); 

    res.json({
      success: true,
      note,
    }); 
  } catch (error) {
    console.error('Error updating note:', error); 
    res.status(500).json({
      success: false,
      message: 'Error updating note',
    }); 
  }
}; 

// Delete a note
exports.deleteNote = async (req, res) => {
  try {
    const note = await Note.findOneAndDelete({
      _id: req.params.noteId,
      userId: req.user.id,
    }); 

    if (!note) {
      return res.status(404).json({
        success: false,
        message: 'Note not found',
      }); 
    }

    res.json({
      success: true,
      message: 'Note deleted successfully',
    }); 
  } catch (error) {
    console.error('Error deleting note:', error); 
    res.status(500).json({
      success: false,
      message: 'Error deleting note',
    }); 
  }
}; 

// Get a specific note by ID
exports.getNoteById = async (req, res) => {
  try {
    const note = await Note.findOne({
      _id: req.params.noteId,
      userId: req.user.id,
    }); 

    if (!note) {
      return res.status(404).json({
        success: false,
        message: 'Note not found',
      }); 
    }

    res.json({
      success: true,
      note,
    }); 
  } catch (error) {
    console.error('Error fetching note:', error); 
    res.status(500).json({
      success: false,
      message: 'Error fetching note',
    }); 
  }
}; 

// Helper function to generate mock notes
const generateMockNotes = (topic, difficulty) => {
  const summaryText = {
    beginner: `${topic} is a fundamental concept that forms the basis of many applications and professional fields. In this beginner-level overview, we'll explore the key definitions, basic principles, essential terminology, and real-world applications. This material is specifically designed to help you understand the core concepts and foundational ideas without requiring extensive background knowledge or specialized prerequisites. By the end of this section, you'll have a solid understanding of what ${topic} is, why it matters, and how it's applied in practical situations.`,
    intermediate: `${topic} represents an important intermediate-level topic that builds upon foundational concepts and explores more sophisticated applications. This section covers advanced definitions, theoretical frameworks, interconnections with other domains, and practical applications in professional settings. You'll learn how different components and concepts interact with each other, how to apply these concepts across various scenarios, and understand the reasoning behind different approaches. This level assumes you have basic knowledge of the topic and are ready to deepen your understanding significantly.`,
    advanced: `${topic} at an advanced level encompasses sophisticated theoretical frameworks, cutting-edge research methodologies, complex interdisciplinary applications, and professional-grade problem-solving techniques. This material assumes solid understanding of foundational and intermediate concepts, and explores nuanced relationships, edge cases, theoretical limitations, and advanced problem-solving techniques used by leading professionals and researchers in the field. You'll gain insights into current research, emerging trends, and future directions of the field.`,
  }; 

  const contentText = {
    beginner: `
## 1. Definition and Overview

${topic} can be defined as a key concept in modern learning and professional practice. To understand ${topic}, it's important to start with these basic definitions:

**Primary Definition:** ${topic} encompasses the fundamental principles, methods, and applications that form the foundation of this field.

**Core Characteristics:**
- It provides a framework for understanding specific phenomena or solving particular problems
- It involves specific principles, rules, and methodologies
- It has practical applications across multiple domains
- It continues to evolve with technological and methodological advances

## 2. Fundamental Principles and Concepts

**Key Principle 1: Foundation and Basic Understanding**
The foundation of ${topic} rests on several basic principles:
- Understanding what ${topic} is and its scope
- Recognizing when and how to apply it
- Appreciating its importance in various contexts

**Key Principle 2: Core Mechanisms and Operations**
The mechanics of ${topic} include:
- How the basic processes work
- The sequential steps involved in application
- Common patterns and structures
- Simple rules that govern behavior

**Key Principle 3: Real-world Applications and Use Cases**
${topic} is applied in practical situations such as:
- Educational contexts and learning scenarios
- Professional and business environments
- Everyday decision-making and problem-solving
- Technology and innovation applications

## 3. Essential Terminology

Before diving deeper, here are key terms you should understand:
- **Term 1:** A foundational term with basic definition and relevance
- **Term 2:** Another key concept essential to understanding the topic
- **Term 3:** Important terminology used in professional contexts
- **Term 4:** Specialized language you'll encounter in further study

## 4. Real-world Applications and Examples

**Application 1: In Education**
${topic} is applied in educational settings to enhance learning outcomes, improve teaching methods, and develop student skills. For example, educators use these principles to create more effective curricula and assessment methods.

**Application 2: In Technology and Business**
In the technology and business sectors, ${topic} enables innovation, improves efficiency, and drives growth. Companies leverage these concepts to develop new products, optimize operations, and gain competitive advantage.

**Application 3: In Professional Practice**
Professionals across various fields apply ${topic} principles daily to solve problems, make decisions, and achieve objectives. These applications demonstrate the practical value and versatility of the concept.

**Application 4: In Research and Development**
Researchers use ${topic} concepts as a foundation for investigation, experimentation, and knowledge advancement in their respective fields.

## 5. Key Points to Remember

**Fundamental Insight 1:** Understanding the basics of ${topic} is crucial for any further learning or application. Don't rush through foundational concepts.

**Fundamental Insight 2:** Practice and repetition reinforce learning and deepen understanding. The more you engage with these concepts, the more intuitive they become.

**Fundamental Insight 3:** Applications and implementations of ${topic} vary significantly depending on context, industry, and specific use cases.

**Fundamental Insight 4:** Continuous learning and staying updated with new developments is important because ${topic} continues to evolve.

## 6. Getting Started with ${topic}

**Next Steps:**
- Review the key definitions and terminology presented above
- Explore practical examples in your area of interest
- Consider how these concepts might apply to situations in your life or work
- Prepare for intermediate-level concepts by solidifying your understanding of these fundamentals

---
This overview provides the essential foundation for understanding ${topic}. As you progress, you'll build upon these concepts to achieve greater depth and sophistication in your knowledge.
    `,
    intermediate: `
## 1. Advanced Theoretical Framework

${topic} operates within a sophisticated theoretical framework that encompasses multiple interconnected dimensions:

**Core Theory: Understanding the Principles**
The theoretical underpinnings of ${topic} include:
- Fundamental axioms and assumptions upon which the field is built
- Major theoretical schools and their contributions
- Comparative analysis of different theoretical approaches
- Reconciliation of apparent contradictions in the literature
- The evolution of theory from historical foundations to modern understanding

**Related Theories: Interdisciplinary Connections**
${topic} intersects with several related fields:
- Theory A: Its relationship to ${topic} and complementary aspects
- Theory B: How these concepts integrate and inform each other
- Theory C: Cross-disciplinary applications and insights
- Synthesis: How multiple theories combine for comprehensive understanding

**Mathematical and Quantitative Principles**
Where applicable, ${topic} relies on:
- Mathematical models and equations describing relationships
- Statistical methods for analysis and prediction
- Computational approaches and algorithms
- Optimization techniques and their applications
- Measurement and quantification methodologies

## 2. Advanced Conceptual Development

**Concept A: Sophisticated Applications and Implications**
At the intermediate level, this concept involves:
- Understanding the nuances and subtleties of the concept
- Recognizing when standard interpretations need modification
- Appreciating the spectrum of valid interpretations
- Integration with complementary concepts for comprehensive understanding

**Concept B: Integration with Other Domains**
${topic} connects with:
- Domain 1: Specific connections and synergies
- Domain 2: How knowledge from other fields enhances understanding
- Domain 3: Interdisciplinary approaches and benefits
- Complex systems: Understanding ${topic} within larger contexts

**Concept C: Systems and Relationships**
Understanding how components interact:
- Component interactions and feedback loops
- Emergent properties arising from component relationships
- System dynamics and equilibrium states
- Stability analysis and perturbation responses

## 3. Analytical Problem-Solving Approaches

**Approach 1: Analytical and Deductive Problem-Solving**
- Best for well-defined problems with clear parameters
- Uses logical deduction and mathematical analysis
- Involves breaking down complex problems into manageable components
- Provides precise, quantifiable solutions

**Approach 2: Creative and Inductive Problem-Solving**
- Best for creative applications and novel situations
- Uses pattern recognition and analogical reasoning
- Encourages exploration of non-obvious connections
- Generates innovative solutions and approaches

**Approach 3: Integrated Approaches for Complex Scenarios**
- Combines analytical rigor with creative exploration
- Addresses situations requiring both precision and innovation
- Involves iterative refinement and feedback loops
- Appropriate for ambiguous, multidisciplinary problems

## 4. Case Studies and Real-world Applications

**Case Study 1: Large-scale Implementation**
This case demonstrates how ${topic} principles scale to complex, real-world situations:
- Context and challenges encountered
- Solutions implemented and adaptations made
- Results achieved and lessons learned
- How theoretical principles translated to practice
- Unexpected insights and best practices developed

**Case Study 2: Challenging Implementation**
This case illustrates how to address difficulties and limitations:
- Nature of challenges and obstacles encountered
- Problem-solving approaches and innovations required
- Alternative solutions considered and evaluated
- Critical success factors
- How understanding of ${topic} was deepened through this experience

**Case Study 3: Innovation and Excellence**
This case shows how ${topic} principles enable innovation:
- Innovative application of standard concepts
- Results and competitive advantages gained
- Contributing factors to success
- Replicability and scalability of the approach
- Future implications and opportunities

## 5. Further Exploration and Development

**Advanced Topics to Explore:**
- Specialized applications in specific fields
- Emerging developments and future directions
- Related research and recent publications
- Debate and discussion in academic and professional communities
- Opportunities for personal exploration and application

**Next Steps in Learning:**
- Engage with primary research materials
- Explore specialized applications relevant to your interests
- Consider advanced-level concepts and theoretical developments
- Begin to develop your own interpretations and applications

---
This intermediate treatment provides a solid foundation for more specialized exploration and professional application of ${topic}.
    `,
    advanced: `
## 1. Advanced Theoretical Analysis and Critique

${topic} at the advanced level requires sophisticated theoretical analysis:

**Quantum Principles: Advanced Theoretical Concepts**
- Fundamental theoretical principles at the highest level of sophistication
- Axiomatic systems and logical foundations
- Limitations and boundary conditions of theoretical frameworks
- Unresolved theoretical questions and ongoing debates
- Meta-theoretical analysis of the field itself

**Edge Cases and Exception Handling**
- Situations where standard theory requires modification
- Boundary conditions and limiting cases
- Non-linear phenomena and complex interactions
- Paradoxes and apparent contradictions in literature
- Context-dependent variations in application
- How theoretical frameworks adapt to novel situations

**Recent Research and Scholarly Contributions**
- Latest peer-reviewed research findings
- Emerging theories and novel approaches
- Critiques and refinements of established theory
- Computational and experimental advances
- Interdisciplinary contributions reshaping the field

## 2. Cutting-Edge Research and Development

**Emerging Technique 1: Modern Methodologies**
- Revolutionary approaches challenging established paradigms
- Computational advances enabling new types of analysis
- Collaborative and cross-disciplinary research methods
- Theoretical developments from recent research
- Practical applications emerging from research breakthroughs

**Emerging Technique 2: Innovation in Advanced Practice**
- Sophisticated applications of ${topic} principles
- Novel problem-solving methodologies
- Optimization and efficiency improvements
- Scaling to large, complex systems
- Performance benchmarking and continuous improvement

**Emerging Paradigm: Future Directions**
- Predictions for field evolution over next 5-20 years
- Disruptive technologies and methodologies
- Shifting paradigms and new theoretical frameworks
- Societal and global implications
- Opportunities for pioneering research and application

## 3. Complex Advanced Problem-Solving

**Method 1: Sophisticated Analytical Approaches**
- Advanced mathematical and computational techniques
- Modeling complex, nonlinear systems
- Multi-variable optimization under constraints
- Probabilistic and statistical approaches to uncertainty
- Simulation and prediction methodologies

**Method 2: Real-world Application with Optimization**
- Applying theory in complex, ambiguous real-world situations
- Navigating constraints and competing objectives
- Stakeholder engagement and collaborative problem-solving
- Implementation strategies for organizational and social systems
- Iterative refinement and adaptive management

**Method 3: Novel Integration and Synthesis**
- Combining multiple theoretical frameworks
- Cross-disciplinary synthesis for comprehensive solutions
- Creating novel approaches through creative integration
- Addressing problems at intersection of multiple domains
- Theoretical innovation through practical necessity

## 4. Scholarly Resources and Academic Contributions

**Seminal Publications:**
- Foundational papers that established the field
- Recent high-impact publications advancing knowledge
- Contrasting perspectives and theoretical debates
- Influential researchers and their contributions
- How to access and critically evaluate scholarly literature

**Research Directions:**
- Open questions in the field
- Underdeveloped areas requiring investigation
- Funding opportunities and research initiatives
- Professional organizations and communities
- Opportunities for significant contributions

## 5. Expert Insights and Professional Perspectives

**Critical Insight 1: Why Deep Mastery Matters**
Understanding ${topic} at advanced levels:
- Enables sophisticated problem-solving in complex situations
- Allows recognition of nuances and context-dependent variations
- Provides foundation for continuing innovation and advancement
- Positions you among leading practitioners in the field
- Creates opportunities for meaningful professional impact

**Critical Insight 2: Future Opportunities**
The evolving field of ${topic} presents opportunities for:
- Pioneering research and theoretical advancement
- Developing innovative applications in new domains
- Leading organizational transformation and innovation
- Mentoring and educating the next generation
- Contributing to societal progress through application

**Critical Insight 3: Professional and Practical Considerations**
Success in advanced application requires:
- Continuous learning and staying current with developments
- Practical experience in diverse application contexts
- Collaboration with experts in complementary fields
- Ethical consideration of implications and consequences
- Strategic thinking about long-term impacts and sustainability

## 6. Synthesis and Integration

**Bringing It All Together:**
- Understanding how theoretical, practical, and innovative aspects integrate
- Developing your own sophisticated understanding and approach
- Contributing to the field through your unique perspective and contributions
- Navigating the complexity and ambiguity inherent in advanced work
- Sustaining motivation and growth in ongoing engagement with ${topic}

---
This advanced treatment recognizes that mastery of ${topic} is an ongoing journey of learning, application, and contribution. The sophistication you develop will enable you to tackle increasingly complex problems, advance knowledge in the field, and make significant professional and societal impact.
    `,
  }; 

  return {
    summary: summaryText[difficulty],
    content: contentText[difficulty],
  }; 
}; 

// @desc    Generate notes from AI
// @route   POST /api/notes/generate
exports.generateNotes = async (req, res) => {
  try {
    const { topic, subject, language = 'english', notesType = 'short', customMessage = null, sections = [], examType = 'competitive' } = req.body; 

    // Validation
    if (!topic || !topic.trim()) {
      return res.status(400).json({
        success: false,
        message: 'Topic is required',
      }); 
    }

    if (!subject || !subject.trim()) {
      return res.status(400).json({
        success: false,
        message: 'Subject is required',
      }); 
    }

    if (!['english', 'hinglish', 'brocode'].includes(language)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid language. Choose english, hinglish, or brocode',
      }); 
    }

    if (!['short', 'detailed'].includes(notesType)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid notes type. Choose short or detailed',
      }); 
    }

    // Validate examType
    const validExamTypes = ['cbse', 'icse', 'state-board', 'jee', 'neet', 'upsc', 'gate', 'college', 'competitive']; 
    if (examType && !validExamTypes.includes(examType)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid exam type provided',
      }); 
    }

    console.log(`Generating notes from AI for topic: "${topic}", subject: "${subject}", language: ${language}, type: ${notesType}, exam: ${examType}, custom message: ${customMessage}`); 

    // Get Gemini API key - Required (no fallback)
    const geminiApiKey = process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY; 
    
    if (!geminiApiKey) {
      return res.status(400).json({
        success: false,
        message: 'AI API key not configured. Please contact support.',
      }); 
    }

    // Language preference string
    let langPrefix = ''; 
    if (language === 'hinglish') {
      langPrefix = 'Write in Hinglish (mix of Hindi words written in English alphabets and English). Use Hindi words like "kya", "hai", "tha", "aur", etc., but write them using English alphabets only - NO Hindi script/Devanagari. '; 
    } else if (language === 'brocode') {
      langPrefix = 'Write in BroCode Hinglish style - casual, friendly, using modern slang, internet language, and mix of Hindi words (written in English alphabets) and English. Use words like "bhai", "mujhe", "samajh aaya", "soch", etc., but write them using English alphabets only - NO Hindi script/Devanagari. '; 
    } else {
      langPrefix = 'Write in English. '; 
    }
    
    // Exam context mapping
    const examContextMap = {
      'cbse': 'CBSE Board Exams (Class 10 & 12) - Focus on NCERT curriculum',
      'icse': 'ICSE Board Exams (Class 10 & 12) - Following ICSE syllabus',
      'state-board': 'State Board Exams - State-specific curriculum',
      'jee': 'JEE Mains and Advanced Entrance Exam - College entrance preparation',
      'neet': 'NEET Medical Entrance Exam - Medical aspirant preparation',
      'upsc': 'UPSC Civil Services Exam - IAS/IPS preparation',
      'gate': 'GATE (Graduate Aptitude Test in Engineering) - Technical exam preparation',
      'college': 'College/University Exams - General higher education',
      'competitive': 'General Competitive Exams - All competitive exam types'
    }; 

    const examContext = examContextMap[examType] || examContextMap['competitive']; 
    
    // Build sections filter
    let sectionsFilter = ''; 
    if (sections && Array.isArray(sections) && sections.length > 0) {
      sectionsFilter = `\n\nFOCUS ONLY on these sections: ${sections.join(', ')}`; 
    }

    // Build custom message instruction
    let customMessageInstruction = ''; 
    if (customMessage && customMessage.trim()) {
      customMessageInstruction = `\n\nUSER'S SPECIAL REQUEST: ${customMessage.trim()}\nPlease incorporate these preferences in your response.`; 
    }
    
    // Build the prompt based on notes type
    let prompt = ''; 
    
    if (notesType === 'short') {
      // SHORT NOTES: ~150 words with key points for exam
      prompt = `${langPrefix}Create short, exam-focused study notes for: "${topic}" in the subject of ${subject}, tailored for ${examContext}.${sectionsFilter}${customMessageInstruction}

IMPORTANT - EXAM FOCUS: 
- Keep it CONCISE - approximately 150-200 words total
- Focus ONLY on the MOST IMPORTANT points that appear in exams
- Include frequently asked question patterns
- Highlight concepts that have high weightage in exams
- Use bullet points for quick revision
- Include key definitions, formulas, and must-know concepts
- Base content on ${examContext} curriculum and exam patterns
- Context: This is about ${topic} from the ${subject} subject

Format your response EXACTLY as follows:

SUMMARY:
[Write a comprehensive summary in 150-200 words covering the key definition, essential concepts, important formulas, and exam tips. Include ALL critical information the student needs to know for exams. Use markdown formatting with **bold** for important terms and bullet points for concepts.]

KEY CONCEPTS:
**Key Definition:**
[1-2 sentences explaining what ${topic} is in the context of ${subject} - essential for exams]

**Essential Concepts (High Exam Weightage):**
- Concept 1: Brief explanation with exam relevance
- Concept 2: Brief explanation with exam relevance
- Concept 3: Brief explanation with exam relevance
- Concept 4: Brief explanation with exam relevance

**Important Formulas/Rules (Frequently Asked):**
[2-3 most important formulas or rules that appear in exams]

**Exam Tips & Common Questions:**
- Common exam question 1
- Common exam question 2
- Critical point to remember during exams

CRITICAL: Wrap ALL mathematical expressions in dollar signs. Examples: $x = 5$, $\\frac{a}{b}$, $\\alpha$, $\\theta$`; 
    } else {
      // DETAILED NOTES: Full comprehensive exam-focused content
      prompt = `${langPrefix}Create comprehensive exam-focused study notes for: "${topic}" in the subject of ${subject}, tailored for ${examContext}.${sectionsFilter}${customMessageInstruction}

IMPORTANT - EXAM FOCUS:
1. Cover ALL exam-relevant concepts with high weightage for ${examContext}
2. Focus on ${topic} from ${subject} subject
3. Each section should be approximately 200 words
4. Use professional markdown formatting including tables
5. FOR ALL MATHEMATICAL EXPRESSIONS: Wrap in dollar signs using LaTeX notation
6. Include frequently asked questions and exam patterns from ${examContext}
7. Highlight important formulas and theorems that appear in exams
8. Mathematical examples: $x = 5$, $\\frac{a}{b}$, $\\sqrt{x}$, $\\alpha$, $\\theta$, $\\int_a^b$, $\\iiint_E$
9. Base content on ${examContext} syllabus and previous year papers

Format your response EXACTLY as follows:

SUMMARY:
[Write 150-200 words covering exam-important points. Include the most critical concepts, formulas, and frequently tested topics. Use markdown headers, **bold**, *italics*, and lists. Use $LaTeX$ for math.]

DETAILS:
# Exam-Focused Study: ${topic} (${subject})

## 1. Definition and Core Concepts (High Exam Weightage)
[Write 200 words. Include a table: Concept | Definition | Exam Importance | Typical Question. Use $LaTeX$ like $\\frac{a}{b}$, $\\sqrt{x}$. Focus on concepts frequently asked in ${examContext}.]

## 2. Important Formulas and Theorems (Must Know for Exams)
[Write 200 words. Format as a table with Formula/Theorem | Statement | Use Case | Exam Frequency. Use $LaTeX$ for math. Include all important formulas that appear in exams.]

## 3. Key Problems and Solutions (Common Exam Questions)
[Write 200 words providing typical exam problems with step-by-step solutions. Use numbered lists and include worked examples with formulas using $LaTeX$ like $\\frac{a}{b}$, $x^2$, $e^x$. Show how to solve common exam questions.]

## 4. Applications and Real-World Context
[Write 200 words providing practical examples and applications that appear in exam scenarios. Format as: Application | Context | How it relates to ${topic}. Use step-by-step solutions with $LaTeX$ like $\\int$, $\\sum$, $\\sqrt{x}$.]

## 5. Common Mistakes and Exam Strategy
[Write 200 words covering common mistakes students make in exams and exam-taking strategies. Format as a table: Mistake | Why it happens | How to avoid | Exam tip. Use $LaTeX$ for math like $\\pm$, $\\neq$, $\\leq$, $\\geq$.]

MARKDOWN TABLE FORMAT EXAMPLES:
| Concept | Definition | Exam Importance |
|---------|-----------|-----------------|
| Example 1 | Explanation | High/Medium/Low |
| Example 2 | Explanation | High/Medium/Low |

CRITICAL: Wrap ALL math in dollar signs: $x$, $\\frac{a}{b}$, $\\int$`; 
    }

    try {
      const response = await axios.post(
        'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent',
        {
          contents: [
            {
              parts: [
                {
                  text: prompt,
                },
              ],
            },
          ],
        },
        {
          headers: {
            'Content-Type': 'application/json',
          },
          params: {
            key: geminiApiKey,
          },
          timeout: 120000, // 120 second (2 minute) timeout for comprehensive responses
        }
      ); 

      if (!response.data.candidates || !response.data.candidates[0]) {
        throw new Error('No content generated from Gemini API'); 
      }

      const generatedText = response.data.candidates[0].content.parts[0].text; 
      
      console.log('Raw Gemini response received, length:', generatedText.length); 
      
      // Parse the response - look for SUMMARY section more carefully
      const summaryMatch = generatedText.match(/SUMMARY:([\s\S]*?)(?:KEY CONCEPTS:|DETAILS:|$)/i); 
      const detailsMatch = generatedText.match(/DETAILS:([\s\S]*?)$/i); 
      const keyConceptsMatch = generatedText.match(/KEY CONCEPTS:([\s\S]*?)$/i); 

      // Clean up the text - get summary with proper fallback
      let summary = ''; 
      if (summaryMatch && summaryMatch[1].trim()) {
        summary = summaryMatch[1].trim(); 
      } else {
        // Fallback: use first 500 chars if summary section not found
        summary = generatedText.substring(0, 500); 
      }

      // For short notes, content is everything. For detailed, use DETAILS section
      let content = ''; 
      if (detailsMatch && detailsMatch[1].trim()) {
        content = detailsMatch[1].trim(); 
      } else if (keyConceptsMatch && keyConceptsMatch[1].trim()) {
        content = keyConceptsMatch[1].trim(); 
      } else {
        content = generatedText; 
      }
      
      // Remove any embedded images from the text
      summary = summary.replace(/!\[.*?\]\(.*?\)/g, '').trim(); 
      content = content.replace(/!\[.*?\]\(.*?\)/g, '').trim(); 
      
      // Ensure both summary and content have content
      if (!summary || summary.length < 50) {
        console.warn('⚠️ Summary is too short, using full content excerpt'); 
        summary = generatedText.substring(0, 300).trim(); 
      }
      
      if (!content || content.length < 50) {
        console.warn('⚠️ Content is too short, using full response'); 
        content = generatedText; 
      }

      const aiNotes = {
        summary: summary,
        content: content,
      }; 
      
      console.log('✅ Successfully generated notes from Gemini API'); 

      // Save to database
      const noteDoc = new Note({
        userId: req.user.id,
        title: topic,
        content: aiNotes.content,
        summary: aiNotes.summary,
        subject: topic,
        isPinned: false,
        tags: [notesType, language, 'generated', 'ai'],
      }); 

      await noteDoc.save(); 

      res.status(201).json({
        success: true,
        message: 'Notes generated successfully from AI',
        notes: {
          id: noteDoc._id,
          topic: topic,
          language: language,
          notesType: notesType,
          customMessage: customMessage,
          summary: aiNotes.summary,
          content: aiNotes.content,
          createdAt: noteDoc.createdAt,
        },
      }); 
    } catch (apiError) {
      console.error('❌ Gemini API call failed:', apiError.message); 
      if (apiError.response) {
        console.error('API Response Status:', apiError.response.status); 
        console.error('API Response Data:', JSON.stringify(apiError.response.data, null, 2)); 
        console.error('API Request URL:', apiError.config?.url); 
        console.error('API Request Params:', apiError.config?.params); 
      }
      res.status(500).json({
        success: false,
        message: `Failed to generate notes from AI: ${apiError.message}`,
      }); 
    }
  } catch (error) {
    console.error('Error in generateNotes:', error); 
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to generate notes',
    }); 
  }
}; 

// Check remaining notes downloads for user
exports.checkRemainingDownloads = async (req, res) => {
  try {
    const User = require('../models/user'); 
    const DownloadHistory = require('../models/DownloadHistory'); 

    const user = await User.findById(req.user.id); 
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
      }); 
    }

    const now = new Date(); 
    const currentMonth = new Date(now.getFullYear(), now.getMonth(), 1); 
    const nextMonth = new Date(now.getFullYear(), now.getMonth() + 1, 1); 

    const FREE_PLAN_DOWNLOAD_LIMIT = 10; 

    // For pro and ultimate users, unlimited
    if (user.subscriptionPlan === 'pro' || user.subscriptionPlan === 'ultimate') {
      return res.json({
        success: true,
        subscriptionPlan: user.subscriptionPlan,
        isUnlimited: true,
        remainingDownloads: Infinity,
        maxDownloads: Infinity,
        usedDownloads: 0,
        resetDate: null,
        message: `${user.subscriptionPlan.toUpperCase()} users have unlimited downloads`,
      }); 
    }

    // Count downloads for free users
    const downloadsThisMonth = await DownloadHistory.countDocuments({
      userId: req.user.id,
      type: 'notes',
      downloadedAt: { $gte: currentMonth, $lt: nextMonth },
    }); 

    const remainingDownloads = Math.max(0, FREE_PLAN_DOWNLOAD_LIMIT - downloadsThisMonth); 

    res.json({
      success: true,
      subscriptionPlan: user.subscriptionPlan,
      isUnlimited: false,
      remainingDownloads,
      maxDownloads: FREE_PLAN_DOWNLOAD_LIMIT,
      usedDownloads: downloadsThisMonth,
      resetDate: nextMonth,
      limitExceeded: remainingDownloads === 0,
    }); 
  } catch (error) {
    console.error('Error checking remaining downloads:', error); 
    res.status(500).json({
      success: false,
      message: 'Error checking remaining downloads',
    }); 
  }
}; 
 