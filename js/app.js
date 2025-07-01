function statusClass(stav) {
    switch (stav.toLowerCase()) {
        case "volný": return "volny";
        case "rezervace": return "rezervace";
        case "adoptován":
        case "adoptovan":
            return "adoptovan";
        default: return "jiny";
    }
}

async function nactiPotkany() {
    const res = await fetch('data/potkani.json');
    const potkani = await res.json();

    const listMimina = document.getElementById('mimina-list');
    const listDospeli = document.getElementById('dospeli-list');
    const listSeniori = document.getElementById('seniori-list');

    listMimina.innerHTML = '';
    listDospeli.innerHTML = '';
    listSeniori.innerHTML = '';

    potkani.forEach(potkan => {
        const card = document.createElement('div');
        card.className = 'potkan-card';
        card.innerHTML = `
            <img class="potkan-img" src="${potkan.foto}" alt="${potkan.jmeno}" data-img="${potkan.foto}">
            <div class="potkan-info">
                <h3>${potkan.jmeno}</h3>
                <span class="status ${statusClass(potkan.stav)}">${potkan.stav}</span>
                <p>
                    <span class="icon-label">
                        <!-- Ikona pro věk -->
                        <svg viewBox="0 0 24 24" class="icon-svg"><path d="M12 12c2.21 0 4-1.79 4-4S14.21 4 12 4s-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/></svg>
                        ${potkan.vek} ${potkan.jednotka}
                    </span>
                </p>
                <p>
                    <span class="icon-label">
                        ${
                          potkan.pohlavi.toLowerCase().includes('samec')
                            ? `<svg class="icon-svg" viewBox="0 0 24 24"><path d="M16 2v2h3.59l-5.83 5.83A6.004 6.004 0 0 0 6 17a6 6 0 0 0 9.17-7.76L21 5.59V9h2V2z"/></svg>`
                            : `<svg class="icon-svg" viewBox="0 0 24 24"><path d="M12 7a5 5 0 0 0-2 9.584V19a2 2 0 1 0 4 0v-2.416A5 5 0 0 0 12 7z"/></svg>`
                        }
                        ${potkan.pohlavi}
                    </span>
                </p>
                <p>
                    <span class="icon-label">
                        <!-- Ikona pro lokace -->
                        <svg class="icon-svg" viewBox="0 0 24 24"><path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5S10.62 6.5 12 6.5s2.5 1.12 2.5 2.5S13.38 11.5 12 11.5z"/></svg>
                        ${potkan.lokace}
                    </span>
                </p>
                <p>${potkan.popis}</p>
            </div>
        `;
        // Po kliknutí na obrázek otevřít lightbox
        card.querySelector('.potkan-img').addEventListener('click', function() {
            otevriLightbox(potkan.foto, potkan.jmeno);
        });

        if (potkan.vek_kategorie === 'mimina') {
            listMimina.appendChild(card);
        } else if (potkan.vek_kategorie === 'dospeli') {
            listDospeli.appendChild(card);
        } else {
            listSeniori.appendChild(card);
        }
    });
}

function otevriLightbox(src, alt) {
    const lb = document.getElementById('lightbox');
    const lbImg = document.getElementById('lightboxImg');
    lbImg.src = src;
    lbImg.alt = alt;
    lb.style.display = 'flex';
}

function zavriLightbox() {
    const lb = document.getElementById('lightbox');
    lb.style.display = 'none';
    document.getElementById('lightboxImg').src = '';
}

window.addEventListener('DOMContentLoaded', () => {
    nactiPotkany();

    // Zavřít lightbox kliknutím na křížek nebo mimo obrázek
    document.getElementById('lightboxClose').onclick = zavriLightbox;
    document.getElementById('lightbox').onclick = function(e) {
        if (e.target === this) zavriLightbox();
    };
    // Zavřít lightbox klávesou ESC
    document.addEventListener('keydown', function(e) {
        if (e.key === "Escape") zavriLightbox();
    });

    // DARK MODE
    const darkBtn = document.getElementById('darkModeToggle');
    if (darkBtn) {
        darkBtn.onclick = function () {
            document.body.classList.toggle('dark-mode');
            if (document.body.classList.contains('dark-mode')) {
                localStorage.setItem('theme', 'dark');
                darkBtn.innerText = "☀️";
            } else {
                localStorage.setItem('theme', 'light');
                darkBtn.innerText = "🌙";
            }
        };
        // Načtení posledního režimu
        if (localStorage.getItem('theme') === 'dark') {
            document.body.classList.add('dark-mode');
            darkBtn.innerText = "☀️";
        }
    }
});
