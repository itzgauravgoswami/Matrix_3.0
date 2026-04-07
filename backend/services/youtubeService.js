const fetch = require('node-fetch'); 

/**
 * YouTube Service
 * Handles searching and fetching YouTube video links
 */

const YOUTUBE_API_KEY = process.env.YOUTUBE_API_KEY; 

/**
 * Check if text contains Hindi script
 */
const containsHindiScript = (text) => {
  if (!text) return false; 
  const hindiScriptRegex = /[\u0900-\u097F]/g; 
  return hindiScriptRegex.test(text); 
}; 

/**
 * Search for YouTube video based on topic and subject
 * Returns the first video ID that matches the search query and allows embedding
 */
exports.searchVideo = async (topic, subject, language = 'english') => {
  try {
    // If API key is not available, return null
    if (!YOUTUBE_API_KEY) {
      console.warn('YouTube API key not found'); 
      return null; 
    }

    console.log(`\n=== SEARCHING FOR VIDEO IN ${language.toUpperCase()} ===`); 

    // Map language to YouTube API parameters
    const languageConfig = {
      'english': {
        langCode: 'en',
        regionCode: 'US',
        searchSuffix: '',
      },
      'hindi': {
        langCode: 'hi',
        regionCode: 'IN',
        searchSuffix: 'हिंदी में',  // "in Hindi"
      },
    }; 

    const config = languageConfig[language] || languageConfig['english']; 
    
    // Build search query
    const searchQuery = config.searchSuffix 
      ? `${topic} ${subject} tutorial ${config.searchSuffix}`
      : `${topic} ${subject} tutorial`; 
    
    console.log(`Search query: "${searchQuery}"`); 
    console.log(`Language config: lang=${config.langCode}, region=${config.regionCode}`); 

    // YouTube API search with language and region parameters
    const searchUrl = `https://www.googleapis.com/youtube/v3/search?q=${encodeURIComponent(searchQuery)}&part=snippet&type=video&maxResults=20&key=${YOUTUBE_API_KEY}&order=relevance&relevanceLanguage=${config.langCode}&regionCode=${config.regionCode}&hl=${config.langCode}`; 
    
    console.log('Making YouTube API request...'); 

    const searchResponse = await fetch(searchUrl, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    }); 

    console.log('YouTube API response status:', searchResponse.status); 

    if (!searchResponse.ok) {
      const errorText = await searchResponse.text(); 
      console.error(`YouTube API error: ${searchResponse.status} ${searchResponse.statusText}`); 
      console.error('Error response:', errorText); 
      return null; 
    }

    const searchData = await searchResponse.json(); 
    console.log(`Found ${searchData.items?.length || 0} video results`); 
    
    if (!searchData.items || searchData.items.length === 0) {
      console.warn('No YouTube videos found for query:', searchQuery); 
      return null; 
    }

    // Try each video to find one with embedding enabled
    for (let i = 0;  i < searchData.items.length;  i++) {
      const item = searchData.items[i]; 
      const videoId = item.id?.videoId; 
      const title = item.snippet?.title || ''; 
      const description = item.snippet?.description || ''; 
      
      if (!videoId) continue; 

      console.log(`\n[${i + 1}/${searchData.items.length}] Checking video: ${videoId}`); 
      console.log(`    Title: ${title.substring(0, 80)}`); 

      const titleHasHindi = containsHindiScript(title); 
      const descHasHindi = containsHindiScript(description); 
      console.log(`    Has Hindi script - Title: ${titleHasHindi}, Desc: ${descHasHindi}`); 

      // Language-specific filtering
      if (language === 'hindi') {
        // For Hindi: prefer videos with Hindi script, but don't skip if none found
        if (!titleHasHindi && !descHasHindi) {
          console.log('    ⚠️  No Hindi script, but continuing (API search should handle this)'); 
        } else {
          console.log('    ✓ Has Hindi content'); 
        }
      } else {
        // For English: only skip if CLEARLY Hindi-only (has Hindi script AND no English indicators)
        if (titleHasHindi && !title.toLowerCase().includes('english') && !title.toLowerCase().includes('tutorial')) {
          console.log('    ❌ Skipping: Appears to be Hindi-only video'); 
          continue; 
        }
        if (titleHasHindi) {
          console.log('    ⚠️  Has Hindi script but also has English indicators, continuing'); 
        } else {
          console.log('    ✓ Appears to be English content'); 
        }
      }

      try {
        // Get video details to check if embedding is allowed
        const videoDetailsUrl = `https://www.googleapis.com/youtube/v3/videos?id=${videoId}&part=status,snippet&key=${YOUTUBE_API_KEY}`; 
        
        const detailsResponse = await fetch(videoDetailsUrl, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
        }); 

        if (detailsResponse.ok) {
          const detailsData = await detailsResponse.json(); 
          
          if (detailsData.items && detailsData.items.length > 0) {
            const videoDetails = detailsData.items[0]; 
            const status = videoDetails.status || {}; 
            
            // Check if embedding is allowed
            if (status.embeddable !== false) {
              console.log(`✅ SELECTED: Found embeddable ${language} video!`); 
              console.log(`   Video ID: ${videoId}`); 
              console.log(`   Title: ${videoDetails.snippet?.title}`); 
              return videoId; 
            } else {
              console.log('    ❌ Skipping: Non-embeddable'); 
            }
          }
        }
      } catch (detailError) {
        console.warn('Error checking video details for:', videoId, detailError.message); 
        console.log('    ⚠️  Trying video despite error'); 
        return videoId; 
      }
    }

    console.log(`\n⚠️  No suitable ${language} video found in 20 results`); 
    console.log('Trying with simpler search query as fallback...'); 
    
    // Fallback: Try simpler search without language suffix
    try {
      const simpleSearchQuery = `${topic} ${subject} tutorial`; 
      const fallbackUrl = `https://www.googleapis.com/youtube/v3/search?q=${encodeURIComponent(simpleSearchQuery)}&part=snippet&type=video&maxResults=10&key=${YOUTUBE_API_KEY}&order=viewCount`; 
      
      const fallbackResponse = await fetch(fallbackUrl, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      }); 

      if (fallbackResponse.ok) {
        const fallbackData = await fallbackResponse.json(); 
        
        if (fallbackData.items && fallbackData.items.length > 0) {
          for (const item of fallbackData.items) {
            const videoId = item.id?.videoId; 
            if (!videoId) continue; 
            
            try {
              const videoDetailsUrl = `https://www.googleapis.com/youtube/v3/videos?id=${videoId}&part=status&key=${YOUTUBE_API_KEY}`; 
              const detailsResponse = await fetch(videoDetailsUrl, {
                method: 'GET',
                headers: { 'Content-Type': 'application/json' },
              }); 

              if (detailsResponse.ok) {
                const detailsData = await detailsResponse.json(); 
                if (detailsData.items?.[0]?.status?.embeddable !== false) {
                  console.log(`✅ FALLBACK: Using video: ${videoId}`); 
                  return videoId; 
                }
              }
            } catch (e) {
              console.warn('Fallback error:', e.message); 
            }
          }
        }
      }
    } catch (fallbackError) {
      console.warn('Fallback search failed:', fallbackError.message); 
    }
    
    return null; 

  } catch (error) {
    console.error('❌ Error searching YouTube video:', error.message); 
    console.error('Error stack:', error.stack); 
    return null; 
  }
}; 

/**
 * Extract video ID from YouTube URL
 */
exports.extractVideoId = (url) => {
  if (!url) return null; 
  
  const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#\&\?]*).*/; 
  const match = url.match(regExp); 
  
  return match && match[2].length === 11 ? match[2] : null; 
}; 

/**
 * Generate embed URL from video ID
 */
exports.getEmbedUrl = (videoId) => {
  if (!videoId) return null; 
  return `https://www.youtube.com/embed/${videoId}`; 
}; 
