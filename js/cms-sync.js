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
                <div class="service-card" onclick="window.location.href='${item.link}'" style="cursor: pointer;">
                    <div class="service-img" style="background-image: url('${item.gambar}');"></div>
                    <div class="service-content">
                        <h3>${item.nama}</h3>
                        <p>${item.deskripsi}</p>
                        <div style="display: flex; align-items: center; gap: 15px; margin-top: 15px;">
                             <a href="https://wa.me/${perusahaan.whatsapp}" style="color: var(--primary); font-weight: 700;" onclick="event.stopPropagation();">Pesan Sekarang <i class="fas fa-arrow-right"></i></a>
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
            
            // Group by Origin
            const groupedRute = rute.reduce((acc, item) => {
                if (!acc[item.asal]) acc[item.asal] = [];
                acc[item.asal].push(item);
                return acc;
            }, {});

            routesContainer.innerHTML = Object.entries(groupedRute).map(([asal, items]) => `
                <div class="route-group" style="margin-bottom: 60px;">
                    <h2 style="font-size: 1.8rem; margin-bottom: 25px; display: flex; align-items: center; gap: 15px; color: var(--primary);">
                        <i class="fas fa-map-marker-alt"></i> Dari ${asal}
                    </h2>
                    <div class="services-grid" style="grid-template-columns: repeat(auto-fit, minmax(320px, 1fr)); gap: 20px;">
                        ${items.map(item => `
                            <div class="route-card" style="padding: 20px; position: relative; overflow: hidden;">
                                ${item.populer ? `
                                <div style="position: absolute; top: 0; right: 0; background: var(--secondary); color: white; padding: 4px 12px; font-size: 0.75rem; font-weight: 700; border-bottom-left-radius: 12px; transform: translateX(0); transition: 0.3s;">
                                    Bestseller
                                </div>
                                ` : ''}
                                <div class="route-header" style="border-bottom: 1px solid #f0f0f0; margin-bottom: 15px; padding-bottom: 10px;">
                                    <div class="route-info">
                                        <h3 style="font-size: 1.1rem; margin: 0;">${asal} <i class="fas fa-long-arrow-alt-right" style="color: var(--secondary); margin: 0 8px;"></i> ${item.tujuan}</h3>
                                        <p style="color: var(--text-muted); margin-top: 5px; font-size: 0.85rem;"><i class="fas fa-clock" style="margin-right: 5px; opacity: 0.7;"></i> ${item.keterangan}</p>
                                    </div>
                                    <div class="route-price" style="font-size: 1.2rem;">${item.harga}</div>
                                </div>
                                <div style="display: flex; gap: 10px;">
                                    <a href="https://wa.me/${perusahaan.whatsapp}?text=Halo Denisa Trans, saya mau pesan travel rute ${asal} - ${item.tujuan}" class="btn-booking" style="display: flex; align-items: center; justify-content: center; gap: 8px; flex: 1; padding: 10px; font-size: 0.9rem;">
                                        <i class="fab fa-whatsapp"></i> Pesan Sekarang
                                    </a>
                                </div>
                            </div>
                        `).join('')}
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
