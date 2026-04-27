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

        // 4. Sync Facilities (Fasilitas Page)
        const fasilitasContainer = document.getElementById('cms-fasilitas-container');
        if (fasilitasContainer) {
            const resFas = await fetch('data/fasilitas.json');
            const dataFas = await resFas.json();
            const fasilitas = dataFas.fasilitas || [];

            fasilitasContainer.innerHTML = fasilitas.map(item => `
                <div class="route-card" style="text-align: center;">
                    <div style="width: 80px; height: 80px; background: rgba(165, 28, 28, 0.1); color: var(--primary); border-radius: 20px; display: flex; align-items: center; justify-content: center; font-size: 2.5rem; margin: 0 auto 20px;">
                        <i class="${item.icon}"></i>
                    </div>
                    <h3>${item.nama}</h3>
                    <p style="color: var(--text-muted); font-size: 0.95rem;">${item.deskripsi}</p>
                </div>
            `).join('');
        }

        // 5. Sync Gallery (Home & Fasilitas Page)
        const galleryContainer = document.getElementById('cms-gallery-container');
        if (galleryContainer) {
            const resGal = await fetch('data/galeri.json');
            const dataGal = await resGal.json();
            const galeri = dataGal.foto || [];

            galleryContainer.innerHTML = galeri.map(item => `
                <div class="gallery-item" style="background-image: url('${item.image}'); background-size: cover; background-position: center; border:none;" title="${item.title}"></div>
            `).join('');
        }

        // 6. Sync Armada (Home Page)
        const armadaContainer = document.getElementById('cms-armada-container');
        if (armadaContainer) {
            const resArm = await fetch('data/armada.json');
            const dataArm = await resArm.json();
            const armadaList = dataArm.armada || [];

            armadaContainer.innerHTML = armadaList.map(item => {
                const images = Array.isArray(item.gambar) ? item.gambar : [item.gambar];
                const sliderHtml = images.map((img, idx) => `
                    <div class="slide ${idx === 0 ? 'active' : ''}" style="background-image: url('${img}');"></div>
                `).join('');

                const indicatorsHtml = images.map((_, idx) => `
                    <div class="slider-dot ${idx === 0 ? 'active' : ''}"></div>
                `).join('');

                return `
                    <div class="service-card">
                        <div class="service-img">
                            <div class="card-slider">
                                ${sliderHtml}
                                ${images.length > 1 ? `
                                <div class="slider-nav">
                                    <button class="prev-btn" onclick="event.stopPropagation();"><i class="fas fa-chevron-left"></i></button>
                                    <button class="next-btn" onclick="event.stopPropagation();"><i class="fas fa-chevron-right"></i></button>
                                </div>
                                <div class="slider-dots">
                                    ${indicatorsHtml}
                                </div>
                                ` : ''}
                            </div>
                        </div>
                        <div class="service-content">
                            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 10px;">
                                <h3 style="margin: 0;">${item.nama}</h3>
                                <span style="background: var(--light); color: var(--primary); padding: 4px 10px; border-radius: 20px; font-size: 0.75rem; font-weight: 700;">${item.kapasitas}</span>
                            </div>
                            <p>${item.deskripsi}</p>
                            <div style="margin-top: 15px;">
                                <a href="https://wa.me/${perusahaan.whatsapp}?text=Halo Denisa Trans, saya ingin tanya sewa armada ${item.nama}" class="btn-booking" style="display: block; text-align: center; font-size: 0.9rem;">Tanya Sewa <i class="fab fa-whatsapp"></i></a>
                            </div>
                        </div>
                    </div>
                `;
            }).join('');

            // Initialize interactive sliders
            const sliders = document.querySelectorAll('.card-slider');
            sliders.forEach(slider => {
                const slides = slider.querySelectorAll('.slide');
                const dots = slider.querySelectorAll('.slider-dot');
                const nextBtn = slider.querySelector('.next-btn');
                const prevBtn = slider.querySelector('.prev-btn');
                
                if (slides.length <= 1) return;

                let current = 0;
                let interval;

                const showSlide = (index) => {
                    slides.forEach(s => s.classList.remove('active'));
                    dots.forEach(d => d.classList.remove('active'));
                    
                    current = (index + slides.length) % slides.length;
                    slides[current].classList.add('active');
                    dots[current].classList.add('active');
                };

                const startAuto = () => {
                    interval = setInterval(() => showSlide(current + 1), 3000);
                };

                const stopAuto = () => clearInterval(interval);

                if(nextBtn) {
                    nextBtn.onclick = () => {
                        stopAuto();
                        showSlide(current + 1);
                        startAuto();
                    };
                }

                if(prevBtn) {
                    prevBtn.onclick = () => {
                        stopAuto();
                        showSlide(current - 1);
                        startAuto();
                    };
                }

                startAuto();
            });
        }

    } catch (error) {
        console.error('Error syncing CMS data:', error);
    }
}

// Initial sync
document.addEventListener('DOMContentLoaded', syncCMSData);
