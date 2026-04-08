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

        // Opcional: Aqui entraria uma chamada fetch() para um Webhook (n8n, Make, Zapier) 
        // para salvar também em uma planilha do Google Sheets de forma muito mais segura que GitHub
        /*
        fetch('SUA_URL_DO_WEBHOOK_AQUI', {
            method: 'POST',
            body: JSON.stringify(lead),
            headers: { 'Content-Type': 'application/json' }
        });
        */

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
