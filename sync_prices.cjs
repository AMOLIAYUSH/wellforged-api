const { Client } = require('pg');

const client = new Client({
    connectionString: 'postgresql://postgres:Ayush@12@localhost:5432/Wf_backend'
});

async function updatePrices() {
    try {
        await client.connect();
        console.log('Connected to database');

        await client.query("UPDATE skus SET price = 349.00 WHERE label LIKE '%100g%'");
        console.log('Updated 100g products to 349.00');

        await client.query("UPDATE skus SET price = 549.00 WHERE label LIKE '%250g%'");
        console.log('Updated 250g products to 549.00');

        console.log('Database updated successfully');
    } catch (err) {
        console.error('Error updating database:', err);
        process.exit(1);
    } finally {
        await client.end();
    }
}

updatePrices();
