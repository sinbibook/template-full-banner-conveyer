/**
 * Index Page Data Mapper
 * Extends BaseDataMapper for Index page specific mappings
 */
class IndexMapper extends BaseDataMapper {
    constructor() {
        super();
    }

    /**
     * 메인 매핑 메서드
     */
    async mapPage() {
        if (!this.isDataLoaded) return;

        try {
            // SEO 메타 태그 업데이트
            this.updateMetaTags();

            // 각 섹션 매핑
            this.mapHeroSection();
            this.mapEssenceSection();
            this.mapSignatureSection();
            this.mapRoomsSection();
            this.mapGallerySection();
            this.mapClosingSection();

            // E-commerce 등록번호 매핑 (footer)
            this.mapEcommerceRegistration();

            // 애니메이션 재초기화
            this.reinitializeScrollAnimations();

            // 슬라이더 재초기화
            this.reinitializeSliders();

        } catch (error) {
        }
    }

    /**
     * 슬라이더 재초기화
     */
    reinitializeSliders() {
        // Hero 슬라이더 재초기화
        if (typeof window.initHeroSlider === 'function') {
            window.initHeroSlider();
        }

        // Essence 슬라이더는 initEssenceImages에서 초기화됨

        // Gallery 슬라이더 재초기화
        if (typeof window.setupInfiniteSlider === 'function') {
            const gallerySlider = document.querySelector('.gallery-slider');
            if (gallerySlider && gallerySlider.querySelectorAll('.gallery-item').length > 0) {
                window.setupInfiniteSlider();
                if (typeof window.setupDragAndSwipe === 'function') {
                    window.setupDragAndSwipe();
                }
            }
        }

        // Signature 섹션 재초기화 (썸네일 클릭 이벤트)
        this.initSignatureInteraction();
    }

    /**
     * Signature 섹션 인터랙션 초기화
     */
    initSignatureInteraction() {
        const signatureData = this.safeGet(this.data, 'homepage.customFields.pages.index.sections.0.signature');
        if (!signatureData || !signatureData.images) return;

        const selectedImages = signatureData.images
            .filter(img => img.isSelected === true)
            .sort((a, b) => a.sortOrder - b.sortOrder)
            .slice(0, 4);

        if (selectedImages.length === 0) return;

        const mainImg = this.safeSelect('[data-signature-main-img]');
        const description = this.safeSelect('[data-signature-description]');
        const thumbnails = this.safeSelectAll('.signature-thumb');

        if (!mainImg || !description || thumbnails.length === 0) return;

        // 초기 활성 썸네일 설정
        thumbnails[0]?.classList.add('active');

        // 썸네일 클릭 이벤트
        thumbnails.forEach((thumb, index) => {
            if (!selectedImages[index]) return;

            thumb.addEventListener('click', () => {
                // 모든 썸네일에서 active 클래스 제거
                thumbnails.forEach(t => t.classList.remove('active'));

                // 클릭된 썸네일에 active 클래스 추가
                thumb.classList.add('active');

                const imgData = selectedImages[index];

                // 페이드 아웃
                mainImg.style.opacity = '0';

                setTimeout(() => {
                    // 이미지와 설명 변경
                    mainImg.src = imgData.url;
                    mainImg.alt = this.sanitizeText(imgData.description, 'Signature Image');
                    description.innerHTML = this._formatTextWithLineBreaks(imgData.description);

                    // 페이드 인
                    mainImg.style.opacity = '1';
                }, 250);
            });
        });
    }

    // ============================================================================
    // 🎯 HERO SECTION MAPPING
    // ============================================================================

    /**
     * Hero Section 매핑 (메인 소개 섹션)
     */
    mapHeroSection() {
        const heroData = this.safeGet(this.data, 'homepage.customFields.pages.index.sections.0.hero');
        if (!heroData) return;

        // 숙소 서브타이틀 매핑
        const subtitle = this.safeGet(this.data, 'property.subtitle');
        const subtitleElement = this.safeSelect('[data-hero-subtitle]');
        if (subtitleElement && subtitle) {
            subtitleElement.textContent = this.sanitizeText(subtitle);
        }

        // 숙소 영문명 매핑
        const propertyNameEn = this.safeGet(this.data, 'property.nameEn');
        const heroPropertyNameEn = this.safeSelect('[data-hero-property-name-en]');
        if (heroPropertyNameEn && propertyNameEn) {
            heroPropertyNameEn.textContent = this.sanitizeText(propertyNameEn);
        }

        // 메인 소개 타이틀 매핑
        const heroTitleElement = this.safeSelect('[data-hero-title]');
        if (heroTitleElement) {
            heroTitleElement.textContent = this.sanitizeText(heroData?.title, '메인 히어로 타이틀');
        }

        // 메인 소개 설명 매핑
        const heroDescElement = this.safeSelect('[data-hero-description]');
        if (heroDescElement) {
            heroDescElement.innerHTML = this._formatTextWithLineBreaks(heroData?.description, '메인 히어로 설명');
        }

        // 히어로 슬라이더 이미지 매핑
        if (heroData.images && Array.isArray(heroData.images)) {
            this.mapHeroSlider(heroData.images);
        }
    }

    /**
     * Hero Slider 이미지 매핑
     */
    mapHeroSlider(images) {
        const sliderContainer = this.safeSelect('[data-hero-slider]');
        if (!sliderContainer) return;

        // isSelected가 true인 이미지만 필터링하고 sortOrder로 정렬
        const selectedImages = images
            .filter(img => img.isSelected === true)
            .sort((a, b) => a.sortOrder - b.sortOrder);

        // 슬라이더 초기화
        sliderContainer.innerHTML = '';

        if (selectedImages.length === 0) {
            // 이미지가 없을 경우 placeholder 슬라이드 추가
            const slideDiv = document.createElement('div');
            slideDiv.className = 'hero-slide active';

            const imgElement = document.createElement('img');
            // ImageHelpers.applyPlaceholder(imgElement);
            imgElement.src = './images/hero.jpg';
            imgElement.alt = 'Placeholder';

            slideDiv.appendChild(imgElement);
            sliderContainer.appendChild(slideDiv);
            return;
        }

        // 이미지 생성
        selectedImages.forEach((img, index) => {
            const slideDiv = document.createElement('div');
            slideDiv.className = 'hero-slide';
            if (index === 0) {
                slideDiv.classList.add('active');
            }

            const imgElement = document.createElement('img');
            imgElement.src = img.url;
            imgElement.alt = this.sanitizeText(img.description, '히어로 이미지');
            imgElement.loading = index === 0 ? 'eager' : 'lazy';

            slideDiv.appendChild(imgElement);
            sliderContainer.appendChild(slideDiv);
        });
    }

    // ============================================================================
    // 💎 ESSENCE SECTION MAPPING
    // ============================================================================

    /**
     * Essence Section 매핑 (핵심 메시지 섹션)
     */
    mapEssenceSection() {
        const essenceData = this.safeGet(this.data, 'homepage.customFields.pages.index.sections.0.essence');
        if (!essenceData) return;

        // 숙소 영문명 매핑
        const propertyNameEn = this.safeGet(this.data, 'property.nameEn');
        const propertyNameElement = this.safeSelect('[data-property-name-en]');
        if (propertyNameElement && propertyNameEn) {
            propertyNameElement.textContent = this.sanitizeText(propertyNameEn);
        }

        // 타이틀 매핑
        const titleElement = this.safeSelect('[data-essence-title]');
        if (titleElement) {
            titleElement.textContent = this.sanitizeText(essenceData?.title, '특징 섹션 타이틀');
        }

        // 설명 매핑
        const descElement = this.safeSelect('[data-essence-description]');
        if (descElement) {
            descElement.innerHTML = this._formatTextWithLineBreaks(essenceData?.description, '특징 섹션 설명');
        }

        // 이미지 매핑 - 3개 이미지 순환 슬라이더용
        this.initEssenceImages(essenceData.images || []);
    }

    /**
     * Essence 이미지 초기화 (갯수 제한 없음)
     */
    initEssenceImages(images) {
        // 선택된 이미지 필터링 및 정렬 (갯수 제한 제거)
        const selectedImages = images
            .filter(img => img.isSelected === true && img.isVisible !== false)
            .sort((a, b) => a.sortOrder - b.sortOrder);

        // 기본 이미지 설정 (최소 3개는 보장)
        const defaultImages = [
            './images/pool.jpg',
            './images/sky.jpg',
            './images/shadow.jpg'
        ];

        // 최종 이미지 배열 생성
        let finalImages;
        if (selectedImages.length === 0) {
            finalImages = defaultImages;
        } else if (selectedImages.length === 1) {
            // 1개만 있으면 그 이미지를 반복 + 기본 이미지 추가
            finalImages = [
                selectedImages[0].url,
                defaultImages[1],
                defaultImages[2]
            ];
        } else if (selectedImages.length === 2) {
            // 2개만 있으면 + 기본 이미지 1개 추가
            finalImages = [
                selectedImages[0].url,
                selectedImages[1].url,
                defaultImages[2]
            ];
        } else {
            // 3개 이상이면 모두 사용
            finalImages = selectedImages.map(img => img.url);
        }

        // window에 이미지 데이터 저장 (index.js에서 사용)
        window.essenceImageData = {
            images: finalImages,
            descriptions: selectedImages.length >= 3
                ? selectedImages.map(img => img.description || '')
                : ['', '', '']
        };

        // 초기 이미지 설정 (첫 3개만 HTML에 설정)
        const mainImg = this.safeSelect('[data-essence-image]');
        const thumb1 = this.safeSelect('.essence-thumb[data-slide="0"] img');
        const thumb2 = this.safeSelect('.essence-thumb[data-slide="1"] img');

        if (mainImg && finalImages.length > 2) {
            mainImg.src = finalImages[2];
            mainImg.alt = selectedImages[2]?.description || 'Essence Image';
        }
        if (thumb1 && finalImages.length > 0) {
            thumb1.src = finalImages[0];
            thumb1.alt = selectedImages[0]?.description || 'Thumbnail 1';
        }
        if (thumb2 && finalImages.length > 1) {
            thumb2.src = finalImages[1];
            thumb2.alt = selectedImages[1]?.description || 'Thumbnail 2';
        }

        // 이미지 로드 후 슬라이더 초기화
        setTimeout(() => {
            if (typeof window.initEssenceSlider === 'function') {
                window.initEssenceSlider();
            }
        }, 100);
    }

    // ============================================================================
    // ⭐ SIGNATURE SECTION MAPPING
    // ============================================================================

    /**
     * Signature Section 매핑 (특색 섹션)
     */
    mapSignatureSection() {
        const signatureData = this.safeGet(this.data, 'homepage.customFields.pages.index.sections.0.signature');
        if (!signatureData) return;

        // 타이틀 매핑
        const titleElement = this.safeSelect('[data-signature-title]');
        if (titleElement) {
            titleElement.textContent = this.sanitizeText(signatureData?.title, '시그니처 섹션 타이틀');
        }

        // 메인 이미지 매핑
        const mainImg = this.safeSelect('[data-signature-main-img]');
        if (mainImg) {
            // ImageHelpers.applyImageOrPlaceholder(mainImg, signatureData.images);
            if (signatureData.images && signatureData.images.length > 0) {
                mainImg.src = signatureData.images[0].url || './images/room.jpg';
                mainImg.alt = signatureData.images[0].description || 'Signature Image';
            }
        }

        // isSelected가 true인 이미지만 필터링하고 sortOrder로 정렬
        const selectedImages = signatureData.images && Array.isArray(signatureData.images)
            ? signatureData.images
                .filter(img => img.isSelected === true)
                .sort((a, b) => a.sortOrder - b.sortOrder)
            : [];

        // 메인 이미지 설명 매핑 (이미지 없어도 fallback 텍스트 보여주기)
        const descElement = this.safeSelect('[data-signature-description]');
        if (descElement) {
            const descriptionText = selectedImages.length > 0 && selectedImages[0].description
                ? selectedImages[0].description
                : '이미지 설명';
            descElement.innerHTML = this._formatTextWithLineBreaks(descriptionText);
        }

        // 썸네일 이미지들 매핑 (이미지 없어도 placeholder 적용 위해 항상 호출)
        this.mapSignatureThumbnails(selectedImages.slice(0, 4));
    }

    /**
     * Signature 썸네일 이미지 매핑
     */
    mapSignatureThumbnails(images) {
        const thumbnails = this.safeSelectAll('.signature-thumb');

        thumbnails.forEach((thumb, index) => {
            const img = thumb.querySelector('img');
            if (!img) return;

            if (images[index]) {
                img.src = images[index].url;
                img.alt = this.sanitizeText(images[index].description, `Signature Thumbnail ${index + 1}`);
                img.classList.remove('empty-image-placeholder');
                thumb.setAttribute('data-index', index);
            } else {
                // 이미지가 없을 경우 placeholder 적용
                // ImageHelpers.applyPlaceholder(img);
                img.src = './images/room.jpg';
                img.alt = `Placeholder ${index + 1}`;
            }
        });
    }

    // ============================================================================
    // 🖼️ GALLERY SECTION MAPPING
    // ============================================================================

    /**
     * Gallery Section 매핑 (갤러리 섹션)
     */
    mapGallerySection() {
        const galleryData = this.safeGet(this.data, 'homepage.customFields.pages.index.sections.0.gallery');

        // Gallery 섹션 타이틀에 숙소 영문명 매핑
        const propertyNameEn = this.safeGet(this.data, 'homepage.basicInfo.propertyNameEn', 'Gallery');
        const galleryPropertyNameElement = this.safeSelect('[data-gallery-property-name]');
        if (galleryPropertyNameElement) {
            galleryPropertyNameElement.textContent = propertyNameEn;
        }

        // 데이터가 없어도 기본 텍스트라도 보이도록 처리
        if (!galleryData) {
            // 타이틀 매핑 (fallback)
            const titleElement = this.safeSelect('[data-gallery-title]');
            if (titleElement) {
                titleElement.textContent = '갤러리';
            }

            // 설명 매핑 (fallback)
            const descElement = this.safeSelect('[data-gallery-description]');
            if (descElement) {
                descElement.textContent = '이미지가 준비 중입니다.';
            }
            return;
        }

        // 타이틀 매핑
        const titleElement = this.safeSelect('[data-gallery-title]');
        if (titleElement) {
            titleElement.textContent = this.sanitizeText(galleryData?.title, '갤러리 섹션 타이틀');
        }

        // 설명 매핑
        const descElement = this.safeSelect('[data-gallery-description]');
        if (descElement) {
            descElement.innerHTML = this._formatTextWithLineBreaks(galleryData?.description, '갤러리 섹션 설명');
        }


        // 갤러리 아이템 매핑
        if (galleryData.images && Array.isArray(galleryData.images)) {
            this.mapGalleryItems(galleryData.images);
        }
    }

    /**
     * Gallery Items 동적 생성
     */
    mapGalleryItems(images) {
        const sliderContainer = this.safeSelect('[data-gallery-grid]');
        if (!sliderContainer) return;

        // isSelected가 true인 이미지만 필터링하고 sortOrder로 정렬 (최대 5개)
        const selectedImages = images
            .filter(img => img.isSelected === true)
            .sort((a, b) => a.sortOrder - b.sortOrder)
            .slice(0, 5);

        // 기존 내용 초기화
        sliderContainer.innerHTML = '';

        // 이미지가 없으면 fallback 이미지들 생성 (바다, 해변, 노을, 하늘 테마)
        if (selectedImages.length === 0) {
            const fallbackImages = [
                './images/sky.jpg',
                './images/pool.jpg',
                './images/shadow.jpg',
                './images/exterior.jpg',
                './images/flower.jpg'
            ];

            fallbackImages.forEach((imageUrl, index) => {
                const itemDiv = document.createElement('div');
                itemDiv.className = 'gallery-item';

                const imgElement = document.createElement('img');
                imgElement.src = imageUrl;
                imgElement.alt = `Gallery Image ${index + 1}`;

                // 호버 시 표시될 설명 span 추가
                const descriptionSpan = document.createElement('span');
                descriptionSpan.className = 'gallery-item-description';
                descriptionSpan.textContent = `Gallery ${index + 1}`;

                itemDiv.appendChild(imgElement);
                itemDiv.appendChild(descriptionSpan);
                sliderContainer.appendChild(itemDiv);
            });
            return;
        }


        // 갤러리 아이템 생성
        selectedImages.forEach((img, index) => {
            const itemDiv = document.createElement('div');
            itemDiv.className = 'gallery-item';

            const imgElement = document.createElement('img');
            imgElement.src = img.url;
            imgElement.alt = this.sanitizeText(img.description, `Gallery Image ${index + 1}`);
            imgElement.loading = 'lazy';

            // 호버 시 표시될 설명 span 추가
            const descriptionSpan = document.createElement('span');
            descriptionSpan.className = 'gallery-item-description';
            descriptionSpan.textContent = this.sanitizeText(img.description, `Gallery ${index + 1}`);

            itemDiv.appendChild(imgElement);
            itemDiv.appendChild(descriptionSpan);
            sliderContainer.appendChild(itemDiv);
        });
    }

    // ============================================================================
    // 🏠 ROOMS SECTION MAPPING
    // ============================================================================

    /**
     * Rooms Section 매핑
     */
    mapRoomsSection() {
        const roomsData = this.safeGet(this.data, 'rooms');
        if (!roomsData || !Array.isArray(roomsData)) return;

        const roomsContainer = this.safeSelect('[data-rooms-grid]');
        if (!roomsContainer) return;

        // 전체 룸 표시
        const displayRooms = roomsData;

        roomsContainer.innerHTML = '';

        displayRooms.forEach((room) => {
            const roomItem = document.createElement('div');
            roomItem.className = 'room-item';
            // 전체 클릭 이벤트 제거 - ROOM VIEW 버튼만 클릭 가능

            // 룸 이미지 (썸네일 또는 첫 번째 이미지)
            const roomImage = room.images && room.images[0] && room.images[0].thumbnail && room.images[0].thumbnail.length > 0
                ? room.images[0].thumbnail[0]
                : './images/room.jpg';


            const roomName = this.sanitizeText(room.name, '객실명');
            const isShortText = roomName.length <= 7; // 7글자 이하면 줄 표시

            roomItem.innerHTML = `
                <div class="room-number${isShortText ? ' short-text' : ''}">${roomName}</div>
                <div class="room-image">
                    <img src="${roomImage}" alt="${this.sanitizeText(room.name, '객실 이미지')}" loading="lazy">
                </div>
                <div class="room-content">
                    <h3 class="room-name">${this.sanitizeText(room.name, '객실명')}</h3>
                    <p class="room-description">${this.sanitizeText(room.description, '객실 설명')}</p>
                    <button class="room-view-btn" onclick="navigateTo('room', '${room.id}')">
                        ROOM VIEW
                    </button>
                </div>
            `;

            roomsContainer.appendChild(roomItem);
        });

        // 드래그 스크롤 기능 추가
        this.addDragScrollToRooms(roomsContainer);
    }

    /**
     * 룸 컨테이너에 드래그 스크롤 기능 추가
     */
    addDragScrollToRooms(container) {
        let isDown = false;
        let startX;
        let scrollLeft;
        let velocity = 0;
        let momentumID = 0;

        // 마우스 이벤트
        container.addEventListener('mousedown', (e) => {
            isDown = true;
            container.style.cursor = 'grabbing';
            container.style.scrollBehavior = 'auto';
            startX = e.pageX - container.offsetLeft;
            scrollLeft = container.scrollLeft;
            velocity = 0;
            if (momentumID) cancelAnimationFrame(momentumID);
            e.preventDefault();
        });

        document.addEventListener('mouseleave', () => {
            isDown = false;
            container.style.cursor = 'grab';
            container.style.scrollBehavior = 'smooth';
            this.applyMomentum(container);
        });

        document.addEventListener('mouseup', () => {
            isDown = false;
            container.style.cursor = 'grab';
            container.style.scrollBehavior = 'smooth';
            this.applyMomentum(container);
        });

        container.addEventListener('mousemove', (e) => {
            if (!isDown) return;
            e.preventDefault();
            const x = e.pageX - container.offsetLeft;
            const walk = (x - startX) * 1.5;
            const prevScrollLeft = container.scrollLeft;
            container.scrollLeft = scrollLeft - walk;
            velocity = container.scrollLeft - prevScrollLeft;
        });

        // 터치 이벤트 개선
        let startTouchX = 0;
        let lastTouchX = 0;
        let startScrollLeft = 0;
        let isScrolling = false;

        container.addEventListener('touchstart', (e) => {
            startTouchX = e.touches[0].pageX;
            lastTouchX = startTouchX;
            startScrollLeft = container.scrollLeft;
            isScrolling = true;
            velocity = 0;
            if (momentumID) cancelAnimationFrame(momentumID);
            container.style.scrollBehavior = 'auto';

            // 모바일에서 수직 스크롤 방지
            document.body.style.overflow = 'hidden';
            document.body.style.touchAction = 'none';
        }, { passive: false });

        container.addEventListener('touchmove', (e) => {
            if (!isScrolling) return;

            // 수평 드래그일 때만 처리
            const touchX = e.touches[0].pageX;
            const touchY = e.touches[0].pageY;
            const walk = startTouchX - touchX;

            // 수평 이동이 수직 이동보다 클 때만 스크롤 방지
            if (Math.abs(walk) > 5) {
                e.preventDefault(); // 페이지 스크롤 방지
                e.stopPropagation();
            }

            const prevScrollLeft = container.scrollLeft;
            container.scrollLeft = startScrollLeft + walk;
            velocity = container.scrollLeft - prevScrollLeft;
            lastTouchX = touchX;
        }, { passive: false });

        container.addEventListener('touchend', () => {
            isScrolling = false;
            container.style.scrollBehavior = 'smooth';

            // 스크롤 복원
            document.body.style.overflow = '';
            document.body.style.touchAction = '';

            this.applyMomentum(container);
        }, { passive: false });

        // 부드러운 스크롤 추가
        container.style.scrollBehavior = 'smooth';
    }

    applyMomentum() {
        // 모멘텀 스크롤 기능 (현재 비활성화)
    }

    /**
     * 룸 페이지로 이동
     */
    navigateToRoom(roomId) {
        if (typeof navigateTo === 'function') {
            navigateTo('room', roomId);
        } else {
        }
    }

    // ============================================================================
    // 🎬 CLOSING SECTION MAPPING
    // ============================================================================

    /**
     * Closing Section 매핑 (마무리 섹션)
     */
    mapClosingSection() {
        // 경로 수정
        const closingData = this.safeGet(this.data, 'homepage.customFields.pages.index.sections.0.closing');

        // 배경 이미지 매핑 - 기본 이미지 제공
        const bgImg = this.safeSelect('[data-closing-bg-img]');
        if (bgImg) {
            if (closingData?.images && closingData.images.length > 0) {
                bgImg.src = closingData.images[0];
            } else {
                // 기본 이미지 설정
                bgImg.src = './images/sky.jpg';
            }
            bgImg.alt = 'Closing Background';
            bgImg.setAttribute('data-image-fallback', '');
        }

        // 숙소 영문명 매핑 (굵은 세로 텍스트)
        const propertyNameEn = this.safeGet(this.data, 'property.nameEn');
        const closingPropertyName = this.safeSelect('[data-closing-property-name]');
        if (closingPropertyName && propertyNameEn) {
            closingPropertyName.textContent = this.sanitizeText(propertyNameEn);
        }

        // 타이틀 매핑 (얇은 세로 텍스트)
        const closingTitle = this.safeSelect('[data-closing-title]');
        if (closingTitle) {
            closingTitle.textContent = closingData?.title || '고요한 공간에서의 쉼';
        }

        // 설명 매핑 (가로 텍스트)
        const descElement = this.safeSelect('[data-closing-description]');
        if (descElement) {
            descElement.innerHTML = this._formatTextWithLineBreaks(
                closingData?.description,
                '고요한 공간에서의 쉼. 나를 위한 특별한 시간을 선물하세요.'
            );
        }
    }
}

// ============================================================================
// 🚀 INITIALIZATION
// ============================================================================

// 페이지 로드 시 자동 초기화
if (typeof window !== 'undefined') {
    window.addEventListener('DOMContentLoaded', async () => {
        const mapper = new IndexMapper();
        await mapper.initialize();
    });
}

// ES6 모듈 및 글로벌 노출
if (typeof module !== 'undefined' && module.exports) {
    module.exports = IndexMapper;
} else {
    window.IndexMapper = IndexMapper;
}
