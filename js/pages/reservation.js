
// 스크롤 기반 이미지 및 텍스트 애니메이션 시스템
document.addEventListener('DOMContentLoaded', function() {
    // 타이핑 애니메이션 처리
    const typingText = document.querySelector('.typing-text');
    if (typingText) {
        setTimeout(() => {
            typingText.classList.add('typed');
        }, 2700);
    }
    // 모든 이미지 패널 가져오기
    const imagePanels = document.querySelectorAll('.reservation-panel-image');
    // 모든 reservation 박스 가져오기
    const reservationBoxes = document.querySelectorAll('.reservation-box');

    // 이미지 애니메이션을 위한 Intersection Observer 설정
    const imageObserverOptions = {
        root: null,
        rootMargin: '-20% 0px',
        threshold: 0
    };

    const imageObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            const section = entry.target.closest('.reservation-section');
            const isSecondSection = section && Array.from(section.parentElement.children).indexOf(section) === 1;

            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
                // 두번째 섹션은 왼쪽 radius, 나머지는 오른쪽 radius
                if (isSecondSection) {
                    entry.target.style.borderTopLeftRadius = '180px';
                    entry.target.style.borderBottomLeftRadius = '180px';
                } else {
                    entry.target.style.borderTopRightRadius = '180px';
                    entry.target.style.borderBottomRightRadius = '180px';
                }
            } else {
                entry.target.classList.remove('visible');
                // 벗어나면 원래대로
                entry.target.style.borderTopRightRadius = '0';
                entry.target.style.borderBottomRightRadius = '0';
                entry.target.style.borderTopLeftRadius = '0';
                entry.target.style.borderBottomLeftRadius = '0';
            }
        });
    }, imageObserverOptions);

    // 텍스트 박스 애니메이션을 위한 Intersection Observer 설정
    const textObserverOptions = {
        root: null,
        rootMargin: '-10% 0px',
        threshold: 0.2
    };

    const textObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
            }
        });
    }, textObserverOptions);

    // 각 이미지 패널 관찰 시작
    imagePanels.forEach(panel => {
        imageObserver.observe(panel);
    });

    // 각 텍스트 박스 관찰 시작
    reservationBoxes.forEach(box => {
        textObserver.observe(box);
    });

});