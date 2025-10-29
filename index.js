// index.js (O Orquestrador)

// Importa as classes de serviço que criamos
import FileReader from './src/services/FileReader.js';
import SupabaseService from './src/services/SupabaseService.js';

// --- Configurações do Processo de ETL ---

// 1. Defina o ano e mês de referência da planilha
// (Conforme sua instrução: 2025, Mês 10/Outubro)
const ANO_REFERENCIA = 2025;
const MES_REFERENCIA = 10; // 1 = Janeiro, 10 = Outubro
const MES_DESCRICAO = 'Outubro';

// 2. Defina o caminho do arquivo a ser processado
const ARQUIVO_PATH = './src/path_xlsx/digm.xlsx';

// --- Fim das Configurações ---

/**
 * [FUNÇÃO CORRIGIDA]
 * Converte uma string de moeda (ex: '1,208.73') para um número float (1208.73).
 * @param {string | number} valorInput - O valor vindo da planilha.
 * @returns {number} - O valor como um float.
 */
function parseCurrency(valorInput) {
    if (!valorInput) {
        return 0; // Trata null, undefined, 0, ""
    }

    // Se já for um número (caso a biblioteca já tenha convertido), apenas retorna.
    if (typeof valorInput === 'number') {
        return valorInput;
    }

    // Se for uma string, remove as vírgulas (milhares)
    const valorLimpo = String(valorInput)
        .replace(/,/g, '');  // Ex: "1,208.73" -> "1208.73"

    return parseFloat(valorLimpo) || 0;
}


/**
 * Função principal que orquestra o processo de ETL (Extract, Transform, Load).
 */
async function processarETL() {
    console.log('--- Iniciando processo de ETL ---');
    
    try {
        // --- 1. EXTRACT (Extrair) ---
        // Instancia o leitor e lê os dados brutos do arquivo
        const fileReader = new FileReader();
        const dadosBrutos = fileReader.read(ARQUIVO_PATH);

        if (!dadosBrutos || dadosBrutos.length === 0) {
            console.error('O arquivo está vazio ou não pôde ser lido. Abortando.');
            return;
        }
        console.log(`[ETL] Extração concluída: ${dadosBrutos.length} linhas encontradas.`);

        // --- 2. TRANSFORM (Transformar) ---
        // Prepara a data de referência no formato 'YYYY-MM-DD'
        // .padStart(2, '0') garante que o mês 1 vire '01'
        const dataReferenciaISO = `${ANO_REFERENCIA}-${String(MES_REFERENCIA).padStart(2, '0')}-01`;

        console.log(`[ETL] Transformando dados... (Data de Referência: ${dataReferenciaISO})`);

        // Mapeia os dados brutos para o formato da tabela 'despesas'
        const dadosTransformados = dadosBrutos.map(linha => {
            // --- CORREÇÃO APLICADA AQUI ---
            // Usamos a nova função 'parseCurrency' para limpar os valores
            const pago = parseCurrency(linha['Pago R$']);
            const aberto = parseCurrency(linha['Aberto R$']);

            return {
                // Adiciona a data de referência
                data_referencia: dataReferenciaISO,
                ano: ANO_REFERENCIA.toString(),
                mes: MES_DESCRICAO,
                
                // Mapeia as colunas do CSV para as colunas do Banco
                filial: linha['Filial'] || null,
                grupo: linha['Grupo'] || null,
                subgrupo: linha['SubGrupo'] || null,
                centro: linha['Centro'] || null,
                plano: linha['Plano'] || null,
                fornecedor: linha['Fornecedor'] || null,
                titulo: linha['Titulo'] || null,
                pago: pago,
                aberto: aberto
            };
        });

        console.log('[ETL] Transformação concluída.');

        // --- 3. LOAD (Carregar) ---
        // Instancia o serviço do Supabase e insere os dados
        const supabaseService = new SupabaseService();
        await supabaseService.insertDespesas(dadosTransformados);

        console.log('--- Processo de ETL concluído com sucesso! ---');

    } catch (error) {
        console.error('--- Falha grave no processo de ETL: ---');
        console.error(error.message);
    }
}

// Executa a função principal
processarETL();