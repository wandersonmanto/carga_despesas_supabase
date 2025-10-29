// src/services/FileReader.js

import xlsx from 'xlsx';

class FileReader {
    /**
     * Lê um arquivo (XLSX ou CSV) e o converte para um array de objetos JSON.
     * @param {string} filePath - O caminho para o arquivo.
     * @returns {Array<Object>} - Um array de objetos, onde cada objeto é uma linha da planilha.
     */
    read(filePath) {
        try {
            // A biblioteca 'xlsx' lê ambos os formatos (XLSX e CSV)
            const workbook = xlsx.readFile(filePath);
            
            // Pega o nome da primeira aba da planilha
            const firstSheetName = workbook.SheetNames[0];
            
            // Pega a planilha (worksheet) usando o nome da aba
            const worksheet = workbook.Sheets[firstSheetName];
            
            // Converte a planilha para JSON
            // { raw: false } tenta formatar valores (ex: datas e números)
            // { defval: null } garante que células vazias virem 'null'
            const data = xlsx.utils.sheet_to_json(worksheet, { raw: false, defval: null });

            console.log(`[FileReader] Arquivo ${filePath} lido com sucesso. ${data.length} linhas encontradas.`);
            return data;

        } catch (error) {
            console.error(`[FileReader] Erro ao ler o arquivo ${filePath}:`, error.message);
            throw new Error('Falha ao ler ou processar o arquivo.');
        }
    }
}

// Exporta a classe para ser usada em outros arquivos
export default FileReader;