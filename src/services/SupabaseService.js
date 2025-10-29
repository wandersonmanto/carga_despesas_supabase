// src/services/SupabaseService.js

import dotenv from 'dotenv';
import { createClient } from '@supabase/supabase-js';

// Carrega as variáveis de ambiente (SUPABASE_URL e SUPABASE_KEY)
dotenv.config();

class SupabaseService {
    
    constructor() {
        if (!process.env.SUPABASE_URL || !process.env.SUPABASE_KEY) {
            throw new Error('Variáveis de ambiente SUPABASE_URL e SUPABASE_KEY são obrigatórias.');
        }

        // Inicializa o cliente Supabase dentro da classe
        this.supabase = createClient(
            process.env.SUPABASE_URL, 
            process.env.SUPABASE_KEY
        );

        console.log('[SupabaseService] Cliente Supabase inicializado.');
    }

    /**
     * Insere um lote de registros de despesas na tabela 'despesas'.
     * Se uma despesa já existir (com base na restrição 'despesa_unica'),
     * ela será ignorada.
     * * @param {Array<Object>} despesas - Um array de objetos de despesa formatados.
     */
    async insertDespesas(despesas) {
        if (!despesas || despesas.length === 0) {
            console.log('[SupabaseService] Nenhum dado para inserir.');
            return;
        }

        console.log(`[SupabaseService] Tentando inserir/ignorar ${despesas.length} registros...`);

        try {
            // MUDANÇA AQUI: Trocamos .insert() por .upsert()
            const { data, error } = await this.supabase
                .from('despesas')
                .upsert(despesas, {
                    // Diz ao Supabase para usar nossa restrição como chave
                    onConflict: 'data_referencia, filial, grupo, subgrupo, plano, fornecedor, titulo, pago, aberto', 
                    // Se houver conflito (duplicata), não faça nada (ignore)
                    ignoreDuplicates: true  
                })
                .select(); // .select() ainda é útil para sabermos o que FOI inserido

            if (error) {
                // Se o erro for sobre a restrição 'despesa_unica' não encontrada,
                // é porque a Etapa 1 não foi executada.
                console.error('[SupabaseService] Erro ao fazer upsert dos dados:', error.message);
                throw error;
            }

            console.log(`[SupabaseService] Sucesso! ${data.length} novos registros foram inseridos.`);
            const ignorados = despesas.length - data.length;
            if (ignorados > 0) {
                console.log(`[SupabaseService] ${ignorados} registros duplicados foram ignorados.`);
            }
            
            return data;

        } catch (error) {
            console.error('[SupabaseService] Falha catastrófica no upsert:', error.message);
            throw new Error('Falha ao se comunicar com o Supabase.');
        }
    }
}

// Exporta a classe
export default SupabaseService;