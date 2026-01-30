/**
 * Facility Page Data Mapper
 * facility.html 전용 매핑 함수들을 포함한 클래스
 * BaseDataMapper를 상속받아 시설 페이지 전용 기능 제공
 * URL 파라미터로 ?id=facility-uuid를 받아서 동적으로 시설 정보 표시
 */
class FacilityMapper extends BaseDataMapper {
    constructor() {
        super();
        this.currentFacility = null;
        this.currentFacilityIndex = null;
    }

    // ============================================================================
    // 🔧 UTILITY METHODS
    // ============================================================================

    /**
     * 현재 시설 정보 가져오기 (URL 파라미터 기반)
     */
    getCurrentFacility() {
        if (!this.isDataLoaded || !this.data.property?.facilities) {
            return null;
        }

        const urlParams = new URLSearchParams(window.location.search);
        const facilityId = urlParams.get('id');

        if (!facilityId) {
            return null;
        }

        const facilityIndex = this.data.property.facilities.findIndex(facility => facility.id === facilityId);

        if (facilityIndex === -1) {
            return null;
        }

        const facility = this.data.property.facilities[facilityIndex];
        this.currentFacility = facility;
        this.currentFacilityIndex = facilityIndex;
        return facility;
    }

    /**
     * 현재 시설의 customFields 페이지 데이터 가져오기
     */
    getCurrentFacilityPageData() {
        const facility = this.getCurrentFacility();
        const facilityPages = this.data.homepage?.customFields?.pages?.facility;

        if (!facility) return null;
        if (!Array.isArray(facilityPages)) return null;

        return facilityPages.find(page => page.id === facility.id);
    }

    // ============================================================================
    // 🏢 SECTION MAPPINGS
    // ============================================================================

    /**
     * 히어로 슬라이더 매핑
     */
    mapFacilityHeroSlider() {
        if (!this.isDataLoaded) return;

        const currentFacility = this.getCurrentFacility();
        if (!currentFacility) return;

        // 이미지 수집 (flat array 구조)
        let facilityImages = [];
        if (currentFacility.images && Array.isArray(currentFacility.images)) {
            currentFacility.images
                .filter(img => img.isSelected !== false)
                .sort((a, b) => (a.sortOrder || 0) - (b.sortOrder || 0))
                .forEach(img => {
                    if (img.url) {
                        facilityImages.push({
                            url: img.url,
                            alt: this.sanitizeText(img.description, currentFacility.name || '시설 이미지')
                        });
                    }
                });
        }

        const isDemo = this.dataSource === 'demo-filled.json';

        // 이미지 없을 때 fallback
        if (facilityImages.length === 0) {
            if (isDemo) {
                facilityImages.push({ url: './images/pool.jpg', alt: '시설 이미지' });
            } else {
                facilityImages.push({ url: ImageHelpers.EMPTY_IMAGE_WITH_ICON, alt: '이미지 없음', isEmpty: true });
            }
        }

        // 슬라이더 렌더링
        const sliderContainer = document.querySelector('[data-facility-hero-slider]');
        if (sliderContainer && facilityImages.length > 0) {
            sliderContainer.innerHTML = '';
            sliderContainer.dataset.sliderInitialized = 'false';

            facilityImages.forEach((image, index) => {
                const slide = document.createElement('div');
                slide.className = `slide ${index === 0 ? 'active' : ''}`;

                const img = document.createElement('img');
                img.src = image.url;
                img.alt = image.alt;
                img.style.cssText = 'width:100%;height:100%;object-fit:cover;';

                if (image.isEmpty) {
                    img.classList.add('empty-image-placeholder');
                }

                slide.appendChild(img);
                sliderContainer.appendChild(slide);
            });

            if (typeof initHeroSlider === 'function') {
                setTimeout(() => initHeroSlider(), 100);
            }
        }

        // 숙소 영문명 매핑 (customFields 우선)
        const propertyNameEl = document.querySelector('[data-hero-property-name-en]');
        if (propertyNameEl) {
            propertyNameEl.textContent = this.getPropertyNameEn();
        }

        // 시설 타이틀 매핑
        const facilityTitleEl = document.querySelector('[data-facility-title]');
        if (facilityTitleEl) {
            facilityTitleEl.textContent = currentFacility.name || '시설 안내';
        }
    }

    /**
     * Top Intro 섹션 매핑
     */
    mapFacilityTopIntro() {
        if (!this.isDataLoaded || !this.data.property?.facilities) return;

        const mainFacility = this.getCurrentFacility();
        if (!mainFacility) return;

        const isDemo = this.dataSource === 'demo-filled.json';

        // 대표 이미지 매핑
        const mainImageEl = document.querySelector('[data-facility-main-image]');
        if (mainImageEl) {
            const sortedImages = (mainFacility.images || [])
                .filter(img => img.isSelected !== false && img.url)
                .sort((a, b) => (a.sortOrder || 0) - (b.sortOrder || 0));
            const firstImage = sortedImages[0];

            if (firstImage) {
                mainImageEl.src = firstImage.url;
                mainImageEl.alt = this.sanitizeText(firstImage.description, mainFacility.name || '시설 이미지');
                mainImageEl.classList.remove('empty-image-placeholder');
            } else if (isDemo) {
                mainImageEl.src = './images/pool.jpg';
                mainImageEl.alt = '시설 이미지';
                mainImageEl.classList.remove('empty-image-placeholder');
            } else {
                mainImageEl.src = ImageHelpers.EMPTY_IMAGE_WITH_ICON;
                mainImageEl.alt = '이미지 없음';
                mainImageEl.classList.add('empty-image-placeholder');
            }
        }

        // 타이틀 매핑
        const titleEl = document.querySelector('[data-facility-intro-title]');
        if (titleEl) {
            titleEl.textContent = mainFacility.name || '시설명';
        }

        // 설명 매핑
        const descEl = document.querySelector('.facility-top-intro-section [data-facility-description]');
        if (descEl) {
            descEl.textContent = mainFacility.description || '';
        }

        // 이용안내 매핑
        const usageEl = document.querySelector('.facility-top-intro-section [data-facility-usage-guide]');
        if (usageEl) {
            if (Array.isArray(mainFacility.usageGuide)) {
                usageEl.innerHTML = this._formatTextWithLineBreaks(mainFacility.usageGuide.join('\n'));
            } else if (mainFacility.usageGuide) {
                usageEl.innerHTML = this._formatTextWithLineBreaks(mainFacility.usageGuide);
            } else {
                usageEl.textContent = '이용 안내 정보가 준비중입니다.';
            }
        }
    }

    /**
     * 이용안내 섹션 매핑 (features, additionalInfos, benefits)
     */
    mapUsageGuideSection() {
        if (!this.isDataLoaded) return;

        const facility = this.getCurrentFacility();
        if (!facility) return;

        const facilityPageData = this.getCurrentFacilityPageData();
        const experience = facilityPageData?.sections?.[0]?.experience;

        const usageSection = document.querySelector('[data-usage-section]');
        if (!usageSection) return;

        let hasContent = false;

        // 주요특징 매핑
        const featuresContainer = document.querySelector('[data-facility-features]');
        if (featuresContainer && experience?.features && experience.features.length > 0) {
            featuresContainer.innerHTML = '';
            experience.features.forEach(feature => {
                const item = document.createElement('div');
                item.className = 'content-item';
                if (typeof feature === 'object' && feature !== null) {
                    item.innerHTML = `
                        <div class="content-title">${this._escapeHTML(feature.title || '특징 타이틀')}</div>
                        <div class="content-description">${this._formatTextWithLineBreaks(feature.description || '특징 설명')}</div>
                    `;
                } else {
                    item.textContent = feature || '특징 타이틀';
                }
                featuresContainer.appendChild(item);
            });
            hasContent = true;
        }

        // 추가정보 매핑
        const additionalContainer = document.querySelector('[data-facility-additional-info]');
        if (additionalContainer && experience?.additionalInfos && experience.additionalInfos.length > 0) {
            additionalContainer.innerHTML = '';
            experience.additionalInfos.forEach(info => {
                const item = document.createElement('div');
                item.className = 'content-item';
                if (typeof info === 'object' && info !== null) {
                    item.innerHTML = `
                        <div class="content-title">${this._escapeHTML(info.title || '추가정보 타이틀')}</div>
                        <div class="content-description">${this._formatTextWithLineBreaks(info.description || '추가정보 설명')}</div>
                    `;
                } else {
                    item.textContent = info || '추가정보 타이틀';
                }
                additionalContainer.appendChild(item);
            });
            hasContent = true;
        }

        // 이용혜택 매핑
        const benefitsContainer = document.querySelector('[data-facility-benefits]');
        if (benefitsContainer && experience?.benefits && experience.benefits.length > 0) {
            benefitsContainer.innerHTML = '';
            experience.benefits.forEach(benefit => {
                const item = document.createElement('div');
                item.className = 'content-item';
                if (typeof benefit === 'object' && benefit !== null) {
                    item.innerHTML = `
                        <div class="content-title">${this._escapeHTML(benefit.title || '혜택 타이틀')}</div>
                        <div class="content-description">${this._formatTextWithLineBreaks(benefit.description || '혜택 설명')}</div>
                    `;
                } else {
                    item.textContent = benefit || '혜택 타이틀';
                }
                benefitsContainer.appendChild(item);
            });
            hasContent = true;
        }

        // 섹션 표시/숨김
        if (hasContent) {
            usageSection.classList.add('has-content');
            usageSection.style.display = '';
        }

        // 박스별 표시/숨김
        const boxes = usageSection.querySelectorAll('.usage-box');
        boxes.forEach(box => {
            const content = box.querySelector('.usage-box-content');
            if (content && content.innerHTML.trim() !== '') {
                box.style.display = '';
                if (box.classList.contains('animate-on-scroll')) {
                    box.classList.add('visible');
                }
            } else {
                box.style.display = 'none';
            }
        });
    }

    /**
     * Special 섹션 매핑 (와이프 슬라이더)
     */
    mapFacilitySpecialSection() {
        if (!this.isDataLoaded) return;

        const currentFacility = this.getCurrentFacility();
        if (!currentFacility) return;

        // 이미지 수집
        let facilityImages = [];
        if (currentFacility.images && Array.isArray(currentFacility.images)) {
            currentFacility.images
                .filter(img => img.isSelected !== false)
                .sort((a, b) => (a.sortOrder || 0) - (b.sortOrder || 0))
                .forEach(img => {
                    if (img.url) {
                        facilityImages.push({
                            url: img.url,
                            sortOrder: img.sortOrder || 0,
                            alt: this.sanitizeText(img.description, currentFacility.name || '시설 이미지')
                        });
                    }
                });
        }

        // 컨베이어 벨트용 이미지 배열 저장
        const validImages = facilityImages.filter(img => img.url && !img.url.startsWith('data:'));
        window.facilitySpecialImages = validImages.length >= 2 ? validImages : null;

        const isDemo = this.dataSource === 'demo-filled.json';
        const leftImg = document.querySelector('[data-facility-left-image]');
        const rightImg = document.querySelector('[data-facility-right-image]');

        // 이미지 설정 헬퍼
        const setImage = (imgEl, imageData, fallbackUrl) => {
            if (!imgEl) return;
            if (imageData?.url) {
                imgEl.src = imageData.url;
                imgEl.alt = imageData.alt || '시설 이미지';
                imgEl.classList.remove('empty-image-placeholder');
            } else {
                // empty placeholder 사용
                imgEl.src = fallbackUrl;
                imgEl.alt = '이미지 없음';
                imgEl.classList.add('empty-image-placeholder');
            }
        };

        setImage(leftImg, facilityImages[0], ImageHelpers.EMPTY_IMAGE_WITH_ICON);
        setImage(rightImg, facilityImages[1], ImageHelpers.EMPTY_IMAGE_WITH_ICON);

        // 모바일에서만 간단한 세로 이미지 배치
        const isMobile = window.innerWidth <= 768;
        if (isMobile) {
            const imageContainer = document.querySelector('.facility-special-images');
            if (imageContainer) {
                // 강제 교체: 간단한 이미지 배치
                const hasImg1 = facilityImages[0]?.url;
                const hasImg2 = facilityImages[1]?.url;
                const img1Url = hasImg1 || ImageHelpers.EMPTY_IMAGE_WITH_ICON;
                const img2Url = hasImg2 || ImageHelpers.EMPTY_IMAGE_WITH_ICON;

                imageContainer.innerHTML = `
                    <img style="width:100%;height:200px;object-fit:cover;margin-bottom:20px;display:block;">
                    <img style="width:100%;height:200px;object-fit:cover;display:block;">
                `;

                const img1 = imageContainer.children[0];
                const img2 = imageContainer.children[1];

                // ImageHelpers 방식 사용
                if (hasImg1) {
                    img1.src = img1Url;
                    img1.alt = '시설 이미지';
                } else {
                    ImageHelpers.applyPlaceholder(img1);
                }

                if (hasImg2) {
                    img2.src = img2Url;
                    img2.alt = '시설 이미지';
                } else {
                    ImageHelpers.applyPlaceholder(img2);
                }
                imageContainer.style.cssText = 'width:100%;display:block;';
            }
        }

        // 숙소 영문명 매핑 (customFields 우선)
        const propertyNameEnEl = document.querySelector('.facility-special-text [data-property-name-en]');
        if (propertyNameEnEl) {
            propertyNameEnEl.textContent = this.getPropertyNameEn();
        }

        // 설명 텍스트 매핑 (customFields about.title)
        const descEl = document.querySelector('[data-facility-description-2]');
        if (descEl) {
            const facilityPageData = this.getCurrentFacilityPageData();
            const aboutTitle = facilityPageData?.sections?.[0]?.about?.title;
            descEl.innerHTML = this._formatTextWithLineBreaks(aboutTitle || '');
        }
    }

    // ============================================================================
    // 🔄 MAIN ENTRY POINT
    // ============================================================================

    /**
     * 페이지 전체 매핑 실행
     */
    async mapPage() {
        if (!this.isDataLoaded) return;

        // URL 파라미터 확인
        const urlParams = new URLSearchParams(window.location.search);
        const facilityId = urlParams.get('id');

        if (!facilityId) {
            const firstFacility = this.data.property?.facilities?.[0];
            if (firstFacility) {
                window.location.href = `facility.html?id=${firstFacility.id}`;
                return;
            }
            return;
        }

        const facility = this.getCurrentFacility();
        if (!facility) return;

        // 섹션 매핑
        this.mapFacilityHeroSlider();
        this.mapFacilityTopIntro();
        this.mapUsageGuideSection();
        this.mapFacilitySpecialSection();

        // SEO 메타 태그 업데이트 (customFields 우선)
        const propertyName = this.getPropertyName();
        this.updateMetaTags({
            title: facility?.name ? `${facility.name} - ${propertyName}` : 'SEO 타이틀',
            description: facility?.description || this.data.property?.description || 'SEO 설명'
        });

        // E-commerce 정보 매핑
        this.mapEcommerceRegistration();

        // 배경 텍스트 번호 설정
        this.setBackgroundNumbers();
    }

    /**
     * 배경 텍스트의 번호 동적 설정
     */
    setBackgroundNumbers() {
        if (this.currentFacilityIndex === null) return;

        const facilityNumber = String(this.currentFacilityIndex + 1).padStart(2, '0');
        const introSection = document.querySelector('.facility-top-intro-section');

        if (introSection) {
            // CSS 커스텀 속성으로 번호 설정
            introSection.style.setProperty('--facility-number', `"Offer${facilityNumber}"`);
        }
    }
}

// iframe 외부에서만 자동 초기화
if (typeof window !== 'undefined' && window.parent === window) {
    document.addEventListener('DOMContentLoaded', async () => {
        const facilityMapper = new FacilityMapper();
        try {
            await facilityMapper.loadData();
            await facilityMapper.mapPage();
        } catch (error) {
            console.error('FacilityMapper initialization error:', error);
        }
    });
}

// 글로벌 노출
if (typeof module !== 'undefined' && module.exports) {
    module.exports = FacilityMapper;
} else {
    window.FacilityMapper = FacilityMapper;
}
