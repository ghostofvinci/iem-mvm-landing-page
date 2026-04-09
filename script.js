document.addEventListener('DOMContentLoaded', () => {
    const modal = document.getElementById('lead-modal');
    const openButtons = document.querySelectorAll('.open-modal');
    const closeBtn = document.querySelector('.close-modal');
    const leadForm = document.getElementById('lead-form');

    // ==========================================
    // CAPTURA DE UTM/VENDEDOR DA URL
    // ==========================================
    const urlParams = new URLSearchParams(window.location.search);
    let sellerParam = urlParams.get('vendedor') || urlParams.get('src') || urlParams.get('utm_source');
    
    // Salva na sessão para caso o lead atualize a página ele não perder o tagueamento do vendedor
    if (sellerParam) {
        sessionStorage.setItem('mvm_seller', sellerParam);
    } else {
        sellerParam = sessionStorage.getItem('mvm_seller') || 'Organico';
    }

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

    // ==========================================
    // MASCARA DE TELEFONE (DDD) 99999-9999
    // ==========================================
    const phoneInput = document.getElementById('phone');
    if (phoneInput) {
        phoneInput.addEventListener('input', function (e) {
            let x = e.target.value.replace(/\D/g, '').match(/(\d{0,2})(\d{0,5})(\d{0,4})/);
            e.target.value = !x[2] ? x[1] : '(' + x[1] + ') ' + x[2] + (x[3] ? '-' + x[3] : '');
        });
    }

    // ==========================================
    // ENVIO DO MODAL (Webhook + Checkout)
    // ==========================================
    
    leadForm.addEventListener('submit', function(e) {
        e.preventDefault();

        // 1. Coleta dos dados
        const name = document.getElementById('name').value;
        const email = document.getElementById('email').value;
        const phone = phoneInput.value;
        const mentorship = document.getElementById('mentorship').value;
        const revenue = document.getElementById('revenue').value;
        const seller = sellerParam; // Tagueamento do vendedor

        // 1. Armazenando no LocalStorage como medida de segurança/backup no navegador
        const lead = { name, email, phone, mentorship, revenue, seller, date: new Date().toISOString() };
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
        
        const rawPhone = phone.replace(/\D/g, '');
        
        // Evitando URLSearchParams porque ele converte espaço em '+' e a plataforma da HeroSpark 
        // parece falhar na decodificação, rejeitando nomes com espaço (ex: "Nome+da+Silva")
        const queryString = `name=${encodeURIComponent(name)}&email=${encodeURIComponent(email)}&tel=${rawPhone}&utm_source=${encodeURIComponent(revenue)}&sck=${encodeURIComponent(seller)}`;

        window.location.href = `${checkoutBaseUrl}?${queryString}`;
    });

    // ==========================================
    // CARROSSEL JS (Auto-scroll + Botões)
    // ==========================================
    const carouselWrapper = document.querySelector('.carousel-wrapper');
    const carousel = document.getElementById('carousel');
    const track = document.getElementById('track');
    const btnPrev = document.querySelector('.carousel-nav.prev');
    const btnNext = document.querySelector('.carousel-nav.next');

    if(carousel && track && btnPrev && btnNext) {
        let scrollSpeed = 0.4; // Metade da velocidade (mais suave)
        let animationId;
        let isHovered = false;
        let isAnimating = false; // Prevents R-A-F from fighting the smooth button scroll

        function autoScroll() {
            if(!isHovered && !isAnimating) {
                carousel.scrollLeft += scrollSpeed;
                // Se o scroll atingir metade do track, reseta instantaneamente invisível
                if(carousel.scrollLeft >= track.scrollWidth / 2) {
                    carousel.style.scrollBehavior = 'auto';
                    carousel.scrollLeft = 0;
                }
            }
            animationId = requestAnimationFrame(autoScroll);
        }
        
        autoScroll();

        // Pausar drag ou hover (agora atrelado ao WRAPPER geral, inclui botoes)
        carouselWrapper.addEventListener('mouseenter', () => isHovered = true);
        carouselWrapper.addEventListener('mouseleave', () => isHovered = false);
        carouselWrapper.addEventListener('touchstart', () => isHovered = true, {passive: true});
        carouselWrapper.addEventListener('touchend', () => isHovered = false);

        btnNext.addEventListener('click', () => {
            isAnimating = true;
            carousel.style.scrollBehavior = 'smooth';
            carousel.scrollBy({ left: 310, behavior: 'smooth' }); // pula 1 card + gap
            
            // Retoma script após a finalização da animação natural
            setTimeout(() => {
                carousel.style.scrollBehavior = 'auto';
                isAnimating = false;
            }, 600);
        });

        btnPrev.addEventListener('click', () => {
            isAnimating = true;
            if(carousel.scrollLeft < 310) {
                // Pula pro espelho lá no meio sem animação
                carousel.style.scrollBehavior = 'auto';
                carousel.scrollLeft += track.scrollWidth / 2;
            }
            // Aguarar o DOM processar o pulo seco, depois animar pra trás
            setTimeout(() => {
                carousel.style.scrollBehavior = 'smooth';
                carousel.scrollBy({ left: -310, behavior: 'smooth' });
                
                setTimeout(() => {
                    carousel.style.scrollBehavior = 'auto';
                    isAnimating = false;
                }, 600);
            }, 50);
        });
    }
});
