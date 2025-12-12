import { Controller } from '@hotwired/stimulus';

export default class extends Controller {
    static targets = ["mobileMenu"];

    toggleMenu() {
        this.mobileMenuTarget.classList.toggle('hidden');
    }

    scrollTo(event) {
        const targetId = event.currentTarget.dataset.target;
        const element = document.getElementById(targetId);
        if (element) {
            const navHeight = document.querySelector('nav').offsetHeight;
            const elementPosition = element.getBoundingClientRect().top;
            const offsetPosition = elementPosition + window.pageYOffset - navHeight;

            window.scrollTo({
                top: offsetPosition,
                behavior: "smooth"
            });

            if (this.hasMobileMenuTarget) {
                this.mobileMenuTarget.classList.add('hidden');
            }
        }
    }
}
