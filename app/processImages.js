const sharp = require('sharp');
const xlsx = require('xlsx');
const axios = require('axios');
const fs = require('fs');
const path = require('path');
const https = require('https');


// Ignorar certificados autoassinados
const agent = new https.Agent({  
    rejectUnauthorized: false
  });

// Caminho da planilha
const workbook = xlsx.readFile('links_logos.xlsx');
const sheet_name_list = workbook.SheetNames;
const worksheet = workbook.Sheets[sheet_name_list[0]];

// Ler URLs das imagens da planilha
const imageUrls = xlsx.utils.sheet_to_json(worksheet, { header: 1 })
    .slice(1)  // Ignora a primeira linha (cabeçalho)
    .map(row => row[0]);  // Assume que as URLs estão na primeira coluna

// Pasta de saída
const outputFolder = 'output/logos';

// Função para baixar, converter e redimensionar imagens
async function processImage(url, outputFolder) {
    try {
        // Nome do arquivo baseado na URL
        const fileName = path.basename(url, path.extname(url)) + '.png';
        const outputFilePath = path.join(outputFolder, fileName);

        // Download da imagem
        const response = await axios({
            url,
            responseType: 'arraybuffer'
        });
        const buffer = Buffer.from(response.data, 'binary');

        // Processamento da imagem
        await sharp(buffer)
            .resize(140, 140)
            .toFormat('png')
            .toFile(outputFilePath);

        console.log(`Imagem salva em: ${outputFilePath}`);
    } catch (error) {
        console.error(`Erro ao processar a imagem ${url}:`, error);
    }
}

// Processar todas as URLs
(async () => {
    for (const url of imageUrls) {
        await processImage(url, outputFolder);
    }
})();
