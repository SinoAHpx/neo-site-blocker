console.log('background is running')

// Listen for messages from the popup
chrome.runtime.onMessage.addListener((request) => {
  if (request.type === 'COUNT') {
    console.log('background has received a message from popup, and count is ', request?.count)
  }
})

// Function to check if a URL is blocked
const isSiteBlocked = (url: string, callback: (isBlocked: boolean) => void): void => {
    chrome.storage.sync.get({ blockedSites: [] }, (data) => {
      const blockedSites = data.blockedSites;
      const isBlocked = blockedSites.some((site: { url: string, isBlocked: boolean }) => {
        try {
          const siteUrl = new URL(site.url);
          const requestUrl = new URL(url);
          return site.isBlocked && siteUrl.hostname === requestUrl.hostname;
        } catch (e) {
          return false;
        }
      });
      callback(isBlocked);
    });
};


// Listen for web requests
chrome.webRequest.onBeforeRequest.addListener(
  (details) => {
    const url = details.url;
    let cancel = false;
    isSiteBlocked(url, (isBlocked) => {
      if (isBlocked) {
        cancel = true;
      }
    });
    if (cancel) {
      return { cancel: true };
    }
  },
  { urls: ["<all_urls>"] },
  ["blocking"]
);
