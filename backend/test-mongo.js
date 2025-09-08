/**
 * Test de connexion MongoDB simple
 */
import mongoose from 'mongoose'
import dotenv from 'dotenv'

dotenv.config()

async function testMongoConnection() {
  try {
    console.log('🔄 Test de connexion MongoDB...')
    
    const uri = process.env.MONGODB_URI
    console.log('URI:', uri.replace(/\/\/.*@/, '//***:***@'))
    
    // Test de connexion simple
    await mongoose.connect(uri, {
      serverSelectionTimeoutMS: 15000,
      connectTimeoutMS: 15000
    })
    
    console.log('✅ Connexion MongoDB réussie!')
    console.log('- Base de données:', mongoose.connection.name)
    console.log('- Host:', mongoose.connection.host)
    console.log('- Port:', mongoose.connection.port)
    console.log('- ReadyState:', mongoose.connection.readyState)
    
    await mongoose.connection.close()
    console.log('✅ Connexion fermée proprement')
    
  } catch (error) {
    console.error('❌ Erreur de connexion MongoDB:', error.message)
    console.error('Type d\'erreur:', error.constructor.name)
    process.exit(1)
  }
}

testMongoConnection()