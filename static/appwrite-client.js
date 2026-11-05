const client = new Appwrite.Client()
    .setEndpoint('https://nyc.cloud.appwrite.io/v1')
    .setProject('6aec1bf700268c3dd42c');

const account = new Appwrite.Account(client);
const databases = new Appwrite.Databases(client);
const Query = Appwrite.Query;

const DATABASE_ID = '6aec2098000c2aac39d0';
const TABLE_ID = '6aec21390031cbdfea27';