import { Controller } from '@hotwired/stimulus';

export default class extends Controller {
    static targets = ["image", "counter", "dot", "thumbnail"];
    static values = {
        images: Array
    }

    connect() {
        this.currentIndex = 0;
        this.touchStart = 0;
        this.touchEnd = 0;
        this.isAutoPlaying = true;

        this.startAutoplay();
    }

    startAutoplay() {
        this.autoplayInterval = setInterval(() => {
            this.goToNext();
        }, 3000);
    }

    stopAutoplay() {
        clearInterval(this.autoplayInterval);
        this.isAutoPlaying = false;
    }

    updateGallery() {
        // Aktualizace hlavního obrázku
        this.imageTarget.src = this.imagesValue[this.currentIndex];
        this.counterTarget.innerText = this.currentIndex + 1;

        // Aktualizace teček pro mobil
        this.dotTargets.forEach((dot, index) => {
            if (index === this.currentIndex) {
                dot.classList.add('bg-[#D6AD09]', 'w-6');
                dot.classList.remove('bg-white/50');
            } else {
                dot.classList.remove('bg-[#D6AD09]', 'w-6');
                dot.classList.add('bg-white/50');
            }
        });

        // Aktualizace miniatur
        this.thumbnailTargets.forEach((thumbnail, index) => {
            if (index === this.currentIndex) {
                thumbnail.classList.add('ring-4', 'ring-[#D6AD09]', 'scale-105');
                thumbnail.classList.remove('opacity-70', 'hover:opacity-100');
            } else {
                thumbnail.classList.remove('ring-4', 'ring-[#D6AD09]', 'scale-105');
                thumbnail.classList.add('opacity-70', 'hover:opacity-100');
            }
        });
    }

    goToNext() {
        this.currentIndex = (this.currentIndex + 1) % this.imagesValue.length;
        this.updateGallery();
    }

    goToPrev() {
        this.currentIndex = (this.currentIndex - 1 + this.imagesValue.length) % this.imagesValue.length;
        this.updateGallery();
    }

    handleImageClick(event) {
        this.stopAutoplay();
        this.currentIndex = parseInt(event.currentTarget.dataset.index);
        this.updateGallery();
    }

    handleTouchStart(event) {
        this.touchStart = event.targetTouches[0].clientX;
    }

    handleTouchEnd(event) {
        this.touchEnd = event.changedTouches[0].clientX;
        this.handleSwipe();
    }

    handleSwipe() {
        if (this.touchStart - this.touchEnd > 50) {
            this.stopAutoplay();
            this.goToNext();
        } else if (this.touchEnd - this.touchStart > 50) {
            this.stopAutoplay();
            this.goToPrev();
        }
    }
}
