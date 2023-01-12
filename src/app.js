import express from 'express'
import dotenv from 'dotenv'
import cors from 'cors'
import { MongoClient } from 'mongodb'

dotenv.config()

const mongoClient = new MongoClient(process.env.DATABASE_URL)
let db;
try {
  await mongoClient.connect()
  db = mongoClient.db()
} catch (error) {
  console.log(error)
}

const app = express()
app.use(cors())
app.use(express.json())

app.get('/api/cars', async (req, res) => {

  try {
    const cars = await db.collection("cars").find().toArray()

    if (!cars) return res.status(404).send("Não encontrei carros!!!")

    res.send(cars)

  } catch (error) {
    res.status(500).send("Deu um erro no servidor de banco de dados")
  }

})

app.post('/api/cars', async (req, res) => {
  const { model, year, name } = req.body;
  const { admin } = req.headers;

  if (admin == 'false') return res.status(401).send('Você não tem autorização para cadastrar')

  if (!model || !year || !name) return res.status(422).send('Por favor informe todos os  campos!')


  try {
    const existsCar = await db.collection("cars").findOne({ name })

    if (existsCar) return res.status(409).send("Esse carro já está cadastrado")

    await db.collection("cars").insertOne({ model, year, name })
    return res.status(201).send("OK")
  } catch (error) {
    return res.status(500).send("Deu um erro no servidor de banco de dados")
  }
})

const PORT = 5007

app.listen(PORT, () => console.log('foiiiiiii'))