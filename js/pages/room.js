// Room 페이지 JavaScript
(function() {
    'use strict';

    document.addEventListener('DOMContentLoaded', function() {
        // 썸네일 상호작용 설정
        setupRoomThumbnailInteraction();

        // Hero 슬라이더 초기화
        setTimeout(() => {
            initRoomHeroSlider();
        }, 100);

        // Gallery 초기화 (index.html 스타일)
        setTimeout(() => {
            initInfiniteGallery(); // 무한 갤러리 복제
            setTimeout(() => {
                initGalleryAutoSlider(); // 자동 슬라이딩 갤러리
            }, 100);
        }, 200);

        // 스크롤 애니메이션 초기화 (데이터 로드 후 실행)
        setTimeout(() => {
            initRoomScrollAnimations();
            initParallaxEffect();
            setupSectionToggles();
        }, 500);
    });

    function initRoomHeroSlider() {
        const slider = document.querySelector('[data-room-slider]');
        if (!slider) {
            return;
        }

        // 이미 초기화되었는지 확인 (중복 방지)
        if (slider.dataset.sliderInitialized === 'true') {
            return;
        }

        const slides = slider.querySelectorAll('.room-slide');
        const prevBtn = document.querySelector('.slider-btn.prev');
        const nextBtn = document.querySelector('.slider-btn.next');
        const progressBar = document.querySelector('.progress-bar');

        if (!slides.length) {
            return;
        }

        let currentSlideIndex = 0;
        let animationId;
        let animationStartTime = null;
        const SLIDE_DURATION = 4000; // 4초

        function showSlide(index) {
            slides.forEach((slide, i) => {
                slide.classList.remove('active', 'hidden');
                if (i === index) {
                    slide.classList.add('active');
                } else {
                    slide.classList.add('hidden');
                }
            });

            // Progress bar 리셋하고 애니메이션 시작
            if (progressBar) {
                progressBar.style.width = '0%';
                animationStartTime = null;
                startProgressAnimation();
            }
        }

        function startProgressAnimation() {
            function animate(timestamp) {
                if (!animationStartTime) animationStartTime = timestamp;

                const elapsed = timestamp - animationStartTime;
                const progress = Math.min((elapsed / SLIDE_DURATION) * 100, 100);

                if (progressBar) {
                    progressBar.style.width = progress + '%';
                }

                if (progress >= 100) {
                    // 슬라이드 전환
                    nextSlide();
                    return;
                }

                animationId = requestAnimationFrame(animate);
            }

            if (animationId) {
                cancelAnimationFrame(animationId);
            }
            animationId = requestAnimationFrame(animate);
        }

        function nextSlide() {
            currentSlideIndex = (currentSlideIndex + 1) % slides.length;
            showSlide(currentSlideIndex);
        }

        function prevSlide() {
            currentSlideIndex = (currentSlideIndex - 1 + slides.length) % slides.length;
            showSlide(currentSlideIndex);
        }

        // Event listeners
        if (nextBtn) {
            nextBtn.addEventListener('click', () => {
                if (animationId) {
                    cancelAnimationFrame(animationId);
                }
                nextSlide();
            });
        }

        if (prevBtn) {
            prevBtn.addEventListener('click', () => {
                if (animationId) {
                    cancelAnimationFrame(animationId);
                }
                prevSlide();
            });
        }

        // Touch support
        let touchStartX = 0;
        slider.addEventListener('touchstart', (e) => {
            touchStartX = e.touches[0].clientX;
            stopAutoSlide();
        });

        slider.addEventListener('touchend', (e) => {
            const touchEndX = e.changedTouches[0].clientX;
            const diff = touchStartX - touchEndX;

            if (Math.abs(diff) > 50) {
                if (diff > 0) {
                    if (animationId) {
                        cancelAnimationFrame(animationId);
                    }
                    nextSlide();
                } else {
                    if (animationId) {
                        cancelAnimationFrame(animationId);
                    }
                    prevSlide();
                }
            }
        });

        // Initialize
        showSlide(0);

        // Mark as initialized
        slider.dataset.sliderInitialized = 'true';
    }

    // Gallery Auto Slider (index.html 스타일)
    // index.html과 동일한 무한 갤러리 기능
    function initInfiniteGallery() {
        const galleryGrid = document.querySelector('[data-room-gallery]');
        if (!galleryGrid) return;

        const originalItems = galleryGrid.querySelectorAll('.gallery-item');
        if (originalItems.length === 0) return;

        // Clone items to create infinite effect - 3배로 복제해서 부드러운 전환
        const totalClones = originalItems.length * 3;

        for (let i = 0; i < totalClones; i++) {
            const itemToClone = originalItems[i % originalItems.length];
            const clonedItem = itemToClone.cloneNode(true);
            galleryGrid.appendChild(clonedItem);
        }
    }

    function initGalleryAutoSlider() {
        const galleryGrid = document.querySelector('[data-room-gallery]');
        if (!galleryGrid) return;

        // 매핑된 갤러리 아이템들 확인
        const galleryItems = galleryGrid.querySelectorAll('.gallery-item');
        if (galleryItems.length <= 1) return;

        let currentIndex = 0;
        let autoSlideInterval;
        const slideInterval = 4000; // 4초마다 자동 슬라이드

        function scrollToItem(index) {
            if (!galleryItems[index]) return;

            const itemWidth = galleryItems[index].offsetWidth + 20; // gap 포함
            const scrollPosition = index * itemWidth;

            galleryGrid.scrollTo({
                left: scrollPosition,
                behavior: 'smooth'
            });
        }

        function nextSlide() {
            currentIndex = (currentIndex + 1) % galleryItems.length;
            scrollToItem(currentIndex);
        }

        function startAutoSlide() {
            autoSlideInterval = setInterval(nextSlide, slideInterval);
        }

        function stopAutoSlide() {
            if (autoSlideInterval) {
                clearInterval(autoSlideInterval);
                autoSlideInterval = null;
            }
        }

        // 마우스 오버 시 자동 슬라이드 정지 (index.html과 동일)
        galleryGrid.addEventListener('mouseenter', stopAutoSlide);
        galleryGrid.addEventListener('mouseleave', startAutoSlide);

        // 터치 시작 시 자동 슬라이드 정지 (index.html과 동일)
        galleryGrid.addEventListener('touchstart', stopAutoSlide);
        galleryGrid.addEventListener('touchend', () => {
            // 터치 후 3초 뒤 다시 시작
            setTimeout(startAutoSlide, 3000);
        });

        // 자동 슬라이드 시작
        startAutoSlide();

        // 화면 크기 변경 시 재조정
        window.addEventListener('resize', () => {
            scrollToItem(currentIndex);
        });

    }

    /**
     * 객실 썸네일 상호작용 설정
     */
    function setupRoomThumbnailInteraction() {
        const thumbnails = document.querySelectorAll('.room-thumb');
        const mainImg = document.getElementById('room-main-img');

        if (!mainImg || thumbnails.length === 0) return;

        thumbnails.forEach((thumb) => {
            thumb.addEventListener('click', function() {
                // 모든 썸네일의 active 클래스 제거
                thumbnails.forEach(t => t.classList.remove('active'));

                // 현재 썸네일에 active 클래스 추가
                this.classList.add('active');

                // 메인 이미지 업데이트
                const thumbImg = this.querySelector('img');
                if (thumbImg && thumbImg.src) {
                    mainImg.src = thumbImg.src;
                    mainImg.alt = thumbImg.alt;
                }
            });
        });
    }

    /**
     * 섹션 토글 기능 설정
     */
    function setupSectionToggles() {
        const toggleBtns = document.querySelectorAll('.section-toggle-btn');

        toggleBtns.forEach(btn => {
            btn.addEventListener('click', function() {
                const targetName = this.getAttribute('data-toggle');
                const content = document.querySelector(`[data-content="${targetName}"]`);
                const minusIcon = this.querySelector('.toggle-minus');
                const plusIcon = this.querySelector('.toggle-plus');

                if (content) {
                    const isHidden = content.style.display === 'none' || !content.style.display;

                    if (isHidden) {
                        // Show content
                        content.style.display = 'block';
                        if (minusIcon) minusIcon.style.display = 'inline';
                        if (plusIcon) plusIcon.style.display = 'none';
                    } else {
                        // Hide content
                        content.style.display = 'none';
                        if (minusIcon) minusIcon.style.display = 'none';
                        if (plusIcon) plusIcon.style.display = 'inline';
                    }
                }
            });
        });
    }

    /**
     * 스크롤 애니메이션 초기화
     */
    function initRoomScrollAnimations() {
        const animateElements = document.querySelectorAll('.animate-on-scroll');

        const observerOptions = {
            threshold: 0.1,
            rootMargin: '0px 0px -50px 0px'
        };

        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('visible');
                }
            });
        }, observerOptions);

        animateElements.forEach(element => {
            observer.observe(element);
        });
    }

    /**
     * 패럴랙스 효과
     */
    function initParallaxEffect() {
        const parallaxElements = document.querySelectorAll('[data-parallax]');

        if (parallaxElements.length === 0) return;

        function updateParallax() {
            const scrolled = window.pageYOffset;

            parallaxElements.forEach(element => {
                const rate = scrolled * -0.5;
                element.style.transform = `translateY(${rate}px)`;
            });
        }

        window.addEventListener('scroll', updateParallax);
    }

    // 전역 노출 (필요시)
    window.initRoomHeroSlider = initRoomHeroSlider;
    window.setupRoomThumbnailInteraction = setupRoomThumbnailInteraction;
    window.initRoomScrollAnimations = initRoomScrollAnimations;
    window.initParallaxEffect = initParallaxEffect;
    window.setupSectionToggles = setupSectionToggles;

})();