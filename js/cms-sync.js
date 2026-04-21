/**
 * CMS SYNC SCRIPT
 * Manages dynamic data population from JSON files
 */

async function syncCMSData() {
    try {
        // 1. Sync Company Info (Header, Footer, WA Links)
        const resPers = await fetch('data/perusahaan.json');
        const perusahaan = await resPers.json();

        // Update WhatsApp Links
        document.querySelectorAll('a[href^="https://wa.me/"]').forEach(link => {
            const currentUrl = new URL(link.href);
            const text = currentUrl.searchParams.get('text') || '';
            link.href = `https://wa.me/${perusahaan.whatsapp}?text=${encodeURIComponent(text)}`;
        });

        // Update Tagline/Hero Text
        const heroTagline = document.querySelector('.hero p');
        if(heroTagline) heroTagline.innerText = perusahaan.tagline;

        const headerLogo = document.querySelector('.logo span');
        // if(headerLogo) headerLogo.innerText = perusahaan.nama.split(' ')[1] || '';

        // Update Footer Info
        document.querySelectorAll('.footer-links li i.fa-phone').forEach(icon => {
            icon.parentElement.innerHTML = `<i class="fas fa-phone"></i> +${perusahaan.whatsapp.replace(/(\d{2})(\d{3})(\d{4})(\d+)/, '$1 $2 $3 $4')}`;
        });

        document.querySelectorAll('.footer-links li i.fa-map-marker-alt').forEach(icon => {
            icon.parentElement.innerHTML = `<i class="fas fa-map-marker-alt"></i> ${perusahaan.alamat}`;
        });

        // 2. Sync Services (Home & Layanan Page)
        const servicesContainer = document.getElementById('cms-services-container');
        if (servicesContainer) {
            const resLay = await fetch('data/layanan.json');
            const dataLay = await resLay.json();
            const layanan = dataLay.layanan || [];
            
            servicesContainer.innerHTML = layanan.map(item => `
                <div class="service-card">
                    <div class="service-icon">
                        <i class="${item.icon}"></i>
                    </div>
                    <div class="service-content">
                        <h3>${item.nama}</h3>
                        <p>${item.deskripsi}</p>
                        <div style="display: flex; align-items: center; gap: 15px; margin-top: 15px;">
                             <a href="https://wa.me/${perusahaan.whatsapp}" style="color: var(--primary); font-weight: 700;">Pesan <i class="fas fa-arrow-right"></i></a>
                             <a href="${item.link}" style="font-size: 0.85rem; color: var(--text-muted); font-weight: 600; border-bottom: 1px solid #ddd;">Lihat Detail</a>
                        </div>
                    </div>
                </div>
            `).join('');
        }

        // 3. Sync Routes (Rute Page)
        const routesContainer = document.getElementById('cms-routes-container');
        if (routesContainer) {
            const resRute = await fetch('data/rute.json');
            const dataRute = await resRute.json();
            const rute = dataRute.rute || [];
            
            routesContainer.innerHTML = rute.map(item => `
                <div class="route-card">
                    <div class="route-header">
                        <div class="route-info">
                            <h3>${item.asal} <i class="fas fa-arrow-right" style="font-size: 0.8rem; margin: 0 10px; color: #ccc;"></i> ${item.tujuan}</h3>
                            <p style="color: var(--text-muted); margin-top: 5px;">${item.keterangan}</p>
                        </div>
                        <div class="route-price">Rp ${item.harga}</div>
                    </div>
                    <div style="margin-top: 20px;">
                        <a href="https://wa.me/${perusahaan.whatsapp}" class="btn-booking" style="display: block; text-align: center;">Pesan Perjalanan</a>
                    </div>
                </div>
            `).join('');
        }

    } catch (error) {
        console.error('Error syncing CMS data:', error);
    }
}

// Initial sync
document.addEventListener('DOMContentLoaded', syncCMSData);
