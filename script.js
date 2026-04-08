document.addEventListener('DOMContentLoaded', () => {
    const modal = document.getElementById('lead-modal');
    const openButtons = document.querySelectorAll('.open-modal');
    const closeBtn = document.querySelector('.close-modal');
    const leadForm = document.getElementById('lead-form');

    // Open modal
    openButtons.forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.preventDefault();
            modal.classList.add('active');
        });
    });

    // Close modal
    closeBtn.addEventListener('click', () => {
        modal.classList.remove('active');
    });

    // Click outside window to close
    modal.addEventListener('click', (e) => {
        if (e.target === modal) {
            modal.classList.remove('active');
        }
    });

    // Form Submit - Redirect with parameters
    leadForm.addEventListener('submit', (e) => {
        e.preventDefault();
        
        const name = document.getElementById('name').value;
        const email = document.getElementById('email').value;
        const phone = document.getElementById('phone').value;
        const revenue = document.getElementById('revenue').value;

        // 1. Armazenando no LocalStorage como medida de segurança/backup no navegador
        const lead = { name, email, phone, revenue, date: new Date().toISOString() };
        let leads = JSON.parse(localStorage.getItem('mvm_leads') || '[]');
        leads.push(lead);
        localStorage.setItem('mvm_leads', JSON.stringify(leads));

        // Disparo do Webhook para o n8n
        fetch('https://webhook.datahacklab.com.br/webhook/92f25a27-927b-4e32-988b-b215cebc9aaa', {
            method: 'POST',
            body: JSON.stringify(lead),
            headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' }
        }).catch(err => console.error('Erro ao salvar lead:', err));

        // 2. Redirecionamento para a HeroSpark enviando os parâmetros na URL
        const checkoutBaseUrl = 'https://pay.herospark.com/evento-presencial-mvm-514932';
        
        const params = new URLSearchParams({
            name: name,
            email: email,
            phone: phone,
            utm_source: revenue 
        });

        window.location.href = `${checkoutBaseUrl}?${params.toString()}`;
    });

    // ==========================================
    // CARROSSEL JS (Auto-scroll + Botões)
    // ==========================================
    const carousel = document.getElementById('carousel');
    const track = document.getElementById('track');
    const btnPrev = document.querySelector('.carousel-nav.prev');
    const btnNext = document.querySelector('.carousel-nav.next');

    if(carousel && track && btnPrev && btnNext) {
        let scrollSpeed = 1; 
        let animationId;
        let isHovered = false;

        function autoScroll() {
            if(!isHovered) {
                carousel.scrollLeft += scrollSpeed;
                // Se o scroll atingir metade do track (onde a duplicata começa), reseta suavemente
                if(carousel.scrollLeft >= track.scrollWidth / 2) {
                    carousel.style.scrollBehavior = 'auto';
                    carousel.scrollLeft = 0;
                }
            }
            animationId = requestAnimationFrame(autoScroll);
        }
        
        autoScroll(); // Inicia

        // Pausar drag ou hover
        carousel.addEventListener('mouseenter', () => isHovered = true);
        carousel.addEventListener('mouseleave', () => isHovered = false);
        carousel.addEventListener('touchstart', () => isHovered = true, {passive: true});
        carousel.addEventListener('touchend', () => isHovered = false);

        btnNext.addEventListener('click', () => {
            // Se estivermos saindo pro final, limpa o comportamento
            carousel.style.scrollBehavior = 'smooth';
            carousel.scrollBy({ left: 310, behavior: 'smooth' }); // largura de 1 card + gap
            setTimeout(() => carousel.style.scrollBehavior = 'auto', 400);
        });

        btnPrev.addEventListener('click', () => {
            if(carousel.scrollLeft < 310) {
                // Pular pro espelho no meio pra simular o infinito pra tras
                carousel.style.scrollBehavior = 'auto';
                carousel.scrollLeft += track.scrollWidth / 2;
            }
            setTimeout(() => {
                carousel.style.scrollBehavior = 'smooth';
                carousel.scrollBy({ left: -310, behavior: 'smooth' });
                setTimeout(() => carousel.style.scrollBehavior = 'auto', 400);
            }, 10);
        });
    }
});
