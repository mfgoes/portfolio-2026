// Fade out dithering canvas when scrolling to case studies section
document.addEventListener('DOMContentLoaded', function() {
    const overlay = document.getElementById('dithering-canvas');
    const workSection = document.getElementById('work-section');

    if (!overlay || !workSection) return;

    // Add will-change for GPU acceleration
    overlay.style.willChange = 'opacity';

    function handleScroll() {
        const workSectionTop = workSection.getBoundingClientRect().top;
        const windowHeight = window.innerHeight;

        // Start fading out when work section is approaching (within viewport)
        // Fully faded when work section reaches top third of viewport
        const fadeStartPoint = windowHeight * 0.8;
        const fadeEndPoint = windowHeight * 0.3;

        if (workSectionTop <= fadeStartPoint && workSectionTop >= fadeEndPoint) {
            // Calculate opacity based on scroll position
            const fadeRange = fadeStartPoint - fadeEndPoint;
            const currentPosition = fadeStartPoint - workSectionTop;
            const opacity = 1 - (currentPosition / fadeRange);
            overlay.style.opacity = Math.max(0, Math.min(1, opacity));
        } else if (workSectionTop < fadeEndPoint) {
            // Fully faded out
            overlay.style.opacity = '0';
        } else {
            // Fully visible
            overlay.style.opacity = '1';
        }
    }

    // Run on scroll with throttling for performance
    let ticking = false;
    window.addEventListener('scroll', function() {
        if (!ticking) {
            window.requestAnimationFrame(function() {
                handleScroll();
                ticking = false;
            });
            ticking = true;
        }
    }, { passive: true });

    // Run once on load
    handleScroll();
});
