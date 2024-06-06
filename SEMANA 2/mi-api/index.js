const { google } = require('googleapis');
const axios = require('axios');
const fs = require('fs');
const path = require('path');

// con la ruta al archivo que contiene tus credenciales de la cuenta de servicio
const auth = new google.auth.GoogleAuth({
    keyFile: 'apikey.json',
    scopes: ['https://www.googleapis.com/auth/drive'],
});

// Inicializa el cliente de Google Drive API
const driveService = google.drive({ version: 'v3', auth });

// Funcion para obtener un numero aleatorio de la API
async function getRandomNumber() {
    try {
        const response = await axios.get('https://www.randomnumberapi.com/api/v1.0/random?min=100&max=1000&count=1');
        const randomNumber = response.data[0]; // Asumiendo que la API devuelve un array de numeros
        console.log(`Numero aleatorio obtenido: ${randomNumber}`);
        return randomNumber;

    } catch (error) {
        console.error('Error al obtener un numero aleatorio:', error);
        throw error;
    }
}

// Funcion para subir un archivo a Google Drive
async function uploadFileToDrive(filename, folderId) {
    const filePath = path.join(__dirname, filename);
    try {
        const res = await driveService.files.create({
            requestBody: {
                name: filename,
                mimeType: 'text/plain',
                parents: [folderId] // ID de la carpeta donde se subira el archivo
            },
            media: {
                mimeType: 'text/plain',
                body: fs.createReadStream(filePath),
            },
        });
        console.log(`Archivo subido con ID: ${res.data.id}`);
    } catch (error) {
        console.error('Error al subir el archivo:', error);
        throw error;
    }
}

// Flujo principal de ejecucion
(async () => {
    try {
        // Obtener un numero aleatorio
        const randomNumber = await getRandomNumber();
        const filename = `file-${randomNumber}.txt`;

        // Crear un archivo temporal con ese numero como nombre
        fs.writeFileSync(filename, 'Este es el contenido del archivo. -> 1284719 -> 1307419');

        // ID de tu carpeta en Google Drive
        const folderId = '16y8ne-MKYdK-WExujd6w_zF_mMnF6pai';

        // Subir el archivo a Google Drive en la carpeta especificada
        await uploadFileToDrive(filename, folderId);

        // Limpiar el archivo local si se desea
        fs.unlinkSync(filename);
    } catch (error) {
        console.error('Error en el flujo principal:', error);
    }
})();
