// Armazenamento local simulado com a chave da ManutenMed
let machines = JSON.parse(localStorage.getItem('manutenmed_maint')) || [];

const form = document.getElementById('form-manutencao');
const listaContainer = document.getElementById('lista-maquinas');

// Evento de envio do formulário
form.addEventListener('submit', (e) => {
    e.preventDefault();

    const novaMaquina = {
        id: Date.now(),
        nome: document.getElementById('maquina').value,
        intervalo: parseInt(document.getElementById('periodicidade').value),
        ultimaData: document.getElementById('data-ultima').value
    };

    machines.push(novaMaquina);
    salvarEAtualizar();
    form.reset();
});

// FUNÇÃO NOVA: Verifica se existem máquinas atrasadas ou vencendo hoje e emite um aviso
function verificarAlertasUrgentes() {
    const hoje = new Date();
    hoje.setHours(0,0,0,0);

    let maquinasCriticas = [];

    machines.forEach(m => {
        const ultima = new Date(m.ultimaData + 'T00:00:00');
        const proxima = new Date(ultima);
        proxima.setDate(ultima.getDate() + m.intervalo);

        const diferencaTempo = proxima.getTime() - hoje.getTime();
        const diasRestantes = Math.ceil(diferencaTempo / (1000 * 60 * 60 * 24));

        // Se estiver atrasada ou vencer hoje (0 dias)
        if (diasRestantes <= 0) {
            maquinasCriticas.push(`• ${m.nome} (${diasRestantes === 0 ? 'Vence Hoje!' : 'Atrasada'})`);
        }
    });

    // Se encontrou alguma máquina com problema, solta o alerta na tela
    if (maquinasCriticas.length > 0) {
        setTimeout(() => {
            alert(`⚠️ ATENÇÃO - MANUTENÇÃO PENDENTE!\n\nAs seguintes máquinas precisam de revisão:\n${maquinasCriticas.join('\n')}`);
        }, 800); // Aguarda quase 1 segundo após abrir o app para soltar o aviso
    }
}

// Função para calcular prazos e renderizar na tela
function renderizarMaquinas() {
    listaContainer.innerHTML = '';

    if (machines.length === 0) {
        listaContainer.innerHTML = `<p class="text-gray-400 text-center py-4 text-sm">Nenhum equipamento cadastrado.</p>`;
        return;
    }

    const hoje = new Date();
    hoje.setHours(0,0,0,0); 

    machines.forEach(m => {
        const ultima = new Date(m.ultimaData + 'T00:00:00');
        const proxima = new Date(ultima);
        proxima.setDate(ultima.getDate() + m.intervalo);

        const diferencaTempo = proxima.getTime() - hoje.getTime();
        const diasRestantes = Math.ceil(diferencaTempo / (1000 * 60 * 60 * 24));

        let corStatus = 'bg-green-100 text-green-800 border-green-300';
        let textoStatus = '🟢 EM DIA';
        let txtDias = `${diasRestantes} dias restantes`;

        if (diasRestantes < 0) {
            corStatus = 'bg-red-100 text-red-800 border-red-300';
            textoStatus = '❌ ATRASADA';
            txtDias = `Atrasada há ${Math.abs(diasRestantes)} dias`;
        } else if (diasRestantes <= 3) {
            corStatus = 'bg-amber-100 text-amber-800 border-amber-300';
            textoStatus = '⚠️ ATENÇÃO';
        }

        const formatarData = (date) => date.toLocaleDateString('pt-BR');

        const card = document.createElement('div');
        card.className = `p-4 rounded-xl border bg-white shadow-sm flex flex-col justify-between space-y-2 border-l-4 ${diasRestantes < 0 ? 'border-l-red-500' : diasRestantes <= 3 ? 'border-l-amber-500' : 'border-l-green-500'}`;
        card.innerHTML = `
            <div class="flex justify-between items-start">
                <div>
                    <h3 class="font-bold text-gray-800 text-lg">${m.nome}</h3>
                    <p class="text-xs text-gray-500">Última: ${formatarData(ultima)} | Próxima: ${formatarData(proxima)}</p>
                </div>
                <span class="text-xs font-semibold px-2.5 py-1 rounded-full border ${corStatus}">
                    ${textoStatus}
                </span>
            </div>
            <div class="flex justify-between items-center pt-2 border-t border-gray-100 text-sm">
                <span class="font-medium text-gray-600">${txtDias}</span>
                <button onclick="deletarMaquina(${m.id})" class="text-red-400 hover:text-red-600 text-xs font-medium">
                    Excluir
                </button>
            </div>
        `;
        listaContainer.appendChild(card);
    });
}

function deletarMaquina(id) {
    machines = machines.filter(m => m.id !== id);
    salvarEAtualizar();
}

function salvarEAtualizar() {
    localStorage.setItem('manutenmed_maint', JSON.stringify(machines));
    renderizarMaquinas();
}

// Inicializa a tela e roda a verificação de alertas ao abrir o app
renderizarMaquinas();
verificarAlertasUrgentes();
