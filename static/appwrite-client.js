const client = new Appwrite.Client()
    .setEndpoint('https://nyc.cloud.appwrite.io/v1')
    .setProject('6aec1bf700268c3dd42c');

window.account = new Appwrite.Account(client);
window.tablesDB = new Appwrite.TablesDB(client);

window.Query = Appwrite.Query;
window.ID = Appwrite.ID;

window.DATABASE_ID = '6aec2098000c2aac39d0';
window.TABLE_ID = '6aec21390031cbdfea27';