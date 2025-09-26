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
        
        // Look for any div containing the problem text
        const contentDivs = document.querySelectorAll('div');
        for (const div of contentDivs) {
            const text = div.textContent;
            if (text && text.includes('You are given') && text.length > 100) {
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
            
            // Create a comment block with title and voice input
            const commentBlock = `/*
 * ${title}
 * 
 * Voice Notes: ${voiceInput}
 */

`;
            
            // Prepend the comment block to existing content
            const existingContent = targetDiv.innerHTML;
            targetDiv.innerHTML = `<pre style="white-space: pre-wrap; font-family: monospace; margin: 0; padding: 0; background: #f8f9fa; border: 1px solid #e9ecef; border-radius: 4px;">${commentBlock}</pre>` + existingContent;
            
            console.log('Successfully prepended problem description to div content');
            return true;
        }
        
        console.log('Found code editor:', codeEditor);
        
        // Store description for later use
        window.leetcodeProblemDescription = description;
        console.log('Description stored for later use:', description.length, 'characters');
        
        // Get recorded voice text
        const voiceInput = getRecordedText();
        console.log('Using recorded voice text:', voiceInput);
        
        // Create a comment block with title and voice input
        const commentBlock = `/*
 * ${title}
 * 
 * Voice Notes: ${voiceInput}
 */

`;
        
        // Get current content
        const currentContent = codeEditor.value || '';
        console.log('Current editor content length:', currentContent.length);
        
        // Check if content already has our comment block
        if (currentContent.includes('/*') && currentContent.includes(title)) {
            console.log('Content already has the problem description');
            return true;
        }
        
        // Add the comment block at the beginning
        const newContent = commentBlock + currentContent;
        
        // Set the new content
        codeEditor.value = newContent;
        
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
        
        console.log('Successfully injected problem description into code editor');
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
    
    if (currentRecognition && isRecording) {
        currentRecognition.stop();
        currentRecognition = null;
        isRecording = false;
        hideRecordingIndicator();
        
        console.log('Final recorded text:', recordedText.trim());
        return recordedText.trim();
    }
    
    return '';
}

/**
 * Gets the currently recorded text
 */
function getRecordedText() {
    return recordedText.trim();
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
    getRecordedText
};
