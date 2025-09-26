// Popup script for LeetCode Problem Extractor

document.addEventListener('DOMContentLoaded', function() {
    const startButton = document.getElementById('startButton');
    const injectButton = document.getElementById('injectButton');
    const loading = document.getElementById('loading');
    const results = document.getElementById('results');
    const error = document.getElementById('error');
    const statusIcon = document.getElementById('statusIcon');
    const statusText = document.getElementById('statusText');
    const titleResult = document.getElementById('titleResult');
    const statementResult = document.getElementById('statementResult');

    // Check if we're on a LeetCode problem page
    function checkCurrentTab() {
        return new Promise((resolve) => {
            chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
                if (tabs[0]) {
                    const url = tabs[0].url;
                    const isLeetCodeProblem = url.includes('leetcode.com/problems/') && url.includes('/description/');
                    resolve({ tab: tabs[0], isLeetCodeProblem });
                } else {
                    resolve({ tab: null, isLeetCodeProblem: false });
                }
            });
        });
    }

    // Update status display
    function updateStatus(icon, text, isError = false) {
        statusIcon.textContent = icon;
        statusText.textContent = text;
        if (isError) {
            statusIcon.style.color = '#ff6b6b';
        } else {
            statusIcon.style.color = 'white';
        }
    }

    // Show error message
    function showError(message) {
        error.textContent = message;
        error.classList.add('show');
        setTimeout(() => {
            error.classList.remove('show');
        }, 5000);
    }

    // Show loading state
    function showLoading() {
        startButton.disabled = true;
        loading.classList.add('show');
        updateStatus('⏳', 'Processing...');
    }

    // Hide loading state
    function hideLoading() {
        startButton.disabled = false;
        loading.classList.remove('show');
    }

    // Display results
    function displayResults(data) {
        titleResult.textContent = data.title || 'No title found';
        statementResult.textContent = data.statement || 'No statement found';
        results.classList.add('show');
        updateStatus('✅', 'Extraction complete!');
    }

    // Inject content script if not already loaded
    function injectContentScript(tabId) {
        return new Promise((resolve, reject) => {
            chrome.scripting.executeScript({
                target: { tabId: tabId },
                files: ['content.js']
            }, (results) => {
                if (chrome.runtime.lastError) {
                    reject(new Error(chrome.runtime.lastError.message));
                } else {
                    console.log('Content script injected successfully');
                    resolve();
                }
            });
        });
    }

    // Send message to content script
    function sendMessageToContentScript(tabId, action = 'extractProblemData') {
        return new Promise((resolve, reject) => {
            chrome.tabs.sendMessage(tabId, { action: action }, (response) => {
                if (chrome.runtime.lastError) {
                    // If content script not found, try to inject it
                    if (chrome.runtime.lastError.message.includes('Receiving end does not exist')) {
                        console.log('Content script not found, injecting...');
                        injectContentScript(tabId)
                            .then(() => {
                                // Wait a bit for script to load, then try again
                                setTimeout(() => {
                                    chrome.tabs.sendMessage(tabId, { action: action }, (response) => {
                                        if (chrome.runtime.lastError) {
                                            reject(new Error('Failed to communicate with content script after injection'));
                                        } else if (response && response.success) {
                                            resolve(response.data || response);
                                        } else {
                                            reject(new Error(response?.error || 'Failed to execute action'));
                                        }
                                    });
                                }, 1000);
                            })
                            .catch(reject);
                    } else {
                        reject(new Error(chrome.runtime.lastError.message));
                    }
                } else if (response && response.success) {
                    resolve(response.data || response);
                } else {
                    reject(new Error(response?.error || 'Failed to execute action'));
                }
            });
        });
    }

    // Main processing function
    async function startProcessing() {
        try {
            showLoading();
            
            // Check current tab
            const { tab, isLeetCodeProblem } = await checkCurrentTab();
            
            if (!tab) {
                throw new Error('No active tab found');
            }
            
            if (!isLeetCodeProblem) {
                throw new Error('Please navigate to a LeetCode problem page with /description/ in the URL');
            }
            
            // Send message to content script
            const data = await sendMessageToContentScript(tab.id);
            
            // Display results
            displayResults(data);
            
            // Log to console
            console.log('=== LeetCode Problem Extractor Results ===');
            console.log('Title:', data.title);
            console.log('Statement:', data.statement);
            console.log('Full Data:', data);
            
        } catch (err) {
            console.error('Error during processing:', err);
            updateStatus('❌', 'Error occurred');
            showError(err.message);
        } finally {
            hideLoading();
        }
    }

    // Injection function
    async function injectIntoEditor() {
        try {
            showLoading();
            updateStatus('⏳', 'Injecting into code editor...');
            
            // Check current tab
            const { tab, isLeetCodeProblem } = await checkCurrentTab();
            
            if (!tab) {
                throw new Error('No active tab found');
            }
            
            if (!isLeetCodeProblem) {
                throw new Error('Please navigate to a LeetCode problem page with /description/ in the URL');
            }
            
            // Send message to content script to inject into editor
            const result = await sendMessageToContentScript(tab.id, 'injectIntoEditor');
            
            if (result.success) {
                updateStatus('✅', 'Successfully injected into code editor!');
                console.log('Successfully injected problem data into code editor');
            } else {
                throw new Error('Failed to inject into code editor');
            }
            
        } catch (err) {
            console.error('Error during injection:', err);
            updateStatus('❌', 'Injection failed');
            showError(err.message);
        } finally {
            hideLoading();
        }
    }

    // Event listeners
    startButton.addEventListener('click', startProcessing);
    
    // Add inject button event listener if it exists
    if (injectButton) {
        injectButton.addEventListener('click', injectIntoEditor);
    }

    // Initialize popup state
    async function initialize() {
        const { isLeetCodeProblem } = await checkCurrentTab();
        
        if (isLeetCodeProblem) {
            updateStatus('🔍', 'Ready to extract');
            startButton.textContent = 'Start Processing';
            
            // Show inject button if it exists
            if (injectButton) {
                injectButton.style.display = 'block';
                injectButton.textContent = 'Inject into Code Editor';
            }
        } else {
            updateStatus('⚠️', 'Not on LeetCode problem page');
            startButton.textContent = 'Go to LeetCode Problem';
            startButton.addEventListener('click', () => {
                chrome.tabs.create({ url: 'https://leetcode.com/problemset/' });
            });
            
            // Hide inject button if not on LeetCode problem page
            if (injectButton) {
                injectButton.style.display = 'none';
            }
        }
    }

    // Initialize when popup opens
    initialize();
});
