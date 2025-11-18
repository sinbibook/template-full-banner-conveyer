/**
 * Header and Footer Loader
 * Dynamically loads header and footer templates into pages
 */

(function() {
    'use strict';

    // Track if header and footer are both loaded
    let headerLoaded = false;
    let footerLoaded = false;

    // Initialize mapper after both header and footer are loaded
    async function tryInitializeMapper() {
        if (headerLoaded && footerLoaded && window.HeaderFooterMapper) {
            // Initialize mapper immediately
            const mapper = new window.HeaderFooterMapper();
            await mapper.initialize();

            // Show header after mapping is complete
            const header = document.querySelector('.top-header');
            if (header) {
                header.style.transition = 'opacity 0.2s ease';
                header.style.opacity = '1';
            }
        }
    }

    // Load CSS
    function loadCSS(href) {
        const link = document.createElement('link');
        link.rel = 'stylesheet';
        link.href = href;
        document.head.appendChild(link);
    }

    // Load Header
    async function loadHeader() {
        try {
            // Load header CSS first
            loadCSS('styles/header.css');

            const response = await fetch('common/header.html');
            const html = await response.text();

            // Create a temporary container
            const temp = document.createElement('div');
            temp.innerHTML = html;

            // Extract body content from the loaded HTML
            const bodyContent = temp.querySelector('body');

            if (bodyContent) {
                // Insert top header first
                const topHeader = bodyContent.querySelector('.top-header');
                if (topHeader) {
                    // Hide immediately to prevent FOUC
                    topHeader.style.opacity = '0';
                    document.body.insertBefore(topHeader, document.body.firstChild);
                }

                // Insert hamburger button
                const hamburgerButton = bodyContent.querySelector('.hamburger-button');
                if (hamburgerButton) {
                    document.body.insertBefore(hamburgerButton, document.body.firstChild);
                }

                // Insert side header
                const sideHeader = bodyContent.querySelector('.side-header');
                if (sideHeader) {
                    document.body.insertBefore(sideHeader, document.body.firstChild);
                }
            } else {
                // Fallback: Insert HTML directly
                const headerHTML = html.replace(/<\/?(!DOCTYPE|html|head|title|link)[^>]*>/g, '');
                const cleanHTML = headerHTML.replace(/<\/?body[^>]*>/g, '');
                const firstChild = document.body.firstChild;
                const tempDiv = document.createElement('div');
                tempDiv.innerHTML = cleanHTML;

                Array.from(tempDiv.children).forEach(child => {
                    document.body.insertBefore(child, firstChild);
                });
            }

            // Load header JavaScript
            const script = document.createElement('script');
            script.src = 'js/common/header.js';
            script.onload = function() {
                // Re-initialize hamburger button after script loads
                setTimeout(() => {
                    const hamburgerButton = document.getElementById('hamburger-button');
                    if (hamburgerButton && window.toggleSideHeader) {
                        hamburgerButton.addEventListener('click', window.toggleSideHeader);
                    }
                }, 100);
            };
            document.body.appendChild(script);

            // Immediately check scroll position after header is loaded
            if (window.scrollY > 50 || window.pageYOffset > 50) {
                const header = document.querySelector('.header');
                if (header) {
                    header.classList.add('scrolled');
                }
            }

            // Mark header as loaded and try to initialize mapper
            headerLoaded = true;
            tryInitializeMapper();
        } catch (error) {
            console.error('Error loading header:', error);
        }
    }

    // Load Footer
    async function loadFooter() {
        try {
            const response = await fetch('common/footer.html');
            if (response.ok) {
                // Load footer CSS
                loadCSS('styles/footer.css');

                const html = await response.text();

                // Create a temporary container
                const temp = document.createElement('div');
                temp.innerHTML = html;

                // Append footer at the end of body
                const footer = temp.querySelector('.footer');
                if (footer) {
                    document.body.appendChild(footer);
                }

                // Load footer JavaScript if exists
                const script = document.createElement('script');
                script.src = 'js/common/footer.js';
                document.body.appendChild(script);

                // Mark footer as loaded and try to initialize mapper
                footerLoaded = true;
                tryInitializeMapper();
            }
        } catch (error) {
            console.error('Error loading footer:', error);
        }
    }

    // Initialize
    document.addEventListener('DOMContentLoaded', function() {
        loadHeader();
        loadFooter();
    });

})();