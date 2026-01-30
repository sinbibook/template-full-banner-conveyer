// Index page JavaScript
(function() {
    'use strict';

    let currentSlide = 0;
    let slides = [];
    let slideInterval;
    let progressInterval;
    let slideDuration = 3000;

    // Initialize hero slider
    function initHeroSlider() {
        const sliderContainer = document.querySelector('.hero-slider-container');
        const slider = document.querySelector('.hero-slider-container .slider');
        const prevBtn = document.querySelector('.slider-btn.prev');
        const nextBtn = document.querySelector('.slider-btn.next');

        if (!slider || !sliderContainer) {
            return;
        }

        // Clear ALL existing intervals to prevent duplicates
        if (slideInterval) {
            clearInterval(slideInterval);
            slideInterval = null;
        }

        // Reset variables
        currentSlide = 0;
        slides = [];

        // 슬라이드 생성 헬퍼 함수
        function createSlides(images) {
            slider.innerHTML = '';
            images.forEach((imageUrl, index) => {
                const slide = document.createElement('div');
                slide.className = 'slide';
                if (index === 0) slide.classList.add('active');

                const img = document.createElement('img');
                img.src = typeof imageUrl === 'object' ? imageUrl.url : imageUrl;
                img.alt = typeof imageUrl === 'object' ? imageUrl.description : `Slide ${index + 1}`;

                slide.appendChild(img);
                slider.appendChild(slide);
            });
            return slider.querySelectorAll('.slide');
        }

        // Check if hero images were set by mapper
        if (window.heroImageData && window.heroImageData.images && window.heroImageData.images.length > 0) {
            slides = createSlides(window.heroImageData.images);
        } else {
            // 이미지 없으면 mapper에서 설정한 empty-image 유지
            slides = slider.querySelectorAll('.slide');
        }

        // Verify slides are created
        if (slides.length === 0) {
            return;
        }

        // Navigation buttons
        if (prevBtn) {
            prevBtn.addEventListener('click', previousSlide);
        }
        if (nextBtn) {
            nextBtn.addEventListener('click', nextSlide);
        }

        // Delay start to ensure DOM is ready
        setTimeout(() => {
            startAutoPlay();
        }, 200);

        // 호버해도 프로그레스바 계속 진행 (호버 일시정지 기능 제거)

        // Touch swipe support for mobile (room-mapper.js와 동일한 방식)
        let touchStartX = 0;
        let touchEndX = 0;
        let touchStartY = 0;
        let touchEndY = 0;

        sliderContainer.addEventListener('touchstart', (e) => {
            touchStartX = e.changedTouches[0].screenX;
            touchStartY = e.changedTouches[0].screenY;
            touchEndX = touchStartX;
            touchEndY = touchStartY;
            stopAutoPlay();
        }, { passive: true });

        sliderContainer.addEventListener('touchmove', (e) => {
            touchEndX = e.changedTouches[0].screenX;
            touchEndY = e.changedTouches[0].screenY;

            const deltaX = Math.abs(touchStartX - touchEndX);
            const deltaY = Math.abs(touchStartY - touchEndY);

            // 수평 이동이 수직보다 크면 스크롤 방지
            if (deltaX > deltaY && deltaX > 10) {
                e.preventDefault();
            }
        }, { passive: false });

        sliderContainer.addEventListener('touchend', () => {
            const deltaX = touchStartX - touchEndX;
            const deltaY = Math.abs(touchStartY - touchEndY);

            // 가로 스와이프가 세로보다 클 때만 처리
            if (Math.abs(deltaX) > 50 && Math.abs(deltaX) > deltaY) {
                if (deltaX > 0) {
                    nextSlide();
                } else {
                    previousSlide();
                }
            }
            startAutoPlay();
        }, { passive: true });

    }

    // Next slide
    function nextSlide() {
        // 슬라이드가 없거나 하나만 있으면 실행하지 않음
        if (!slides || slides.length <= 1) {
            return;
        }

        // 현재 슬라이드 제거
        if (slides[currentSlide]) {
            slides[currentSlide].classList.remove('active');
        }

        // 다음 슬라이드로 이동
        currentSlide = (currentSlide + 1) % slides.length;

        // 새 슬라이드 활성화
        if (slides[currentSlide]) {
            slides[currentSlide].classList.add('active');
        }

        // 프로그레스바 리셋
        resetProgress();
    }

    // Previous slide
    function previousSlide() {
        if (slides.length === 0) return;

        slides[currentSlide].classList.remove('active');
        currentSlide = (currentSlide - 1 + slides.length) % slides.length;
        slides[currentSlide].classList.add('active');
        resetProgress();
    }

    // Start progress bar
    function startProgress() {
        const progressBar = document.querySelector('.progress-bar');
        if (!progressBar) return;

        // CSS 애니메이션을 사용한 방식
        progressBar.style.transition = 'none';
        progressBar.style.width = '0%';

        // 강제로 리플로우
        progressBar.offsetHeight;

        // 애니메이션 시작
        progressBar.style.transition = `width ${slideDuration}ms linear`;
        progressBar.style.width = '100%';
    }

    // Reset progress bar
    function resetProgress() {
        const progressBar = document.querySelector('.progress-bar');
        if (!progressBar) return;

        // 즉시 0으로 리셋
        progressBar.style.transition = 'none';
        progressBar.style.width = '0%';

        // 강제로 리플로우
        progressBar.offsetHeight;

        // 잠시 후 새로운 프로그레스 시작
        setTimeout(() => {
            startProgress();
        }, 50);
    }

    // Start auto-play
    function startAutoPlay() {
        // 이미 실행 중이면 중복 실행 방지
        if (slideInterval) {
            return;
        }

        // 슬라이드가 2개 이상일 때만 자동재생
        if (!slides || slides.length === 0) {
            return;
        }

        // 기존 interval 정리
        stopAutoPlay();

        // 슬라이드 전환 시작
        slideInterval = setInterval(() => {
            nextSlide();
        }, slideDuration);

        // 프로그레스바 시작
        startProgress();
    }

    // Stop auto-play
    function stopAutoPlay() {
        if (slideInterval) {
            clearInterval(slideInterval);
            slideInterval = null;
        }

        // 프로그레스바 정지
        const progressBar = document.querySelector('.progress-bar');
        if (progressBar) {
            const currentWidth = progressBar.offsetWidth;
            const containerWidth = progressBar.parentElement.offsetWidth;
            const currentPercent = (currentWidth / containerWidth) * 100;

            progressBar.style.transition = 'none';
            progressBar.style.width = currentPercent + '%';
        }
    }

    // Initialize signature thumbnails
    function initSignatureThumbnails() {
        const thumbnails = document.querySelectorAll('.signature-thumb');
        const mainImage = document.getElementById('signature-main-img');

        if (!mainImage || thumbnails.length === 0) return;

        // Sample images for signature section
        const signatureImages = [
            './images/room.jpg',
            './images/pool.jpg',
            './images/exterior.jpg',
            './images/room2.jpg'
        ];

        // Set main image
        mainImage.src = signatureImages[0];

        // Set thumbnail images and click handlers
        thumbnails.forEach((thumb, index) => {
            const img = thumb.querySelector('img');
            if (img && signatureImages[index]) {
                img.src = signatureImages[index];
                img.alt = `Signature ${index + 1}`;

                thumb.addEventListener('click', function() {
                    mainImage.src = signatureImages[index];

                    // Update active state
                    thumbnails.forEach(t => t.classList.remove('active'));
                    thumb.classList.add('active');
                });
            }
        });

        // Set first thumbnail as active
        if (thumbnails[0]) {
            thumbnails[0].classList.add('active');
        }
    }


    // Essence slider functionality
    let currentEssenceSlide = 0;
    let essenceInterval;
    let essenceDuration = 3000; // 3 seconds
    let isTransitioning = false;
    let essenceImages = []; // 이미지 배열 저장
    let essenceStarted = false; // 애니메이션 시작 여부 추가

    function initEssenceSlider() {

        // window.essenceImageData에서 이미지 배열 가져오기
        if (window.essenceImageData && window.essenceImageData.images) {
            essenceImages = window.essenceImageData.images;
        } else {
            // 폴백: 현재 설정된 이미지들을 배열로 저장
            const thumb1Img = document.querySelector('.essence-thumb[data-slide="0"] img');
            const thumb2Img = document.querySelector('.essence-thumb[data-slide="1"] img');
            const mainImg = document.querySelector('.essence-slider-container [data-essence-image]');

            if (thumb1Img && thumb2Img && mainImg) {
                essenceImages = [
                    thumb1Img.src,  // 이미지 0
                    thumb2Img.src,  // 이미지 1
                    mainImg.src     // 이미지 2
                ];
            }
        }

        // Add click listeners to thumbnails
        const thumbnails = document.querySelectorAll('.essence-thumb');
        thumbnails.forEach((thumb) => {
            thumb.addEventListener('click', () => {
                if (isTransitioning) return;

                stopEssenceAutoSlide();
                // Simply advance the circular rotation
                nextEssenceSlide();
                startEssenceAutoSlide();
            });
        });

        // Show initial state (애니메이션은 시작하지 않음)
        showEssenceSlide(0);

        // essence-image 요소의 애니메이션 완료 감지
        const essenceImage = document.querySelector('.essence-image');
        const essenceSection = document.querySelector('.essence-section');

        if (essenceImage && essenceSection) {
            // essence-image가 animate 클래스를 받았을 때 감지
            const observer = new IntersectionObserver((entries) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting && !essenceStarted) {
                        // essence-image의 fadeIn 애니메이션 delay(800ms) 후 즉시 시작
                        setTimeout(() => {
                            essenceStarted = true;
                            startEssenceAutoSlide();
                        }, 800); // fadeIn delay와 동일하게 설정
                        observer.unobserve(entry.target);
                    }
                });
            }, {
                threshold: 0.3 // 섹션의 30%가 보일 때 트리거
            });

            observer.observe(essenceImage);

            // Pause auto-sliding on hover
            essenceSection.addEventListener('mouseenter', stopEssenceAutoSlide);
            essenceSection.addEventListener('mouseleave', () => {
                if (essenceStarted) {
                    startEssenceAutoSlide();
                }
            });
        }
    }

    function showEssenceSlide(index) {
        if (isTransitioning) return;

        // 첫 번째 호출시에는 애니메이션 없이 초기화만
        if (index === 0 && currentEssenceSlide === 0) {
            return; // 이미지는 데이터 매퍼에서 설정됨
        }

        // 모든 경우에 순환 애니메이션 실행
        animateImageSwap();
    }

    function animateImageSwap() {
        isTransitioning = true;

        // 모바일에서는 순서대로 이미지 변경
        if (window.innerWidth <= 768) {
            mobileSequentialImageChange();
            return;
        }

        // Get current images (정확한 선택자 사용)
        const thumb1Img = document.querySelector('.essence-thumb[data-slide="0"] img');
        const thumb2Img = document.querySelector('.essence-thumb[data-slide="1"] img');
        const mainImg = document.querySelector('.essence-slider-container [data-essence-image]');

        // Get containers (올바른 컨테이너 선택)
        const thumb1Container = document.querySelector('.essence-thumb[data-slide="0"] .essence-thumb-container');
        const thumb2Container = document.querySelector('.essence-thumb[data-slide="1"] .essence-thumb-container');
        const mainContainer = document.querySelector('.essence-slider-container');

        // 필수 요소들이 있는지 확인
        if (!thumb1Img || !thumb2Img || !mainImg || !thumb1Container || !thumb2Container || !mainContainer) {
            isTransitioning = false;
            return;
        }

        // 이미지 배열이 준비되지 않았으면 현재 DOM에서 추출
        if (essenceImages.length === 0) {
            essenceImages = [
                thumb1Img.src,
                thumb2Img.src,
                mainImg.src
            ];
        }

        // 인덱스 증가
        currentEssenceSlide = (currentEssenceSlide + 1) % 3; // 항상 3개 이미지로 고정

        // Store current image sources
        const currentThumb1Src = thumb1Img.src;
        const currentThumb2Src = thumb2Img.src;
        const currentMainSrc = mainImg.src;

        // 컨베이어 벨트 로직: 현재 표시된 이미지들을 배열로 관리
        let currentDisplayed = [currentThumb1Src, currentThumb2Src, currentMainSrc];

        // 다음 이미지 세트 계산 (한 칸씩 이동)
        const nextDisplayed = [
            currentDisplayed[2], // 메인 → 썸네일1
            currentDisplayed[0], // 썸네일1 → 썸네일2
            currentDisplayed[1]  // 썸네일2 → 메인
        ];

        // 새로운 이미지 소스들
        const newThumb1Src = nextDisplayed[0];
        const newThumb2Src = nextDisplayed[1];
        const newMainSrc = nextDisplayed[2];

        // 실제 메인 컨테이너 찾기
        const actualMainContainer = mainImg.parentElement;

        // 모든 컨테이너에 적절한 스타일 설정
        [thumb1Container, thumb2Container, actualMainContainer].forEach(container => {
            container.style.overflow = 'hidden';
            container.style.position = 'relative';
        });

        // 먼저 실제 이미지를 즉시 교체 (깜박임 제거)
        thumb1Img.src = newThumb1Src;
        thumb2Img.src = newThumb2Src;
        mainImg.src = newMainSrc;

        // wipe 효과를 위한 오버레이 생성 (이전 이미지로)
        const wipeOverlay1 = document.createElement('div');
        wipeOverlay1.style.cssText = `
            position: absolute;
            top: 0;
            right: 0;
            width: 100%;
            height: 100%;
            background: url('${currentThumb1Src}') center/cover;
            border-radius: 0;
            z-index: 15;
            transition: width 0.8s ease-in-out;
        `;

        const wipeOverlay2 = document.createElement('div');
        wipeOverlay2.style.cssText = `
            position: absolute;
            top: 0;
            right: 0;
            width: 100%;
            height: 100%;
            background: url('${currentThumb2Src}') center/cover;
            border-radius: 0;
            z-index: 15;
            transition: width 0.8s ease-in-out;
        `;

        const wipeOverlayMain = document.createElement('div');
        wipeOverlayMain.style.cssText = `
            position: absolute;
            top: 0;
            right: 0;
            width: 100%;
            height: 100%;
            background: url('${currentMainSrc}') center/cover;
            border-radius: 0;
            z-index: 15;
            transition: width 0.8s ease-in-out;
        `;

        // 오버레이 추가
        thumb1Container.appendChild(wipeOverlay1);
        thumb2Container.appendChild(wipeOverlay2);
        actualMainContainer.appendChild(wipeOverlayMain);

        // wipe 애니메이션 시작
        requestAnimationFrame(() => {
            wipeOverlay1.style.width = '0';
            wipeOverlay2.style.width = '0';
            wipeOverlayMain.style.width = '0';
        });

        // 애니메이션 완료 후 정리
        setTimeout(() => {
            // 오버레이 제거
            if (thumb1Container.contains(wipeOverlay1)) thumb1Container.removeChild(wipeOverlay1);
            if (thumb2Container.contains(wipeOverlay2)) thumb2Container.removeChild(wipeOverlay2);
            if (actualMainContainer.contains(wipeOverlayMain)) actualMainContainer.removeChild(wipeOverlayMain);

            isTransitioning = false;
        }, 850); // 0.8초 애니메이션 + 여유시간
    }



    function mobileSequentialImageChange() {
        // 모바일에서 세 개의 이미지를 순서대로 wipe 효과로 변경
        const mainImg = document.querySelector('.essence-slider-container [data-essence-image]');
        const mainContainer = document.querySelector('.essence-slider-container');

        // 이미지 배열 다시 수집 (사용자 업로드 이미지 포함)
        if (!essenceImages || essenceImages.length === 0) {
            // window.essenceImageData에서 사용자 업로드 이미지 가져오기
            if (window.essenceImageData && window.essenceImageData.images) {
                essenceImages = window.essenceImageData.images;
            } else {
                // DOM에서 현재 이미지들 추출
                const thumb1Img = document.querySelector('.essence-thumb[data-slide="0"] img');
                const thumb2Img = document.querySelector('.essence-thumb[data-slide="1"] img');
                if (thumb1Img && thumb2Img && mainImg) {
                    essenceImages = [thumb1Img.src, thumb2Img.src, mainImg.src];
                }
            }
        }

        if (!mainImg || !mainContainer || !essenceImages || essenceImages.length === 0) {
            isTransitioning = false;
            return;
        }

        // 다음 이미지 인덱스 계산 (배열 길이에 맞춤)
        currentEssenceSlide = (currentEssenceSlide + 1) % essenceImages.length;

        // 현재 이미지 저장
        const currentSrc = mainImg.src;
        const newSrc = essenceImages[currentEssenceSlide];

        // 컨테이너 설정
        mainContainer.style.overflow = 'hidden';
        mainContainer.style.position = 'relative';

        // 새 이미지로 즉시 교체
        mainImg.src = newSrc;

        // wipe 효과를 위한 오버레이 생성 (이전 이미지로)
        const wipeOverlay = document.createElement('div');
        wipeOverlay.style.cssText = `
            position: absolute;
            top: 0;
            right: 0;
            width: 100%;
            height: 100%;
            background: url('${currentSrc}') center/cover;
            border-radius: 0;
            z-index: 15;
            transition: width 0.8s ease-in-out;
        `;

        // 오버레이 추가
        mainContainer.appendChild(wipeOverlay);

        // wipe 애니메이션 시작
        requestAnimationFrame(() => {
            wipeOverlay.style.width = '0';
        });

        // 애니메이션 완료 후 정리
        setTimeout(() => {
            // 오버레이 제거
            if (mainContainer.contains(wipeOverlay)) {
                mainContainer.removeChild(wipeOverlay);
            }
            isTransitioning = false;
        }, 850); // 0.8초 애니메이션 + 여유시간
    }

    function nextEssenceSlide() {
        showEssenceSlide(currentEssenceSlide + 1);
    }

    function startEssenceAutoSlide() {
        stopEssenceAutoSlide(); // Clear any existing interval
        essenceInterval = setInterval(nextEssenceSlide, essenceDuration);
    }

    function stopEssenceAutoSlide() {
        if (essenceInterval) {
            clearInterval(essenceInterval);
            essenceInterval = null;
        }
    }

    // Initialize closing section background - 이제 index-mapper.js에서 JSON 데이터로 처리
    function initClosingSection() {
        // 하드코딩 제거 - index-mapper.js의 mapClosingSection()에서 처리
    }

    // Initialize scroll animations
    let scrollAnimations;

    function initScrollAnimations() {
        // ScrollAnimations 클래스가 로드될 때까지 더 안정적으로 대기
        if (typeof ScrollAnimations === 'undefined') {
            // 최대 5초까지 대기하되, 100ms마다 체크
            let attempts = 0;
            const maxAttempts = 50; // 5초

            const checkInterval = setInterval(() => {
                attempts++;
                if (typeof ScrollAnimations !== 'undefined') {
                    clearInterval(checkInterval);
                    initScrollAnimations();
                } else if (attempts >= maxAttempts) {
                    clearInterval(checkInterval);
                    console.warn('ScrollAnimations class not loaded, using fallback');
                    // ScrollAnimations가 로드되지 않았을 때 수동으로 애니메이션 클래스 추가
                    initFallbackAnimations();
                }
            }, 100);
            return;
        }

        // 기존 observer 파괴
        if (scrollAnimations && typeof scrollAnimations.destroy === 'function') {
            scrollAnimations.destroy();
        }

        scrollAnimations = new ScrollAnimations({
            threshold: 0.1,
            rootMargin: '0px 0px -50px 0px'
        });


        // 모바일 감지
        const isMobile = window.innerWidth <= 768;

        let animations = [];

        if (isMobile) {
            // 모바일: 섹션별 간단한 fadeUp 애니메이션
            animations = [
                {
                    type: 'fadeUp',
                    selector: '.hero-text-content',
                    options: { delay: 0 }
                },
                {
                    type: 'fadeUp',
                    selector: '.essence-content',
                    options: { delay: 200 }
                },
                {
                    type: 'fadeUp',
                    selector: '.rooms-container',
                    options: { delay: 200 }
                },
                {
                    type: 'fadeUp',
                    selector: '.gallery-container',
                    options: { delay: 200 }
                },
                // 클로징 섹션은 한번에
                {
                    type: 'fadeUp',
                    selector: '.closing-content',
                    options: { delay: 200 }
                }
            ];
        } else {
            // 데스크탑: 기존 세밀한 애니메이션
            animations = [
                // 히어로 영역: 숙소명, 타이틀, 설명이 순차적으로 아래에서 등장
                {
                    type: 'slideUp',
                    selector: '.hero-property-name',
                    options: { delay: 0 }
                },
                {
                    type: 'slideUp',
                    selector: '.hero-title',
                    options: { delay: 600 }
                },
                {
                    type: 'slideUp',
                    selector: '.hero-description',
                    options: { delay: 1200 }
                },
                // Essence 섹션: 영문명은 왼쪽에서, 타이틀/설명은 아래에서, 이미지들은 제자리에서 등장
                {
                    type: 'slideRight',
                    selector: '.property-name-en',
                    options: { delay: 0 }
                },
                {
                    type: 'slideUp',
                    selector: '.essence-title',
                    options: { delay: 200 }
                },
                {
                    type: 'slideUp',
                    selector: '.essence-description',
                    options: { delay: 400 }
                },
                {
                    type: 'fadeIn',
                    selector: '.essence-thumbnails',
                    options: { delay: 600 }
                },
                {
                    type: 'fadeIn',
                    selector: '.essence-image',
                    options: { delay: 800 }
                },
                // Rooms 섹션: 타이틀은 왼쪽에서, 객실들은 페이드인
                {
                    type: 'slideRight',
                    selector: '.rooms-title',
                    options: { delay: 0 }
                },
                // room-item은 스크롤 애니메이션 제거 - 항상 보이도록 설정
                // Gallery 섹션: 섹션 타이틀은 오른쪽에서, 제목/설명은 위로, 이미지들은 하나씩 페이드인
                {
                    type: 'slideLeft',
                    selector: '.gallery-section-title',
                    options: { delay: 0 }
                },
                {
                    type: 'slideUp',
                    selector: '.gallery-title',
                    options: { delay: 200 }
                },
                {
                    type: 'slideUp',
                    selector: '.gallery-description',
                    options: { delay: 400 }
                },
                // gallery-item들도 스크롤 애니메이션 제거 - 항상 보이도록 설정
                // 클로징 영역: 타이틀, 설명이 순차적으로 아래에서 위로 등장
                {
                    type: 'slideUp',
                    selector: '.closing-title',
                    options: { delay: 0 }
                },
                {
                    type: 'slideUp',
                    selector: '.closing-description',
                    options: { delay: 600 }
                }
            ];
        }

        scrollAnimations.registerAnimations(animations);
    }

    // ScrollAnimations 클래스가 로드되지 않았을 때의 대체 애니메이션
    function initFallbackAnimations() {

        // 스크롤 애니메이션이 필요한 요소들만 관리 (room-item, gallery-item 제외)
        const elementsToAnimate = [
            { selector: '.rooms-title', className: 'animate-slide-right' },
            { selector: '.gallery-section-title', className: 'animate-slide-left' },
            { selector: '.gallery-title', className: 'animate-slide-up' },
            { selector: '.gallery-description', className: 'animate-slide-up' }
        ];

        // Intersection Observer 지원 여부 확인
        if (!window.IntersectionObserver) {
            // IntersectionObserver가 지원되지 않으면 모든 요소를 즉시 표시
            elementsToAnimate.forEach(item => {
                const elements = document.querySelectorAll(item.selector);
                elements.forEach(el => el.classList.add(item.className));
            });
            return;
        }

        // 각 요소 타입별로 Observer 생성
        elementsToAnimate.forEach(item => {
            const elements = document.querySelectorAll(item.selector);
            if (elements.length === 0) return;

            const observer = new IntersectionObserver((entries) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        entry.target.classList.add(item.className);
                        observer.unobserve(entry.target);
                    }
                });
            }, {
                threshold: 0.1,
                rootMargin: '0px 0px -50px 0px'
            });

            elements.forEach(el => observer.observe(el));
        });
    }

    // New Rooms Slider functionality - Hero slider style with active classes
    let currentRoomIndex = 0;
    let totalRooms = 0;
    let roomItems = [];

    function initRoomsSlider() {
        const roomsGrid = document.querySelector('.rooms-grid');
        if (!roomsGrid) return;

        // Get room items (no DOM restructuring needed)
        roomItems = Array.from(roomsGrid.querySelectorAll('.room-item'));
        totalRooms = roomItems.length;

        if (totalRooms === 0) return;

        // Initialize positions with active classes (hero slider style)
        updateRoomPositions();

        // Add navigation arrows to the active (center) room only
        setupNavigationButtons();

        // Set initial button states
        updateNavigationButtons();
    }

    function setupNavigationButtons() {
        const roomsContainer = document.querySelector('.rooms-container');
        if (!roomsContainer) return;

        // Create prev button
        const prevBtn = document.createElement('button');
        prevBtn.className = 'rooms-nav-btn rooms-nav-prev';
        prevBtn.innerHTML = `
            <span class="nav-symbol">‹</span>
            <span class="nav-text">prev</span>
        `;

        // Create next button
        const nextBtn = document.createElement('button');
        nextBtn.className = 'rooms-nav-btn rooms-nav-next';
        nextBtn.innerHTML = `
            <span class="nav-symbol">›</span>
            <span class="nav-text">next</span>
        `;

        // Add event listeners
        prevBtn.addEventListener('click', moveToPrevRoom);
        nextBtn.addEventListener('click', moveToNextRoom);

        // Append buttons directly to rooms container
        roomsContainer.appendChild(prevBtn);
        roomsContainer.appendChild(nextBtn);
    }

    function moveToPrevRoom() {
        if (currentRoomIndex === 0) return; // Don't move if at first room
        currentRoomIndex = (currentRoomIndex - 1 + totalRooms) % totalRooms;
        updateRoomPositions();
    }

    function moveToNextRoom() {
        if (currentRoomIndex === totalRooms - 1) return; // Don't move if at last room
        currentRoomIndex = (currentRoomIndex + 1) % totalRooms;
        updateRoomPositions();
    }

    function updateNavigationButtons() {
        const prevBtn = document.querySelector('.rooms-nav-prev');
        const nextBtn = document.querySelector('.rooms-nav-next');

        if (!prevBtn || !nextBtn) return;

        // Remove disabled class from both buttons
        prevBtn.classList.remove('disabled');
        nextBtn.classList.remove('disabled');

        // Add disabled class if at first/last room
        if (currentRoomIndex === 0) {
            prevBtn.classList.add('disabled');
        }
        if (currentRoomIndex === totalRooms - 1) {
            nextBtn.classList.add('disabled');
        }
    }

    function updateRoomPositions() {
        if (!roomItems.length) return;

        // First fade out current room
        roomItems.forEach(room => {
            if (room.classList.contains('active')) {
                room.style.opacity = '0';
            }
        });

        // After fade out, switch rooms and fade in
        setTimeout(() => {
            // Remove all state classes from all rooms
            roomItems.forEach(room => {
                room.classList.remove('active', 'next', 'prev', 'hidden');
            });

            // Apply active class system like hero slider
            roomItems.forEach((room, index) => {
                // Calculate position relative to current index
                const position = (index - currentRoomIndex + totalRooms) % totalRooms;

                // Apply appropriate class based on position
                if (position === 0) {
                    room.classList.add('active');
                    // Fade in the new active room
                    setTimeout(() => {
                        room.style.opacity = '1';
                    }, 50);
                } else if (position === 1) {
                    room.classList.add('next');
                } else if (position === totalRooms - 1) {
                    room.classList.add('prev');
                } else {
                    room.classList.add('hidden');
                }
            });

            // Update navigation button states
            updateNavigationButtons();
        }, 300); // Wait for fade out
    }

    // Drag functionality removed - using navigation buttons only

    // Initialize all components when DOM is loaded
    let isInitialized = false;

    function initializeAll() {
        if (isInitialized) return;
        isInitialized = true;

        // 초기화 순서 보장
        setTimeout(() => {
            initHeroSlider();
            initRoomsSlider();
        }, 100);

        initSignatureThumbnails();
        initEssenceSlider();
        initClosingSection();
        initScrollAnimations();
    }

    // 전역 노출 (preview-handler와 mapper에서 사용)
    window.initHeroSlider = initHeroSlider;
    window.initEssenceSlider = initEssenceSlider;
    window.initRoomsSlider = initRoomsSlider;
    window.initScrollAnimations = initScrollAnimations;

    // Try multiple initialization strategies for better compatibility
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', function() {
            setTimeout(initializeAll, 100);
        });
    } else {
        // DOM is already loaded
        setTimeout(initializeAll, 100);
    }

    // Fallback: Also try on window load
    window.addEventListener('load', function() {
        if (!isInitialized) {
            setTimeout(initializeAll, 200);
        }
    });

    // Initialize infinite gallery slider
    function initInfiniteGallery() {
        const galleryGrid = document.querySelector('.gallery-grid');
        if (!galleryGrid) return;

        const originalItems = galleryGrid.querySelectorAll('.gallery-item');
        if (originalItems.length === 0) return;

        // Clone items to create infinite effect
        const itemsToClone = Math.ceil(window.innerWidth / 320) + originalItems.length;

        for (let i = 0; i < itemsToClone; i++) {
            const itemToClone = originalItems[i % originalItems.length];
            const clonedItem = itemToClone.cloneNode(true);
            galleryGrid.appendChild(clonedItem);
        }
    }

    // Gallery Auto Slider
    function initGalleryAutoSlider() {
        const galleryGrid = document.querySelector('.gallery-grid');
        if (!galleryGrid) return;

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

        // 마우스 오버 시 자동 슬라이드 정지
        galleryGrid.addEventListener('mouseenter', stopAutoSlide);
        galleryGrid.addEventListener('mouseleave', startAutoSlide);

        // 터치 시작 시 자동 슬라이드 정지
        galleryGrid.addEventListener('touchstart', stopAutoSlide);
        galleryGrid.addEventListener('touchend', () => {
            // 터치 후 3초 뒤 다시 시작
            setTimeout(startAutoSlide, 3000);
        });

        // 스크롤 이벤트로 현재 위치 추적
        galleryGrid.addEventListener('scroll', () => {
            const scrollLeft = galleryGrid.scrollLeft;
            const itemWidth = galleryItems[0].offsetWidth + 20;
            currentIndex = Math.round(scrollLeft / itemWidth);
        });

        // 갤러리가 화면에 보일 때 자동 슬라이드 시작
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    startAutoSlide();
                } else {
                    stopAutoSlide();
                }
            });
        }, {
            threshold: 0.3
        });

        observer.observe(galleryGrid);
    }

    // IndexMapper 완료 후 히어로 슬라이더와 갤러리 재초기화
    window.addEventListener('mapperReady', function() {
        initHeroSlider();
        initGalleryAutoSlider();
        setTimeout(initInfiniteGallery, 500); // 갤러리 이미지 로드 후 복제
    });

})();