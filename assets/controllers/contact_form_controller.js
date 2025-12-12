import { Controller } from '@hotwired/stimulus';

export default class extends Controller {
    static targets = ["button"];

    submit(event) {
        event.preventDefault();

        this.buttonTarget.disabled = true;
        this.buttonTarget.textContent = 'Odesílám...';

        const formData = new FormData(this.element);

        fetch('/contact/new', {
            method: 'POST',
            body: formData,
            headers: {
                'X-Requested-With': 'XMLHttpRequest',
            },
        })
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                this.element.reset();
                this.buttonTarget.style.display = 'none';
                const thankYouMessage = document.createElement('p');
                thankYouMessage.className = 'text-green-500 text-center';
                thankYouMessage.textContent = 'Děkujeme za vaši poptávku, brzy se vám ozveme.';
                this.element.append(thankYouMessage);
            } else {
                this.buttonTarget.disabled = false;
                this.buttonTarget.textContent = 'Objednat ubytování';
                alert(data.error || 'Při odesílání formuláře došlo k chybě.');
            }
        })
        .catch(() => {
            this.buttonTarget.disabled = false;
            this.buttonTarget.textContent = 'Objednat ubytování';
            alert('Při odesílání formuláře došlo k chybě');
        });
    }
}
