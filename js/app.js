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
            <img class="potkan-img" src="${potkan.foto}" alt="${potkan.jmeno}">
            <div class="potkan-info">
                <h3>${potkan.jmeno}</h3>
                <span class="status ${statusClass(potkan.stav)}">${potkan.stav}</span>
                <p><b>Věk:</b> ${potkan.vek} ${potkan.jednotka}</p>
                <p><b>Pohlaví:</b> ${potkan.pohlavi}</p>
                <p><b>Depozitum:</b> ${potkan.depozitum}</p>
                <p>${potkan.popis}</p>
            </div>
        `;
        if (potkan.vek_kategorie === 'mimina') {
            listMimina.appendChild(card);
        } else if (potkan.vek_kategorie === 'dospeli') {
            listDospeli.appendChild(card);
        } else {
            listSeniori.appendChild(card);
        }
    });
}

window.addEventListener('DOMContentLoaded', nactiPotkany);
