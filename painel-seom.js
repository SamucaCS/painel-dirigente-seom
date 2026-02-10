const SUPABASE_URL = "https://smvlyewxhrihqqcaegnr.supabase.co";
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNtdmx5ZXd4aHJpaHFxY2FlZ25yIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjQyMTQxNzYsImV4cCI6MjA3OTc5MDE3Nn0.GYQCiJGV42ud8agWyuQ_6uLswmxFPaL6tVdm3VIN8g8";
const supabaseClient = supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

const ESCOLAS_SEOM = [
    "Unidade Regional De Ensino - Suzano",
    "ALFREDO ROBERTO",
    "ALICE ROMANOS PROFª",
    "ANDERSON DA SILVA SOARES",
    "ANGELA SUELI P DIAS",
    "ANIS FADUL DOUTOR",
    "ANTONIO BRASILIO MENEZES DA FONSECA PROF",
    "ANTONIO GARCIA VEREADOR",
    "ANTONIO JOSE CAMPOS DE MENEZES PROF",
    "ANTONIO RODRIGUES DE ALMEIDA",
    "ANTONIO VALDEMAR GALO VEREADOR",
    "BATISTA RENZI",
    "BENEDITA DE CAMPOS MARCOLONGO PROFª",
    "BRASILIO MACHADO NETO COMENDADOR",
    "CARLINDO REIS",
    "CARLOS MOLTENI PROF",
    "CHOJIRO SEGAWA",
    "DAVID JORGE CURI PROF",
    "EDIR DO COUTO ROSA",
    "ELIANE APARECIDA D DA SILVA",
    "EUCLIDES IGESCA",
    "GERALDO JUSTINIANO DE REZENDE SILVA PROF",
    "GILBERTO DE CARVALHO PROF",
    "GIOVANNI BATTISTA RAFFO PROF DOUTOR",
    "HELENA ZERRENNER",
    "IIJIMA",
    "IGNES CORREA ALLEN",
    "JACQUES YVES COUSTEAU COMANDANTE",
    "JANDYRA COUTINHO PROFª",
    "JARDIM SAO PAULO II",
     "Jose Eduardo Viera Raduan",
    "JOSE BENEDITO LEITE BARTHOLOMEI PROF",
    "JOSE CAMILO DE ANDRADE",
    "JOSE PAPAIZ PROF",
    "JOVIANO SATLER DE LIMA PROF",
    "JUSSARA FEITOSA DOMSCHKE PROFª",
    "Justino Marcondes Rangel",
    "Landia dos Santos Batista",
    "LEDA FERNANDES LOPES PROFª",
    "LUCY FRANCO KOWALSKI PROFª",
    "LUIZ BIANCONI",
    "LUIZA HIDAKA PROFª",
    "MANUEL DOS SANTOS PAIVA",
    "MARIA ELISA DE AZEVEDO CINTRA PROFª",
    "Mario Manoel Dantas de Aquino",
    "MARTHA CALIXTO CAZAGRANDE",
    "MASAITI SEKINE PROF",
    "MORATO DE OLIVEIRA DOUTOR",
    "OLAVO LEONEL FERREIRA PROF",
    "OLZANETTI GOMES PROFESSOR",
    "OSWALDO DE OLIVEIRA LIMA",
    "PARQUE DOURADO II",
    "PAULO AMERICO PAGANUCCI",
    "PAULO KOBAYASHI PROF",
    "RAUL BRASIL PROF EE",
    "RAUL BRASIL PROF",
    "ROBERTO BIANCHI",
    "SEBASTIAO PEREIRA VIDAL",
    "Tacito Zancheta",
    "TOCHICHICO YOCHICAVA PROF",
    "TOKUZO TERAZAKI",
    "YOLANDA BASSI PROFª",
    "ZELIA GATTAI AMADO",
    "ZEIKICHI FUKUOKA"
];

let registros = [];
let chartTema = null;
let chartStatus = null;

document.addEventListener("DOMContentLoaded", () => {
    popularFiltroEscola();
    popularFiltroStatus(); // <--- Adicionado: Popula o filtro de status
    setupFiltros();
    carregarRegistros();
});

function popularFiltroEscola() {
    const select = document.getElementById("f-escola");
    if (!select) return;

    ESCOLAS_SEOM.forEach(nome => {
        const opt = document.createElement("option");
        opt.value = nome;
        opt.textContent = nome;
        select.appendChild(opt);
    });
}

// --- Nova Função ---
function popularFiltroStatus() {
    const select = document.getElementById("f-status");
    if (!select) return;

    // Limpa opções atuais e adiciona a padrão
    select.innerHTML = '<option value="">Todos os status</option>';

    const opcoes = [
        { valor: "em_andamento", texto: "Em andamento" },
        { valor: "concluido", texto: "Concluído" },
        { valor: "nao_atendido", texto: "Não atendido" } // <--- Opção que faltava
    ];

    opcoes.forEach(op => {
        const opt = document.createElement("option");
        opt.value = op.valor;
        opt.textContent = op.texto;
        select.appendChild(opt);
    });
}
// -------------------

function setupFiltros() {
    const filtros = document.querySelectorAll(".filter");
    filtros.forEach(f => {
        f.addEventListener("change", atualizarTudo);
    });
}

async function carregarRegistros() {
    const emptyState = document.getElementById("empty-state");
    if (emptyState) emptyState.textContent = "Carregando registros...";

    try {
        const { data, error } = await supabaseClient
            .from("seom_registros")
            .select("*")
            .order("created_at", { ascending: false });

        if (error) {
            console.error("Erro ao carregar registros:", error);
            registros = [];
            if (emptyState)
                emptyState.textContent = "Erro ao carregar registros. Veja o console.";
        } else {
            registros = data || [];
            if (emptyState) emptyState.textContent = "";
        }
    } catch (err) {
        console.error("Erro inesperado:", err);
        registros = [];
        if (emptyState)
            emptyState.textContent = "Erro inesperado ao carregar registros.";
    }

    atualizarTudo();
}

function atualizarTudo() {
    const filtrados = filtrarRegistros();
    atualizarCards(filtrados);
    atualizarGraficos(filtrados);
    atualizarTabela(filtrados);
}

function filtrarRegistros() {
    const tema = document.getElementById("f-tema").value;
    const escola = document.getElementById("f-escola").value;
    const status = document.getElementById("f-status").value;

    return registros
        .filter(r =>
            r.tipo !== "bi_manutencao" &&
            r.tipo !== "bi_manutencao_predial"
        )
        .filter(r => {
            const okTema = !tema || r.tipo === tema;
            const okEscola = !escola || r.escola === escola;
            const okStatus = !status || r.status === status;
            return okTema && okEscola && okStatus;
        });
}

function atualizarCards(lista) {
    const total = lista.length;

    const obras = lista.filter(r => r.tipo === "obras").length;
    const solicit = lista.filter(r => r.tipo === "solicitacao").length;
    const termo = lista.filter(r => r.tipo === "termo").length;

    const andamento = lista.filter(r => r.status === "em_andamento").length;
    const concluido = lista.filter(r => r.status === "concluido").length;
    // Se você tiver cards para 'não atendido' no HTML, adicione o cálculo aqui:
    // const naoAtendido = lista.filter(r => r.status === "nao_atendido").length;

    const escolasSet = new Set(
        lista
            .map(r => (r.escola || "").trim())
            .filter(nome => nome.length > 0)
    );
    const escolas = escolasSet.size;

    setText("card-total", total);
    setText("card-escolas", escolas);
    setText("card-obras", obras);
    setText("card-solic", solicit);
    setText("card-termo", termo);
    setText("card-andamento", andamento);
    setText("card-concluido", concluido);

    setPercent("card-obras-perc", obras, total);
    setPercent("card-solic-perc", solicit, total);
    setPercent("card-termo-perc", termo, total);
    setPercent("card-andamento-perc", andamento, total);
    setPercent("card-concluido-perc", concluido, total);
}

function setText(id, value) {
    const el = document.getElementById(id);
    if (!el) return;
    el.textContent = typeof value === "number" ? value : "–";
}

function setPercent(id, value, total) {
    const el = document.getElementById(id);
    if (!el) return;

    if (!total || total === 0) {
        el.textContent = "0% do total";
        return;
    }

    const perc = ((value / total) * 100).toFixed(1).replace(".", ",");
    el.textContent = `${perc}% do total`;
}

function atualizarGraficos(lista) {
    atualizarGraficoTema(lista);
    atualizarGraficoStatus(lista);
}

function atualizarGraficoTema(lista) {
    const obras = lista.filter(r => r.tipo === "obras").length;
    const solicit = lista.filter(r => r.tipo === "solicitacao").length;
    const termo = lista.filter(r => r.tipo === "termo").length;

    const labels = ["Obras", "Solicitação", "Termo de visita"];
    const theData = [obras, solicit, termo];

    const ctx = document.getElementById("chartPorTema");
    if (!ctx) return;

    if (!chartTema) {
        chartTema = new Chart(ctx, {
            type: "bar",
            data: {
                labels,
                datasets: [
                    {
                        label: "Registros",
                        data: theData,
                        borderRadius: 8
                    }
                ]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                scales: {
                    y: {
                        beginAtZero: true,
                        ticks: {
                            stepSize: 1
                        }
                    }
                }
            }
        });
    } else {
        chartTema.data.labels = labels;
        chartTema.data.datasets[0].data = theData;
        chartTema.update();
    }
}

function atualizarGraficoStatus(lista) {
    const apenasObras = lista.filter(r => r.tipo === "obras");

    const andamento = apenasObras.filter(r => r.status === "em_andamento").length;
    const concluido = apenasObras.filter(r => r.status === "concluido").length;
    const naoAtendido = apenasObras.filter(r => r.status === "nao_atendido").length;

    const semStatus = apenasObras.filter(
        r =>
            !r.status ||
            (r.status !== "em_andamento" &&
                r.status !== "concluido" &&
                r.status !== "nao_atendido")
    ).length;

    const labels = ["Em andamento", "Concluído", "Não atendido", "Sem status"];
    const data = [andamento, concluido, naoAtendido, semStatus];

    const ctx = document.getElementById("chartStatus");
    if (!ctx) return;

    const cores = [
        "#facc15", // Em andamento    -> amarelo
        "#22c55e", // Concluído       -> verde
        "#ef4444", // Não atendido    -> vermelho
        "#3b82f6"  // Sem status      -> azul
    ];

    if (!chartStatus) {
        chartStatus = new Chart(ctx, {
            type: "doughnut",
            data: {
                labels,
                datasets: [
                    {
                        data,
                        backgroundColor: cores,
                        borderWidth: 0
                    }
                ]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        position: "bottom"
                    }
                },
                cutout: "65%"
            }
        });
    } else {
        chartStatus.data.labels = labels;
        chartStatus.data.datasets[0].data = data;
        chartStatus.data.datasets[0].backgroundColor = cores;
        chartStatus.update();
    }
}

function atualizarTabela(lista) {
    const tbody = document.getElementById("tabela-registros");
    const empty = document.getElementById("empty-state");
    if (!tbody) return;

    tbody.innerHTML = "";

    if (!lista.length) {
        if (empty) empty.textContent = "Nenhum registro encontrado com os filtros.";
        return;
    }
    if (empty) empty.textContent = "";

    const slice = lista.slice(0, 30);

    slice.forEach(r => {
        const tr = document.createElement("tr");

        const tdTema = document.createElement("td");
        tdTema.textContent = labelTema(r.tipo);
        tr.appendChild(tdTema);

        const tdEscola = document.createElement("td");
        tdEscola.textContent = r.escola || "-";
        tr.appendChild(tdEscola);

        const tdDescricao = document.createElement("td");
        tdDescricao.textContent = resumoDescricao(r.descricao);
        tr.appendChild(tdDescricao);

        const tdStatus = document.createElement("td");
        if (r.status) {
            const span = document.createElement("span");
            span.className = `badge ${r.status}`;
            span.textContent = labelStatus(r.status);
            tdStatus.appendChild(span);
        } else {
            tdStatus.textContent = "-";
        }
        tr.appendChild(tdStatus);

        const tdData = document.createElement("td");
        tdData.textContent = formatarData(r.data_referencia || r.created_at);
        tr.appendChild(tdData);

        tbody.appendChild(tr);
    });
}

function labelTema(tipo) {
    switch (tipo) {
        case "obras":
            return "Obras e manutenção";
        case "solicitacao":
            return "Solicitação de manutenção";
        case "termo":
            return "Termo de visita";
        default:
            return tipo || "-";
    }
}

function labelStatus(status) {
    switch (status) {
        case "em_andamento":
            return "Em andamento";
        case "concluido":
            return "Concluído";
        case "nao_atendido":
            return "Não atendido";
        default:
            return status || "-";
    }
}

function resumoDescricao(texto, limite = 80) {
    if (!texto) return "-";
    if (texto.length <= limite) return texto;
    return texto.slice(0, limite - 3) + "...";
}

function formatarData(valor) {
    if (!valor) return "-";
    if (/^\d{4}-\d{2}-\d{2}$/.test(valor)) {
        const [ano, mes, dia] = valor.split("-");
        return `${dia}/${mes}/${ano}`;
    }
    const d = new Date(valor);
    if (Number.isNaN(d.getTime())) return "-";

    const dia = String(d.getDate()).padStart(2, "0");
    const mes = String(d.getMonth() + 1).padStart(2, "0");
    const ano = d.getFullYear();
    return `${dia}/${mes}/${ano}`;
}
