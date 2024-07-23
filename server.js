import express from 'express';
import fileUpload from 'express-fileupload';
import fs from 'fs';
import fetch from 'node-fetch';
import path from 'path';
import { fileURLToPath } from 'url';

const app = express();
const port = 3000;

const CLIENT_ID = "62b182eea31d8d9863079f42";
const CLIENT_SECRET = "2NiYR9Qkvc1rwof3oHkPE4KvCK65A0IeJjTXaZS9xM42G6PHFW";
const API_URL = "https://academy.turiscool.com/admin/api/";
const TOKEN = "Tgm4Xx76myQrEwcxFrz63iFKUhCzGxWb1Z4sXr0b";

let emailsVerified = [];

// Definir __dirname
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

app.use(fileUpload());
app.use(express.json());
app.use(express.static('public')); // Servir archivos estáticos desde la carpeta 'public'

// Ruta para subir archivos
app.post('/upload', (req, res) => {
    if (!req.files || Object.keys(req.files).length === 0) {
        return res.status(400).send('No files were uploaded.');
    }

    const file = req.files.file;
    const filePath = path.join(__dirname, 'uploads', file.name);

    file.mv(filePath, function(err) {
        if (err) {
            return res.status(500).send(err);
        }

        readFile(filePath);
        res.send('File uploaded!');
    });
});

// Ruta para desbloquear usuarios
app.post('/unsuspend', (req, res) => {
    const mails = req.body.mails;
    if (mails) {
        comprobarSiMailsSeparadosPorComa(mails);
    }

    unsuspendUsers(emailsVerified)
        .then(() => {
            emailsVerified = []; // Vaciar el array después de desuspender
            res.send('Users unsuspended!');
        })
        .catch(err => res.status(500).send(err));
});

// Funciones del backend
function readFile(filePath) {
    fs.readFile(filePath, 'utf8', (err, data) => {
        if (err) {
            console.error(err);
            return;
        }
        cleanData(data);
    });
}

function cleanData(data) {
    const dataSplited = data.split('\n');
    const dataCleaned = dataSplited.map(item => item.split(','));
    dataCleaned.shift(); // Elimina la fila de encabezado

    let dataSpliced = [];
    dataCleaned.forEach(element => {
        element.splice(3, 1000); // Ajusta según la cantidad de columnas que necesites
        dataSpliced.push(element);
    });

    obtainEmails(dataSpliced);
}

function obtainEmails(data) {
    let emails = data.map(item => item[2]);

    emails.forEach(email => {
        if (email) { // Validación adicional
            let slicedEmail = email.trim().replace(/"/g, '');
            if (!emailsVerified.includes(slicedEmail)) {
                emailsVerified.push(slicedEmail);
            }
        }
    });
    console.log(emailsVerified);
}

async function unsuspendUsers(emails) {
    try {
        for (const email of emails) {
            const response = await fetch(`${API_URL}v2/users/${email}/unsuspend`, {
                method: 'PUT',
                headers: {
                    'Lw-Client': CLIENT_ID,
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${TOKEN}`
                }
            });
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            const data = await response.json();
            console.log(data);
            console.log('Usuarios desbloqueados correctamente');
        }
    } catch (error) {
        console.error('Error unsuspending users:', error);
    }
}

function comprobarSiMailsSeparadosPorComa(mails) {
    if (!mails) {
        console.log('No hay correos');
        return;
    }

    if (mails.includes(' ')) {
        console.log('Los correos no deben contener espacios');
        return;
    }

    let regexEmail = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,6}$/;
    let mailsSeparated = mails.split(',');

    for (let i = 0; i < mailsSeparated.length; i++) {
        let email = mailsSeparated[i].trim();
        if (!regexEmail.test(email)) {
            console.log('El correo no es válido');
        } else {
            if (!emailsVerified.includes(email)) {
                emailsVerified.push(email);
            }
        }
    }
    console.log(emailsVerified);
}

app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}/`);
});
