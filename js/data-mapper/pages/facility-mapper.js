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
    // 🏢 FACILITY PAGE SPECIFIC MAPPINGS
    // ============================================================================

    /**
     * Facility 히어로 슬라이더 매핑 (모든 facility 이미지 사용)
     */
    mapFacilityHeroSlider() {
        // 데이터 확인

        if (!this.isDataLoaded) {
            return;
        }

        // 현재 URL 파라미터에 해당하는 시설 가져오기
        const currentFacility = this.getCurrentFacility();
        if (!currentFacility) {
            return;
        }


        // 현재 시설의 이미지만 사용
        let facilityImages = [];
        if (currentFacility.images && currentFacility.images.main && Array.isArray(currentFacility.images.main)) {
            currentFacility.images.main.forEach(img => {
                facilityImages.push({
                    url: img.url || img,
                    alt: img.description || currentFacility.name || '시설 이미지'
                });
            });
        }

        if (facilityImages.length === 0) {
            return;
        }

        // 슬라이더 컨테이너에 직접 이미지 추가
        const sliderContainer = document.querySelector('[data-facility-hero-slider]');
        if (sliderContainer && facilityImages.length > 0) {
            sliderContainer.innerHTML = '';

            facilityImages.forEach((image, index) => {
                const slide = document.createElement('div');
                slide.className = `slide ${index === 0 ? 'active' : ''}`;
                slide.style.backgroundImage = `url('${image.url}')`;
                slide.style.backgroundSize = 'cover';
                slide.style.backgroundPosition = 'center';
                slide.style.height = '100%';
                sliderContainer.appendChild(slide);
            });


            // Re-initialize slider after adding images
            if (typeof initHeroSlider === 'function') {
                setTimeout(() => {
                    initHeroSlider();
                }, 100);
            }
        }

        // 숙소 영문명 매핑 (작게) - property.nameEn 사용
        const propertyNameEn = this.data.property?.nameEn || 'PROPERTY NAME';
        const propertyNameEl = document.querySelector('[data-hero-property-name-en]');
        if (propertyNameEl) {
            propertyNameEl.textContent = propertyNameEn;
        }

        // 시설 타이틀 매핑 (크게) - 현재 시설 이름만 표시
        const facilityTitleEl = document.querySelector('[data-facility-title]');
        if (facilityTitleEl) {
            facilityTitleEl.textContent = currentFacility.name || '시설 안내';
        }
    }

    /**
     * 새로운 Facility Special Section 매핑
     */
    mapFacilitySpecialSection() {
        if (!this.isDataLoaded) {
            return;
        }

        // 현재 시설 가져오기
        const currentFacility = this.getCurrentFacility();
        if (!currentFacility) {
            return;
        }

        // 현재 시설의 이미지만 수집
        let facilityImages = [];
        if (currentFacility.images && currentFacility.images.main && Array.isArray(currentFacility.images.main)) {
            currentFacility.images.main.forEach(img => {
                // isVisible이 true이거나 없는 경우만 포함
                if (img.isVisible !== false) {
                    facilityImages.push({
                        url: img.url || img,
                        sortOrder: img.sortOrder || 0,
                        alt: img.description || currentFacility.name || '시설 이미지'
                    });
                }
            });
        }

        // sortOrder로 정렬
        facilityImages.sort((a, b) => a.sortOrder - b.sortOrder);

        // 순차적으로 사용할 수 있도록 전체 배열 저장
        // facility.js에서 컨베이어 벨트 방식으로 순환
        window.facilitySpecialImages = facilityImages;

        // 숙소 영문명 매핑
        const propertyNameEnEl = document.querySelector('.facility-special-text [data-property-name-en]');
        if (propertyNameEnEl) {
            propertyNameEnEl.textContent = this.data.property?.nameEn || 'Stay the Nocul';
        }

        // 설명 텍스트 매핑 (한 줄만) - 현재 시설 사용
        const descEl = document.querySelector('[data-facility-description-2]');
        if (descEl) {
            const currentFacility = this.getCurrentFacility();
            descEl.textContent = currentFacility?.description || 'And the beautiful sunset';
        }
    }

    /**
     * 이용안내 섹션 매핑
     */
    mapUsageGuideSection() {
        if (!this.isDataLoaded) return;

        // 현재 URL 파라미터에 해당하는 시설 가져오기
        const facility = this.getCurrentFacility();
        if (!facility) {
            return;
        }

        const usageSection = document.querySelector('[data-usage-section]');
        if (!usageSection) return;

        let hasContent = false;

        // 주요특징 매핑 (CUSTOM FIELD 예시 - 추후 실제 데이터로 교체)
        const featuresContainer = document.querySelector('[data-facility-features]');
        if (featuresContainer && facility.features) {
            featuresContainer.innerHTML = '';
            facility.features.forEach(feature => {
                const item = document.createElement('div');
                item.className = 'content-item';
                item.textContent = feature;
                featuresContainer.appendChild(item);
            });
            hasContent = true;
        }

        // 추가정보 매핑
        const additionalContainer = document.querySelector('[data-facility-additional-info]');
        if (additionalContainer && facility.additionalInfo) {
            additionalContainer.innerHTML = '';
            facility.additionalInfo.forEach(info => {
                const item = document.createElement('div');
                item.className = 'content-item';
                if (info.title) {
                    item.innerHTML = `
                        <div class="content-title">${info.title}</div>
                        <div class="content-description">${info.description || ''}</div>
                    `;
                } else {
                    item.textContent = info;
                }
                additionalContainer.appendChild(item);
            });
            hasContent = true;
        }

        // 이용혜택 매핑
        const benefitsContainer = document.querySelector('[data-facility-benefits]');
        if (benefitsContainer && facility.benefits) {
            benefitsContainer.innerHTML = '';
            facility.benefits.forEach(benefit => {
                const item = document.createElement('div');
                item.className = 'content-item';
                item.textContent = benefit;
                benefitsContainer.appendChild(item);
            });
            hasContent = true;
        }

        // 내용이 있으면 섹션 표시
        if (hasContent) {
            usageSection.classList.add('has-content');
        }

        // 빈 박스는 숨김
        const boxes = usageSection.querySelectorAll('.usage-box');
        boxes.forEach(box => {
            const content = box.querySelector('.usage-box-content');
            if (!content || content.innerHTML.trim() === '') {
                box.style.display = 'none';
            }
        });
    }

    /**
     * 두 번째 섹션: Facility Top Intro Section 매핑
     */
    mapFacilityTopIntro() {
        if (!this.isDataLoaded || !this.data.property?.facilities) {
            return;
        }

        // 현재 URL 파라미터에 해당하는 시설 가져오기
        const mainFacility = this.getCurrentFacility();
        if (!mainFacility) {
            return;
        }

        // 대표 이미지 매핑 - 새로운 구조 (facility.images.main)
        const mainImageEl = document.querySelector('[data-facility-main-image]');
        if (mainImageEl) {
            if (mainFacility.images && mainFacility.images.main && mainFacility.images.main[0]) {
                const mainImage = mainFacility.images.main[0];
                mainImageEl.src = mainImage.url || mainImage;
            } else {
                mainImageEl.src = './images/pool.jpg';
            }
        }

        // 타이틀 매핑
        const titleEl = document.querySelector('[data-facility-intro-title]');
        if (titleEl) {
            titleEl.textContent = mainFacility.name || '개별 수영장';
        }

        // description 매핑 (작은 글씨) - facility-top-intro-section 내부의 요소만 선택
        const descEl = document.querySelector('.facility-top-intro-section [data-facility-description]');
        if (descEl) {
            descEl.textContent = mainFacility.description || '';
        }

        // 이용안내(usageGuide) 매핑 - facility-top-intro-section 내부의 요소만 선택
        const usageEl = document.querySelector('.facility-top-intro-section [data-facility-usage-guide]');
        if (usageEl) {
            // usageGuide가 배열인 경우 처리
            if (Array.isArray(mainFacility.usageGuide)) {
                usageEl.innerHTML = mainFacility.usageGuide.map(line => `${line}`).join('<br>');
            } else if (mainFacility.usageGuide) {
                usageEl.textContent = mainFacility.usageGuide;
            } else {
                usageEl.textContent = '이용 안내 정보가 준비중입니다.';
            }
        }
    }

    /**
     * 새로운 Facility Hero Section 매핑 (모든 시설 리스트)
     */
    mapFacilityHeroSection() {
        if (!this.isDataLoaded || !this.data.property?.facilities) {
            return;
        }

        const container = this.safeSelect('[data-facility-list]');
        if (!container) return;

        container.innerHTML = '';

        const facilities = this.data.property.facilities || [];
        const sortedFacilities = facilities.sort((a, b) => (a.displayOrder || 0) - (b.displayOrder || 0));

        sortedFacilities.forEach((facility, index) => {
            const facilityItem = document.createElement('div');
            facilityItem.className = 'facility-item';

            // Image section
            const imageDiv = document.createElement('div');
            imageDiv.className = 'facility-image';
            const img = document.createElement('img');

            // Get first image from facility - 새로운 구조 (facility.images.main)
            if (facility.images && facility.images.main && facility.images.main[0]) {
                const mainImage = facility.images.main[0];
                img.src = mainImage.url || mainImage;
            } else {
                img.src = './images/pool.jpg';
            }

            img.alt = facility.name;
            imageDiv.appendChild(img);

            // Content section
            const contentDiv = document.createElement('div');
            contentDiv.className = 'facility-content';

            // Subtitle
            if (facility.subtitle) {
                const subtitle = document.createElement('div');
                subtitle.className = 'facility-subtitle';
                subtitle.textContent = facility.subtitle;
                contentDiv.appendChild(subtitle);
            }

            // English title
            if (facility.nameEn) {
                const titleEn = document.createElement('h2');
                titleEn.className = 'facility-title-en';
                titleEn.textContent = facility.nameEn;
                contentDiv.appendChild(titleEn);
            }

            // Korean title
            const titleKr = document.createElement('h3');
            titleKr.className = 'facility-title-kr';
            titleKr.textContent = facility.name;
            contentDiv.appendChild(titleKr);

            // Description
            if (facility.description) {
                const description = document.createElement('p');
                description.className = 'facility-description';
                description.textContent = facility.description;
                contentDiv.appendChild(description);
            }

            // Details
            if (facility.details && facility.details.length > 0) {
                const detailsDiv = document.createElement('div');
                detailsDiv.className = 'facility-details';

                facility.details.forEach(detail => {
                    const detailItem = document.createElement('div');
                    detailItem.className = 'facility-detail-item';
                    detailItem.textContent = detail;
                    detailsDiv.appendChild(detailItem);
                });

                contentDiv.appendChild(detailsDiv);
            }

            facilityItem.appendChild(imageDiv);
            facilityItem.appendChild(contentDiv);
            container.appendChild(facilityItem);
        });
    }

    /**
     * 현재 시설 정보 가져오기 (URL 파라미터 기반)
     */
    getCurrentFacility() {
        if (!this.isDataLoaded || !this.data.property?.facilities) {
            return null;
        }

        // URL에서 facility id 추출
        const urlParams = new URLSearchParams(window.location.search);
        const facilityId = urlParams.get('id');

        if (!facilityId) {
            return null;
        }

        // facilities 배열에서 해당 id의 시설 찾기
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
        if (!facility) return null;

        const facilityPages = this.data.homepage?.customFields?.pages?.facility;
        if (!Array.isArray(facilityPages)) return null;

        return facilityPages.find(page => page.id === facility.id);
    }

    /**
     * Fullscreen Slider 매핑 (facility.images 전체 순서대로)
     */
    mapFullscreenSlider() {
        const facility = this.getCurrentFacility();
        if (!facility) return;

        const sliderInner = this.safeSelect('.fullscreen-slider-inner');
        if (!sliderInner) return;

        // 새로운 구조: facility.images.main 배열
        const facilityImages = facility.images?.main || [];
        const sortedImages = facilityImages
            .filter(img => img.isVisible !== false)
            .sort((a, b) => (a.sortOrder || 0) - (b.sortOrder || 0));

        sliderInner.innerHTML = '';

        if (sortedImages.length === 0) {
            // 이미지 없을 때 placeholder
            const slide = document.createElement('div');
            slide.className = 'fullscreen-slide active';
            const img = document.createElement('img');
            ImageHelpers.applyPlaceholder(img);
            slide.appendChild(img);
            sliderInner.appendChild(slide);
            return;
        }

        // 슬라이드 생성
        sortedImages.forEach((image, index) => {
            const slide = document.createElement('div');
            slide.className = `fullscreen-slide${index === 0 ? ' active' : ''}`;
            const img = document.createElement('img');
            img.src = image.url;
            img.alt = image.description || facility.name;
            img.loading = index === 0 ? 'eager' : 'lazy';
            img.setAttribute('data-image-fallback', '');
            slide.appendChild(img);
            sliderInner.appendChild(slide);
        });

        // 슬라이더 재초기화
        this.reinitializeSlider();
    }

    /**
     * FullscreenSlider 재초기화
     */
    reinitializeSlider() {
        const sliderContainer = this.safeSelect('.fullscreen-slider-container');
        if (!sliderContainer || typeof FullscreenSlider !== 'function') {
            return;
        }

        // 기존 슬라이더 인스턴스 제거
        if (window.fullscreenSlider) {
            window.fullscreenSlider = null;
        }

        // 새로운 슬라이더 인스턴스 생성 (selector string 전달)
        window.fullscreenSlider = new FullscreenSlider('.fullscreen-slider-container');
    }

    /**
     * 기본 정보 매핑 (시설명, 시설 설명)
     */
    mapBasicInfo() {
        const facility = this.getCurrentFacility();
        if (!facility) return;

        // 시설명 매핑 (시스템 데이터) - 히어로 섹션의 타이틀만
        const facilityTitle = this.safeSelect('.facility-hero-section [data-facility-title]');
        if (facilityTitle) {
            facilityTitle.textContent = facility.name;
        }

        // 주의: facility-description은 mapFacilityTopIntro()에서 처리됨
        // 여기서는 처리하지 않음 (중복 매핑 방지)
    }

    /**
     * 첫 번째 섹션 이미지 매핑 (슬라이더와 안겹치게)
     */
    mapFirstSectionImage() {
        const facility = this.getCurrentFacility();
        if (!facility) return;

        const infoImage = this.safeSelect('.facility-info-section .facility-info-left .facility-info-image img');
        if (!infoImage) return;

        // 새로운 구조: facility.images.main
        const facilityImages = facility.images?.main || [];
        const sortedImages = facilityImages
            .filter(img => img.isVisible !== false)
            .sort((a, b) => (a.sortOrder || 0) - (b.sortOrder || 0));

        // 슬라이더 첫 두 장과 중복 방지 (3번째 이미지 사용, 없으면 마지막)
        const nextImage = sortedImages[2] || sortedImages[sortedImages.length - 1];

        if (nextImage) {
            infoImage.src = nextImage.url;
            infoImage.alt = nextImage.description || facility.name;
            infoImage.setAttribute('data-image-fallback', '');
        } else {
            ImageHelpers.applyPlaceholder(infoImage);
        }
    }

    /**
     * 이용안내 매핑 (facility.usageGuide만 사용)
     */
    mapUsageGuide() {
        const facility = this.getCurrentFacility();
        if (!facility) return;

        const usageGuideContainer = this.safeSelect('[data-facility-usage-guide]');
        if (!usageGuideContainer) return;

        if (facility.usageGuide) {
            // 시스템 데이터 (facility.usageGuide) - 간단한 개행 처리
            usageGuideContainer.innerHTML = this._formatTextWithLineBreaks(facility.usageGuide);
        } else {
            usageGuideContainer.innerHTML = `<div class="facility-line">${facility.name} 이용 안내가 준비 중입니다.</div>`;
        }
    }

    /**
     * 두 번째 섹션 매핑 (CUSTOM FIELD - 주요특징, 추가정보, 이용혜택)
     */
    mapSecondSection() {
        const facility = this.getCurrentFacility();
        if (!facility) return;

        const secondSection = this.safeSelect('.facility-info-section-reversed');
        if (!secondSection) return;

        const facilityPageData = this.getCurrentFacilityPageData();
        const experience = facilityPageData?.sections?.[0]?.experience;

        // 섹션 데이터가 없으면 숨김
        if (!experience || (!experience.features && !experience.additionalInfos && !experience.benefits)) {
            secondSection.style.display = 'none';
            return;
        }

        // 모든 섹션이 디폴트 값인지 체크
        const isFeaturesDefault = experience.features?.every(f =>
            f.title === '특징 타이틀' && f.description === '특징 설명'
        ) ?? true;
        const isAdditionalInfoDefault = experience.additionalInfos?.every(i =>
            i.title === '추가정보 타이틀' && i.description === '추가정보 설명'
        ) ?? true;
        const isBenefitsDefault = experience.benefits?.every(b =>
            b.title === '혜택 타이틀' && b.description === '혜택 설명'
        ) ?? true;

        // 모든 섹션이 디폴트 값이면 전체 섹션 숨김
        if (isFeaturesDefault && isAdditionalInfoDefault && isBenefitsDefault) {
            secondSection.style.display = 'none';
            return;
        }

        secondSection.style.display = '';

        // 두 번째 섹션 이미지 매핑
        this.mapSecondSectionImage();

        // 주요특징 매핑
        this.mapFeatures(experience.features);

        // 추가정보 매핑
        this.mapAdditionalInfo(experience.additionalInfos);

        // 이용혜택 매핑
        this.mapBenefits(experience.benefits);
    }

    /**
     * 두 번째 섹션 이미지 매핑
     */
    mapSecondSectionImage() {
        const facility = this.getCurrentFacility();
        if (!facility) return;

        const secondInfoImage = this.safeSelect('.facility-info-section-reversed .facility-info-left .facility-info-image img');
        if (!secondInfoImage) return;

        // 새로운 구조: facility.images.main
        const facilityImages = facility.images?.main || [];
        const sortedImages = facilityImages
            .filter(img => img.isVisible !== false)
            .sort((a, b) => (a.sortOrder || 0) - (b.sortOrder || 0));

        // 다른 이미지 (슬라이더 + 1번째 다음 이미지)
        const secondImage = sortedImages[sortedImages.length >= 2 ? sortedImages.length - 1 : 0];

        if (secondImage) {
            secondInfoImage.src = secondImage.url;
            secondInfoImage.alt = secondImage.description || facility.name;
            secondInfoImage.setAttribute('data-image-fallback', '');
        } else {
            ImageHelpers.applyPlaceholder(secondInfoImage);
        }
    }

    /**
     * 주요특징 매핑 (CUSTOM FIELD)
     */
    mapFeatures(features) {
        const featuresContainer = this.safeSelect('[data-facility-features]');
        if (!featuresContainer) return;

        if (!features || !Array.isArray(features) || features.length === 0) {
            featuresContainer.closest('.facility-detail-section')?.remove();
            return;
        }

        // 모든 아이템이 디폴트 값인지 체크
        const isAllDefault = features.every(feature =>
            feature.title === '특징 타이틀' && feature.description === '특징 설명'
        );

        if (isAllDefault) {
            featuresContainer.closest('.facility-detail-section')?.remove();
            return;
        }

        featuresContainer.innerHTML = '';

        features.forEach(feature => {
            const featureItem = document.createElement('div');
            featureItem.className = 'facility-feature-item';

            const titleDiv = document.createElement('div');
            titleDiv.className = 'feature-title';
            titleDiv.innerHTML = this._formatTextWithLineBreaks(feature.title || '');

            const descDiv = document.createElement('div');
            descDiv.className = 'feature-description';
            descDiv.innerHTML = this._formatTextWithLineBreaks(feature.description || '');

            featureItem.appendChild(titleDiv);
            featureItem.appendChild(descDiv);
            featuresContainer.appendChild(featureItem);
        });
    }

    /**
     * 추가정보 매핑 (CUSTOM FIELD)
     */
    mapAdditionalInfo(additionalInfo) {
        const additionalInfoContainer = this.safeSelect('[data-facility-additional-info]');
        if (!additionalInfoContainer) return;

        if (!additionalInfo || !Array.isArray(additionalInfo) || additionalInfo.length === 0) {
            additionalInfoContainer.closest('.facility-detail-section')?.remove();
            return;
        }

        // 모든 아이템이 디폴트 값인지 체크
        const isAllDefault = additionalInfo.every(info =>
            info.title === '추가정보 타이틀' && info.description === '추가정보 설명'
        );

        if (isAllDefault) {
            additionalInfoContainer.closest('.facility-detail-section')?.remove();
            return;
        }

        additionalInfoContainer.innerHTML = '';

        additionalInfo.forEach(info => {
            const infoItem = document.createElement('div');
            infoItem.className = 'facility-additional-info-item';

            const titleDiv = document.createElement('div');
            titleDiv.className = 'additional-info-title';
            titleDiv.innerHTML = this._formatTextWithLineBreaks(info.title || '');

            const descDiv = document.createElement('div');
            descDiv.className = 'additional-info-description';
            descDiv.innerHTML = this._formatTextWithLineBreaks(info.description || '');

            infoItem.appendChild(titleDiv);
            infoItem.appendChild(descDiv);
            additionalInfoContainer.appendChild(infoItem);
        });
    }

    /**
     * 이용혜택 매핑 (CUSTOM FIELD)
     */
    mapBenefits(benefits) {
        const benefitsContainer = this.safeSelect('[data-facility-benefits]');
        if (!benefitsContainer) return;

        if (!benefits || !Array.isArray(benefits) || benefits.length === 0) {
            benefitsContainer.closest('.facility-detail-section')?.remove();
            return;
        }

        // 모든 아이템이 디폴트 값인지 체크
        const isAllDefault = benefits.every(benefit =>
            benefit.title === '혜택 타이틀' && benefit.description === '혜택 설명'
        );

        if (isAllDefault) {
            benefitsContainer.closest('.facility-detail-section')?.remove();
            return;
        }

        benefitsContainer.innerHTML = '';

        benefits.forEach(benefit => {
            const benefitItem = document.createElement('div');
            benefitItem.className = 'facility-benefit-item';

            const titleDiv = document.createElement('div');
            titleDiv.className = 'benefit-title';
            titleDiv.innerHTML = this._formatTextWithLineBreaks(benefit.title || '');

            const descDiv = document.createElement('div');
            descDiv.className = 'benefit-description';
            descDiv.innerHTML = this._formatTextWithLineBreaks(benefit.description || '');

            benefitItem.appendChild(titleDiv);
            benefitItem.appendChild(descDiv);
            benefitsContainer.appendChild(benefitItem);
        });
    }

    /**
     * Marquee 매핑 (property.nameEn)
     */
    mapMarquee() {
        const marqueeContainer = this.safeSelect('.marquee-text');
        if (!marqueeContainer) return;

        const propertyNameEn = this.data.property?.nameEn || 'Property Name';

        marqueeContainer.innerHTML = '';
        for (let i = 0; i < 5; i++) {
            const span = document.createElement('span');
            span.textContent = propertyNameEn;
            marqueeContainer.appendChild(span);
        }
    }

    /**
     * Banner 매핑 (property exterior 이미지 1번째)
     */
    mapBanner() {
        const bannerSection = this.safeSelect('.full-banner');
        if (!bannerSection) return;

        const propertyImages = this.data.property?.images;
        if (!Array.isArray(propertyImages) || propertyImages.length === 0) {
            bannerSection.style.backgroundImage = `url('${ImageHelpers.EMPTY_IMAGE_WITH_ICON}')`;
            bannerSection.style.backgroundSize = 'cover';
            bannerSection.style.backgroundPosition = 'center';
            bannerSection.style.backgroundRepeat = 'no-repeat';
            return;
        }

        // exterior 이미지 찾기
        let exteriorImages = [];
        for (const imageGroup of propertyImages) {
            if (imageGroup.exterior && Array.isArray(imageGroup.exterior)) {
                exteriorImages = imageGroup.exterior;
                break;
            }
        }

        const sortedExterior = exteriorImages
            .filter(img => img.isSelected)
            .sort((a, b) => (a.sortOrder || 0) - (b.sortOrder || 0));

        const firstExterior = sortedExterior[0];

        if (firstExterior) {
            bannerSection.style.backgroundImage = `url('${firstExterior.url}')`;
            bannerSection.style.backgroundSize = 'cover';
            bannerSection.style.backgroundPosition = 'center';
            bannerSection.style.backgroundRepeat = 'no-repeat';
        } else {
            bannerSection.style.backgroundImage = `url('${ImageHelpers.EMPTY_IMAGE_WITH_ICON}')`;
            bannerSection.style.backgroundSize = 'cover';
            bannerSection.style.backgroundPosition = 'center';
            bannerSection.style.backgroundRepeat = 'no-repeat';
        }
    }

    /**
     * 갤러리 매핑 (facility.images 4장 fix)
     */
    mapGallery() {
        const facility = this.getCurrentFacility();
        if (!facility) return;

        const galleryContainer = this.safeSelect('.facility-gallery-container');
        if (!galleryContainer) return;

        // 새로운 구조: facility.images.main
        const facilityImages = facility.images?.main || [];
        const sortedImages = facilityImages
            .filter(img => img.isVisible !== false)
            .sort((a, b) => (a.sortOrder || 0) - (b.sortOrder || 0));

        // 기존 gallery-item들을 찾아서 사용 (HTML 구조 유지)
        const galleryItems = galleryContainer.querySelectorAll('.gallery-item');

        if (sortedImages.length === 0) {
            // 이미지가 없으면 모든 gallery-item에 placeholder 적용
            galleryItems.forEach(item => {
                const img = item.querySelector('.gallery-item-image img');
                const title = item.querySelector('.gallery-item-title');

                if (img) {
                    ImageHelpers.applyPlaceholder(img);
                }
                if (title) {
                    title.textContent = '이미지 설명';
                }
            });
            return;
        }

        // 이미지가 있으면 각 gallery-item에 매핑
        const galleryImages = sortedImages.slice(0, 4);

        galleryItems.forEach((item, index) => {
            const img = item.querySelector('.gallery-item-image img');
            const title = item.querySelector('.gallery-item-title');

            if (galleryImages[index]) {
                const image = galleryImages[index];
                if (img) {
                    img.src = image.url;
                    img.alt = image.description || facility.name;
                    img.setAttribute('data-image-fallback', '');
                    img.classList.remove('empty-image-placeholder');
                }
                if (title) {
                    title.textContent = this.sanitizeText(image.description, '이미지 설명');
                }
            } else {
                // 이미지가 부족하면 placeholder
                if (img) {
                    ImageHelpers.applyPlaceholder(img);
                }
                if (title) {
                    title.textContent = '이미지 설명';
                }
            }
        });
    }

    // ============================================================================
    // 🔄 TEMPLATE METHODS IMPLEMENTATION
    // ============================================================================

    /**
     * Facility 페이지 전체 매핑 실행
     */
    async mapPage() {
        if (!this.isDataLoaded) {
            return;
        }

        // URL 파라미터 확인
        const urlParams = new URLSearchParams(window.location.search);
        const facilityId = urlParams.get('id');

        if (!facilityId) {
            // URL 파라미터가 없으면 첫 번째 시설로 리다이렉트
            const firstFacility = this.data.property?.facilities?.[0];
            if (firstFacility) {
                window.location.href = `facility.html?id=${firstFacility.id}`;
                return;
            }
            return;
        }

        // 특정 시설 표시
        const facility = this.getCurrentFacility();
        if (!facility) {
            return;
        }

        // 첫 번째 섹션: Facility 히어로 슬라이더 매핑
        this.mapFacilityHeroSlider();

        // 두 번째 섹션: Top Intro 섹션 매핑
        this.mapFacilityTopIntro();

        // 이용안내 섹션 매핑
        this.mapUsageGuideSection();

        // 세 번째 섹션: Special 섹션 매핑
        this.mapFacilitySpecialSection();

        // 순차적으로 각 섹션 매핑
        this.mapFullscreenSlider();     // Fullscreen slider
        this.mapBasicInfo();            // 시설명, 시설 설명
        this.mapFirstSectionImage();    // 첫 번째 섹션 이미지
        this.mapUsageGuide();           // 이용안내
        this.mapSecondSection();        // 두 번째 섹션 (CUSTOM FIELD)
        this.mapMarquee();              // Marquee
        this.mapBanner();               // Banner
        this.mapGallery();              // Gallery

        // 메타 태그 업데이트 (페이지별 SEO 적용)
        const property = this.data.property;
        const pageSEO = {
            title: (facility?.name && property?.name) ? `${facility.name} - ${property.name}` : 'SEO 타이틀',
            description: facility?.description || property?.description || 'SEO 설명'
        };
        this.updateMetaTags(pageSEO);

        // E-commerce registration 매핑
        this.mapEcommerceRegistration();
    }
}

// DOMContentLoaded 이벤트 리스너
document.addEventListener('DOMContentLoaded', async () => {
    const facilityMapper = new FacilityMapper();
    try {
        await facilityMapper.loadData();
        await facilityMapper.mapPage();
    } catch (error) {
    }
});

// ES6 모듈 및 글로벌 노출
if (typeof module !== 'undefined' && module.exports) {
    module.exports = FacilityMapper;
} else {
    window.FacilityMapper = FacilityMapper;
}
