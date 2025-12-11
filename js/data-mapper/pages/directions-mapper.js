/**
 * Directions Page Data Mapper
 * directions.html 전용 매핑 함수들을 포함한 클래스
 * BaseDataMapper를 상속받아 오시는길 페이지 전용 기능 제공
 */
class DirectionsMapper extends BaseDataMapper {
    // Kakao Map 설정 상수
    static KAKAO_MAP_ZOOM_LEVEL = 5;
    static SDK_WAIT_INTERVAL = 100; // ms

    constructor() {
        super();
    }

    // ============================================================================
    // 🗺️ DIRECTIONS PAGE MAPPINGS
    // ============================================================================

    /**
     * Fullscreen Slider 섹션 매핑
     */
    mapSliderSection() {
        if (!this.isDataLoaded) return;

        const directionsData = this.safeGet(this.data, 'homepage.customFields.pages.directions.sections.0');
        if (!directionsData) return;

        // 슬라이더 이미지 매핑
        if (directionsData.hero?.images && Array.isArray(directionsData.hero.images)) {
            this.mapSliderImages(directionsData.hero.images);
        }
    }

    /**
     * Slider Images 동적 생성
     */
    mapSliderImages(images) {
        const sliderContainer = this.safeSelect('[data-directions-slider]');
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
            slideDiv.className = 'fullscreen-slide active';

            const imgElement = document.createElement('img');
            imgElement.src = './images/hero.jpg'; // 기본 placeholder 이미지
            imgElement.alt = '오시는길 이미지';

            slideDiv.appendChild(imgElement);
            sliderContainer.appendChild(slideDiv);
            return;
        }

        // 이미지 생성
        selectedImages.forEach((img, index) => {
            const slideDiv = document.createElement('div');
            slideDiv.className = 'fullscreen-slide';
            if (index === 0) {
                slideDiv.classList.add('active');
            }

            const imgElement = document.createElement('img');
            imgElement.src = img.url;
            imgElement.alt = this.sanitizeText(img.description, '오시는길 이미지');
            imgElement.loading = index === 0 ? 'eager' : 'lazy';

            slideDiv.appendChild(imgElement);
            sliderContainer.appendChild(slideDiv);
        });
    }

    /**
     * Property Name Korean 매핑
     * property.name → [data-main-property-name-kr]
     */
    mapPropertyNameKr() {
        if (!this.isDataLoaded) return;

        const property = this.safeGet(this.data, 'property');
        const propertyNameElement = this.safeSelect('[data-main-property-name-kr]');

        if (propertyNameElement && property?.name) {
            propertyNameElement.textContent = this.sanitizeText(property.name, '더 베스트 풀빌라');
        }
    }

    /**
     * Property Name English 매핑
     * property.nameEn → [data-main-property-name-en]
     */
    mapPropertyNameEn() {
        if (!this.isDataLoaded) return;

        const property = this.safeGet(this.data, 'property');
        const propertyNameElement = this.safeSelect('[data-main-property-name-en]');

        if (propertyNameElement && property?.nameEn) {
            propertyNameElement.textContent = this.sanitizeText(property.nameEn, 'The Best Poolvilla');
        }
    }

    /**
     * Location Info 섹션 매핑 (타이틀, 주소)
     */
    mapLocationInfo() {
        if (!this.isDataLoaded || !this.data.property) return;

        const property = this.data.property;
        const heroData = this.safeGet(this.data, 'homepage.customFields.pages.directions.sections.0.hero');

        // 타이틀 매핑 - customFields hero.title 사용
        const titleElement = this.safeSelect('[data-directions-title]');

        if (titleElement) {
            const titleText = this.sanitizeText(heroData?.title, '찾아오시는 길');
            titleElement.textContent = titleText;
        }

        // 주소 매핑 - 새로운 구조 (property.location.address)
        const addressElement = this.safeSelect('[data-directions-address]');
        if (addressElement) {
            const location = this.safeGet(property, 'location');
            const address = location?.address || property?.address; // 하위 호환성 유지
            addressElement.textContent = this.sanitizeText(address, '숙소 주소');
        }
    }

    /**
     * Notes 섹션 매핑 (안내사항) - location-note-section 요소 처리
     */
    mapNotesSection() {
        if (!this.isDataLoaded) return;

        const directionsData = this.safeGet(this.data, 'homepage.customFields.pages.directions.sections.0');
        const notesElement = this.safeSelect('[data-directions-notes]');

        if (!notesElement) return;

        // notice 데이터가 있으면 제목과 설명을 분리해서 표시
        if (directionsData?.notice?.title && directionsData?.notice?.description) {
            const title = this.sanitizeText(directionsData.notice.title);
            const description = this.sanitizeText(directionsData.notice.description).replace(/\n/g, '<br>');

            notesElement.innerHTML = `
                <div class="note-title">${title}</div>
                <div class="note-content">${description}</div>
            `;
            notesElement.style.display = 'flex';
        } else {
            // 데이터가 없으면 숨김
            notesElement.style.display = 'none';
        }
    }

    /**
     * Full Banner 섹션 매핑
     * 숙소 외경이미지 0번째 이미지 사용
     */
    mapFullBanner() {
        if (!this.isDataLoaded) return;

        const propertyImages = this.safeGet(this.data, 'property.images');
        const exteriorImages = propertyImages?.exterior;
        const bannerElement = this.safeSelect('[data-main-banner]');

        if (!bannerElement) {
            return;
        }

        // 외경 이미지 중 첫 번째 이미지 사용
        if (exteriorImages && exteriorImages.length > 0 && exteriorImages[0]?.url) {
            const imageUrl = exteriorImages[0].url;
            bannerElement.style.backgroundImage = `url('${imageUrl}')`;
            bannerElement.style.backgroundSize = 'cover';
            bannerElement.style.backgroundPosition = 'center';
            bannerElement.style.backgroundRepeat = 'no-repeat';
            bannerElement.style.minHeight = '400px'; // 최소 높이 설정
        } else {
            // 이미지가 없으면 배경 제거
            bannerElement.style.backgroundImage = 'none';
            bannerElement.style.minHeight = '400px'; // 최소 높이 설정
        }

        // 숙소 영문명 매핑 (full-banner 내부)
        const propertyNameEn = this.safeGet(this.data, 'property.nameEn');
        const closingPropertyName = bannerElement.querySelector('[data-closing-property-name]');
        if (closingPropertyName && propertyNameEn) {
            closingPropertyName.textContent = this.sanitizeText(propertyNameEn);
        }
    }

    /**
     * 카카오맵 초기화 및 표시
     */
    initKakaoMap() {
        if (!this.isDataLoaded || !this.data.property) {
            return;
        }

        const property = this.data.property;
        const mapContainer = document.getElementById('kakao-map');
        const location = this.safeGet(property, 'location');

        // 새로운 구조 (property.location.latitude/longitude) 또는 기존 구조 지원
        const latitude = location?.latitude || property.latitude;
        const longitude = location?.longitude || property.longitude;

        if (!mapContainer || !latitude || !longitude) {
            return;
        }

        // 지도 생성 함수
        const createMap = () => {
            try {
                // 검색 쿼리 및 URL 생성 (한 번만) - 새로운 구조 지원
                const address = location?.address || property.address;
                const searchQuery = address || property.name || '선택한 위치';
                const kakaoMapUrl = `https://map.kakao.com/?q=${encodeURIComponent(searchQuery)}`;
                const openKakaoMap = () => window.open(kakaoMapUrl, '_blank');

                // 지도 중심 좌표
                const mapCenter = new kakao.maps.LatLng(latitude, longitude);

                // 지도 옵션
                const mapOptions = {
                    center: mapCenter,
                    level: DirectionsMapper.KAKAO_MAP_ZOOM_LEVEL,
                    draggable: false,
                    scrollwheel: false,
                    disableDoubleClick: true,
                    disableDoubleClickZoom: true
                };

                // 지도 생성
                const map = new kakao.maps.Map(mapContainer, mapOptions);
                map.setZoomable(false);

                // 마커 생성 및 클릭 이벤트
                const marker = new kakao.maps.Marker({
                    position: mapCenter,
                    map: map
                });
                kakao.maps.event.addListener(marker, 'click', openKakaoMap);

                // 인포윈도우 콘텐츠 DOM 생성 및 이벤트 핸들러 연결
                const infowindowContent = document.createElement('div');
                infowindowContent.style.cssText = 'padding:5px; font-size:14px; cursor:pointer;';
                infowindowContent.innerHTML = `${property.name}<br/><small style="color:#666;">클릭하면 카카오맵으로 이동</small>`;
                infowindowContent.addEventListener('click', openKakaoMap);

                const infowindow = new kakao.maps.InfoWindow({
                    content: infowindowContent
                });
                infowindow.open(map, marker);
            } catch (error) {
            }
        };

        // SDK 로드 확인 및 지도 생성
        const checkSdkAndLoad = (retryCount = 0) => {
            const MAX_RETRIES = 20; // 20 * 100ms = 2초
            if (window.kakao && window.kakao.maps && window.kakao.maps.load) {
                // kakao.maps.load() 공식 API 사용
                window.kakao.maps.load(createMap);
            } else if (retryCount < MAX_RETRIES) {
                // SDK가 아직 로드되지 않았으면 대기
                setTimeout(() => checkSdkAndLoad(retryCount + 1), DirectionsMapper.SDK_WAIT_INTERVAL);
            } else {
            }
        };

        checkSdkAndLoad();
    }

    // ============================================================================
    // 🔄 TEMPLATE METHODS IMPLEMENTATION
    // ============================================================================

    /**
     * Directions 페이지 전체 매핑 실행
     */
    async mapPage() {
        if (!this.isDataLoaded) {
            return;
        }

        // 순차적으로 각 섹션 매핑
        this.mapPropertyNameKr(); // 숙소명 한글 매핑
        this.mapPropertyNameEn(); // 숙소명 영문 매핑
        this.mapSliderSection(); // 풀스크린 슬라이더 매핑
        this.mapLocationInfo(); // 타이틀, 주소 매핑
        this.mapNotesSection(); // 안내사항 매핑
        this.mapFullBanner(); // 풀 배너 이미지 매핑
        this.initKakaoMap(); // 카카오맵 초기화 및 표시

        // 메타 태그 업데이트 (페이지별 SEO 적용)
        const property = this.data.property;
        const directionsData = this.safeGet(this.data, 'homepage.customFields.pages.directions.sections.0.hero');
        const pageSEO = {
            title: property?.name ? `오시는길 - ${property.name}` : 'SEO 타이틀',
            description: directionsData?.description || property?.description || 'SEO 설명'
        };
        this.updateMetaTags(pageSEO);

        // OG 이미지 업데이트 (hero 이미지 사용)
        this.updateOGImage(directionsData);

        // E-commerce registration 매핑
        this.mapEcommerceRegistration();

        // 슬라이더 재초기화
        this.reinitializeSlider();

        // 페이지 스크립트 재초기화
        this.reinitializePageScripts();
    }

    /**
     * 슬라이더 재초기화
     */
    reinitializeSlider() {
        // FullscreenSlider 재초기화
        if (typeof window.FullscreenSlider === 'function') {
            const sliderContainer = document.querySelector('.fullscreen-slider-container');
            if (sliderContainer && document.querySelectorAll('.fullscreen-slide').length > 0) {
                new window.FullscreenSlider('.fullscreen-slider-container', {
                    slideDuration: 4000,
                    autoplay: true,
                    enableSwipe: true,
                    enableKeyboard: true
                });
            }
        }
    }

    /**
     * 페이지 스크립트 재초기화 (directions.js 함수들 호출)
     */
    reinitializePageScripts() {
        // location notes 초기화 (directions.js에서 정의)
        if (typeof window.initializeLocationNotes === 'function') {
            window.initializeLocationNotes();
        }

        // scroll animations 초기화 (directions.js에서 정의)
        if (typeof window.setupScrollAnimations === 'function') {
            window.setupScrollAnimations();
        }
    }

    /**
     * OG 이미지 업데이트 (directions hero 이미지 사용, 없으면 로고)
     * @param {Object} directionsData - directions hero 섹션 데이터
     */
    updateOGImage(directionsData) {
        if (!this.isDataLoaded) return;

        const ogImage = this.safeSelect('meta[property="og:image"]');
        if (!ogImage) return;

        // 우선순위: hero 이미지 > 로고 이미지
        if (directionsData?.images && directionsData.images.length > 0 && directionsData.images[0]?.url) {
            ogImage.setAttribute('content', directionsData.images[0].url);
        } else {
            const defaultImage = this.getDefaultOGImage();
            if (defaultImage) {
                ogImage.setAttribute('content', defaultImage);
            }
        }
    }
}

// ============================================================================
// 🚀 INITIALIZATION
// ============================================================================

// 페이지 로드 시 자동 초기화
if (typeof window !== 'undefined') {
    window.addEventListener('DOMContentLoaded', async () => {
        const mapper = new DirectionsMapper();
        await mapper.initialize();
    });
}

// ES6 모듈 및 글로벌 노출
if (typeof module !== 'undefined' && module.exports) {
    module.exports = DirectionsMapper;
} else {
    window.DirectionsMapper = DirectionsMapper;
}