// Facility Page JavaScript
(function() {
    'use strict';


    // Export initHeroSlider to global scope for mapper
    window.initHeroSlider = initHeroSlider;

    // Initialize hero slider when DOM is ready
    document.addEventListener('DOMContentLoaded', function() {
        // Wait for mapper to complete before initializing slider
        setTimeout(() => {
            initHeroSlider();
        }, 100);

        // Setup wipe animation for special section
        setTimeout(setupWipeAnimation, 500);
    });

    function initHeroSlider() {
        const slider = document.querySelector('[data-facility-hero-slider]');
        if (!slider) {
            return;
        }

        const slides = slider.querySelectorAll('.slide');
        const prevBtn = document.querySelector('.prev-btn');
        const nextBtn = document.querySelector('.next-btn');
        const progressBar = document.querySelector('.progress-bar');


        if (!slides.length) {
            return;
        }

        let currentSlide = 0;
        let autoSlideInterval;
        let progressInterval;

        function showSlide(index) {
            // Hide all slides
            slides.forEach((slide, i) => {
                slide.classList.toggle('active', i === index);
            });
        }

        function nextSlide() {
            currentSlide = (currentSlide + 1) % slides.length;
            showSlide(currentSlide);
            resetProgress();
        }

        function prevSlide() {
            currentSlide = (currentSlide - 1 + slides.length) % slides.length;
            showSlide(currentSlide);
            resetProgress();
        }

        function startProgress() {
            let progress = 0;
            if (progressBar) {
                progressBar.style.width = '0%';
                progressInterval = setInterval(() => {
                    progress += 100 / 30; // 3 seconds = 30 intervals of 100ms
                    progressBar.style.width = Math.min(progress, 100) + '%';
                    if (progress >= 100) {
                        clearInterval(progressInterval);
                    }
                }, 100);
            }
        }

        function resetProgress() {
            if (progressInterval) {
                clearInterval(progressInterval);
            }
            startProgress();
        }

        function startAutoSlide() {
            resetProgress();
            autoSlideInterval = setInterval(() => {
                nextSlide();
            }, 3000);
        }

        function stopAutoSlide() {
            if (autoSlideInterval) {
                clearInterval(autoSlideInterval);
            }
            if (progressInterval) {
                clearInterval(progressInterval);
            }
        }

        // Set up event listeners
        if (prevBtn) {
            prevBtn.addEventListener('click', () => {
                stopAutoSlide();
                prevSlide();
                startAutoSlide();
            });
        }

        if (nextBtn) {
            nextBtn.addEventListener('click', () => {
                stopAutoSlide();
                nextSlide();
                startAutoSlide();
            });
        }

        // Pause on hover
        slider.addEventListener('mouseenter', stopAutoSlide);
        slider.addEventListener('mouseleave', startAutoSlide);

        // Touch swipe support for mobile
        let touchStartX = 0;
        let touchEndX = 0;
        let isSwiping = false;

        slider.addEventListener('touchstart', (e) => {
            touchStartX = e.touches[0].clientX;
            isSwiping = true;
            stopAutoSlide();
        }, { passive: true });

        slider.addEventListener('touchmove', (e) => {
            if (!isSwiping) return;
            touchEndX = e.touches[0].clientX;
        }, { passive: true });

        slider.addEventListener('touchend', () => {
            if (!isSwiping) return;
            isSwiping = false;

            const swipeDistance = touchStartX - touchEndX;
            const threshold = 50; // Minimum distance for swipe

            if (Math.abs(swipeDistance) > threshold) {
                if (swipeDistance > 0) {
                    // Swiped left - next slide
                    nextSlide();
                } else {
                    // Swiped right - previous slide
                    prevSlide();
                }
            }

            startAutoSlide();
        }, { passive: true });

        // Keyboard navigation
        document.addEventListener('keydown', (e) => {
            if (e.key === 'ArrowLeft') {
                stopAutoSlide();
                prevSlide();
                startAutoSlide();
            } else if (e.key === 'ArrowRight') {
                stopAutoSlide();
                nextSlide();
                startAutoSlide();
            }
        });

        // Start the slider
        showSlide(0);
        startAutoSlide();

    }

    // Add fade-in animation to hero section on page load
    window.addEventListener('load', function() {
        const heroSection = document.querySelector('.facility-hero-section');
        if (heroSection) {
            heroSection.classList.add('fade-in-hero');
        }
    });

    // Usage boxes animation - handled by ScrollAnimations below
})();

// ScrollAnimations 초기화
let scrollAnimations;

function initScrollAnimations() {
    if (typeof ScrollAnimations === 'undefined') {
        setTimeout(initScrollAnimations, 100);
        return;
    }

    scrollAnimations = new ScrollAnimations({
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    });

    const animations = [
        // Facility intro text animation (image will use custom wipe effect)
        { type: 'slideUp', selector: '.facility-intro-text', options: { delay: 200 } },

        // Usage boxes sequential animation - one by one with increased delays
        { type: 'slideUp', selector: '.usage-box[data-features-box]', options: { delay: 100, duration: 800 } },
        { type: 'slideUp', selector: '.usage-box[data-additional-box]', options: { delay: 600, duration: 800 } },   // 0.5초 후
        { type: 'slideUp', selector: '.usage-box[data-benefits-box]', options: { delay: 1100, duration: 800 } },   // 1초 후 (0.5초씩 간격)

        // Special section animations
        { type: 'slideRight', selector: '.facility-special-left', options: { delay: 100 } },
        { type: 'slideLeft', selector: '.facility-special-right', options: { delay: 200 } }
    ];

    scrollAnimations.registerAnimations(animations);

    // Initialize custom wipe reveal for dome image
    initDomeImageWipe();
}

/**
 * Initialize dome image wipe reveal effect
 */
function initDomeImageWipe() {
    const domeImage = document.querySelector('.facility-intro-image.wipe-reveal');

    if (!domeImage) return;

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                // Add visible class to trigger wipe animation
                setTimeout(() => {
                    entry.target.classList.add('visible');
                }, 100); // Small delay for better effect

                // Add shadow after wipe animation completes (1.2s)
                setTimeout(() => {
                    entry.target.classList.add('shadow-ready');
                    entry.target.style.overflow = 'visible';
                }, 1300); // After wipe animation completes

                // Unobserve after animation triggers
                observer.unobserve(entry.target);
            }
        });
    }, {
        threshold: 0.2,
        rootMargin: '0px 0px -50px 0px'
    });

    observer.observe(domeImage);
}

// Initialize animations after DOM loads
document.addEventListener('DOMContentLoaded', function() {
    setTimeout(() => {
        initScrollAnimations();
    }, 100);
});

/**
 * 컨베이어 벨트 방식 슬라이더 설정
 */
function setupWipeAnimation() {
    const leftSlider = document.querySelector('[data-wipe-slider="left"]');
    const rightSlider = document.querySelector('[data-wipe-slider="right"]');

    // 양쪽 슬라이더가 모두 있어야 작동
    if (leftSlider && rightSlider) {
        createConveyorSlider(leftSlider, rightSlider);
    }
}

/**
 * 컨베이어 벨트 방식 슬라이더 생성
 * 이미지가 순서대로 왼쪽 → 오른쪽으로 이동하며 순환
 */
function createConveyorSlider(leftContainer, rightContainer) {
    // JSON에서 이미지 배열 가져오기
    const imageUrls = getSliderImages();

    if (!imageUrls || imageUrls.length < 2) {
        return;
    }

    let currentIndex = 0;
    let isTransitioning = false;

    // 초기 이미지 설정
    const leftImg = leftContainer.querySelector('img.active');
    const rightImg = rightContainer.querySelector('img.active');

    if (leftImg && rightImg && imageUrls.length >= 2) {
        leftImg.src = imageUrls[0];
        rightImg.src = imageUrls[1];
        currentIndex = 1;
    }

    // 다음 이미지로 전환 (wipe 방식 - 새 이미지를 먼저 뒤에 배치)
    function nextImages() {
        if (isTransitioning || imageUrls.length < 2) return;
        isTransitioning = true;

        // 다음 이미지 인덱스 계산
        const nextIndex = (currentIndex + 1) % imageUrls.length;
        const nextImageUrl = imageUrls[nextIndex];

        // 먼저 기존 이미지의 src를 새 이미지로 변경 (뒤에 배치)
        leftImg.style.zIndex = '1';
        rightImg.style.zIndex = '1';

        // 새 이미지를 기존 img 태그에 로드
        const tempLeftSrc = leftImg.src;
        const tempRightSrc = rightImg.src;
        leftImg.src = rightImg.src;
        rightImg.src = nextImageUrl;

        // 왼쪽 와이프 오버레이 생성 (현재 이미지를 보여줌)
        const leftWipeOverlay = document.createElement('div');
        leftWipeOverlay.style.position = 'absolute';
        leftWipeOverlay.style.top = '0';
        leftWipeOverlay.style.right = '0';
        leftWipeOverlay.style.width = '100%';
        leftWipeOverlay.style.height = '100%';
        leftWipeOverlay.style.background = `url('${tempLeftSrc}') center/cover`;
        leftWipeOverlay.style.zIndex = '10';
        leftWipeOverlay.style.transition = 'width 0.8s ease-in-out';
        leftWipeOverlay.style.overflow = 'hidden';

        // 오른쪽 와이프 오버레이 생성
        const rightWipeOverlay = document.createElement('div');
        rightWipeOverlay.style.position = 'absolute';
        rightWipeOverlay.style.top = '0';
        rightWipeOverlay.style.right = '0';
        rightWipeOverlay.style.width = '100%';
        rightWipeOverlay.style.height = '100%';
        rightWipeOverlay.style.background = `url('${tempRightSrc}') center/cover`;
        rightWipeOverlay.style.zIndex = '10';
        rightWipeOverlay.style.transition = 'width 0.8s ease-in-out';
        rightWipeOverlay.style.overflow = 'hidden';

        // 컨테이너 설정
        leftContainer.style.position = 'relative';
        leftContainer.style.overflow = 'hidden';
        rightContainer.style.position = 'relative';
        rightContainer.style.overflow = 'hidden';

        // 오버레이 추가
        leftContainer.appendChild(leftWipeOverlay);
        rightContainer.appendChild(rightWipeOverlay);

        // 와이프 애니메이션 시작 (순차적으로)
        setTimeout(() => {
            leftWipeOverlay.style.width = '0';
        }, 50);

        setTimeout(() => {
            rightWipeOverlay.style.width = '0';
        }, 150); // 오른쪽은 약간 늦게

        // 애니메이션 완료 후 정리
        setTimeout(() => {
            // 오버레이 제거
            if (leftContainer.contains(leftWipeOverlay)) leftContainer.removeChild(leftWipeOverlay);
            if (rightContainer.contains(rightWipeOverlay)) rightContainer.removeChild(rightWipeOverlay);

            currentIndex = nextIndex;
            isTransitioning = false;
        }, 900);
    }

    // 자동 슬라이드 (3초마다)
    let autoSlideInterval = setInterval(nextImages, 3000);

    // 호버 시 일시정지
    const handleMouseEnter = () => clearInterval(autoSlideInterval);
    const handleMouseLeave = () => {
        autoSlideInterval = setInterval(nextImages, 3000);
    };

    leftContainer.addEventListener('mouseenter', handleMouseEnter);
    leftContainer.addEventListener('mouseleave', handleMouseLeave);
    rightContainer.addEventListener('mouseenter', handleMouseEnter);
    rightContainer.addEventListener('mouseleave', handleMouseLeave);

}

/**
 * 슬라이더 이미지 URL 가져오기
 */
function getSliderImages() {
    // JSON 데이터에서 이미지 가져오기
    if (window.facilitySpecialImages && window.facilitySpecialImages.length > 0) {
        // URL만 추출
        return window.facilitySpecialImages.map(img => img.url);
    }

    // 폴백: 데이터가 없으면 기본 이미지 사용
    return [
        'images/john-fornander-Id7u0EkTjBE-unsplash.jpg',
        'images/axel-bimashanda-5Re--kAsKco-unsplash.jpg',
        'images/jesse-gardner-OwWbUOIbhDY-unsplash.jpg',
        'images/ferdinand-asakome-oUdt2BJrLJE-unsplash.jpg',
        'images/prometey-sanchez-noskov-pB7e8JL5KMI-unsplash.jpg',
        'images/rosemary-media-mbHWETVlhWY-unsplash.jpg'
    ];
}