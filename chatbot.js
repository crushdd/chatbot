const puppeteer = require('puppeteer-core');
const { Client, LocalAuth } = require('whatsapp-web.js');
const qrcode = require('qrcode-terminal');
const readline = require('readline');

// Configuração do WhatsApp Web
const client = new Client({
    authStrategy: new LocalAuth(),
    puppeteer: {
        headless: true,
        executablePath: '/usr/bin/google-chrome-stable', // Caminho para o navegador
        args: [
            '--no-sandbox', // Desativa o sandbox
            '--disable-setuid-sandbox', // Desativa o setuid sandbox
        ],
    },
});

// Gerar o QR Code para autenticação
client.on('qr', (qr) => {
    qrcode.generate(qr, { small: true });
    console.log('Escaneie o QR Code acima!');
});

// Após a conexão bem-sucedida
client.on('ready', () => {
    console.log('Tudo certo! WhatsApp conectado.');

    // Menu interativo
    const rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout
    });

    rl.question('Escolha uma opção:\n1 - Adicionar opção e resposta\n2 - Deletar opção\nDigite o número da opção desejada: ', (option) => {
        if (option === '1') {
            rl.question('Digite a pergunta da nova opção: ', (question) => {
                rl.question('Digite a resposta para a pergunta: ', (answer) => {
                    // Aqui você pode adicionar o código para salvar a nova opção e resposta
                    console.log(`Opção "${question}" com resposta "${answer}" foi adicionada.`);
                    rl.close();
                });
            });
        } else if (option === '2') {
            rl.question('Digite o número da opção a ser deletada: ', (optionToDelete) => {
                // Aqui você pode adicionar o código para deletar a opção
                console.log(`Opção número "${optionToDelete}" foi deletada.`);
                rl.close();
            });
        } else {
            console.log('Opção inválida.');
            rl.close();
        }
    });
});

// Iniciar o cliente
client.initialize();

// Lidar com desconexões ou falhas
client.on('disconnected', (reason) => {
    console.log('Cliente desconectado. Razão:', reason);
});
