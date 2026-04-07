import React, { useState, useEffect, useRef } from 'react'; 
import { ChevronRight, Download, RefreshCw, Loader } from 'lucide-react'; 
import ReactMarkdown from 'react-markdown'; 
import remarkGfm from 'remark-gfm'; 
import html2canvas from 'html2canvas'; 
import { jsPDF } from 'jspdf'; 
import { useAuth } from '../context/AuthContext'; 
import katex from 'katex'; 
import 'katex/dist/katex.min.css'; 

const API_BASE_URL = import.meta.env.VITE_API_URL_FRONTEND || import.meta.env.VITE_API_LOCAL_URL_FRONTEND || 'http://localhost:5000/api'

// Component to render LaTeX math expressions
const MathText = ({ children }) => {
  // Helper to extract text from children (handles arrays, strings, elements)
  const extractText = (child) => {
    if (typeof child === 'string') {
      return child; 
    }
    if (typeof child === 'number') {
      return String(child); 
    }
    if (Array.isArray(child)) {
      return child.map(extractText).join(''); 
    }
    if (child && typeof child === 'object' && child.props && child.props.children) {
      return extractText(child.props.children); 
    }
    return ''; 
  }; 

  const text = typeof children === 'string' ? children : extractText(children); 
  const parts = []; 
  let lastIndex = 0; 
  
  // Match both inline ($...$) and block ($$...$$) math
  const mathRegex = /\$\$[\s\S]*?\$\$|\$[^\$\n]+\$/g; 
  let match; 
  
  while ((match = mathRegex.exec(text)) !== null) {
    // Add text before match
    if (match.index > lastIndex) {
      parts.push({
        type: 'text',
        content: text.substring(lastIndex, match.index)
      }); 
    }
    
    // Add math
    const mathContent = match[0]; 
    const isBlock = mathContent.startsWith('$$'); 
    const latexStr = mathContent.slice(isBlock ? 2 : 1, -(isBlock ? 2 : 1)); 
    
    parts.push({
      type: 'math',
      content: latexStr,
      block: isBlock
    }); 
    
    lastIndex = match.index + match[0].length; 
  }
  
  // Add remaining text
  if (lastIndex < text.length) {
    parts.push({
      type: 'text',
      content: text.substring(lastIndex)
    }); 
  }
  
  // If no math found, return original text
  if (parts.length === 0 || (parts.length === 1 && parts[0].type === 'text')) {
    return <>{text}</>; 
  }
  
  return (
    <>
      {parts.map((part, idx) => {
        if (part.type === 'text') {
          return <span key={idx}>{part.content}</span>; 
        } else {
          try {
            const html = katex.renderToString(part.content, {
              throwOnError: false,
              strict: false,
              displayMode: part.block
            }); 
            return (
              <span
                key={idx}
                dangerouslySetInnerHTML={{ __html: html }}
                style={{ display: part.block ? 'block' : 'inline', margin: part.block ? '0.5em 0' : '0' }}
                className={part.block ? 'text-center my-2' : ''}
              />
            ); 
          } catch (e) {
            // console.warn('KaTeX render error:', e); 
            return <span key={idx}>{part.content}</span>; 
          }
        }
      })}
    </>
  ); 
}; 

// Helper function to convert LaTeX math to readable text for PDF
const convertLatexToPdfText = (text) => {
  if (!text) return ''; 
  
  let result = text; 
  
  // Handle fractions FIRST - before removing dollar signs
  result = result.replace(/\$\\frac\{([^}]*)\}\{([^}]*)\}\$/g, '($1/$2)'); 
  result = result.replace(/\\frac\{([^}]*)\}\{([^}]*)\}/g, '($1/$2)'); 
  
  // Handle square roots - before removing dollar signs
  result = result.replace(/\$\\sqrt\{([^}]*)\}\}\$/g, '√($1)'); 
  result = result.replace(/\$\\sqrt\{([^}]*)\}\$/g, '√($1)'); 
  result = result.replace(/\\sqrt\{([^}]*)\}/g, '√($1)'); 
  
  // Handle integrals with limits like \int_a^b or \int^a_b
  result = result.replace(/\$\\int_\{([^}]*)\}\^\{([^}]*)\}\$/g, '∫($1 to $2)'); 
  result = result.replace(/\$\\int\^\{([^}]*)\}_\{([^}]*)\}\$/g, '∫($2 to $1)'); 
  result = result.replace(/\\int_\{([^}]*)\}\^\{([^}]*)\}/g, '∫($1 to $2)'); 
  result = result.replace(/\\int\^\{([^}]*)\}_\{([^}]*)\}/g, '∫($2 to $1)'); 
  
  // Handle sum with limits
  result = result.replace(/\$\\sum_\{([^}]*)\}\^\{([^}]*)\}\$/g, '∑($1 to $2)'); 
  result = result.replace(/\\sum_\{([^}]*)\}\^\{([^}]*)\}/g, '∑($1 to $2)'); 
  
  // Replace complex LaTeX commands by length (longest first to avoid conflicts)
  const complexReplacements = [
    ['\\leftarrow', '←'],
    ['\\rightarrow', '→'],
    ['\\leftrightarrow', '↔'],
    ['\\Rightarrow', '⇒'],
    ['\\Leftarrow', '⇐'],
    ['\\Leftrightarrow', '⇔'],
  ]; 
  
  complexReplacements.forEach(([latex, symbol]) => {
    const escaped = latex.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'); 
    result = result.replace(new RegExp(escaped, 'g'), symbol); 
  }); 
  
  // Comprehensive LaTeX Greek letters and mathematical symbols
  const basicReplacements = {
    // Integration and summation
    '\\iiint': '∫∫∫',
    '\\iint': '∫∫',
    '\\int': '∫',
    '\\sum': '∑',
    '\\prod': '∏',
    '\\coprod': '∐',
    
    // Greek letters - lowercase
    '\\alpha': 'α',
    '\\beta': 'β',
    '\\gamma': 'γ',
    '\\delta': 'δ',
    '\\epsilon': 'ε',
    '\\zeta': 'ζ',
    '\\eta': 'η',
    '\\theta': 'θ',
    '\\iota': 'ι',
    '\\kappa': 'κ',
    '\\lambda': 'λ',
    '\\mu': 'μ',
    '\\nu': 'ν',
    '\\xi': 'ξ',
    '\\omicron': 'ο',
    '\\pi': 'π',
    '\\rho': 'ρ',
    '\\sigma': 'σ',
    '\\tau': 'τ',
    '\\upsilon': 'υ',
    '\\phi': 'φ',
    '\\chi': 'χ',
    '\\psi': 'ψ',
    '\\omega': 'ω',
    
    // Greek letters - uppercase
    '\\Alpha': 'Α',
    '\\Beta': 'Β',
    '\\Gamma': 'Γ',
    '\\Delta': 'Δ',
    '\\Epsilon': 'Ε',
    '\\Zeta': 'Ζ',
    '\\Eta': 'Η',
    '\\Theta': 'Θ',
    '\\Iota': 'Ι',
    '\\Kappa': 'Κ',
    '\\Lambda': 'Λ',
    '\\Mu': 'Μ',
    '\\Nu': 'Ν',
    '\\Xi': 'Ξ',
    '\\Omicron': 'Ο',
    '\\Pi': 'Π',
    '\\Rho': 'Ρ',
    '\\Sigma': 'Σ',
    '\\Tau': 'Τ',
    '\\Upsilon': 'Υ',
    '\\Phi': 'Φ',
    '\\Chi': 'Χ',
    '\\Psi': 'Ψ',
    '\\Omega': 'Ω',
    
    // Mathematical operators and relations
    '\\pm': '±',
    '\\mp': '∓',
    '\\times': '×',
    '\\div': '÷',
    '\\cdot': '·',
    '\\ast': '*',
    '\\star': '★',
    '\\circ': '°',
    '\\bullet': '•',
    '\\oplus': '⊕',
    '\\ominus': '⊖',
    '\\otimes': '⊗',
    '\\odot': '⊙',
    '\\oslash': '⊘',
    
    // Comparison and logical operators
    '\\approx': '≈',
    '\\neq': '≠',
    '\\equiv': '≡',
    '\\leq': '≤',
    '\\geq': '≥',
    '\\ll': '≪',
    '\\gg': '≫',
    '\\sim': '~',
    '\\simeq': '≃',
    '\\cong': '≅',
    '\\propto': '∝',
    
    // Logical operators
    '\\forall': '∀',
    '\\exists': '∃',
    '\\nexists': '∄',
    '\\in': '∈',
    '\\notin': '∉',
    '\\ni': '∋',
    
    // Set operators
    '\\cup': '∪',
    '\\cap': '∩',
    '\\subset': '⊂',
    '\\supset': '⊃',
    '\\subseteq': '⊆',
    '\\supseteq': '⊇',
    '\\emptyset': '∅',
    '\\therefore': '∴',
    '\\because': '∵',
    
    // Limits and infinities
    '\\infty': '∞',
    '\\nabla': '∇',
    '\\partial': '∂',
    '\\hbar': 'ℏ',
    
    // Mathematical constants
    '\\aleph': 'ℵ',
    '\\beth': 'ℶ',
    '\\gimel': 'ℷ',
    '\\daleth': 'ℸ',
    
    // Function operators
    '\\lim': 'lim',
    '\\limsup': 'limsup',
    '\\liminf': 'liminf',
    '\\max': 'max',
    '\\min': 'min',
    '\\sin': 'sin',
    '\\cos': 'cos',
    '\\tan': 'tan',
    '\\arcsin': 'arcsin',
    '\\arccos': 'arccos',
    '\\arctan': 'arctan',
    '\\sinh': 'sinh',
    '\\cosh': 'cosh',
    '\\tanh': 'tanh',
    '\\exp': 'exp',
    '\\log': 'log',
    '\\ln': 'ln',
    '\\lg': 'lg',
    
    // Arrows and direction symbols
    '\\uparrow': '↑',
    '\\downarrow': '↓',
    '\\updownarrow': '↕',
    '\\Uparrow': '⇑',
    '\\Downarrow': '⇓',
    '\\Updownarrow': '⇕',
    '\\nwarrow': '↖',
    '\\nearrow': '↗',
    '\\swarrow': '↙',
    '\\searrow': '↘',
    '\\Leftarrow': '⇐',
    '\\Rightarrow': '⇒',
    '\\Leftrightarrow': '⇔',
    '\\leftarrow': '←',
    '\\rightarrow': '→',
    '\\leftrightarrow': '↔',
    '\\mapsto': '↦',
    '\\hookrightarrow': '↪',
    '\\hookleftarrow': '↩',
    
    // Geometric symbols
    '\\angle': '∠',
    '\\perp': '⊥',
    '\\parallel': '∥',
    '\\square': '□',
    '\\diamond': '◊',
    '\\triangle': '△',
    '\\ell': 'ℓ',
    
    // Miscellaneous
    '\\dagger': '†',
    '\\ddagger': '‡',
    '\\P': '¶',
    '\\S': '§',
    '\\copyright': '©',
    '\\circledR': '®',
    '\\circledS': 'Ⓢ',
  }; 
  
  Object.entries(basicReplacements).forEach(([latex, symbol]) => {
    const escaped = latex.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'); 
    result = result.replace(new RegExp(escaped, 'g'), symbol); 
  }); 
  
  // Handle subscripts and superscripts - convert to readable format
  // Handle ^{...} patterns
  result = result.replace(/\^(\{[^}]*\})/g, (match, content) => {
    const inner = content.slice(1, -1); 
    return '^' + inner; 
  }); 
  
  // Handle _{...} patterns
  result = result.replace(/_(\{[^}]*\})/g, (match, content) => {
    const inner = content.slice(1, -1); 
    return '_' + inner; 
  }); 
  
  // Handle single character ^ and _
  result = result.replace(/\^([a-zA-Z0-9])/g, '$1^'); 
  result = result.replace(/_([a-zA-Z0-9])/g, '$1_'); 
  
  // Remove remaining LaTeX command braces
  result = result.replace(/\\left\(/g, '('); 
  result = result.replace(/\\right\)/g, ')'); 
  result = result.replace(/\\left\[/g, '['); 
  result = result.replace(/\\right\]/g, ']'); 
  result = result.replace(/\\left\{/g, '{'); 
  result = result.replace(/\\right\}/g, '}'); 
  
  // Remove dollar signs
  result = result.replace(/\$\$/g, ''); 
  result = result.replace(/\$/g, ''); 
  
  // Clean up remaining LaTeX commands with arguments {content} - keep the content
  result = result.replace(/\\[a-zA-Z]+\{([^}]*)\}/g, '$1'); 
  
  // Clean up remaining backslashes and LaTeX commands (but preserve spaces in text)
  result = result.replace(/\\/g, ''); 
  
  // Clean up only multiple consecutive spaces, but preserve single spaces between words
  result = result.replace(/  +/g, ' ').trim(); 
  
  return result; 
}; 

export default function NotesInterface({ onNavigate, notesData }) {
  const { user } = useAuth(); 
  const notesDisplayRef = useRef(null); 
  const leftPanelRef = useRef(null); 
  const [leftPanelHeight, setLeftPanelHeight] = useState('auto'); 
  const [userSubscription, setUserSubscription] = useState('free'); 
  const [notes, setNotes] = useState(notesData?.notes || null); 
  const [topic, setTopic] = useState(notesData?.topic || ''); 
  const [subject, setSubject] = useState(notesData?.subject || ''); 
  const [language, setLanguage] = useState(notesData?.language || 'english'); 
  const [notesType, setNotesType] = useState(notesData?.notesType || 'short'); 
  const [examType, setExamType] = useState(notesData?.examType || 'competitive'); 
  const [customMessage, setCustomMessage] = useState(notesData?.customMessage || ''); 
  const [isGenerating, setIsGenerating] = useState(false); 
  const [error, setError] = useState(null); 
  const [imageLoaded, setImageLoaded] = useState(true); 
  const [notesDownloadLimitInfo, setNotesDownloadLimitInfo] = useState(null); 
  const [showDownloadLimitWarning, setShowDownloadLimitWarning] = useState(false); 

  // Fetch subscription data
  useEffect(() => {
    const fetchSubscriptionData = async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/user/profile`, {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('authToken')}`,
          },
        }); 
        const data = await response.json(); 
        if (data.success) {
          setUserSubscription(data.user.subscriptionPlan || 'free'); 
        }
      } catch (error) {
        // console.error('Error fetching subscription:', error); 
        setUserSubscription('free'); 
      }
    }; 

    fetchSubscriptionData(); 
  }, []); 

  // Fetch notes download limit info
  useEffect(() => {
    const fetchDownloadLimitInfo = async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/notes/check/remaining-downloads`, {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('authToken')}`,
          },
        }); 
        const data = await response.json(); 
        if (data.success) {
          setNotesDownloadLimitInfo(data); 
          if (data.limitExceeded) {
            setShowDownloadLimitWarning(true); 
          }
        }
      } catch (err) {
        // console.error('Error fetching download limit info:', err); 
      }
    }; 

    fetchDownloadLimitInfo(); 
  }, []); 

  // Measure left panel height and apply to right panel
  useEffect(() => {
    const measureHeight = () => {
      if (leftPanelRef.current) {
        const height = leftPanelRef.current.offsetHeight; 
        setLeftPanelHeight(`${height}px`); 
      }
    }; 

    // Initial measurement
    measureHeight(); 

    // Measure on window resize
    window.addEventListener('resize', measureHeight); 
    
    // Use ResizeObserver for responsive changes
    const resizeObserver = new ResizeObserver(measureHeight); 
    if (leftPanelRef.current) {
      resizeObserver.observe(leftPanelRef.current); 
    }

    return () => {
      window.removeEventListener('resize', measureHeight); 
      resizeObserver.disconnect(); 
    }; 
  }, []); 

  const autoGenerateNotes = async () => {
    if (!topic.trim()) return; 
    if (!subject.trim()) {
      setError('Please enter a subject'); 
      return; 
    }

    setIsGenerating(true); 
    setError(null); 

    try {
      const response = await fetch(`${API_BASE_URL}/notes/generate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('authToken')}`,
        },
        body: JSON.stringify({
          topic: topic.trim(),
          subject: subject.trim(),
          language,
          notesType,
          examType,
          customMessage: customMessage.trim() || null,
        }),
      }); 

      const data = await response.json(); 

      if (data.success) {
        // console.log('Generated notes data:', data.notes); 
        // console.log('Image URL from response:', data.notes?.imageUrl); 
        setNotes(data.notes); 
        setImageLoaded(true); 
        setError(null); 
      } else {
        setError(data.message || 'Failed to generate notes'); 
      }
    } catch (err) {
      // console.error('Error generating notes:', err); 
      setError('Error generating notes. Please try again.'); 
    } finally {
      setIsGenerating(false); 
    }
  }; 

  const generateNotes = async (e) => {
    e.preventDefault(); 
    if (!topic.trim()) {
      setError('Please enter a topic'); 
      return; 
    }
    if (!subject.trim()) {
      setError('Please enter a subject'); 
      return; 
    }

    setIsGenerating(true); 
    setError(null); 
    setNotes(null); 

    try {
      const response = await fetch(`${API_BASE_URL}/notes/generate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('authToken')}`,
        },
        body: JSON.stringify({
          topic: topic.trim(),
          subject: subject.trim(),
          language,
          notesType,
          examType,
          customMessage: customMessage.trim() || null,
        }),
      }); 

      const data = await response.json(); 

      if (data.success) {
        setNotes(data.notes); 
        setIsSaved(false); 
        setError(null); 
      } else {
        setError(data.message || 'Failed to generate notes'); 
      }
    } catch (err) {
      // console.error('Error generating notes:', err); 
      setError('Error generating notes. Please try again.'); 
    } finally {
      setIsGenerating(false); 
    }
  }; 

  // Helper function to convert LaTeX math expressions to readable text
  // Note: Math expressions now come from backend in Unicode format (e.g., α, β, ∫, √, etc.)
  // No need for conversion - just display directly

  const downloadNotes = async () => {
    if (!notes) {
      setError('Error: Notes not ready for download'); 
      return; 
    }

    // Check download limit for free users
    if (userSubscription === 'free' && notesDownloadLimitInfo?.limitExceeded) {
      setShowDownloadLimitWarning(true); 
      setError('Download limit reached. Upgrade to Pro or Ultimate to continue downloading notes.'); 
      return; 
    }

    try {
      const pdf = new jsPDF({
        orientation: 'p',
        unit: 'mm',
        format: 'a4',
        compress: true
      }); 
      
      // Set default font to support Unicode properly
      pdf.setFont('Helvetica'); 
      
      const pageWidth = pdf.internal.pageSize.getWidth(); 
      const pageHeight = pdf.internal.pageSize.getHeight(); 
      const margin = 15; 
      const contentWidth = pageWidth - 2 * margin; 
      let yPosition = 5;  // Very minimal top margin for logo

      // Set default font with UTF-8 encoding support
      pdf.setFont('Helvetica'); 
      pdf.setLanguage('en'); 

      // Define border color based on subscription plan
      let borderColor = [52, 152, 219];  // Default blue for free
      if (userSubscription === 'pro') {
        borderColor = [155, 89, 182];  // Purple for pro
      } else if (userSubscription === 'ultimate') {
        borderColor = [230, 126, 34];  // Orange/Gold for ultimate
      }
      // Free plan keeps default blue

      // Add Logo - load from public folder centered with reduced width
      try {
        const logoImg = new Image(); 
        logoImg.src = '/pdf_mail.png'; 
        
        // Wait for image to load, then add to PDF
        await new Promise((resolve) => {
          logoImg.onload = () => {
            // Add logo centered with 70% of content width
            const logoWidth = contentWidth * 0.7; 
            const logoX = margin + (contentWidth - logoWidth) / 2;  // Center horizontally
            pdf.addImage(logoImg, 'PNG', logoX, yPosition, logoWidth, 30); 
            yPosition += 32;  // Space after full-width logo
            resolve(); 
          }; 
          logoImg.onerror = () => {
            // If image fails to load, just continue without it
            resolve(); 
          }; 
        }); 
      } catch (logoError) {
        // console.warn('Could not load logo:', logoError); 
      }

      // Add line separator after logo with margins
      yPosition += 2;  // Top margin for line
      pdf.setDrawColor(...borderColor);  // Use subscription-based color
      pdf.setLineWidth(1.5);  // Bold line
      pdf.line(margin, yPosition, pageWidth - margin, yPosition); 
      yPosition += 10;  // Bottom margin for line (increased space)

      // Add Header without background
      pdf.setFontSize(24); 
      pdf.setTextColor(25, 55, 109);  // Dark blue
      pdf.setFont('Helvetica', 'bold'); 
      pdf.text(topic, margin, yPosition);  // Back to left margin, below line
      yPosition += 12; 

      // Add metadata
      pdf.setFontSize(10); 
      pdf.setTextColor(80, 100, 130); 
      pdf.setFont('Helvetica', 'normal'); 
      const userName = user?.name || 'User'; 
      pdf.text(`Student: ${userName} | Language: ${language.charAt(0).toUpperCase() + language.slice(1)} | Format: ${notesType.charAt(0).toUpperCase() + notesType.slice(1)} | Exam: ${examType.toUpperCase()} | Generated: ${new Date().toLocaleDateString()}`, margin, yPosition); 
      yPosition += 6; 

      // Add colored horizontal line
      pdf.setDrawColor(...borderColor);  // Use subscription-based color
      pdf.setLineWidth(0.8); 
      pdf.line(margin, yPosition, pageWidth - margin, yPosition); 
      yPosition += 8; 

      // Helper function to check and add new page if needed
      const checkAndAddPage = (requiredHeight = 10) => {
        if (yPosition + requiredHeight > pageHeight - 10) {
          pdf.addPage(); 
          yPosition = margin; 
        }
      }; 

      // Helper to add section header with background
      const addSectionHeader = (title, isDetailedNotes = false) => {
        checkAndAddPage(10); 
        const bgColor = isDetailedNotes ? [230, 245, 250] : [245, 250, 255];  // Different blues
        const textColor = isDetailedNotes ? [20, 100, 150] : [25, 75, 140]; 
        
        pdf.setFillColor(...bgColor); 
        pdf.rect(margin - 2, yPosition - 5, contentWidth + 4, 8, 'F'); 
        
        pdf.setFontSize(14); 
        pdf.setTextColor(...textColor); 
        pdf.setFont('Helvetica', 'bold'); 
        pdf.text(title, margin, yPosition); 
        yPosition += 8; 
      }; 

      // Helper to add regular text with wrapping
      const addText = (text, fontSize = 11, isBold = false, headerLevel = 0) => {
        // Convert LaTeX to readable text for PDF
        let processedText = convertLatexToPdfText(text); 
        
        // Clean up markdown formatting
        let cleanText = processedText
          .replace(/^#+\s+/g, '')            // Remove header markers
          .replace(/\*\*(.*?)\*\*/g, '$1')  // Remove bold markers
          .replace(/__(.*?)__/g, '$1')      // Remove bold underscores
          .replace(/\*(.*?)\*/g, '$1')      // Remove italic markers
          .replace(/_(.*?)_/g, '$1')        // Remove italic underscores
          .replace(/\[(.*?)\]\((.*?)\)/g, '$1');  // Remove links
        
        pdf.setFontSize(fontSize); 
        
        // Add colors for different header levels
        if (headerLevel === 1) {
          pdf.setTextColor(25, 85, 145);  // Dark blue for h1
        } else if (headerLevel === 2) {
          pdf.setTextColor(70, 130, 180);  // Steel blue for h2
        } else if (headerLevel === 3) {
          pdf.setTextColor(100, 150, 200);  // Light blue for h3
        } else if (isBold) {
          pdf.setTextColor(40, 40, 40);  // Dark gray for bold non-headers
        } else {
          pdf.setTextColor(60, 60, 60);  // Medium gray for regular text
        }
        
        pdf.setFont('Helvetica', isBold ? 'bold' : 'normal'); 
        const lines = pdf.splitTextToSize(cleanText, contentWidth); 
        lines.forEach(line => {
          checkAndAddPage(fontSize * 0.35 + 1); 
          pdf.text(line, margin, yPosition); 
          yPosition += fontSize * 0.35 + 1; 
        }); 
      }; 

      // Helper to add bullet points
      const addBullet = (text) => {
        // Convert LaTeX to readable text for PDF
        const processedText = convertLatexToPdfText(text); 
        
        pdf.setFontSize(11); 
        pdf.setTextColor(100, 130, 170);  // Blue bullet color
        pdf.setFont('Helvetica', 'normal'); 
        const bulletLines = pdf.splitTextToSize(processedText, contentWidth - 8); 
        checkAndAddPage(bulletLines.length * 4 + 2); 
        pdf.text('• ', margin + 2, yPosition); 
        
        // Text in dark color
        pdf.setTextColor(60, 60, 60); 
        // Render each line individually instead of as array
        bulletLines.forEach((line, index) => {
          pdf.text(line, margin + 8, yPosition + (index * 4)); 
        }); 
        yPosition += bulletLines.length * 4 + 2; 
      }; 

      // Helper to add numbered list
      const addNumberedItem = (number, text) => {
        // Convert LaTeX to readable text for PDF
        const processedText = convertLatexToPdfText(text); 
        
        pdf.setFontSize(11); 
        pdf.setTextColor(100, 130, 170);  // Blue number color
        pdf.setFont('Helvetica', 'bold'); 
        const itemLines = pdf.splitTextToSize(processedText, contentWidth - 12); 
        checkAndAddPage(itemLines.length * 4 + 2); 
        pdf.text(`${number}. `, margin + 2, yPosition); 
        
        // Text in dark color
        pdf.setTextColor(60, 60, 60); 
        pdf.setFont('Helvetica', 'normal'); 
        // Render each line individually instead of as array
        itemLines.forEach((line, index) => {
          pdf.text(line, margin + 12, yPosition + (index * 4)); 
        }); 
        yPosition += itemLines.length * 4 + 2; 
      }; 

      // Helper to parse and render markdown
      const renderMarkdown = (markdown) => {
        const lines = markdown.split('\n'); 
        let tableLines = []; 
        let inCodeBlock = false; 
        let codeBlockLines = []; 

        for (let i = 0;  i < lines.length;  i++) {
          const line = lines[i].trim(); 

          // Handle code blocks (triple backticks)
          if (line.startsWith('```')) {
            if (inCodeBlock) {
              // End of code block
              inCodeBlock = false; 
              // Render the code block
              if (codeBlockLines.length > 0) {
                checkAndAddPage(codeBlockLines.length * 3.5 + 4); 
                pdf.setFillColor(240, 240, 240);  // Light gray background
                pdf.setDrawColor(200, 200, 200);  // Gray border
                pdf.setLineWidth(0.5); 
                const codeBlockHeight = codeBlockLines.length * 3.5 + 2; 
                pdf.rect(margin, yPosition, contentWidth, codeBlockHeight, 'FD'); 
                
                pdf.setFontSize(9); 
                pdf.setFont('Courier', 'normal'); 
                pdf.setTextColor(60, 60, 60); 
                let codeY = yPosition + 2; 
                codeBlockLines.forEach(codeLine => {
                  pdf.text(codeLine, margin + 2, codeY); 
                  codeY += 3.5; 
                }); 
                yPosition += codeBlockHeight + 3; 
              }
              codeBlockLines = []; 
            } else {
              // Start of code block
              inCodeBlock = true; 
              codeBlockLines = []; 
            }
            continue; 
          }

          // If in code block, collect the lines
          if (inCodeBlock) {
            codeBlockLines.push(line); 
            continue; 
          }

          // Skip empty lines
          if (!line) {
            yPosition += 2; 
            continue; 
          }

          // Headers
          if (line.startsWith('# ')) {
            let headerText = line.substring(2).trim(); 
            // Remove emojis from headers for PDF compatibility
            headerText = headerText.replace(/[\u{1F300}-\u{1F9FF}]/gu, '').trim(); 
            yPosition += 3; 
            // Add visual separator line
            checkAndAddPage(4); 
            pdf.setDrawColor(...borderColor);  // Use subscription-based color
            pdf.line(margin, yPosition, pageWidth - margin, yPosition); 
            yPosition += 6; 
            // Add the header text in blue
            pdf.setFontSize(14); 
            pdf.setTextColor(40, 80, 140); 
            pdf.setFont('Helvetica', 'bold'); 
            pdf.text(headerText, margin, yPosition); 
            yPosition += 7; 
          } else if (line.startsWith('## ')) {
            let headerText = line.substring(3).trim(); 
            // Remove emojis from headers for PDF compatibility
            headerText = headerText.replace(/[\u{1F300}-\u{1F9FF}]/gu, '').trim(); 
            yPosition += 2; 
            // Add visual separator line
            checkAndAddPage(3); 
            pdf.setDrawColor(...borderColor);  // Use subscription-based color
            pdf.line(margin, yPosition, pageWidth - margin, yPosition); 
            yPosition += 5; 
            // Add the header text
            pdf.setFontSize(12); 
            pdf.setTextColor(50, 50, 50); 
            pdf.setFont('Helvetica', 'bold'); 
            pdf.text(headerText, margin, yPosition); 
            yPosition += 5; 
          } else if (line.startsWith('### ')) {
            let headerText = line.substring(4).trim(); 
            // Remove emojis from headers for PDF compatibility
            headerText = headerText.replace(/[\u{1F300}-\u{1F9FF}]/gu, '').trim(); 
            // Just add the text with slight styling
            pdf.setFontSize(11); 
            pdf.setTextColor(70, 70, 70); 
            pdf.setFont('Helvetica', 'bold'); 
            checkAndAddPage(4); 
            pdf.text(headerText, margin, yPosition); 
            yPosition += 3; 
          }
          // Numbered lists
          else if (/^\d+\./.test(line)) {
            const match = line.match(/^(\d+)\.\s+(.*)/); 
            if (match) {
              let listText = match[2]; 
              // Remove bold markers but keep text bold
              const boldMatches = listText.match(/\*\*(.*?)\*\*/g); 
              if (boldMatches) {
                boldMatches.forEach(bold => {
                  const cleanBold = bold.replace(/\*\*/g, ''); 
                  listText = listText.replace(bold, cleanBold); 
                }); 
              }
              // Remove italic markers
              listText = listText.replace(/\*(.*?)\*/g, '$1').replace(/_(.*?)_/g, '$1'); 
              // Remove inline code backticks
              listText = listText.replace(/`([^`]+)`/g, '$1'); 
              addNumberedItem(match[1], listText); 
            }
          }
          // Bullet points
          else if (line.startsWith('- ') || line.startsWith('* ')) {
            let bulletText = line.replace(/^[-*]\s+/, ''); 
            // Remove bold markers but keep text bold
            const boldMatches = bulletText.match(/\*\*(.*?)\*\*/g); 
            if (boldMatches) {
              boldMatches.forEach(bold => {
                const cleanBold = bold.replace(/\*\*/g, ''); 
                bulletText = bulletText.replace(bold, cleanBold); 
              }); 
            }
            // Remove italic markers
            bulletText = bulletText.replace(/\*(.*?)\*/g, '$1').replace(/_(.*?)_/g, '$1'); 
            // Remove inline code backticks
            bulletText = bulletText.replace(/`([^`]+)`/g, '$1'); 
            addBullet(bulletText); 
          }
          // Tables
          else if (line.includes('|')) {
            tableLines.push(line); 
            // Check if next line is separator
            if (i + 1 < lines.length && lines[i + 1].includes('|') && lines[i + 1].includes('-')) {
              i++;  // Skip separator line
            }
            // Check if this is the last table line
            if (i + 1 >= lines.length || !lines[i + 1].includes('|')) {
              if (tableLines.length > 0) {
                renderTable(tableLines); 
                tableLines = []; 
                yPosition += 5; 
              }
            }
          }
          // Regular text
          else {
            let cleanText = line; 
            // Remove bold markers
            cleanText = cleanText.replace(/\*\*(.*?)\*\*/g, '$1'); 
            // Remove italic markers
            cleanText = cleanText.replace(/__(.*?)__/g, '$1').replace(/\*(.*?)\*/g, '$1').replace(/_([^_]+)_/g, '$1'); 
            // Remove inline code backticks
            cleanText = cleanText.replace(/`([^`]+)`/g, '$1'); 
            
            // Just add text normally (no math processing needed since backend sends Unicode)
            addText(cleanText); 
          }
        }
      }; 

      // Helper to render table
      const renderTable = (tableLines) => {
        if (tableLines.length < 2) return; 

        const parseCells = (line) => {
          return line.split('|')
            .map(cell => {
              let cleanCell = cell.trim(); 
              // Convert LaTeX to readable text for PDF
              cleanCell = convertLatexToPdfText(cleanCell); 
              // Remove markdown bold markers but keep emojis
              cleanCell = cleanCell.replace(/\*\*(.*?)\*\*/g, '$1'); 
              // Remove italic markers
              cleanCell = cleanCell.replace(/__(.*?)__/g, '$1').replace(/\*(.*?)\*/g, '$1').replace(/_([^_]+)_/g, '$1'); 
              // Remove inline code backticks
              cleanCell = cleanCell.replace(/`([^`]+)`/g, '$1'); 
              return cleanCell; 
            })
            .filter(cell => cell !== '' && !cell.match(/^-+$/)); 
        }; 

        const rows = []; 
        for (let i = 0;  i < tableLines.length;  i++) {
          const cells = parseCells(tableLines[i]); 
          if (cells.length > 0) {
            rows.push(cells); 
          }
        }

        if (rows.length === 0) return; 

        const colCount = rows[0].length; 
        const colWidth = contentWidth / colCount; 
        const minRowHeight = 10; 
        const maxCellHeight = 50;  // Maximum height per cell

        // Calculate row heights - wrap text and measure height needed
        const rowHeights = rows.map((row) => {
          let maxHeight = minRowHeight; 
          row.forEach((cell) => {
            if (cell && cell.length > 0) {
              // Estimate height needed based on text length and column width
              const lines = pdf.splitTextToSize(cell, colWidth - 2); 
              const cellHeight = Math.min(lines.length * 4.5 + 2, maxCellHeight); 
              maxHeight = Math.max(maxHeight, cellHeight); 
            }
          }); 
          return maxHeight; 
        }); 

        // Calculate total table height
        const totalTableHeight = rowHeights.reduce((a, b) => a + b, 0) + 5; 
        checkAndAddPage(totalTableHeight); 

        // Draw table with wrapped text
        let currentY = yPosition; 
        rows.forEach((row, rowIndex) => {
          const rowHeight = rowHeights[rowIndex]; 
          let currentX = margin; 
          
          row.forEach((cell, colIndex) => {
            // Cell border
            pdf.setDrawColor(...borderColor);  // Use subscription-based color
            pdf.setLineWidth(0.5); 
            pdf.rect(currentX, currentY, colWidth, rowHeight); 

            // Cell background
            if (rowIndex === 0) {
              pdf.setFillColor(70, 130, 180);  // Steel blue
              pdf.rect(currentX, currentY, colWidth, rowHeight, 'F'); 
              pdf.setTextColor(255, 255, 255);  // White text
              pdf.setFont('Helvetica', 'bold'); 
            } else {
              pdf.setFillColor(245, 245, 245);  // Light gray
              pdf.rect(currentX, currentY, colWidth, rowHeight, 'F'); 
              pdf.setTextColor(40, 40, 40);  // Dark text
              pdf.setFont('Helvetica', 'normal'); 
            }

            // Cell text rendering with wrapping
            pdf.setFontSize(8); 
            
            if (rowIndex === 0) {
              pdf.setTextColor(255, 255, 255); 
            } else {
              pdf.setTextColor(40, 40, 40); 
            }
            
            // Split text to fit column width and render it
            const cellText = cell || ''; 
            const lines = pdf.splitTextToSize(cellText, colWidth - 2); 
            const maxLines = Math.floor((rowHeight - 2) / 4.5); 
            
            let textY = currentY + 3; 
            lines.slice(0, maxLines).forEach((line) => {
              pdf.text(line, currentX + 1, textY); 
              textY += 4.5; 
            }); 

            currentX += colWidth; 
          }); 
          currentY += rowHeight; 
        }); 

        yPosition = currentY; 
      }; 

      // Add Summary
      if (notes.summary) {
        addSectionHeader('Summary', false); 
        renderMarkdown(notes.summary); 
        yPosition += 5; 
      }

      // Add Detailed Notes
      if (notes.content) {
        addSectionHeader('Detailed Notes', true); 
        renderMarkdown(notes.content); 
      }

      // Add footer to all pages and borders
      const pageCount = pdf.internal.getNumberOfPages(); 
      const borderMargin = 2;  // Very small margin from edges
      for (let i = 1;  i <= pageCount;  i++) {
        pdf.setPage(i); 
        
        // Add border around each page (very close to edges)
        pdf.setDrawColor(...borderColor);  // Use subscription-based color
        pdf.setLineWidth(1.5); 
        pdf.rect(borderMargin, borderMargin, pageWidth - 2 * borderMargin, pageHeight - 2 * borderMargin); 
        
        // Add footer text
        pdf.setFontSize(8); 
        pdf.setTextColor(150, 150, 150); 
        pdf.text(`SelfRanker | Page ${i} of ${pageCount}`, margin, pageHeight - 8); 
      }

      // Save PDF
      pdf.save(`${topic.replace(/\s+/g, '_')}_notes.pdf`); 

      // Record download for all users
      try {
        const recordResponse = await fetch(`${API_BASE_URL}/download-history`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('authToken')}`,
          },
          body: JSON.stringify({
            type: 'notes',
          }),
        }); 
        
        const recordData = await recordResponse.json(); 
        // console.log('Download recorded:', recordData); 

        // Refetch download limit info for free users only
        if (userSubscription === 'free') {
          const limitResponse = await fetch(`${API_BASE_URL}/notes/check/remaining-downloads`, {
            headers: {
              'Authorization': `Bearer ${localStorage.getItem('authToken')}`,
            },
          }); 
          const limitData = await limitResponse.json(); 
          // console.log('Updated limit data:', limitData); 
          
          if (limitData.success) {
            setNotesDownloadLimitInfo(limitData); 
            if (limitData.limitExceeded) {
              setShowDownloadLimitWarning(true); 
            }
          }
        }
      } catch (err) {
        // console.error('Error recording download:', err); 
      }
    } catch (error) {
      // console.error('Error downloading PDF:', error); 
      // console.error('Error details:', error.message); 
      setError('Error downloading PDF. Please try again.'); 
    }
  }; 

  // Helper function to apply styling to markdown content
  const applyStylingToContent = (element) => {
    // Style headers
    element.querySelectorAll('h1').forEach(el => {
      el.style.fontSize = '24px'; 
      el.style.color = '#a78bfa'; 
      el.style.marginTop = '15px'; 
      el.style.marginBottom = '10px'; 
      el.style.fontWeight = 'bold'; 
      el.style.borderBottom = '2px solid #a78bfa'; 
      el.style.paddingBottom = '8px'; 
    }); 

    element.querySelectorAll('h2').forEach(el => {
      el.style.fontSize = '18px'; 
      el.style.color = '#60a5fa'; 
      el.style.marginTop = '12px'; 
      el.style.marginBottom = '8px'; 
      el.style.fontWeight = 'bold'; 
      el.style.borderLeft = '3px solid #60a5fa'; 
      el.style.paddingLeft = '10px'; 
    }); 

    element.querySelectorAll('h3, h4, h5, h6').forEach(el => {
      el.style.color = '#818cf8'; 
      el.style.marginTop = '10px'; 
      el.style.marginBottom = '8px'; 
      el.style.fontWeight = 'bold'; 
    }); 

    // Style paragraphs
    element.querySelectorAll('p').forEach(el => {
      el.style.marginBottom = '10px'; 
      el.style.color = '#cbd5e1'; 
    }); 

    // Style lists
    element.querySelectorAll('ul, ol').forEach(el => {
      el.style.marginLeft = '20px'; 
      el.style.marginBottom = '10px'; 
    }); 

    element.querySelectorAll('li').forEach(el => {
      el.style.marginBottom = '5px'; 
      el.style.color = '#cbd5e1'; 
    }); 

    // Style inline code
    element.querySelectorAll('code').forEach(el => {
      if (!el.closest('pre')) {
        el.style.backgroundColor = '#1e293b'; 
        el.style.color = '#fbbf24'; 
        el.style.padding = '2px 6px'; 
        el.style.borderRadius = '3px'; 
        el.style.fontFamily = 'monospace'; 
        el.style.fontSize = '12px'; 
      }
    }); 

    // Style code blocks
    element.querySelectorAll('pre').forEach(el => {
      el.style.backgroundColor = '#1e293b'; 
      el.style.color = '#fbbf24'; 
      el.style.padding = '12px'; 
      el.style.borderRadius = '4px'; 
      el.style.overflow = 'auto'; 
      el.style.marginBottom = '10px'; 
      el.style.fontFamily = 'monospace'; 
      el.style.fontSize = '12px'; 
    }); 

    // Style blockquotes
    element.querySelectorAll('blockquote').forEach(el => {
      el.style.borderLeft = '4px solid #a855f7'; 
      el.style.paddingLeft = '15px'; 
      el.style.margin = '10px 0'; 
      el.style.color = '#cbd5e1'; 
      el.style.fontStyle = 'italic'; 
      el.style.backgroundColor = '#1a2332'; 
      el.style.padding = '10px 15px'; 
      el.style.borderRadius = '4px'; 
    }); 

    // Style tables
    element.querySelectorAll('table').forEach(el => {
      el.style.borderCollapse = 'collapse'; 
      el.style.width = '100%'; 
      el.style.margin = '15px 0'; 
      el.style.border = '1px solid #475569'; 
    }); 

    element.querySelectorAll('th').forEach(el => {
      el.style.backgroundColor = '#1e293b'; 
      el.style.color = '#a78bfa'; 
      el.style.padding = '10px'; 
      el.style.textAlign = 'left'; 
      el.style.fontWeight = 'bold'; 
      el.style.border = '1px solid #475569'; 
    }); 

    element.querySelectorAll('td').forEach(el => {
      el.style.padding = '8px'; 
      el.style.color = '#cbd5e1'; 
      el.style.border = '1px solid #475569'; 
    }); 

    // Style strong and em
    element.querySelectorAll('strong').forEach(el => {
      el.style.fontWeight = 'bold'; 
      el.style.color = '#f3f4f6'; 
    }); 

    element.querySelectorAll('em').forEach(el => {
      el.style.fontStyle = 'italic'; 
      el.style.color = '#a7f3d0'; 
    }); 
  }; 

  return (
    <div className={`min-h-screen py-8 pt-24 md:py-12 md:pt-32 relative overflow-hidden ${
      userSubscription === 'pro' 
        ? 'bg-gradient-to-b from-slate-950 via-purple-950 to-slate-950' 
        : userSubscription === 'ultimate' 
        ? 'bg-gradient-to-b from-slate-950 via-orange-950 to-slate-950'
        : 'bg-gradient-to-b from-black via-slate-950 to-black'
    }`} style={{ fontFamily: "'Lato', sans-serif" }}>
      {/* Grid Background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div 
          className="absolute inset-0"
          style={{
            backgroundImage: `
              linear-gradient(to right, ${
                userSubscription === 'pro' 
                  ? 'rgba(168, 85, 247, 0.08)' 
                  : userSubscription === 'ultimate'
                  ? 'rgba(249, 115, 22, 0.08)'
                  : 'rgba(168, 85, 247, 0.08)'
              } 1px, transparent 1px),
              linear-gradient(to bottom, ${
                userSubscription === 'pro' 
                  ? 'rgba(168, 85, 247, 0.08)' 
                  : userSubscription === 'ultimate'
                  ? 'rgba(249, 115, 22, 0.08)'
                  : 'rgba(168, 85, 247, 0.08)'
              } 1px, transparent 1px)
            `,
            backgroundSize: '50px 50px'
          }}
        ></div>
      </div>

      {/* Gradient Orbs */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {userSubscription === 'pro' ? (
          <>
            <div className="absolute top-1/4 -left-32 w-48 md:w-64 lg:w-72 h-48 md:h-64 lg:h-72 bg-purple-900/5 rounded-full blur-3xl animate-pulse"></div>
            <div className="absolute bottom-1/4 -right-32 w-56 md:w-72 lg:w-80 h-56 md:h-72 lg:h-80 bg-purple-900/5 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1.5s' }}></div>
          </>
        ) : userSubscription === 'ultimate' ? (
          <>
            <div className="absolute top-1/4 -left-32 w-48 md:w-64 lg:w-72 h-48 md:h-64 lg:h-72 bg-orange-900/5 rounded-full blur-3xl animate-pulse"></div>
            <div className="absolute bottom-1/4 -right-32 w-56 md:w-72 lg:w-80 h-56 md:h-72 lg:h-80 bg-yellow-900/5 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1.5s' }}></div>
          </>
        ) : (
          <>
            <div className="absolute top-1/4 -left-32 w-48 md:w-64 lg:w-72 h-48 md:h-64 lg:h-72 bg-purple-900/5 rounded-full blur-3xl animate-pulse"></div>
            <div className="absolute bottom-1/4 -right-32 w-56 md:w-72 lg:w-80 h-56 md:h-72 lg:h-80 bg-magenta-900/5 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1.5s' }}></div>
          </>
        )}
      </div>

      <div className="relative max-w-6xl mx-auto px-3 sm:px-4 lg:px-6">
        <button
          onClick={() => onNavigate?.('dashboard')}
          className="mb-6 md:mb-8 text-slate-400 hover:text-purple-400 flex items-center gap-2 transition-all duration-300 group transform hover:scale-105 active:scale-95 animate-in fade-in slide-in-from-left-8 duration-1000 text-sm md:text-base"
        >
          <ChevronRight className="rotate-180 group-hover:-translate-x-1 transition-transform" size={18} />
          Back to Dashboard
        </button>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6 md:gap-8 auto-rows-max md:auto-rows-fr">
          {/* Left - Input Form */}
          <div ref={leftPanelRef} className="md:col-span-1 bg-gradient-to-br from-slate-900/40 to-slate-950/40 border border-purple-500/30 rounded-xl sm:rounded-2xl p-4 sm:p-6 md:p-8 backdrop-blur-sm shadow-2xl hover:shadow-purple-500/10 transition-all duration-300 animate-in fade-in slide-in-from-left-8 duration-1000 overflow-hidden md:overflow-visible h-fit md:h-full">
            <h1 className="text-lg sm:text-xl md:text-2xl font-bold text-white mb-4 sm:mb-6 hover:text-purple-300 transition-colors">
              Generate Notes
            </h1>

            <div className="space-y-3 sm:space-y-4 md:space-y-6">
              {/* Topic Input */}
              <div className="animate-in fade-in slide-in-from-top-4 duration-700 delay-150">
                <label className="block text-white font-semibold mb-2 text-xs sm:text-sm md:text-base">Topic</label>
                <input
                  type="text"
                  placeholder="e.g., Photosynthesis..."
                  value={topic}
                  onChange={(e) => setTopic(e.target.value)}
                  disabled={isGenerating}
                  className="w-full bg-slate-700/50 border border-purple-500/30 hover:border-purple-500/60 rounded-lg px-3 py-2 sm:px-3 sm:py-2 md:px-4 md:py-3 text-white placeholder-slate-400 focus:outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 transition-all duration-300 text-xs sm:text-sm md:text-base disabled:opacity-50 disabled:cursor-not-allowed"
                />
                <p className="text-xs text-slate-400 mt-1">
                  Enter any specific topic
                </p>
              </div>

              {/* Subject Input */}
              <div className="animate-in fade-in slide-in-from-top-4 duration-700 delay-160">
                <label className="block text-white font-semibold mb-2 text-xs sm:text-sm md:text-base">Subject</label>
                <input
                  type="text"
                  placeholder="e.g., Biology, Physics, History..."
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  disabled={isGenerating}
                  className="w-full bg-slate-700/50 border border-purple-500/30 hover:border-purple-500/60 rounded-lg px-3 py-2 sm:px-3 sm:py-2 md:px-4 md:py-3 text-white placeholder-slate-400 focus:outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 transition-all duration-300 text-xs sm:text-sm md:text-base disabled:opacity-50 disabled:cursor-not-allowed"
                />
                <p className="text-xs text-slate-400 mt-1">
                  Enter the subject area
                </p>
              </div>

              {/* Language Selection */}
              <div className="animate-in fade-in slide-in-from-top-4 duration-700 delay-200">
                <label className="block text-white font-semibold mb-2 text-xs sm:text-sm md:text-base">Language</label>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { key: 'english', label: 'English', bgColor: 'from-blue-600 to-cyan-600', hoverColor: 'hover:from-blue-700 hover:to-cyan-700', shadowColor: 'shadow-blue-500/50' },
                    { key: 'hinglish', label: 'Hinglish', bgColor: 'from-orange-600 to-yellow-600', hoverColor: 'hover:from-orange-700 hover:to-yellow-700', shadowColor: 'shadow-orange-500/50' },
                    { key: 'brocode', label: 'BroCode', bgColor: 'from-pink-600 to-rose-600', hoverColor: 'hover:from-pink-700 hover:to-rose-700', shadowColor: 'shadow-pink-500/50' }
                  ].map((item) => (
                    <button
                      key={item.key}
                      type="button"
                      onClick={() => setLanguage(item.key)}
                      disabled={isGenerating}
                      className={`py-2 md:py-3 px-1 md:px-2 rounded-lg font-medium transition-all transform hover:scale-105 active:scale-95 text-[7px] sm:text-[8px] md:text-xs disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center h-auto min-h-9 sm:min-h-10 md:min-h-11 leading-tight ${
                        language === item.key
                          ? `bg-gradient-to-r ${item.bgColor} ${item.hoverColor} text-white shadow-lg ${item.shadowColor}`
                          : 'bg-slate-700/50 text-slate-300 hover:bg-slate-700 border border-slate-600'
                      }`}
                    >
                      <span className="text-center whitespace-nowrap overflow-hidden text-ellipsis">{item.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Notes Type Selection */}
              <div className="animate-in fade-in slide-in-from-top-4 duration-700 delay-300">
                <label className="block text-white font-semibold mb-2 text-xs sm:text-sm md:text-base">Notes Format</label>
                <div className="grid grid-cols-2 gap-2">
                  {[
                    { key: 'short', label: 'Short Notes', bgColor: 'from-green-600 to-emerald-600', hoverColor: 'hover:from-green-700 hover:to-emerald-700', shadowColor: 'shadow-green-500/50' },
                    { key: 'detailed', label: 'Detailed Notes', bgColor: 'from-violet-600 to-purple-600', hoverColor: 'hover:from-violet-700 hover:to-purple-700', shadowColor: 'shadow-violet-500/50' }
                  ].map((item) => (
                    <button
                      key={item.key}
                      type="button"
                      onClick={() => setNotesType(item.key)}
                      disabled={isGenerating}
                      className={`py-2 md:py-3 px-1 md:px-2 rounded-lg font-medium transition-all transform hover:scale-105 active:scale-95 text-[7px] sm:text-[8px] md:text-xs disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center h-auto min-h-9 sm:min-h-10 md:min-h-11 leading-tight ${
                        notesType === item.key
                          ? `bg-gradient-to-r ${item.bgColor} ${item.hoverColor} text-white shadow-lg ${item.shadowColor}`
                          : 'bg-slate-700/50 text-slate-300 hover:bg-slate-700 border border-slate-600'
                      }`}
                    >
                      <span className="text-center whitespace-nowrap overflow-hidden text-ellipsis">{item.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Exam Type Selection */}
              <div className="animate-in fade-in slide-in-from-top-4 duration-700 delay-350">
                <label className="block text-white font-semibold mb-2 text-xs sm:text-sm md:text-base">Exam Type</label>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { key: 'cbse', label: '🏫 CBSE' },
                    { key: 'icse', label: '📚 ICSE' },
                    { key: 'state-board', label: '🎓 State Board' },
                    { key: 'jee', label: '🚀 JEE' },
                    { key: 'neet', label: '🔬 NEET' },
                    { key: 'upsc', label: '🏛️ UPSC' },
                    { key: 'gate', label: '⚙️ GATE' },
                    { key: 'college', label: '🎯 College' },
                    { key: 'competitive', label: '🏆 Other' },
                  ].map((item) => (
                    <button
                      key={item.key}
                      type="button"
                      onClick={() => setExamType(item.key)}
                      disabled={isGenerating}
                      className={`py-2 md:py-2 px-1 md:px-2 rounded-lg font-medium transition-all transform hover:scale-105 active:scale-95 text-[7px] sm:text-[8px] md:text-xs disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center h-auto min-h-8 sm:min-h-9 md:min-h-10 leading-tight whitespace-nowrap ${
                        examType === item.key
                          ? 'bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-white shadow-lg shadow-blue-500/50'
                          : 'bg-slate-700/50 text-slate-300 hover:bg-slate-700 border border-slate-600'
                      }`}
                    >
                      {item.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Custom Message */}
              <div className="animate-in fade-in slide-in-from-top-4 duration-700 delay-400">
                <label className="block text-white font-semibold mb-2 text-xs sm:text-sm md:text-base">Custom Message <span className="text-slate-400 font-normal">(Optional)</span></label>
                <textarea
                  placeholder="Add any specific instructions or context for your notes..."
                  value={customMessage}
                  onChange={(e) => setCustomMessage(e.target.value)}
                  disabled={isGenerating}
                  rows="3"
                  className="w-full bg-slate-700/50 border border-purple-500/30 hover:border-purple-500/60 rounded-lg px-3 py-2 sm:px-3 sm:py-2 md:px-4 md:py-3 text-white placeholder-slate-400 focus:outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 transition-all duration-300 text-xs sm:text-sm md:text-base disabled:opacity-50 disabled:cursor-not-allowed resize-none"
                />
                <p className="text-xs text-slate-400 mt-1">
                  e.g., "Include more examples" or "Focus on key concepts"
                </p>
              </div>

              {/* Generate Button */}
              <button
                type="button"
                onClick={autoGenerateNotes}
                disabled={!topic.trim() || isGenerating}
                className="w-full py-2 sm:py-3 md:py-4 mt-4 sm:mt-6 md:mt-8 bg-gradient-to-r from-purple-600 to-magenta-600 hover:from-purple-700 hover:to-magenta-700 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-lg font-semibold transition-all flex items-center justify-center gap-2 shadow-lg shadow-purple-500/50 transform hover:scale-105 active:scale-95 disabled:hover:scale-100 animate-in fade-in slide-in-from-top-4 duration-700 delay-600 text-xs sm:text-sm md:text-base"
              >
              {isGenerating ? (
                  <>
                    <Loader size={16} className="animate-spin" />
                    <span className="text-xs sm:text-sm md:text-base">Generating...</span>
                  </>
                ) : (
                  <>
                    <RefreshCw size={16} />
                    <span className="text-xs sm:text-sm md:text-base">Generate Notes</span>
                  </>
                )}
              </button>

              {/* Error Message */}
              {error && (
                <div className="p-2 sm:p-3 md:p-4 bg-red-500/20 border border-red-500/50 rounded-lg text-red-300 text-xs sm:text-sm animate-in fade-in">
                  {error}
                </div>
              )}

              {/* Status Indicator */}
              {isGenerating && (
                <div className="p-2 sm:p-3 md:p-4 bg-blue-500/20 border border-blue-500/50 rounded-lg text-blue-300 text-xs sm:text-sm animate-in fade-in flex items-center gap-2">
                  <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-blue-300"></div>
                  <span>Generating detailed notes...</span>
                </div>
              )}
            </div>
          </div>

          {/* Right - Notes Display */}
          <div className="md:col-span-2 bg-gradient-to-br from-slate-900/40 to-slate-950/40 border border-purple-500/30 rounded-xl sm:rounded-2xl p-4 sm:p-6 md:p-8 backdrop-blur-sm shadow-2xl hover:shadow-purple-500/10 transition-all duration-300 animate-in fade-in slide-in-from-right-8 duration-1000 overflow-hidden md:overflow-hidden flex flex-col h-fit md:h-full" style={{ height: leftPanelHeight }}>
            {notes ? (
              <div ref={notesDisplayRef} className="overflow-y-auto flex-1 custom-scrollbar pr-2">
                {/* Notes Header */}
                <div className="mb-4 sm:mb-6 md:mb-8">
                  <h2 className="text-xl sm:text-2xl md:text-3xl font-bold text-white mb-2">
                    {topic}
                  </h2>
                  <div className="flex flex-wrap gap-2">
                    <span className="px-2 sm:px-3 md:px-4 py-1 md:py-2 bg-blue-500/20 border border-blue-500/50 rounded-full text-blue-300 text-xs font-semibold capitalize">
                      {language === 'english' ? 'English' : language === 'hinglish' ? 'Hinglish' : '😎 BroCode (Hinglish)'}
                    </span>
                    <span className="px-2 sm:px-3 md:px-4 py-1 md:py-2 bg-purple-500/20 border border-purple-500/50 rounded-full text-purple-300 text-xs font-semibold capitalize">
                      {notesType === 'short' ? '📋 Short Notes' : '📖 Detailed Notes'}
                    </span>
                    <span className="px-2 sm:px-3 md:px-4 py-1 md:py-2 bg-blue-500/20 border border-blue-500/50 rounded-full text-blue-300 text-xs font-semibold">
                      📚 Study Material
                    </span>
                  </div>
                </div>

                {/* Summary Section */}
                {notes.summary && (
                  <div className="mb-8 sm:mb-10 md:mb-12 pb-6 sm:pb-8 border-b border-slate-700/50">
                    <h3 className="text-lg sm:text-xl md:text-2xl font-bold text-purple-300 mb-4 sm:mb-5">
                      📌 Summary
                    </h3>
                    <div className="text-slate-300 text-xs sm:text-sm md:text-base leading-relaxed prose prose-invert max-w-none">
                      <ReactMarkdown
                        remarkPlugins={[remarkGfm]}
                        components={{
                          p: ({node, ...props}) => <p className="mb-3 sm:mb-4 text-slate-200 leading-relaxed"><MathText>{props.children}</MathText></p>,
                          h1: ({node, ...props}) => <h1 className="text-xl sm:text-2xl font-bold mt-5 sm:mt-6 mb-3 sm:mb-4 text-purple-300 border-b border-purple-500/30 pb-2" {...props} />,
                          h2: ({node, ...props}) => {
                            const text = props.children?.[0]?.toString() || ''; 
                            const numberMatch = text.match(/^(\d+)\.\s+(.+)$/); 
                            if (numberMatch) {
                              return (
                                <h2 className="text-base sm:text-lg md:text-xl font-bold mt-4 sm:mt-5 mb-2 sm:mb-3 flex items-center gap-3">
                                  <span className="inline-flex items-center justify-center w-7 h-7 sm:w-8 sm:h-8 bg-gradient-to-br from-blue-500 to-blue-600 text-white text-xs sm:text-sm font-bold rounded-lg shadow-md">
                                    {numberMatch[1]}
                                  </span>
                                  <span className="text-blue-300 leading-tight">{numberMatch[2]}</span>
                                </h2>
                              ); 
                            }
                            return <h2 className="text-base sm:text-lg md:text-xl font-bold mt-4 sm:mt-5 mb-2 sm:mb-3 text-blue-300" {...props} />; 
                          },
                          h3: ({node, ...props}) => <h3 className="text-sm sm:text-base font-bold mt-3 mb-2 text-indigo-300" {...props} />,
                          h4: ({node, ...props}) => <h4 className="text-xs sm:text-sm font-bold mt-3 mb-2 text-indigo-200" {...props} />,
                          strong: ({node, ...props}) => <strong className="text-white font-bold" {...props} />,
                          em: ({node, ...props}) => <em className="text-slate-200 italic" {...props} />,
                          ul: ({node, ...props}) => <ul className="list-none mb-3 sm:mb-4 space-y-1 sm:space-y-2 ml-3 sm:ml-4" {...props} />,
                          ol: ({node, ...props}) => <ol className="list-none mb-3 sm:mb-4 space-y-1 sm:space-y-2 ml-3 sm:ml-4" {...props} />,
                          li: ({node, ...props}) => <li className="ml-3 sm:ml-4 pl-2 relative text-slate-200 before:content-['▪'] before:absolute before:left-0 before:text-purple-400 before:text-xs sm:before:text-sm"><MathText>{props.children}</MathText></li>,
                          pre: ({node, ...props}) => <pre className="bg-slate-800 p-3 rounded mb-3 text-orange-300 font-mono text-xs overflow-x-auto" {...props} />,
                          code: ({node, inline, ...props}) => 
                            inline ? (
                              <code className="bg-slate-800 px-2 py-1 rounded text-orange-300 font-mono text-xs" {...props} />
                            ) : (
                              <code className="text-orange-300 font-mono text-xs" {...props} />
                            ),
                          blockquote: ({node, ...props}) => <blockquote className="border-l-4 border-purple-500 pl-4 my-3 italic text-slate-400 bg-purple-500/10 py-2 pr-3 rounded-r" {...props} />,
                          a: ({node, ...props}) => <a className="text-blue-400 hover:text-blue-300 underline" {...props} />,
                          table: ({node, ...props}) => <div className="overflow-x-auto my-4"><table className="border-collapse w-full border border-slate-600 rounded" style={{tableLayout: 'fixed'}} {...props} /></div>,
                          thead: ({node, ...props}) => <thead className="bg-gradient-to-r from-slate-800 to-slate-700" {...props} />,
                          tbody: ({node, ...props}) => <tbody {...props} />,
                          tr: ({node, ...props}) => <tr className="border-b border-slate-600 hover:bg-slate-800/50 transition-colors" {...props} />,
                          th: ({node, ...props}) => <th className="border border-slate-600 px-4 py-4 text-left font-bold text-purple-300 text-xs sm:text-sm break-words max-w-xs" {...props} />,
                          td: ({node, ...props}) => <td className="border border-slate-600 px-4 py-4 text-slate-200 text-xs sm:text-sm break-words max-w-xs align-top"><MathText>{props.children}</MathText></td>,
                          img: ({node, ...props}) => (
                            <img 
                              className="w-full max-w-4xl mx-auto h-auto rounded-lg my-4 border border-slate-600 object-contain max-h-96 bg-slate-800/50" 
                              loading="lazy"
                              alt="Generated content"
                              onError={(e) => {
                                // console.warn('Image failed to load:', e.target.src); 
                                e.target.style.display = 'none'; 
                              }}
                              {...props} 
                            />
                          ),
                        }}
                      >
                        {notes.summary}
                      </ReactMarkdown>
                    </div>
                  </div>
                )}

                {/* Content Section */}
                {notes.content && (
                  <div className="mb-6 sm:mb-8 md:mb-10">
                    <h3 className="text-lg sm:text-xl md:text-2xl font-bold text-purple-300 mb-4 sm:mb-5">
                      📖 Detailed Notes
                    </h3>
                    <div className="text-slate-300 text-xs sm:text-sm md:text-base leading-relaxed prose prose-invert max-w-none">
                      <ReactMarkdown
                        remarkPlugins={[remarkGfm]}
                        components={{
                          p: ({node, ...props}) => {
                            return <p className="mb-3 sm:mb-4 text-slate-200 leading-relaxed"><MathText>{props.children}</MathText></p>; 
                          },
                          h1: ({node, ...props}) => <h1 className="text-2xl sm:text-3xl font-bold mt-6 sm:mt-7 mb-3 sm:mb-4 text-purple-300 border-b border-purple-500/30 pb-2" {...props} />,
                          h2: ({node, ...props}) => {
                            const text = props.children?.[0]?.toString() || ''; 
                            const numberMatch = text.match(/^(\d+)\.\s+(.+)$/); 
                            if (numberMatch) {
                              return (
                                <h2 className="text-lg sm:text-xl md:text-2xl font-bold mt-5 sm:mt-6 mb-3 sm:mb-4 flex items-center gap-3">
                                  <span className="inline-flex items-center justify-center w-8 h-8 sm:w-9 sm:h-9 bg-gradient-to-br from-blue-500 to-blue-600 text-white text-sm sm:text-base font-bold rounded-lg shadow-md flex-shrink-0">
                                    {numberMatch[1]}
                                  </span>
                                  <span className="text-blue-300 leading-tight">{numberMatch[2]}</span>
                                </h2>
                              ); 
                            }
                            return <h2 className="text-lg sm:text-xl md:text-2xl font-bold mt-5 sm:mt-6 mb-3 text-blue-300" {...props} />; 
                          },
                          h3: ({node, ...props}) => <h3 className="text-base sm:text-lg font-bold mt-4 sm:mt-5 mb-2 text-indigo-300" {...props} />,
                          h4: ({node, ...props}) => <h4 className="text-sm sm:text-base font-bold mt-3 sm:mt-4 mb-2 text-indigo-200" {...props} />,
                          h5: ({node, ...props}) => <h5 className="text-xs sm:text-sm font-semibold mt-3 mb-2 text-slate-100" {...props} />,
                          h6: ({node, ...props}) => <h6 className="text-xs font-semibold mt-2 mb-1 text-slate-200 uppercase tracking-wider" {...props} />,
                          strong: ({node, ...props}) => <strong className="text-white font-bold" {...props} />,
                          em: ({node, ...props}) => <em className="text-slate-200 italic" {...props} />,
                          ul: ({node, ...props}) => <ul className="list-none mb-3 sm:mb-4 space-y-1 sm:space-y-2 ml-3 sm:ml-4" {...props} />,
                          ol: ({node, ...props}) => <ol className="list-none mb-3 sm:mb-4 space-y-1 sm:space-y-2 ml-3 sm:ml-4" {...props} />,
                          li: ({node, ...props}) => <li className="ml-3 sm:ml-4 pl-2 relative text-slate-200 before:content-['▪'] before:absolute before:left-0 before:text-purple-400 before:text-xs sm:before:text-sm"><MathText>{props.children}</MathText></li>,
                          pre: ({node, ...props}) => <pre className="bg-slate-800 p-3 rounded mb-3 text-orange-300 font-mono text-xs overflow-x-auto" {...props} />,
                          code: ({node, inline, ...props}) => 
                            inline ? (
                              <code className="bg-slate-800 px-2 py-1 rounded text-orange-300 font-mono text-xs" {...props} />
                            ) : (
                              <code className="text-orange-300 font-mono text-xs" {...props} />
                            ),
                          blockquote: ({node, ...props}) => <blockquote className="border-l-4 border-purple-500 pl-4 my-3 italic text-slate-400 bg-purple-500/10 py-2 pr-3 rounded-r" {...props} />,
                          a: ({node, ...props}) => <a className="text-blue-400 hover:text-blue-300 underline" {...props} />,
                          table: ({node, ...props}) => <div className="overflow-x-auto my-4"><table className="border-collapse w-full border border-slate-600 rounded" style={{tableLayout: 'fixed'}} {...props} /></div>,
                          thead: ({node, ...props}) => <thead className="bg-gradient-to-r from-slate-800 to-slate-700" {...props} />,
                          tbody: ({node, ...props}) => <tbody {...props} />,
                          tr: ({node, ...props}) => <tr className="border-b border-slate-600 hover:bg-slate-800/50 transition-colors" {...props} />,
                          th: ({node, ...props}) => <th className="border border-slate-600 px-4 py-4 text-left font-bold text-purple-300 text-xs sm:text-sm break-words max-w-xs" {...props} />,
                          td: ({node, ...props}) => {
                            return <td className="border border-slate-600 px-4 py-4 text-slate-200 text-xs sm:text-sm break-words max-w-xs align-top"><MathText>{props.children}</MathText></td>; 
                          },
                          img: ({node, ...props}) => (
                            <img 
                              className="w-full max-w-4xl mx-auto h-auto rounded-lg my-4 border border-slate-600 object-contain max-h-96 bg-slate-800/50" 
                              loading="lazy"
                              alt="Generated content"
                              onError={(e) => {
                                // console.warn('Image failed to load:', e.target.src); 
                                e.target.style.display = 'none'; 
                              }}
                              {...props} 
                            />
                          ),
                        }}
                      >
                        {notes.content}
                      </ReactMarkdown>
                    </div>
                  </div>
                )}

                {/* Download Limit Warning */}
                {showDownloadLimitWarning && notesDownloadLimitInfo && userSubscription === 'free' && (
                  <div className="mb-6 p-4 bg-yellow-500/20 border-2 border-yellow-500/50 rounded-lg">
                    <div className="flex items-start gap-3">
                      <span className="text-2xl mt-1">⚠️</span>
                      <div className="flex-1">
                        <h3 className="text-yellow-200 font-bold mb-2">Download Limit Reached</h3>
                        <p className="text-yellow-100 text-sm mb-3">
                          You have used <span className="font-bold">{notesDownloadLimitInfo.usedDownloads || notesDownloadLimitInfo.maxDownloads}/{notesDownloadLimitInfo.maxDownloads}</span> free downloads this month. Your limit will reset on <span className="font-bold">{new Date(notesDownloadLimitInfo.resetDate).toLocaleDateString()}</span>.
                        </p>
                        <button
                          onClick={() => onNavigate?.('pricing')}
                          className="px-4 py-2 bg-gradient-to-r from-purple-600 to-magenta-600 hover:from-purple-700 hover:to-magenta-700 text-white rounded-lg text-sm font-semibold transition-all hover:shadow-lg"
                        >
                          Upgrade to Pro → Unlimited Downloads
                        </button>
                      </div>
                    </div>
                  </div>
                )}

                {/* Download Remaining Info */}
                {notesDownloadLimitInfo && userSubscription === 'free' && !notesDownloadLimitInfo.limitExceeded && (
                  <div className="mb-6 p-3 bg-blue-500/20 border border-blue-500/50 rounded-lg text-blue-300 text-sm flex items-center gap-2">
                    <span>ℹ️</span>
                    <span>Free plan: <span className="font-bold">{notesDownloadLimitInfo.remainingDownloads}/10</span> notes downloads remaining this month</span>
                  </div>
                )}

                {/* Pro/Ultimate Download Message */}
                {notesDownloadLimitInfo && (userSubscription === 'pro' || userSubscription === 'ultimate') && (
                  <div className="mb-6 p-3 bg-emerald-500/20 border border-emerald-500/50 rounded-lg text-emerald-300 text-sm flex items-center gap-2">
                    <span>✨</span>
                    <span>Your <span className="font-bold capitalize">{userSubscription}</span> plan includes <span className="font-bold">Unlimited Downloads</span> every month!</span>
                  </div>
                )}

                {/* Action Buttons */}
                <div className="flex flex-col sm:flex-row flex-wrap gap-2 sm:gap-3 md:gap-4 mt-6 sm:mt-8 pt-4 sm:pt-6 md:pt-8 border-t border-slate-700">
                  <button
                    onClick={downloadNotes}
                    className="w-full flex items-center justify-center gap-2 px-3 sm:px-4 md:px-6 py-2 md:py-3 bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-white rounded-lg font-semibold transition-all transform hover:scale-105 active:scale-95 text-xs sm:text-sm md:text-base shadow-lg shadow-blue-500/30"
                  >
                    <Download size={14} className="sm:w-4 md:w-4" />
                    <span className="hidden sm:inline">Download</span>
                  </button>
                </div>
              </div>
            ) : (
              <div className="bg-gradient-to-br from-slate-900/40 to-slate-950/40 border border-purple-500/30 rounded-xl sm:rounded-2xl p-4 sm:p-6 md:p-8 backdrop-blur-sm shadow-2xl transition-all duration-300 animate-in fade-in slide-in-from-right-8 duration-1000 overflow-hidden min-h-[300px] sm:min-h-[400px] flex flex-col items-center justify-center text-center">
                <div className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl mb-3 sm:mb-4">📚</div>
                <h3 className="text-lg sm:text-xl md:text-2xl font-bold text-white mb-2">
                  No Notes Generated Yet
                </h3>
                <p className="text-slate-400 text-xs sm:text-sm md:text-base mb-4 sm:mb-6 px-2">
                  Enter a topic and click "Generate Notes" to get started with detailed study materials.
                </p>
                <div className="flex flex-col gap-1.5 sm:gap-2 text-left text-slate-400 text-xs sm:text-sm px-4">
                  <p>✓ Detailed explanations</p>
                  <p>✓ Structured material</p>
                  <p>✓ Save and download</p>
                  <p>✓ Share with others</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  ); 
}