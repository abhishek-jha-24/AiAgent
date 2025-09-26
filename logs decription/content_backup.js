// LeetCode Problem Extractor Content Script

/**
 * Extracts the problem title from the LeetCode problem page
 * @returns {string} The problem title
 */
function getProblemTitle() {
    try {
        // Look for the title in the text-title class
        const titleElement = document.querySelector('.text-title');
        if (titleElement) {
            return titleElement.textContent.trim();
        }
        
        // Alternative selector for the title
        const titleElement2 = document.querySelector('.text-title-large');
        if (titleElement2) {
            return titleElement2.textContent.trim();
        }
        
        // Look for title in the problem header
        const headerTitle = document.querySelector('h1, .problem-title, [data-testid="problem-title"]');
        if (headerTitle) {
            return headerTitle.textContent.trim();
        }
        
        // Look for title in the page title or any element containing the problem number and name
        const titlePattern = /(\d+\.\s+[^-\n]+)/;
        const pageTitle = document.title;
        const match = pageTitle.match(titlePattern);
        if (match) {
            return match[1].trim();
        }
        
        console.warn('Problem title not found');
        return '';
    } catch (error) {
        console.error('Error extracting problem title:', error);
        return '';
    }
}

/**
 * Extracts the problem statement/description from the LeetCode problem page
 * @returns {string} The problem description as plain text
 */
function getProblemStatement() {
    try {
        // Look for the main content in the question-content class
        const contentElement = document.querySelector('.content__u3I1.question-content__JfgR');
        if (contentElement) {
            return contentElement.textContent.trim();
        }
        
        // Alternative selectors for the problem content
        const contentElement2 = document.querySelector('.question-content__JfgR');
        if (contentElement2) {
            return contentElement2.textContent.trim();
        }
        
        // Look for content in description panel
        const descriptionPanel = document.querySelector('[data-track-load="description_content"]');
        if (descriptionPanel) {
            return descriptionPanel.textContent.trim();
        }
        
        // Look for content in the main problem description area
        const mainContent = document.querySelector('.elfjS, .problem-description, .question-content');
        if (mainContent) {
            return mainContent.textContent.trim();
        }
        
        // Look for content in the problem description area (for standard problem pages)
        const problemDescription = document.querySelector('.description__24sM, .content__u3I1, .question-content');
        if (problemDescription) {
            return problemDescription.textContent.trim();
        }
        
        // Look for content in the main problem area
        const mainProblemArea = document.querySelector('[data-track-load="problem_description"]');
        if (mainProblemArea) {
            return mainProblemArea.textContent.trim();
        }
        
        // Look for any div containing the problem text
        const contentDivs = document.querySelectorAll('div');
        for (const div of contentDivs) {
            const text = div.textContent;
            if (text && (text.includes('You are given') || text.includes('Given') || text.includes('Example')) && text.length > 100) {
                return text.trim();
            }
        }
        
        console.warn('Problem statement not found');
        return '';
    } catch (error) {
        console.error('Error extracting problem statement:', error);
        return '';
    }
}

/**
 * Injects the problem title and description into the LeetCode code editor
 * @param {string} title - The problem title
 * @param {string} description - The problem description
 */
async function injectIntoCodeEditor(title, description) {
    try {
        console.log('=== Injecting into LeetCode Code Editor ===');
        console.log('Title:', title);
        console.log('Description length:', description ? description.length : 0);
        
        // First, let's try multiple approaches to find the target element
        let targetDiv = document.querySelector('div[data-mprt="3"].overflow-guard');
        
        if (!targetDiv) {
            console.log('Target div not found with exact selector, trying alternatives...');
            
            // Try alternative selectors
            const alternatives = [
                'div[data-mprt="3"]',
                '.overflow-guard',
                'div.overflow-guard',
                '[data-mprt="3"]'
            ];
            
            for (const selector of alternatives) {
                targetDiv = document.querySelector(selector);
                if (targetDiv) {
                    console.log('Found target div with selector:', selector);
                    break;
                }
            }
        }
        
        if (!targetDiv) {
            console.error('Could not find target div with any selector');
            console.log('Available divs with data-mprt:', document.querySelectorAll('[data-mprt]'));
            console.log('Available divs with overflow-guard class:', document.querySelectorAll('.overflow-guard'));
            return false;
        }
        
        console.log('Found target div:', targetDiv);
        console.log('Target div innerHTML length:', targetDiv.innerHTML.length);
        
        // Look for existing textarea or code editor within the div
        let codeEditor = targetDiv.querySelector('textarea') || 
                        targetDiv.querySelector('.monaco-editor textarea') ||
                        targetDiv.querySelector('.CodeMirror textarea') ||
                        targetDiv.querySelector('textarea[data-gramm="false"]') ||
                        targetDiv.querySelector('textarea[data-enable-grammarly="false"]');
        
        // If no textarea found, look for any textarea in the div
        if (!codeEditor) {
            const textareas = targetDiv.querySelectorAll('textarea');
            console.log('Found textareas in target div:', textareas.length);
            for (const textarea of textareas) {
                console.log('Textarea dimensions:', textarea.offsetWidth, 'x', textarea.offsetHeight);
                if (textarea.offsetHeight > 50 && textarea.offsetWidth > 100) {
                    codeEditor = textarea;
                    break;
                }
            }
        }
        
        // If still no code editor found, try to find any textarea on the page
        if (!codeEditor) {
            console.log('No code editor found in target div, searching entire page...');
            const allTextareas = document.querySelectorAll('textarea');
            console.log('Total textareas on page:', allTextareas.length);
            
            for (const textarea of allTextareas) {
                console.log('Textarea dimensions:', textarea.offsetWidth, 'x', textarea.offsetHeight);
                if (textarea.offsetHeight > 100 && textarea.offsetWidth > 200) {
                    codeEditor = textarea;
                    console.log('Found large textarea on page:', textarea);
                    break;
                }
            }
        }
        
        if (!codeEditor) {
            console.warn('No code editor found anywhere, trying to work with existing content');
            
            // Check if content already has our comment block
            if (targetDiv.textContent.includes('/*') && targetDiv.textContent.includes(title)) {
                console.log('Content already has the problem description');
                return true;
            }
            
            // Store description for later use
            window.leetcodeProblemDescription = description;
            console.log('Description stored for later use:', description.length, 'characters');
            
            // Get recorded voice text
            const voiceInput = getRecordedText();
            console.log('Using recorded voice text:', voiceInput);
            
            // Detect the programming language from LeetCode editor
            const selectedLanguage = detectProgrammingLanguage();
            console.log('Detected programming language:', selectedLanguage);
            
            // Generate AI solution based on voice notes and problem description
            let aiGeneratedCode = '';
            if (voiceInput && voiceInput.trim() !== '') {
                try {
                    console.log('Generating AI solution based on voice notes...');
                    aiGeneratedCode = await generateAISolution(title, description, voiceInput, selectedLanguage);
                    console.log('AI Generated Code:', aiGeneratedCode);
                } catch (error) {
                    console.error('Error generating AI solution:', error);
                    aiGeneratedCode = '// AI solution generation failed: ' + error.message;
                }
            }
            
            // Replace all existing content with the AI-generated solution
            let newContent = '';
            
            if (aiGeneratedCode && aiGeneratedCode.trim() !== '') {
                // Use only the AI-generated code, no comments
                newContent = aiGeneratedCode;
            } else {
                // Fallback to comment block if no AI code
                const commentBlock = `/*
 * ${title}
 * 
 * Voice Notes: ${voiceInput}
 * 
 * AI Generated Solution:
${aiGeneratedCode ? aiGeneratedCode.split('\n').map(line => ' * ' + line).join('\n') : ' * No solution generated'}
 */

`;
                newContent = commentBlock;
            }
            
            // Replace all existing content with the new solution
            targetDiv.innerHTML = `<pre style="white-space: pre-wrap; font-family: monospace; margin: 0; padding: 0; background: #f8f9fa; border: 1px solid #e9ecef; border-radius: 4px;">${newContent}</pre>`;
            
            console.log('Successfully replaced div content with AI solution');
            return true;
        }
        
        console.log('Found code editor:', codeEditor);
        
        // Store description for later use
        window.leetcodeProblemDescription = description;
        console.log('Description stored for later use:', description.length, 'characters');
        
        // Get recorded voice text
        const voiceInput = getRecordedText();
        
        // Detect the programming language from LeetCode editor
        const selectedLanguage = detectProgrammingLanguage();
        console.log('Detected programming language:', selectedLanguage);
        
        // Generate AI solution based on voice notes and problem description
        let aiGeneratedCode = '';
        if (voiceInput && voiceInput.trim() !== '') {
            try {
                aiGeneratedCode = await generateAISolution(title, description, voiceInput, selectedLanguage);
            } catch (error) {
                console.error('Error generating AI solution:', error);
                aiGeneratedCode = '// AI solution generation failed: ' + error.message;
            }
        }
        
        // Create a comment block with title, voice input, and AI solution
        const commentBlock = `/*
 * ${title}
 * 
 * Voice Notes: ${voiceInput}
 * 
 * AI Generated Solution:
${aiGeneratedCode ? aiGeneratedCode.split('\n').map(line => ' * ' + line).join('\n') : ' * No solution generated'}
 */

`;
        
        // Get current content
        const currentContent = codeEditor.value || '';
        console.log('Current editor content length:', currentContent.length);
        
        // Replace all existing content with the AI-generated solution
        let newContent = '';
        
        if (aiGeneratedCode && aiGeneratedCode.trim() !== '') {
            // Use only the AI-generated code, no comments
            newContent = aiGeneratedCode;
        } else {
            // Fallback to comment block if no AI code
            newContent = commentBlock;
        }
        
        // Set the new content
        codeEditor.value = newContent;
        
        // Log only the generated AI solution
        if (aiGeneratedCode) {
            console.log('=== Replacing LeetCode Editor with AI Solution ===');
            console.log(aiGeneratedCode);
        }
        
        // Trigger input events to notify the editor of the change
        const events = ['input', 'change', 'keyup', 'paste', 'blur', 'focus'];
        events.forEach(eventType => {
            const event = new Event(eventType, { bubbles: true, cancelable: true });
            codeEditor.dispatchEvent(event);
        });
        
        // Also try to trigger change event on the parent elements
        let parent = codeEditor.parentElement;
        while (parent && parent !== document.body) {
            const changeEvent = new Event('change', { bubbles: true, cancelable: true });
            parent.dispatchEvent(changeEvent);
            parent = parent.parentElement;
        }
        
        // Focus the editor
        codeEditor.focus();
        
        console.log('Successfully replaced LeetCode editor content with AI solution');
        return true;
        
    } catch (error) {
        console.error('Error injecting into code editor:', error);
        return false;
    }
}

// Main execution function (called by popup)
function extractProblemData() {
    console.log('=== LeetCode Problem Extractor (Triggered by Popup) ===');
    
    const title = getProblemTitle();
    const statement = getProblemStatement();
    
    console.log('Problem Title:', title);
    console.log('Problem Statement:', statement);
    
    const result = {
        title: title,
        statement: statement,
        timestamp: new Date().toISOString(),
        url: window.location.href
    };
    
    console.log('Extracted Data:', result);
    
    // Store in window object for external access
    window.leetcodeExtractedData = result;
    
    return result;
}

// Function to extract and inject into code editor
function extractAndInject() {
    console.log('=== Extract and Inject into Code Editor ===');
    
    const title = getProblemTitle();
    const statement = getProblemStatement();
    
    if (!title || !statement) {
        console.error('Could not extract problem data');
        return false;
    }
    
    console.log('Extracted title:', title);
    console.log('Extracted statement length:', statement.length);
    
    // Try injection with retry mechanism
    let attempts = 0;
    const maxAttempts = 5;
    const retryDelay = 1000; // 1 second
    
    async function tryInjection() {
        attempts++;
        console.log(`Injection attempt ${attempts}/${maxAttempts}`);
        
        try {
            const success = await injectIntoCodeEditor(title, statement);
            
            if (success) {
                console.log('Successfully injected problem data into code editor');
                return true;
            } else if (attempts < maxAttempts) {
                console.log(`Injection failed, retrying in ${retryDelay}ms...`);
                setTimeout(tryInjection, retryDelay);
            } else {
                console.error('Failed to inject problem data into code editor after all attempts');
                return false;
            }
        } catch (error) {
            console.error('Error during injection attempt:', error);
            if (attempts < maxAttempts) {
                console.log(`Injection failed with error, retrying in ${retryDelay}ms...`);
                setTimeout(tryInjection, retryDelay);
            } else {
                console.error('Failed to inject problem data into code editor after all attempts');
                return false;
            }
        }
    }
    
    // Start the retry process
    setTimeout(tryInjection, 500); // Initial delay
    
    return true;
}

// Listen for messages from popup
chrome.runtime.onMessage.addListener(async (request, sender, sendResponse) => {
    console.log('Content script received message:', request);
    
    if (request.action === 'extractProblemData') {
        try {
            console.log('Extracting problem data...');
            const data = extractProblemData();
            console.log('Extraction successful:', data);
            sendResponse({ success: true, data: data });
        } catch (error) {
            console.error('Error in content script:', error);
            sendResponse({ success: false, error: error.message });
        }
        return true; // Keep message channel open for async response
    }
    
    if (request.action === 'injectIntoEditor') {
        try {
            console.log('Injecting into code editor...');
            const success = extractAndInject();
            sendResponse({ success: success });
        } catch (error) {
            console.error('Error injecting into editor:', error);
            sendResponse({ success: false, error: error.message });
        }
        return true; // Keep message channel open for async response
    }
    
    if (request.action === 'getStoredDescription') {
        try {
            console.log('Retrieving stored description...');
            const description = getStoredDescription();
            sendResponse({ success: true, description: description });
        } catch (error) {
            console.error('Error retrieving stored description:', error);
            sendResponse({ success: false, error: error.message });
        }
        return true; // Keep message channel open for async response
    }
    
    if (request.action === 'startVoiceRecording') {
        try {
            console.log('Starting voice recording...');
            const result = await startVoiceRecording();
            sendResponse({ success: true, message: 'Voice recording started' });
        } catch (error) {
            console.error('Error starting voice recording:', error);
            sendResponse({ success: false, error: error.message });
        }
        return true; // Keep message channel open for async response
    }
    
    if (request.action === 'stopVoiceRecording') {
        try {
            console.log('Stopping voice recording...');
            const recordedText = stopVoiceRecording();
            sendResponse({ success: true, recordedText: recordedText, message: 'Voice recording stopped' });
        } catch (error) {
            console.error('Error stopping voice recording:', error);
            sendResponse({ success: false, error: error.message });
        }
        return true; // Keep message channel open for async response
    }
    
    if (request.action === 'getRecordedText') {
        try {
            console.log('Getting recorded text...');
            const recordedText = getRecordedText();
            sendResponse({ success: true, recordedText: recordedText });
        } catch (error) {
            console.error('Error getting recorded text:', error);
            sendResponse({ success: false, error: error.message });
        }
        return true; // Keep message channel open for async response
    }
});

// Signal that content script is ready
console.log('LeetCode Problem Extractor content script loaded and ready');

// Global variables for voice recording
let currentRecognition = null;
let isRecording = false;
let recordedText = '';

/**
 * Starts voice recording
 */
function startVoiceRecording() {
    return new Promise((resolve, reject) => {
        console.log('Starting voice recording...');
        
        // Check if speech recognition is supported
        if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
            console.error('Speech recognition not supported in this browser');
            reject(new Error('Speech recognition not supported in this browser. Please use Chrome or Edge.'));
            return;
        }
        
        if (isRecording) {
            console.log('Already recording, stopping current recording first');
            stopVoiceRecording();
        }
        
        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
        currentRecognition = new SpeechRecognition();
        
        // Configure recognition for continuous recording
        currentRecognition.continuous = true;
        currentRecognition.interimResults = true;
        currentRecognition.lang = 'en-US';
        currentRecognition.maxAlternatives = 1;
        
        recordedText = '';
        isRecording = true;
        
        currentRecognition.onstart = () => {
            console.log('Voice recording started');
            showRecordingIndicator();
            resolve(true);
        };
        
        currentRecognition.onresult = (event) => {
            let interimTranscript = '';
            
            for (let i = event.resultIndex; i < event.results.length; i++) {
                const transcript = event.results[i][0].transcript;
                if (event.results[i].isFinal) {
                    recordedText += transcript + ' ';
                    console.log('Final transcript added:', transcript);
                    console.log('Total recorded text so far:', recordedText);
                } else {
                    interimTranscript += transcript;
                }
            }
            
            // Update the indicator with current text
            updateRecordingIndicator(recordedText + interimTranscript);
        };
        
        currentRecognition.onerror = (event) => {
            console.error('Voice recording error:', event.error);
            stopVoiceRecording();
            
            let errorMessage = 'Voice recording error: ' + event.error;
            switch (event.error) {
                case 'not-allowed':
                    errorMessage = 'Microphone access denied. Please allow microphone access.';
                    break;
                case 'no-speech':
                    errorMessage = 'No speech detected.';
                    break;
                case 'audio-capture':
                    errorMessage = 'No microphone found.';
                    break;
                case 'network':
                    errorMessage = 'Network error.';
                    break;
            }
            reject(new Error(errorMessage));
        };
        
        // Start recording
        try {
            currentRecognition.start();
        } catch (error) {
            console.error('Failed to start voice recording:', error);
            reject(new Error('Failed to start voice recording: ' + error.message));
        }
    });
}

/**
 * Stops voice recording
 */
function stopVoiceRecording() {
    console.log('Stopping voice recording...');
    console.log('Current recorded text before stopping:', recordedText);
    
    if (currentRecognition && isRecording) {
        currentRecognition.stop();
        currentRecognition = null;
        isRecording = false;
        hideRecordingIndicator();
        
        const finalText = recordedText.trim();
        console.log('Final recorded text after stopping:', finalText);
        console.log('Final text length:', finalText.length);
        return finalText;
    }
    
    console.log('No active recording to stop');
    return '';
}

/**
 * Gets the currently recorded text
 */
function getRecordedText() {
    const text = recordedText.trim();
    console.log('getRecordedText called, returning:', text);
    console.log('getRecordedText length:', text.length);
    return text;
}

/**
 * Shows recording indicator
 */
function showRecordingIndicator() {
    // Remove existing indicator if any
    hideRecordingIndicator();
    
    const indicator = document.createElement('div');
    indicator.id = 'voice-recording-indicator';
    indicator.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: #f44336;
        color: white;
        padding: 15px 20px;
        border-radius: 10px;
        font-size: 16px;
        font-weight: bold;
        z-index: 10000;
        box-shadow: 0 4px 15px rgba(244, 67, 54, 0.3);
        max-width: 300px;
        max-height: 200px;
        overflow-y: auto;
    `;
    indicator.innerHTML = `
        <div style="margin-bottom: 10px;">🔴 Recording... Click Stop when done</div>
        <div id="recorded-text" style="font-size: 12px; background: rgba(255,255,255,0.2); padding: 8px; border-radius: 5px; margin-top: 8px; min-height: 20px;"></div>
    `;
    document.body.appendChild(indicator);
    
    // Add stop button
    const stopButton = document.createElement('button');
    stopButton.textContent = 'Stop Recording';
    stopButton.style.cssText = `
        background: white;
        color: #f44336;
        border: none;
        padding: 8px 16px;
        border-radius: 5px;
        font-weight: bold;
        cursor: pointer;
        margin-top: 8px;
    `;
    stopButton.onclick = () => {
        stopVoiceRecording();
    };
    indicator.appendChild(stopButton);
}

/**
 * Updates the recording indicator with current text
 */
function updateRecordingIndicator(text) {
    const textElement = document.getElementById('recorded-text');
    if (textElement) {
        textElement.textContent = text || 'Listening...';
    }
}

/**
 * Hides recording indicator
 */
function hideRecordingIndicator() {
    const indicator = document.getElementById('voice-recording-indicator');
    if (indicator) {
        indicator.remove();
    }
}

/**
 * Detects the programming language selected in LeetCode editor
 * @returns {string} The detected programming language
 */
function detectProgrammingLanguage() {
    try {
        // Look for language selector or editor indicators
        const languageSelectors = [
            // Language dropdown
            '.ant-select-selection-item',
            '.language-selector .ant-select-selection-item',
            '[data-testid="language-selector"] .ant-select-selection-item',
            
            // Editor language indicators
            '.monaco-editor[data-lang]',
            '.CodeMirror[data-mode]',
            
            // Language buttons
            '.language-button.active',
            '.lang-btn.selected',
            
            // Text content indicators
            'button[title*="Python"]',
            'button[title*="Java"]',
            'button[title*="JavaScript"]',
            'button[title*="C++"]',
            'button[title*="C#"]',
            'button[title*="Go"]',
            'button[title*="Rust"]',
            'button[title*="Swift"]',
            'button[title*="Kotlin"]',
            'button[title*="Scala"]',
            'button[title*="PHP"]',
            'button[title*="Ruby"]',
            'button[title*="TypeScript"]'
        ];
        
        for (const selector of languageSelectors) {
            const element = document.querySelector(selector);
            if (element) {
                const text = element.textContent || element.title || element.getAttribute('data-lang') || element.getAttribute('data-mode');
                if (text) {
                    const language = mapLanguageName(text.toLowerCase());
                    if (language) {
                        console.log('Found language from element:', text, '->', language);
                        return language;
                    }
                }
            }
        }
        
        // Look for existing code in editor to detect language
        const codeEditor = document.querySelector('textarea') || document.querySelector('.monaco-editor textarea');
        if (codeEditor && codeEditor.value) {
            const code = codeEditor.value;
            const language = detectLanguageFromCode(code);
            if (language) {
                console.log('Detected language from existing code:', language);
                return language;
            }
        }
        
        // Default fallback
        console.log('Could not detect language, defaulting to Python');
        return 'python';
        
    } catch (error) {
        console.error('Error detecting programming language:', error);
        return 'python'; // Default fallback
    }
}

/**
 * Maps LeetCode language names to standard language names
 * @param {string} languageText - The language text from LeetCode
 * @returns {string|null} The mapped language name
 */
function mapLanguageName(languageText) {
    const languageMap = {
        'python': 'python',
        'python3': 'python',
        'java': 'java',
        'javascript': 'javascript',
        'js': 'javascript',
        'typescript': 'typescript',
        'ts': 'typescript',
        'c++': 'cpp',
        'cpp': 'cpp',
        'c': 'c',
        'c#': 'csharp',
        'csharp': 'csharp',
        'go': 'go',
        'golang': 'go',
        'rust': 'rust',
        'swift': 'swift',
        'kotlin': 'kotlin',
        'scala': 'scala',
        'php': 'php',
        'ruby': 'ruby',
        'sql': 'sql',
        'mysql': 'sql'
    };
    
    for (const [key, value] of Object.entries(languageMap)) {
        if (languageText.includes(key)) {
            return value;
        }
    }
    
    return null;
}

/**
 * Detects programming language from existing code
 * @param {string} code - The existing code in editor
 * @returns {string|null} The detected language
 */
function detectLanguageFromCode(code) {
    if (code.includes('class Solution') && code.includes('public ')) return 'java';
    if (code.includes('def ') && code.includes('class Solution')) return 'python';
    if (code.includes('function ') || code.includes('var ') || code.includes('let ')) return 'javascript';
    if (code.includes('class Solution') && code.includes('func ')) return 'go';
    if (code.includes('impl Solution')) return 'rust';
    if (code.includes('class Solution') && code.includes('fun ')) return 'kotlin';
    if (code.includes('#include')) return 'cpp';
    if (code.includes('using System')) return 'csharp';
    if (code.includes('<?php')) return 'php';
    if (code.includes('def ') && !code.includes('class Solution')) return 'python';
    
    return null;
}

/**
 * Generates AI solution based on voice notes and problem description
 * @param {string} title - The problem title
 * @param {string} description - The problem description
 * @param {string} voiceNotes - The voice notes from user
 * @param {string} language - The programming language
 * @returns {Promise<string>} The generated code solution
 */
async function generateAISolution(title, description, voiceNotes, language = 'python') {
    try {
        // Create a prompt for AI code generation
        const prompt = `You are an expert programmer. Generate a complete solution for this LeetCode problem based on the user's voice notes.

Problem Title: ${title}

Problem Description:
${description}

User's Voice Notes/Instructions:
${voiceNotes}

Programming Language: ${language}

Please generate a complete, working solution that follows the user's instructions. Include:
1. Proper class structure
2. Complete implementation
3. Comments explaining the approach
4. Time and space complexity analysis

Return only the code solution, no explanations outside the code.`;

        // For now, we'll use a simple mock AI response since we don't have API access
        // In a real implementation, you would call an AI API like OpenAI, Claude, etc.
        const mockAISolution = generateMockAISolution(title, voiceNotes, language);
        
        return mockAISolution;
        
    } catch (error) {
        console.error('Error in AI solution generation:', error);
        throw error;
    }
}

/**
 * Generates a mock AI solution based on the problem and voice notes
 * @param {string} title - The problem title
 * @param {string} voiceNotes - The voice notes
 * @param {string} language - The programming language
 * @returns {string} Mock solution code
 */
function generateMockAISolution(title, voiceNotes, language = 'python') {
    // This is a mock implementation - in reality you'd call an AI API
    const solutions = {
        'python': `class Solution:
    # Solution based on voice notes: "${voiceNotes}"
    
    def twoSum(self, nums: List[int], target: int) -> List[int]:
        # Hash map approach as suggested in voice notes
        num_map = {}
        
        for i, num in enumerate(nums):
            complement = target - num
            
            if complement in num_map:
                return [num_map[complement], i]
            
            num_map[num] = i
        
        return []  # No solution found
    
    # Time Complexity: O(n) - single pass through array
    # Space Complexity: O(n) - hash map storage`,

        'java': `class Solution {
    // Solution based on voice notes: "${voiceNotes}"
    
    public int[] twoSum(int[] nums, int target) {
        // Hash map approach as suggested in voice notes
        Map<Integer, Integer> map = new HashMap<>();
        
        for (int i = 0; i < nums.length; i++) {
            int complement = target - nums[i];
            
            if (map.containsKey(complement)) {
                return new int[]{map.get(complement), i};
            }
            
            map.put(nums[i], i);
        }
        
        return new int[0]; // No solution found
    }
    
    // Time Complexity: O(n) - single pass through array
    // Space Complexity: O(n) - hash map storage
}`,

        'javascript': `/**
 * @param {number[]} nums
 * @param {number} target
 * @return {number[]}
 */
// Solution based on voice notes: "${voiceNotes}"

var twoSum = function(nums, target) {
    // Hash map approach as suggested in voice notes
    const map = new Map();
    
    for (let i = 0; i < nums.length; i++) {
        const complement = target - nums[i];
        
        if (map.has(complement)) {
            return [map.get(complement), i];
        }
        
        map.set(nums[i], i);
    }
    
    return []; // No solution found
};

// Time Complexity: O(n) - single pass through array
// Space Complexity: O(n) - hash map storage`,

        'cpp': `class Solution {
public:
    // Solution based on voice notes: "${voiceNotes}"
    
    vector<int> twoSum(vector<int>& nums, int target) {
        // Hash map approach as suggested in voice notes
        unordered_map<int, int> map;
        
        for (int i = 0; i < nums.size(); i++) {
            int complement = target - nums[i];
            
            if (map.find(complement) != map.end()) {
                return {map[complement], i};
            }
            
            map[nums[i]] = i;
        }
        
        return {}; // No solution found
    }
    
    // Time Complexity: O(n) - single pass through array
    // Space Complexity: O(n) - hash map storage
};`,

        'csharp': `public class Solution {
    // Solution based on voice notes: "${voiceNotes}"
    
    public int[] TwoSum(int[] nums, int target) {
        // Hash map approach as suggested in voice notes
        var map = new Dictionary<int, int>();
        
        for (int i = 0; i < nums.Length; i++) {
            int complement = target - nums[i];
            
            if (map.ContainsKey(complement)) {
                return new int[] { map[complement], i };
            }
            
            map[nums[i]] = i;
        }
        
        return new int[0]; // No solution found
    }
    
    // Time Complexity: O(n) - single pass through array
    // Space Complexity: O(n) - hash map storage
}`,

        'go': `func twoSum(nums []int, target int) []int {
    // Solution based on voice notes: "${voiceNotes}"
    
    // Hash map approach as suggested in voice notes
    numMap := make(map[int]int)
    
    for i, num := range nums {
        complement := target - num
        
        if idx, exists := numMap[complement]; exists {
            return []int{idx, i}
        }
        
        numMap[num] = i
    }
    
    return []int{} // No solution found
    
    // Time Complexity: O(n) - single pass through array
    // Space Complexity: O(n) - hash map storage
}`,

        'rust': `impl Solution {
    // Solution based on voice notes: "${voiceNotes}"
    
    pub fn two_sum(nums: Vec<i32>, target: i32) -> Vec<i32> {
        // Hash map approach as suggested in voice notes
        let mut map = std::collections::HashMap::new();
        
        for (i, &num) in nums.iter().enumerate() {
            let complement = target - num;
            
            if let Some(&idx) = map.get(&complement) {
                return vec![idx, i as i32];
            }
            
            map.insert(num, i as i32);
        }
        
        vec![] // No solution found
        
        // Time Complexity: O(n) - single pass through array
        // Space Complexity: O(n) - hash map storage
    }
}`,

        'typescript': `function twoSum(nums: number[], target: number): number[] {
    // Solution based on voice notes: "${voiceNotes}"
    
    // Hash map approach as suggested in voice notes
    const map = new Map<number, number>();
    
    for (let i = 0; i < nums.length; i++) {
        const complement = target - nums[i];
        
        if (map.has(complement)) {
            return [map.get(complement)!, i];
        }
        
        map.set(nums[i], i);
    }
    
    return []; // No solution found
    
    // Time Complexity: O(n) - single pass through array
    // Space Complexity: O(n) - hash map storage
}`
    };

    return solutions[language] || solutions['python'];
}

/**
 * Retrieves the stored problem description
 * @returns {string} The stored problem description
 */
function getStoredDescription() {
    return window.leetcodeProblemDescription || '';
}

// Export functions for external use
window.leetcodeExtractor = {
    getProblemTitle,
    getProblemStatement,
    extractProblemData,
    injectIntoCodeEditor,
    extractAndInject,
    getStoredDescription,
    startVoiceRecording,
    stopVoiceRecording,
    getRecordedText,
    generateAISolution
};
