const express = require("express");
const mysql = require("mysql2");
var bodyParser = require('body-parser');
var app = express();

let userId = null;

var con = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: 'n0m3l0',
    database: 'desesperanza'
});

con.connect();

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static('public')); 


app.post('/iniciarsesion', (req, res) => {
    const correo_i = req.body.correo_i;
    const contra_i = req.body.contra_i;

    if (correo_i.length === 0 || contra_i.length === 0) {
        console.log("Llena todos los campos");
        return res.send("Llena todos los campos");
    } else if (!/.*@gmail\.com$/.test(correo_i)) {
        return res.send("El correo debe de tener la nomenclatura solicitada; ejemplo@gmail.com ");
    } else {
        con.query('SELECT id_usuario, correo FROM clientes WHERE correo = ? AND contraseña = ?', [correo_i, contra_i], (err, respuesta) => {
            if (err) return console.log('ERROR: ', err);

            if (respuesta.length > 0) {
                userId = respuesta[0].id_usuario;
                return res.send("Inicio de sesión exitoso");
            } else {
                return res.send("Credenciales incorrectas");
            }
        });
    }
});

app.post('/registrarus', (req, res) => {
    const correo_i = req.body.correo_r;
    const contra_i = req.body.contra_r;
    const contra_i2 = req.body.contra_r2;
    const Usuario_i = req.body.Usuario_r;

    if (!Usuario_i) {
        return res.status(400).json({ error: 'Ingresa los datos correctamente.' });
    }

    if (!correo_i || !correo_i.endsWith('@gmail.com')) {
        return res.status(400).json({ error: 'El correo electrónico debe ser de formato Gmail.' });
    }

    if (contra_i.length < 8) {
        return res.status(400).json({ error: 'La contraseña debe tener al menos 8 caracteres.' });
    }

    if (contra_i !== contra_i2) {
        return res.status(400).json({ error: 'Las contraseñas no coinciden.' });
    }

    con.query('SELECT nombre FROM clientes WHERE correo = ?', [correo_i], (err, results) => {
        if (err) {
            return res.status(500).json({ error: 'Error al consultar la base de datos' });
        }

        if (results.length > 0) {
            return res.status(400).json({ error: 'Este correo ya está registrado' });
        }

        const query = 'INSERT INTO clientes (nombre, correo, contraseña) VALUES (?, ?, ?)';
        con.query(query, [Usuario_i, correo_i, contra_i], (err) => {
            if (err) {
                return res.status(500).json({ error: 'Error al guardar los datos' });
            }

            res.status(201).json({ message: 'Datos guardados correctamente' });
        });
    });
});


app.post('/agregarPan', (req, res) => {
    const { nombre_pan, cantidad, precio_pan } = req.body;

    con.query('INSERT INTO panes (nombre_pan, cantidad, precio_pan) VALUES (?, ?, ?)', [nombre_pan, cantidad, precio_pan], (err) => {
        if (err) {
            console.log("Error al agregar pan", err);
            return res.status(500).send("Error al agregar pan");
        }
        res.redirect('/'); 
    });
});


app.get('/obtenerPanes', (req, res) => {
    con.query('SELECT * FROM panes', (err, respuesta) => {
        if (err) return res.status(500).send('Error al obtener panes');
        res.json(respuesta); // Devuelve la lista de panes en formato JSON
    });
});


app.post('/actualizarPan', (req, res) => {
    const { id_pan, nombre_pan, cantidad, precio_pan } = req.body;

    const updates = [];
    if (nombre_pan) updates.push(`nombre_pan = '${nombre_pan}'`);
    if (cantidad) updates.push(`cantidad = ${cantidad}`);
    if (precio_pan) updates.push(`precio_pan = ${precio_pan}`);

    if (updates.length > 0) {
        con.query(`UPDATE panes SET ${updates.join(', ')} WHERE id_pan = ?`, [id_pan], (err, resultado) => {
            if (err) {
                console.error('Error al actualizar el pan:', err);
                return res.status(500).send("Error al actualizar el pan");
            }
            if (resultado.affectedRows === 0) {
                return res.status(404).send("Pan no encontrado");
            }
            res.redirect('/'); 
        });
    } else {
        res.status(400).send("No se proporcionaron datos para actualizar");
    }
});


app.post('/borrarPan', (req, res) => {
    const id_pan = req.body.id_pan;

    con.query('DELETE FROM panes WHERE id_pan = ?', [id_pan], (err, resultado) => {
        if (err) {
            console.error('Error al borrar el pan:', err);
            return res.status(500).send("Error al borrar el pan");
        }
        if (resultado.affectedRows === 0) {
            return res.status(404).send("Pan no encontrado");
        }
        res.redirect('/'); 
    });
});


app.listen(3000, () => {
    console.log('Servidor escuchando en el puerto 3000');
});
