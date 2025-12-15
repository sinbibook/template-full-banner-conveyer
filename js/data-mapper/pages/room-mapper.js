/**
 * Room Page Data Mapper
 * room.html 전용 매핑 함수들을 포함한 클래스
 * BaseDataMapper를 상속받아 객실 페이지 전용 기능 제공
 * URL 파라미터로 ?index=0,1,2...를 받아서 동적으로 객실 정보 표시
 */
class RoomMapper extends BaseDataMapper {
    constructor() {
        super();
        this.currentRoom = null;
        this.currentRoomIndex = null;
        this.currentRoomPageData = null;
    }

    // ============================================================================
    // 🏠 ROOM PAGE SPECIFIC MAPPINGS
    // ============================================================================

    /**
     * 현재 객실 정보 가져오기 (URL 파라미터 기반)
     */
    getCurrentRoom() {
        if (!this.isDataLoaded || !this.data.rooms) {
            return null;
        }

        // URL에서 room id 추출
        const urlParams = new URLSearchParams(window.location.search);
        let roomId = urlParams.get('id');

        // id가 없으면 첫 번째 room으로 리다이렉트
        if (!roomId && this.data.rooms.length > 0) {
            window.location.href = `room.html?id=${this.data.rooms[0].id}`;
            return null;
        }

        if (!roomId) {
            return null;
        }

        // rooms 배열에서 해당 id의 객실 찾기
        const roomIndex = this.data.rooms.findIndex(room => room.id === roomId);

        if (roomIndex === -1) {
            return null;
        }

        const room = this.data.rooms[roomIndex];
        this.currentRoom = room;
        this.currentRoomIndex = roomIndex; // 인덱스도 저장 (페이지 데이터 접근용)
        return room;
    }

    /**
     * 현재 객실 인덱스 가져오기
     */
    getCurrentRoomIndex() {
        if (this.currentRoomIndex !== undefined) {
            return this.currentRoomIndex;
        }

        // getCurrentRoom()이 호출되지 않았을 경우를 위한 fallback
        const urlParams = new URLSearchParams(window.location.search);
        const roomId = urlParams.get('id');

        if (roomId && this.data.rooms) {
            const index = this.data.rooms.findIndex(room => room.id === roomId);
            if (index !== -1) {
                this.currentRoomIndex = index;
                return index;
            }
        }

        return null;
    }

    /**
     * 현재 객실 페이지 데이터 가져오기 (캐시 포함)
     */
    getCurrentRoomPageData() {
        // 현재 room을 먼저 가져와서 캐시가 유효한지 확인
        const room = this.getCurrentRoom();
        if (!room || !room.id) {
            return null;
        }

        // 캐시된 데이터가 있고 같은 room이면 바로 반환
        if (this.currentRoomPageData && this.currentRoomPageData.id === room.id) {
            return this.currentRoomPageData;
        }

        const roomPages = this.safeGet(this.data, 'homepage.customFields.pages.room');
        if (!roomPages || !Array.isArray(roomPages)) {
            return null;
        }

        // pages.room 배열에서 현재 room.id와 일치하는 페이지 데이터 찾기
        const pageData = roomPages.find(page => page.id === room.id);
        if (!pageData) {
            return null;
        }

        // 캐시 저장
        this.currentRoomPageData = {
            id: room.id,
            data: pageData
        };

        return this.currentRoomPageData;
    }

    /**
     * Hero Slider 섹션 매핑
     */
    mapHeroSlider() {
        const room = this.getCurrentRoom();
        if (!room) return;

        const sliderContainer = this.safeSelect('[data-room-slider]');
        if (!sliderContainer) return;

        // JSON 구조에 따라 interior 이미지 배열 가져오기
        const interiorImages = room.images?.[0]?.interior;

        // 기존 슬라이드 제거
        sliderContainer.innerHTML = '';

        // 이미지가 없으면 placeholder 처리
        const isDemo = this.dataSource === 'demo-filled.json';

        if (!interiorImages || interiorImages.length === 0) {
            if (isDemo) {
                // 데모 모드: fallback 이미지 5개 생성
                const placeholderImages = [
                    './images/room.jpg',
                    './images/room2.jpg',
                    './images/room3.jpg',
                    './images/pool.jpg',
                    './images/pool2.jpg'
                ];

                placeholderImages.forEach((imgSrc, i) => {
                    const slide = document.createElement('div');
                    slide.className = 'room-slide';
                    slide.setAttribute('data-index', i);

                    if (i === 0) {
                        slide.classList.add('active');
                    } else if (i === 1) {
                        slide.classList.add('next');
                    } else if (i === 4) {
                        slide.classList.add('prev');
                    }

                    const img = document.createElement('img');
                    img.src = imgSrc;
                    img.alt = `객실 이미지 ${i + 1}`;
                    img.loading = i === 0 ? 'eager' : 'lazy';

                    slide.appendChild(img);
                    sliderContainer.appendChild(slide);
                });

                const roomTotalPages = this.safeSelect('.room-total-pages');
                if (roomTotalPages) roomTotalPages.textContent = '05';
            } else {
                // 프로덕션 모드: empty placeholder 1개 생성
                const slide = document.createElement('div');
                slide.className = 'room-slide active';
                slide.setAttribute('data-index', 0);

                const img = document.createElement('img');
                img.src = ImageHelpers.EMPTY_IMAGE_WITH_ICON;
                img.alt = '이미지 없음';
                img.classList.add('empty-image-placeholder');

                slide.appendChild(img);
                sliderContainer.appendChild(slide);

                const roomTotalPages = this.safeSelect('.room-total-pages');
                if (roomTotalPages) roomTotalPages.textContent = '01';
            }
            return;
        }

        // isSelected가 true인 이미지만 필터링하고 sortOrder로 정렬
        const sortedImages = interiorImages
            .filter(img => img.isSelected)
            .sort((a, b) => (a.sortOrder || 0) - (b.sortOrder || 0));

        // 슬라이드 생성
        sortedImages.forEach((image, index) => {
            const slide = document.createElement('div');
            slide.className = 'room-slide';
            slide.setAttribute('data-index', index);

            // 첫 번째는 active, 두 번째는 next로 설정
            if (index === 0) {
                slide.classList.add('active');
            } else if (index === 1) {
                slide.classList.add('next');
            } else if (index === sortedImages.length - 1 && sortedImages.length > 2) {
                slide.classList.add('prev');
            }

            const img = document.createElement('img');
            img.src = image.url;
            img.alt = this.sanitizeText(image.description, room.name || '객실 이미지');
            img.loading = index === 0 ? 'eager' : 'lazy';
            img.setAttribute('data-image-fallback', '');

            slide.appendChild(img);
            sliderContainer.appendChild(slide);
        });

        // Total 카운트 업데이트 (데스크탑 & 모바일)
        const roomTotalPages = this.safeSelect('.room-total-pages');
        if (roomTotalPages) {
            roomTotalPages.textContent = String(sortedImages.length).padStart(2, '0');
        }
        const roomTotalPagesMobile = this.safeSelect('.room-total-pages-mobile');
        if (roomTotalPagesMobile) {
            roomTotalPagesMobile.textContent = String(sortedImages.length).padStart(2, '0');
        }

        // Hero Slider 초기화
        this.initializeHeroSlider();
    }

    /**
     * Hero Slider 초기화 - 무한 캐러셀
     */
    initializeHeroSlider() {
        const sliderContainer = this.safeSelect('[data-room-slider]');
        const prevBtn = this.safeSelect('#room-prev-btn');
        const nextBtn = this.safeSelect('#room-next-btn');
        const prevBtnMobile = this.safeSelect('#room-prev-btn-mobile');
        const nextBtnMobile = this.safeSelect('#room-next-btn-mobile');
        const currentPageSpan = this.safeSelect('.room-current-page');
        const currentPageSpanMobile = this.safeSelect('.room-current-page-mobile');
        const progressFill = this.safeSelect('.room-progress-fill');

        if (!sliderContainer || !prevBtn || !nextBtn) return;

        const slides = Array.from(sliderContainer.children);
        const totalSlides = slides.length;

        if (totalSlides === 0) return;

        let currentIndex = 0;
        let autoPlayInterval = null;
        let isTransitioning = false;

        // 클론 생성 (앞뒤로 복사본 추가)
        const firstClone = slides[0].cloneNode(true);
        const lastClone = slides[totalSlides - 1].cloneNode(true);
        firstClone.classList.add('clone');
        lastClone.classList.add('clone');

        // 슬라이드 초기 설정
        slides.forEach((slide, index) => {
            slide.style.position = 'absolute';
            slide.style.top = '50%';
            slide.style.left = '50%';
            slide.style.width = '75%';
            slide.style.height = '90%';
            slide.style.borderRadius = '20px';
            slide.style.overflow = 'hidden';
            slide.style.transition = 'all 0.8s cubic-bezier(0.25, 0.46, 0.45, 0.94)';
        });

        // 슬라이드 위치 업데이트 함수
        const updateSlidePositions = () => {
            const isMobile = window.innerWidth <= 768;

            if (isMobile) {
                // 모바일: fade 효과 (90vw)
                slides.forEach((slide, index) => {
                    slide.style.transform = 'translate(-50%, -50%)'; // transform 유지
                    slide.style.width = '90vw';
                    if (index === currentIndex) {
                        slide.classList.add('active');
                    } else {
                        slide.classList.remove('active');
                    }
                });
            } else {
                // 데스크탑: 기존 슬라이드 효과
                slides.forEach((slide, index) => {
                    slide.classList.remove('active'); // 모바일 클래스 제거
                    const position = (index - currentIndex + totalSlides) % totalSlides;

                    if (position === 0) {
                        // Active (center)
                        slide.style.transform = 'translate(-50%, -50%)';
                        slide.style.opacity = '1';
                        slide.style.visibility = 'visible';
                        slide.style.zIndex = '3';
                    } else if (position === 1) {
                        // Next (right)
                        slide.style.transform = 'translate(calc(50% + 30px), -50%)';
                        slide.style.opacity = '0.7';
                        slide.style.visibility = 'visible';
                        slide.style.zIndex = '2';
                    } else if (position === totalSlides - 1) {
                        // Prev (left)
                        slide.style.transform = 'translate(calc(-150% - 30px), -50%)';
                        slide.style.opacity = '0.7';
                        slide.style.visibility = 'visible';
                        slide.style.zIndex = '2';
                    } else {
                        // Hidden
                        slide.style.opacity = '0';
                        slide.style.visibility = 'visible';
                        slide.style.zIndex = '1';
                        // 다음에 prev 위치로 올 슬라이드는 왼쪽 멀리에 배치
                        if (position === totalSlides - 2) {
                            slide.style.transform = 'translate(calc(-250% - 60px), -50%)';
                        } else {
                            slide.style.transform = 'translate(calc(150% + 60px), -50%)';
                        }
                    }
                });
            }
        };

        // 다음 슬라이드로 이동
        const moveNext = () => {
            if (isTransitioning) return;
            isTransitioning = true;

            currentIndex = (currentIndex + 1) % totalSlides;
            updateSlidePositions();

            // 페이지 번호 업데이트 (데스크탑 & 모바일)
            if (currentPageSpan) {
                currentPageSpan.textContent = String(currentIndex + 1).padStart(2, '0');
            }
            if (currentPageSpanMobile) {
                currentPageSpanMobile.textContent = String(currentIndex + 1).padStart(2, '0');
            }

            setTimeout(() => {
                isTransitioning = false;
            }, 1000);
        };

        // 이전 슬라이드로 이동
        const movePrev = () => {
            if (isTransitioning) return;
            isTransitioning = true;

            currentIndex = (currentIndex - 1 + totalSlides) % totalSlides;
            updateSlidePositions();

            // 페이지 번호 업데이트
            if (currentPageSpan) {
                currentPageSpan.textContent = String(currentIndex + 1).padStart(2, '0');
            }

            setTimeout(() => {
                isTransitioning = false;
            }, 1000);
        };

        // 자동 재생 시작 함수
        const startAutoPlay = () => {
            stopAutoPlay();
            autoPlayInterval = setInterval(moveNext, 3000);
        };

        // 자동 재생 정지 함수
        const stopAutoPlay = () => {
            if (autoPlayInterval) {
                clearInterval(autoPlayInterval);
                autoPlayInterval = null;
            }
        };

        // 버튼 이벤트
        prevBtn.addEventListener('click', () => {
            stopAutoPlay();
            movePrev();
            startAutoPlay();
        });

        nextBtn.addEventListener('click', () => {
            stopAutoPlay();
            moveNext();
            startAutoPlay();
        });

        // 모바일 버튼 이벤트
        if (prevBtnMobile) {
            prevBtnMobile.addEventListener('click', () => {
                stopAutoPlay();
                movePrev();
                startAutoPlay();
            });
        }

        if (nextBtnMobile) {
            nextBtnMobile.addEventListener('click', () => {
                stopAutoPlay();
                moveNext();
                startAutoPlay();
            });
        }

        // 마우스 호버 시 자동 재생 정지
        sliderContainer.addEventListener('mouseenter', stopAutoPlay);
        sliderContainer.addEventListener('mouseleave', startAutoPlay);

        // 모바일 터치 이벤트 (스와이프)
        let touchStartX = 0;
        let touchEndX = 0;
        let touchStartY = 0;
        let touchEndY = 0;

        sliderContainer.addEventListener('touchstart', (e) => {
            touchStartX = e.changedTouches[0].screenX;
            touchStartY = e.changedTouches[0].screenY;
            stopAutoPlay();
        });

        sliderContainer.addEventListener('touchend', (e) => {
            touchEndX = e.changedTouches[0].screenX;
            touchEndY = e.changedTouches[0].screenY;

            const deltaX = touchStartX - touchEndX;
            const deltaY = Math.abs(touchStartY - touchEndY);

            // 가로 스와이프가 세로보다 클 때만 처리 (세로 스크롤 방해 방지)
            if (Math.abs(deltaX) > 50 && Math.abs(deltaX) > deltaY) {
                if (deltaX > 0) {
                    // 왼쪽으로 스와이프 → 다음 슬라이드
                    moveNext();
                } else {
                    // 오른쪽으로 스와이프 → 이전 슬라이드
                    movePrev();
                }
            }
            startAutoPlay();
        });

        // 리사이즈 이벤트 처리
        let resizeTimer;
        window.addEventListener('resize', () => {
            clearTimeout(resizeTimer);
            resizeTimer = setTimeout(() => {
                updateSlidePositions();
            }, 250);
        });

        // 초기 설정
        updateSlidePositions();
        startAutoPlay();
    }

    /**
     * 기본 정보 섹션 매핑 (객실명, 썸네일, 설명)
     */
    mapBasicInfo() {
        const room = this.getCurrentRoom();
        if (!room) return;

        // 객실명 매핑 (시스템 데이터)
        const roomName = this.safeSelect('[data-room-name]');
        if (roomName) {
            roomName.textContent = room.name;
        }

        // 모바일 객실명 매핑 (시스템 데이터)
        const roomNameMobile = this.safeSelect('[data-room-name-mobile]');
        if (roomNameMobile) {
            roomNameMobile.textContent = room.name;
        }

        // Hero 섹션의 객실 설명 매핑 (시스템 데이터)
        const heroDescription = document.querySelector('.room-hero-text [data-room-info-description]');
        if (heroDescription) {
            heroDescription.innerHTML = this._formatTextWithLineBreaks(room.description, `${room.name}의 상세 정보입니다.`);
            // animate-on-scroll이 있으므로 visible 클래스 추가
            setTimeout(() => {
                heroDescription.classList.add('visible');
            }, 100);
        }

        // 썸네일 이미지 매핑 (시스템 데이터)
        const roomThumbnail = this.safeSelect('[data-room-thumbnail]');
        if (roomThumbnail) {
            const thumbnailImages = room.images?.[0]?.thumbnail;
            const selectedThumbnail = thumbnailImages?.find(img => img.isSelected);
            const isDemo = this.dataSource === 'demo-filled.json';

            if (selectedThumbnail) {
                roomThumbnail.src = selectedThumbnail.url;
                roomThumbnail.alt = this.sanitizeText(selectedThumbnail.description, room.name || '객실 썸네일');
                roomThumbnail.setAttribute('data-image-fallback', '');
                roomThumbnail.classList.remove('empty-image-placeholder');
            } else if (isDemo) {
                roomThumbnail.src = './images/room.jpg';
                roomThumbnail.alt = this.sanitizeText(room.name, '객실 썸네일');
                roomThumbnail.classList.remove('empty-image-placeholder');
            } else {
                roomThumbnail.src = ImageHelpers.EMPTY_IMAGE_WITH_ICON;
                roomThumbnail.alt = '이미지 없음';
                roomThumbnail.classList.add('empty-image-placeholder');
            }
        }

        // 객실 설명 매핑 (CUSTOM FIELD)
        const roomDescription = this.safeSelect('[data-room-description]');
        if (roomDescription) {
            const roomPageData = this.getCurrentRoomPageData();
            const heroTitle = roomPageData?.data?.sections?.[0]?.hero?.title;
            roomDescription.innerHTML = this._formatTextWithLineBreaks(heroTitle, '객실 히어로 타이틀');
        }
    }

    /**
     * 객실 정보 섹션 매핑 (Room Information 섹션)
     */
    mapRoomInfoSection() {
        const room = this.getCurrentRoom();
        if (!room) return;

        // 시스템 데이터: 객실 설명 매핑
        const roomInfoDescription = this.safeSelect('[data-room-info-description]');
        if (roomInfoDescription) {
            roomInfoDescription.innerHTML = this._formatTextWithLineBreaks(room.description, `${room.name}의 상세 정보입니다.`);
        }
    }

    /**
     * 객실 상세 정보 매핑
     */
    mapRoomDetails() {
        const room = this.getCurrentRoom();
        if (!room) return;

        // 객실 크기 (시스템 데이터)
        const roomSize = this.safeSelect('[data-room-size]');
        if (roomSize) {
            roomSize.textContent = room.size || '-';
        }

        // 침대 타입 (시스템 데이터)
        const roomBedTypes = this.safeSelect('[data-room-bed-types]');
        if (roomBedTypes) {
            const bedTypes = room.bedTypes || [];
            roomBedTypes.textContent = bedTypes.length > 0 ? bedTypes.join(', ') : '-';
        }

        // 객실 구성 (시스템 데이터)
        const roomComposition = this.safeSelect('[data-room-composition]');
        if (roomComposition) {
            const roomStructures = room.roomStructures || [];
            roomComposition.textContent = roomStructures.length > 0 ? roomStructures.join(', ') : '-';
        }

        // 인원 (시스템 데이터)
        const roomCapacity = this.safeSelect('[data-room-capacity]');
        if (roomCapacity) {
            const capacity = `기준 ${room.baseOccupancy || 2}인 / 최대 ${room.maxOccupancy || 4}인`;
            roomCapacity.textContent = capacity;
        }

        // 체크인 (시스템 데이터)
        const roomCheckin = this.safeSelect('[data-room-checkin]');
        if (roomCheckin) {
            const checkinTime = this.data.property?.checkinTime || '15:00';
            roomCheckin.textContent = checkinTime;
        }

        // 체크아웃 (시스템 데이터)
        const roomCheckout = this.safeSelect('[data-room-checkout]');
        if (roomCheckout) {
            const checkoutTime = this.data.property?.checkoutTime || '11:00';
            roomCheckout.textContent = checkoutTime;
        }

        // 객실 이용규칙/안내사항 (시스템 데이터)
        const roomGuide = this.safeSelect('[data-room-guide]');
        if (roomGuide) {
            const roomInfo = room.roomInfo || '편안한 휴식 공간';
            roomGuide.innerHTML = this._formatTextWithLineBreaks(roomInfo);
        }
    }

    /**
     * 객실 편의시설/특징 매핑
     */
    mapRoomAmenities() {
        const room = this.getCurrentRoom();
        if (!room || !room.amenities || room.amenities.length === 0) {
            return;
        }

        // amenities-list 매핑 (편의시설 섹션)
        const amenitiesIcons = this.safeSelect('[data-room-amenities-icons]');
        if (amenitiesIcons) {
            amenitiesIcons.innerHTML = '';

            // 간단한 아이콘과 텍스트로 표시
            room.amenities.forEach(amenity => {
                const amenityName = amenity.name?.ko || amenity.name || amenity;
                const iconItem = document.createElement('div');
                iconItem.className = 'amenity-icon-item';

                iconItem.innerHTML = `
                    <svg class="amenity-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"/>
                    </svg>
                    <span>${amenityName}</span>
                `;

                amenitiesIcons.appendChild(iconItem);
            });
        }

        // 기존 그리드 방식도 유지 (있을 경우)
        const amenitiesGrid = this.safeSelect('[data-room-amenities-grid]');
        if (!amenitiesGrid) {
            return;
        }

        // 기존 어메니티 제거
        amenitiesGrid.innerHTML = '';

        // JSON 데이터의 실제 어메니티들에 맞춘 아이콘 매핑 (기존 방식 유지)
        const amenityIcons = {
            // JSON에서 나오는 실제 어메니티들
            '간이 주방': 'M3 6h18M3 6l3-3h12l3 3M3 6v15a2 2 0 002 2h14a2 2 0 002-2V6M10 12h4',
            '냉장고': 'M5 3h14a2 2 0 012 2v14a2 2 0 01-2 2H5a2 2 0 01-2-2V5a2 2 0 012-2zM12 8h.01M12 16h.01',
            '전자레인지': 'M3 7h18v10H3V7zM7 7V3a1 1 0 011-1h8a1 1 0 011 1v4M9 12h6',
            '인덕션': 'M8 12a4 4 0 118 0 4 4 0 01-8 0zM12 8v8M8 12h8',
            '조리도구': 'M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z',
            '그릇': 'M21 12c0 4.97-4.03 9-9 9s-9-4.03-9-9 4.03-9 9-9 9 4.03 9 9zM8 12h8',
            '정수기': 'M12 2v20M8 5h8M6 12h12M8 19h8',
            '와이파이': 'M2 7h20M2 12h20M2 17h20',
            '에어컨': 'M3 12h18M3 8h18M3 16h18M12 3v18',
            '침구류': 'M3 7h18v10H3V7zM7 3h10v4H7V3z',
            '수건': 'M3 12h18M6 7h12M6 17h12',
            '어메니티': 'M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z',
            '청소용품': 'M6 2l3 6 5-4-8 13 4-7 6 2z',
            '헤어드라이어': 'M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z',
            '기본': 'M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z'
        };

        // 어메니티 아이템들 생성 (기존 방식과 동일)
        room.amenities.forEach(amenity => {
            const amenityDiv = document.createElement('div');
            amenityDiv.className = 'feature-item';

            const amenityName = amenity.name?.ko || amenity.name || amenity;
            const iconPath = amenityIcons[amenityName] || amenityIcons['기본'];

            amenityDiv.innerHTML = `
                <svg class="feature-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="${iconPath}"/>
                </svg>
                <span class="text-base md:text-lg text-gray-600">${amenityName}</span>
            `;

            amenitiesGrid.appendChild(amenityDiv);
        });
    }

    /**
     * Circular Text 매핑
     */
    mapCircularText() {
        // Hero circular text 매핑
        const heroCircularText = this.safeSelect('[data-hero-circular-property-text]');
        if (heroCircularText) {
            const property = this.safeGet(this.data, 'property');
            if (property?.nameEn) {
                // 텍스트를 3번 반복하여 원 전체에 균등하게 분포
                const repeatedText = `${property.nameEn.toUpperCase()} • ${property.nameEn.toUpperCase()} • ${property.nameEn.toUpperCase()} • `;
                heroCircularText.textContent = repeatedText;
            }
        }

        // 모바일 Hero circular text 매핑
        const heroCircularTextMobile = this.safeSelect('[data-hero-circular-property-text-mobile]');
        if (heroCircularTextMobile) {
            const property = this.safeGet(this.data, 'property');
            if (property?.nameEn) {
                // 텍스트를 3번 반복하여 원 전체에 균등하게 분포
                const repeatedText = `${property.nameEn.toUpperCase()} • ${property.nameEn.toUpperCase()} • ${property.nameEn.toUpperCase()} • `;
                heroCircularTextMobile.textContent = repeatedText;
            }
        }
    }

    /**
     * 객실 배너 이미지 매핑 (thumbnail 0번째)
     */
    mapBanner() {
        const room = this.getCurrentRoom();
        if (!room) return;

        const bannerSection = this.safeSelect('[data-room-banner]');
        if (!bannerSection) return;

        const thumbnailImages = room.images?.[0]?.thumbnail;
        const sortedThumbnails = thumbnailImages
            ?.filter(img => img.isSelected)
            .sort((a, b) => (a.sortOrder || 0) - (b.sortOrder || 0)) || [];

        const firstThumbnail = sortedThumbnails?.[0];
        const isDemo = this.dataSource === 'demo-filled.json';

        // 항상 스타일 적용 (이미지가 없어도 placeholder 표시)
        if (firstThumbnail?.url) {
            bannerSection.style.backgroundImage = `url('${firstThumbnail.url}')`;
            bannerSection.classList.remove('empty-image-placeholder');
        } else if (isDemo) {
            bannerSection.style.backgroundImage = `url('./images/room.jpg')`;
            bannerSection.classList.remove('empty-image-placeholder');
        } else {
            bannerSection.style.backgroundImage = `url('${ImageHelpers.EMPTY_IMAGE_WITH_ICON}')`;
            bannerSection.classList.add('empty-image-placeholder');
        }

        bannerSection.style.backgroundSize = 'cover';
        bannerSection.style.backgroundPosition = 'center';
        bannerSection.style.backgroundRepeat = 'no-repeat';
        bannerSection.style.backgroundAttachment = 'fixed';
        bannerSection.style.height = '600px';

        // animate-on-scroll 오버라이드
        bannerSection.style.opacity = '1';
        bannerSection.style.transform = 'none';

        // 또는 visible 클래스 추가
        setTimeout(() => {
            bannerSection.classList.add('visible');
        }, 100);

        // 배너 내 property name 매핑
        const bannerPropertyText = bannerSection.querySelector('[data-property-name-en]');
        if (bannerPropertyText) {
            const propertyNameEn = this.data.property?.nameEn || 'PROPERTY NAME';
            bannerPropertyText.textContent = propertyNameEn;
        }
    }

    /**
     * 외부 갤러리 섹션 매핑 (exterior 이미지 1~6장 자동 그리드)
     */
    mapExteriorGallery() {
        const room = this.getCurrentRoom();
        if (!room) return;

        // 갤러리 제목 매핑 (CUSTOM FIELD)
        const galleryTitle = this.safeSelect('[data-room-gallery-title]');
        if (galleryTitle) {
            const roomPageData = this.getCurrentRoomPageData();
            const galleryTitleText = roomPageData?.data?.sections?.[0]?.gallery?.title;
            galleryTitle.innerHTML = this._formatTextWithLineBreaks(galleryTitleText || '객실 갤러리 타이틀');
        }

        const exteriorImages = room.images?.[0]?.exterior;
        const sortedImages = exteriorImages
            ?.filter(img => img.isSelected)
            .sort((a, b) => (a.sortOrder || 0) - (b.sortOrder || 0)) || [];

        // 최대 6장만 사용
        const galleryImages = sortedImages.slice(0, 6);
        const imageCount = galleryImages.length;

        // 갤러리 래퍼 요소 찾기
        const galleryWrapper = this.safeSelect('.gallery-grid-wrapper');
        if (!galleryWrapper) return;

        // 기존 내용 비우기
        galleryWrapper.innerHTML = '';
        const isDemo = this.dataSource === 'demo-filled.json';

        // 이미지가 없으면 플레이스홀더 표시
        if (imageCount === 0) {
            if (isDemo) {
                // 데모 모드: fallback 이미지 6개 사용
                const placeholderImages = [
                    './images/exterior.jpg',
                    './images/exterior2.jpg',
                    './images/pool.jpg',
                    './images/pool2.jpg',
                    './images/pool3.jpg',
                    './images/sky.jpg'
                ];

                // 3-2-1 패턴으로 플레이스홀더 표시
                const gridPattern = [3, 2, 1];
                let imageIndex = 0;
                let delayCount = 0;

                gridPattern.forEach(rowCount => {
                    const rowDiv = document.createElement('div');
                    rowDiv.className = `gallery-row row-${rowCount}`;

                    for (let i = 0; i < rowCount && imageIndex < 6; i++) {
                        const itemDiv = document.createElement('div');
                        itemDiv.className = 'gallery-item animate-fade-up';
                        itemDiv.setAttribute('data-delay', delayCount);

                        const img = document.createElement('img');
                        img.src = placeholderImages[imageIndex];
                        img.alt = '갤러리 이미지';

                        itemDiv.appendChild(img);
                        rowDiv.appendChild(itemDiv);

                        imageIndex++;
                        delayCount += 300;
                    }

                    galleryWrapper.appendChild(rowDiv);
                });
            } else {
                // 프로덕션 모드: empty placeholder 1개 생성
                const rowDiv = document.createElement('div');
                rowDiv.className = 'gallery-row row-1';

                const itemDiv = document.createElement('div');
                itemDiv.className = 'gallery-item animate-fade-up';

                const img = document.createElement('img');
                img.src = ImageHelpers.EMPTY_IMAGE_WITH_ICON;
                img.alt = '이미지 없음';
                img.classList.add('empty-image-placeholder');

                itemDiv.appendChild(img);
                rowDiv.appendChild(itemDiv);
                galleryWrapper.appendChild(rowDiv);
            }
        } else {
            // 이미지 개수에 따른 그리드 패턴 결정
            let gridPattern = [];
            switch(imageCount) {
                case 1:
                    gridPattern = [1]; // 1장
                    break;
                case 2:
                    gridPattern = [2]; // 2장 한 줄
                    break;
                case 3:
                    gridPattern = [3]; // 3장 한 줄
                    break;
                case 4:
                    gridPattern = [2, 2]; // 2장씩 2줄
                    break;
                case 5:
                    gridPattern = [3, 2]; // 3장 + 2장
                    break;
                case 6:
                    gridPattern = [3, 2, 1]; // 3장 + 2장 + 1장
                    break;
            }

            // 이미지 인덱스 추적
            let imageIndex = 0;
            let delayCount = 0;

            // 그리드 패턴에 따라 HTML 생성
            gridPattern.forEach(rowCount => {
                const rowDiv = document.createElement('div');
                rowDiv.className = `gallery-row row-${rowCount}`;

                for (let i = 0; i < rowCount && imageIndex < imageCount; i++) {
                    const image = galleryImages[imageIndex];
                    const itemDiv = document.createElement('div');
                    itemDiv.className = 'gallery-item animate-fade-up';
                    itemDiv.setAttribute('data-delay', delayCount);

                    const img = document.createElement('img');
                    img.src = image.url;
                    img.alt = this.sanitizeText(image.description, room.name || '갤러리 이미지');
                    img.setAttribute('data-image-fallback', '');

                    itemDiv.appendChild(img);
                    rowDiv.appendChild(itemDiv);

                    imageIndex++;
                    delayCount += 300; // 각 이미지마다 300ms 딜레이
                }

                galleryWrapper.appendChild(rowDiv);
            });
        }

        // 스크롤 애니메이션 재초기화
        setTimeout(() => {
            this.initGalleryAnimations();
        }, 100);
    }

    /**
     * 갤러리 애니메이션 초기화
     */
    initGalleryAnimations() {
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

        // 새로 생성된 갤러리 아이템들에 대해 관찰 시작
        const galleryItems = document.querySelectorAll('.gallery-item.animate-fade-up');
        galleryItems.forEach((item) => {
            const delay = item.getAttribute('data-delay');
            if (delay) {
                item.style.transitionDelay = `${delay / 1000}s`;
            }
            observer.observe(item);
        });

        // 갤러리 제목도 애니메이션 적용
        const galleryTitle = document.querySelector('.gallery-grid-title.animate-fade-up');
        if (galleryTitle) {
            observer.observe(galleryTitle);
        }
    }

    // ============================================================================
    // 🔄 MAIN ENTRY POINT
    // ============================================================================

    /**
     * Room 페이지 전체 매핑 실행
     */
    async mapPage() {
        if (!this.isDataLoaded) {
            return;
        }

        const room = this.getCurrentRoom();
        if (!room) {
            return;
        }

        // 순차적으로 각 섹션 매핑
        this.mapHeroSlider();
        this.initializeHeroSlider();
        this.mapBasicInfo();
        this.mapRoomInfoSection();
        this.mapRoomDetails();
        this.mapCircularText();
        this.mapRoomAmenities();
        this.mapBanner();
        this.mapExteriorGallery();

        // 메타 태그 업데이트 (페이지별 SEO 적용)
        const property = this.data.property;
        const pageSEO = {
            title: (room?.name && property?.name) ? `${room.name} - ${property.name}` : 'SEO 타이틀',
            description: room?.description || property?.description || 'SEO 설명'
        };
        this.updateMetaTags(pageSEO);

        // OG 이미지 업데이트 (객실 이미지 사용)
        this.updateOGImage(room);

        // E-commerce registration 매핑
        this.mapEcommerceRegistration();
    }


    /**
     * OG 이미지 업데이트 (객실 이미지 사용, 없으면 로고)
     * @param {Object} room - 현재 객실 데이터
     */
    updateOGImage(room) {
        if (!this.isDataLoaded || !room) return;

        const ogImage = this.safeSelect('meta[property="og:image"]');
        if (!ogImage) return;

        // room.images[0]에서 thumbnail, interior, exterior 순으로 첫 번째 이미지 찾기
        const imageSources = [
            room.images?.[0]?.thumbnail,
            room.images?.[0]?.interior,
            room.images?.[0]?.exterior,
        ];

        const firstImageArray = imageSources.find(arr => Array.isArray(arr) && arr.length > 0);
        const imageUrl = firstImageArray?.[0]?.url;

        // 우선순위: 객실 이미지 > 로고 이미지
        if (imageUrl) {
            ogImage.setAttribute('content', imageUrl);
        } else {
            const defaultImage = this.getDefaultOGImage();
            if (defaultImage) {
                ogImage.setAttribute('content', defaultImage);
            }
        }
    }
}

// ES6 모듈 및 글로벌 노출
if (typeof module !== 'undefined' && module.exports) {
    module.exports = RoomMapper;
} else {
    window.RoomMapper = RoomMapper;
}

// ============================================================================
// 🚀 INITIALIZATION
// ============================================================================

// iframe 내부가 아닌 경우에만 자동 초기화 (preview-handler와 충돌 방지)
if (typeof window !== 'undefined' && window.parent === window) {
    document.addEventListener('DOMContentLoaded', async () => {
        const roomMapper = new RoomMapper();

        try {
            // 데이터 로드
            await roomMapper.loadData();

            // 페이지 매핑 실행
            await roomMapper.mapPage();
        } catch (error) {
            console.error('RoomMapper initialization error:', error);
        }
    });
}
