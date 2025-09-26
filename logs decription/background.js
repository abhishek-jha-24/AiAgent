// Background script for LeetCode Problem Extractor
// This is a service worker that handles extension lifecycle events

chrome.runtime.onInstalled.addListener((details) => {
    console.log('LeetCode Problem Extractor installed');
    
    if (details.reason === 'install') {
        // Set up initial state or perform one-time setup
        console.log('Extension installed for the first time');
    } else if (details.reason === 'update') {
        // Handle extension update
        console.log('Extension updated');
    }
});

// Handle extension icon click (though we're using popup now)
chrome.action.onClicked.addListener((tab) => {
    // This won't be called since we have a popup defined in manifest
    console.log('Extension icon clicked (popup should open)');
});

// Handle messages from content scripts or popup
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    console.log('Background script received message:', request);
    
    if (request.action === 'getActiveTab') {
        chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
            if (tabs[0]) {
                sendResponse({ tab: tabs[0] });
            } else {
                sendResponse({ error: 'No active tab found' });
            }
        });
        return true; // Keep message channel open for async response
    }
});

// Handle tab updates to check if we're on a LeetCode problem page
chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
    if (changeInfo.status === 'complete' && tab.url) {
        const isLeetCodeProblem = tab.url.includes('leetcode.com/problems/') && tab.url.includes('/description/');
        
        if (isLeetCodeProblem) {
            console.log('User navigated to LeetCode problem page:', tab.url);
            // You could inject content script here if needed, but it's already set to auto-inject
        }
    }
});

console.log('LeetCode Problem Extractor background script loaded');
