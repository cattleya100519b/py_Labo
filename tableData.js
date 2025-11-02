const tableData = [];
const names = ["Alice", "Bob", "Charlie", "David", "Eve"];
for (let i = 1; i <= 50; i++) {
    const name = names[Math.floor(Math.random() * names.length)];
    const age = 18 + Math.floor(Math.random() * 50);
    const score = Math.floor(Math.random() * 100);
    tableData.push({ id: i, name, age, score, img: `img${(i % 5) + 1}.jpg` });
}