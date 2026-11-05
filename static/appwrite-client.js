// 检查 SDK 是否成功加载
if (typeof Appwrite === 'undefined') {
    alert("Appwrite SDK 加载失败，请检查网络或 CDN 链接！");
}

const client = new Appwrite.Client()
    .setEndpoint('https://nyc.cloud.appwrite.io/v1')
    .setProject('6aec1bf700268c3dd42c');

window.account = new Appwrite.Account(client);

// 自动检测 SDK 版本：优先使用 TablesDB，如果没有则降级使用 Databases
if (Appwrite.TablesDB) {
    window.db = new Appwrite.TablesDB(client);
    window.isNewTables = true;
} else {
    window.db = new Appwrite.Databases(client);
    window.isNewTables = false;
}

window.Query = Appwrite.Query;
window.ID = Appwrite.ID;

window.DATABASE_ID = '6aec2098000c2aac39d0';
window.TABLE_ID = '6aec21390031cbdfea27';

console.log("Appwrite 初始化完成。当前 API 类型：", window.isNewTables ? "TablesDB" : "Databases");