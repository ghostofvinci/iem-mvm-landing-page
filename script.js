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
            // A plataforma da herospark normalmente ignora parâmetros extras que não são campos de checkout, mas repassamos.
            utm_source: revenue 
        });

        // Redireciona para o Checkout com os dados pré-preenchidos
        window.location.href = `${checkoutBaseUrl}?${params.toString()}`;
    });
});
