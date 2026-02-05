document.addEventListener('DOMContentLoaded', function() {
    const input = document.querySelector('input[type="text"]');
    const placeholderTexts = [
        "Algebra Lineal", 
        "Geometría Analítica", 
        "Algoritmia Avanzada", 
        "Física", 
        "Machine Learning"
    ];
    let currentIndex = 0;
    let charIndex = 0;
    let isDeleting = false;

    function type() {
        const currentText = placeholderTexts[currentIndex];
        if (!isDeleting && charIndex < currentText.length) {
            input.setAttribute('placeholder', currentText.slice(0, charIndex + 1));
            charIndex++;
            setTimeout(type, 100);
        } else if (isDeleting && charIndex > 0) {
            input.setAttribute('placeholder', currentText.slice(0, charIndex - 1));
            charIndex--;
            setTimeout(type, 100);
        } else {
            isDeleting = !isDeleting;
            if (!isDeleting) {
                currentIndex = (currentIndex + 1) % placeholderTexts.length;
            }
            setTimeout(type, 500);
        }
    }

    type();
});
