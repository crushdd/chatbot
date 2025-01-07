const puppeteer = require('puppeteer-core');
const { Client, LocalAuth } = require('whatsapp-web.js');
const qrcode = require('qrcode-terminal');
const readline = require('readline');
const fs = require('fs');

// Armazenando as opções e respostas
let options = {};

// Função de delay para aguardar um tempo
const delay = ms => new Promise(resolve => setTimeout(resolve, ms));

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
});

// Lidar com as mensagens recebidas no WhatsApp
client.on('message', async (message) => {
    console.log('Mensagem recebida:', message.body);
    
    // Verificando se a mensagem recebida é uma das perguntas armazenadas
    const response = options[message.body];
    
    if (response) {
        // Respondendo com a resposta associada
        message.reply(response);
        console.log('Resposta enviada:', response);
    } else {
        // Enviando o menu se a mensagem for de saudação ou pedido de menu
        if (message.body.match(/(menu|Menu|oi|Oi|Olá|olá|ola|Ola)/i)) {
            const chat = await message.getChat();
            await chat.sendStateTyping(); // Simulando Digitação
            await delay(3000); // Delay de 3 segundos
            const contact = await message.getContact(); // Pegando o contato
            const name = contact.pushname; // Pegando o nome do contato
            await client.sendMessage(
                message.from,
                'Olá! ' + name.split(' ')[0] + ', sou o assistente virtual da empresa tal. Como posso ajudá-lo hoje? Por favor, digite uma das opções abaixo:\n\n' +
                '1 - Como funciona\n' +
                '2 - Valores dos planos\n' +
                '3 - Fazer teste no Android\n' +
                '4 - Fazer teste no IPhone\n' +
                '5 - Como aderir\n' +
                '6 - Outras perguntas\n' +
                '7 - Receber vídeo informativo'
            );
        } else if (message.body === '3') {
            // Resposta para "Fazer teste no Android"
            await message.reply(options['Fazer teste no Android']);
            console.log('Resposta 1 enviada: ', options['Fazer teste no Android']);

            // Aguardar 5 segundos antes de enviar o vídeo
            await delay(5000);

            // Caminho correto do vídeo
            const videoPath = '/home/container/app.mp4'; // Caminho exato para o arquivo de vídeo

            try {
                // Enviar o vídeo
                await message.reply(
                    'Aqui está o vídeo com as instruções de como conectar no aplicativo.', // Mensagem de texto opcional
                    { media: fs.createReadStream(videoPath) } // Enviar o arquivo de vídeo
                );
                console.log('Vídeo enviado com sucesso!');
            } catch (error) {
                console.error('Erro ao enviar o vídeo:', error);
            }

            // Terceira resposta
            await message.reply(options['Fazer teste no Android - vídeo']);
            console.log('Resposta 3 enviada: ', options['Fazer teste no Android - vídeo']);
        }
    }
});

// Respostas armazenadas
options['Como funciona'] = 'Disponibilizamos a internet ilimitada por meio do nosso aplicativo. Basta baixá-lo, fazer login com o acesso iremos fornecer, e conectar. Enquanto você mantiver o aplicativo aberto e conectado, terá acesso à internet ilimitada.';
options['Valores dos planos'] = `### *PLANOS SEM ACESSO PARA ROTEAR INTERNET:*

====================== 
*Plano Mensal:* R$25,00 /mês  
30 dias de internet ilimitada (sem acesso para rotear para TV/computador/celular)

-------------------------------------------------
*Plano Bronze* 🥉  
3 Meses de internet ilimitada por: *R$69,90*  
(Ficam apenas R$23,30 por mês)

-------------------------------------------------
*Plano Prata* 🥈  
6 Meses de internet ilimitada por: *R$129,90*  
(Ficam apenas R$21,65 por mês)  
+ 1 Mês de Bônus (Pague 6 e Leve 7 meses)

-------------------------------------------------
*Plano Ouro* 🥇  
12 Meses de internet ilimitada por: *R$226,90*  
(Ficam apenas R$18,90 por mês)  
+ 2 Meses de Bônus (Pague 12 e Leve 14 meses)

======================

### *PLANOS COM ACESSO PARA ROTEAR INTERNET:*
*(DISPONIVEL APENAS PARA PLANOS COMPRADOS PARA ANDROID)*

====================== 
*Plano Mensal:* R$35,00 /mês  
30 dias de internet ilimitada + roteamento ilimitado para TV/computador/celular

-------------------------------------------------
*Plano Bronze* 🥉  
3 Meses de internet ilimitada + roteamento por: *R$95,00*  
(Ficam apenas R$31,67 por mês)

-------------------------------------------------
*Plano Prata* 🥈  
6 Meses de internet ilimitada + roteamento por: *R$180,00*  
(Ficam apenas R$30,00 por mês)  
+ 1 Mês de Bônus (Pague 6 e Leve 7 meses)

-------------------------------------------------
*Plano Ouro* 🥇  
12 Meses de internet ilimitada + roteamento por: *R$330,00*  
(Ficam apenas R$27,50 por mês)  
+ 2 Meses de Bônus (Pague 12 e Leve 14 meses)

======================`;

options['Fazer teste no Android'] = 'Por favor, _*INSTALE*_ este aplicativo: https://play.google.com/store/apps/details?id=com.hypernet23.pro E _*abra-o*_ com o _*Wi-Fi ligado*_.';
options['Fazer teste no Android - vídeo'] = '👤 Usuário: 5120\n🔑 Senha: 5120\n📲 Limite: 1\n🗓️ Expira em: 24 horas\n🌍 Instruções de conexão: Abra o aplicativo com o seu Wi-Fi ligado. Após abrir o aplicativo, desligue o Wi-Fi e ligue os seus dados móveis. Certifique-se de que apareça a indicação de 3G, H+, 4G ou 5G. Insira o usuário e senha acima, escolha a opção correspondente à sua operadora e clique em conectar. Aguarde 15 segundos. Se não funcionar, teste todas as opções disponíveis para a sua operadora no aplicativo.';

// Iniciar o cliente
client.initialize();

// Lidar com desconexões ou falhas
client.on('disconnected', (reason) => {
    console.log('Cliente desconectado. Razão:', reason);
});
