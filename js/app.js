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
                <p><b>Věk:</b> ${potkan.vek} ${potkan.jednotka}</p>
                <p><b>Pohlaví:</b> ${potkan.pohlavi}</p>
                <p><b>Depozitum:</b> ${potkan.depozitum}</p>
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
});
