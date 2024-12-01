const express = require('express');
const cors = require('cors');
const fs = require('fs').promises;
const path = require('path');

const app = express();
const PORT = 5000;

app.use(cors());
app.use(express.json());

const DATABASE_FILE = path.join(__dirname, 'tasks.json');

// Garantir que o arquivo de banco de dados existe
async function initializeDatabase() {
    try {
        await fs.access(DATABASE_FILE);
    } catch {
        await fs.writeFile(DATABASE_FILE, JSON.stringify([]));
    }
}

// Ler tarefas
async function readTasks() {
    const data = await fs.readFile(DATABASE_FILE, 'utf8');
    return JSON.parse(data);
}

// Escrever tarefas
async function writeTasks(tasks) {
    await fs.writeFile(DATABASE_FILE, JSON.stringify(tasks, null, 2));
}

// Rotas
app.get('/tasks', async (req, res) => {
    try {
        const tasks = await readTasks();
        res.json(tasks);
    } catch (error) {
        res.status(500).json({ error: 'Erro ao ler tarefas' });
    }
});

app.post('/tasks', async (req, res) => {
    try {
        const tasks = await readTasks();
        const newTask = {
            id: tasks.length + 1,
            ...req.body,
            createdAt: new Date()
        };
        tasks.push(newTask);
        await writeTasks(tasks);
        res.status(201).json(newTask);
    } catch (error) {
        res.status(500).json({ error: 'Erro ao criar tarefa' });
    }
});

// Inicializar e iniciar servidor
initializeDatabase().then(() => {
    app.listen(PORT, () => {
        console.log(`Servidor rodando na porta ${PORT}`);
    });
});