// ==UserScript==
// @name         Asura Scans Premium Ad Remover
// @namespace    http://tampermonkey.net/
// @version      0.1.0
// @description  Removes "ASURA+" premium subscription ads from Asura Scans pages.
// @author       Invictus Navarchus
// @match        *://*.asuracomic.net/*
// @grant        none
// @run-at       document-idle
// ==/UserScript==

(function() {
    'use strict';

    const SCRIPT_PREFIX = '[AsuraAdRemover]';

    function log(message) {
        console.log(`${SCRIPT_PREFIX} ${message}`);
    }

    function removeMatchingAds() {
        log('Scanning for premium ads...');
        let adsRemovedThisScan = 0;

        // --- Target Top Banner Ad ---
        // Characteristics to look for:
        // - Typically a prominent div near the top of the page (not fixed position).
        // - Contains text: "PREMIUM OFFER", "ASURA+", "Premium".
        // - Contains a button with "Subscribe Now!".
        // - The example HTML showed it as <div class="relative z-50 overflow-hidden ...">
        document.querySelectorAll('div.relative.z-50.overflow-hidden, body > div:not([id]):not([class=""])').forEach(el => {
            // Ensure it's not a modal (which would be position: fixed)
            if (getComputedStyle(el).position === 'fixed') {
                return;
            }

            const textContent = el.textContent || "";
            // Quick check for essential keywords
            if (!textContent.includes('PREMIUM OFFER') || !textContent.includes('ASURA+') || !textContent.includes('Subscribe Now!')) {
                return;
            }

            // More specific checks
            const h2AsuraPremium = Array.from(el.querySelectorAll('h2')).find(
                h => (h.textContent || "").includes('ASURA+') && (h.textContent || "").includes('Premium')
            );
            const subscribeButton = Array.from(el.querySelectorAll('button')).find(
                b => (b.textContent || "").includes('Subscribe Now!')
            );

            if (h2AsuraPremium && subscribeButton) {
                // Heuristic: top banners are generally large.
                // The example banner was directly under a div with id="header-ads"
                // or a direct child of body with specific classes.
                if (el.offsetHeight > 50 && el.offsetWidth > 200) { // Basic size check
                    log(`Removing potential top banner ad (class: ${el.className}, id: ${el.id})`);
                    el.remove();
                    adsRemovedThisScan++;
                }
            }
        });

        // --- Target Modal Pop-up Ad ---
        // Characteristics to look for:
        // - A `div` with `position: fixed`, often styled as an overlay (e.g., `class="fixed inset-0"`).
        // - High z-index (e.g., 50 or more).
        // - Contains text: "Premium Offer", "ASURA+", "Premium".
        // - Contains buttons like "Subscribe Now!", "Skip Ad", or an X close icon.
        // - Often includes price details like "$19.99", "Premium Benefits", or "Just $1.67".
        document.querySelectorAll('div.fixed.inset-0, div[style*="position: fixed"]').forEach(el => {
            const style = getComputedStyle(el);
            if (style.position !== 'fixed') return; // Must be fixed

            // Ensure it's likely an overlay ad (high z-index, takes up space)
            if (parseInt(style.zIndex, 10) < 40) { // Ads are usually on top
                 // Check if it's the specific modal from the example, which has z-index 50
                if (!el.classList.contains('z-50') && !(el.style.zIndex && parseInt(el.style.zIndex, 10) >= 40)) {
                    return;
                }
            }


            const textContent = el.textContent || "";
            // Quick check for essential keywords
            if (!textContent.includes('Premium Offer') || !textContent.includes('ASURA+') || !(textContent.includes('Subscribe Now!') || textContent.includes('Skip Ad'))) {
                return;
            }

            // Check for specific price points or benefit lists as a strong indicator it's the target ad
            if (!textContent.includes('$19.99') && !textContent.includes('Premium Benefits') && !textContent.includes('Just $1.67')) {
                return;
            }

            // More specific checks
            const h2AsuraPremium = Array.from(el.querySelectorAll('h2')).find(
                h => (h.textContent || "").includes('ASURA+') && (h.textContent || "").includes('Premium')
            );
            const subscribeButton = Array.from(el.querySelectorAll('button')).find(
                b => (b.textContent || "").includes('Subscribe Now!') && !(b.textContent || "").includes('Skip Ad') // Avoid matching "Skip Ad" button if it also says "Subscribe"
            );
            const skipAdButton = Array.from(el.querySelectorAll('button')).find(
                b => (b.textContent || "").trim() === 'Skip Ad'
            );
            // The X close button from the example HTML (inside the modal)
            const closeButtonX = el.querySelector('div[class*="jsx-"] button svg.lucide-x, button[aria-label="Close promotion"] svg.lucide-x');


            if (h2AsuraPremium && (subscribeButton || skipAdButton || closeButtonX)) {
                log(`Removing potential modal ad (class: ${el.className}, id: ${el.id})`);
                el.remove();
                adsRemovedThisScan++;
            }
        });

        if (adsRemovedThisScan > 0) {
            log(`${adsRemovedThisScan} ad(s) removed in this scan.`);
        } else {
            log('No matching ads found in this scan.');
        }
    }

    // Run the removal function once the DOM is ready and idle.
    // requestAnimationFrame helps ensure it runs after the browser has painted, reducing layout shifts.
    if (document.readyState === 'complete' || document.readyState === 'interactive' || document.readyState === 'loaded') {
         // `document.readyState === 'loaded'` is not a standard value, but some browsers might use it.
         // 'interactive' means DOM is ready, 'complete' means all resources loaded.
        requestAnimationFrame(removeMatchingAds);
    } else {
        document.addEventListener('DOMContentLoaded', () => {
            requestAnimationFrame(removeMatchingAds);
        });
    }

    // Observe DOM changes for dynamically loaded ads
    const observer = new MutationObserver((mutationsList) => {
        let potentialAdAdded = false;
        for (const mutation of mutationsList) {
            if (mutation.type === 'childList' && mutation.addedNodes.length > 0) {
                for (const node of mutation.addedNodes) {
                    if (node.nodeType === Node.ELEMENT_NODE) { // Only check element nodes
                        const nodeText = node.textContent || "";
                        // Check if the added node or its content strongly suggests it's an ad we target
                        if ((nodeText.includes('ASURA+') && (nodeText.includes('Premium Offer') || nodeText.includes('Subscribe Now'))) ||
                            (node.matches && (node.matches('div.relative.z-50.overflow-hidden') || node.matches('div.fixed.inset-0')))) {
                            potentialAdAdded = true;
                            break; // Found a potential ad, no need to check further nodes in this mutation record
                        }
                    }
                }
            }
            if (potentialAdAdded) break; // Found a potential ad, no need to check further mutation records
        }

        if (potentialAdAdded) {
            log('DOM change detected, re-scanning for ads.');
            // Use requestAnimationFrame to batch potential multiple calls from rapid mutations
            requestAnimationFrame(removeMatchingAds);
        }
    });

    // Start observing the body for added child elements and modifications in the entire subtree
    observer.observe(document.body, {
        childList: true, // Watch for addition or removal of child nodes
        subtree: true    // Watch descendants as well
    });

    log('Initialization complete. Observer active for dynamic ads.');

})();
