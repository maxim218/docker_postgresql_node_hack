"use strict";

// Подключаем модули
let express = require("express");
let app = express();
let pg = require('pg');

// Разрешаем междоменные запросы
app.use(function(req, res, next) {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
    next();
});

// Описываем функцию создания нового клиента для подключения к БД
function createNewClient() {
    return new pg.Client({
        user: 'postgres',
        host: 'localhost',
        database: 'my_database',
        password: '12345',
        port: 5432
    });
}

// Описываем функцию отправки запроса в БД и получения ответа от неё
function makeQuery(query, resultObj, callback) {
    const client = createNewClient();
    client.connect();

    client.query(query, (err, res) => {
        resultObj.arr = res.rows;
        client.end();
        callback();
    });
}

// Создаем таблицу
makeQuery("CREATE TABLE IF NOT EXISTS people (man_id BIGSERIAL PRIMARY KEY, man_nickname TEXT, man_age INTEGER);", {}, () => {
      console.log("table was created")
});

// Описываем функцию для получения списка всех людей в БД
app.get('/get_all_records', (request, response) => {
   console.log("GET ALL RECORDS");
   let aaa = {
      arr: []
   };

   makeQuery("SELECT * FROM people ORDER BY man_id ASC;", aaa, () => {
       const answer = aaa.arr;
       response.end(JSON.stringify(answer));
       console.log("get ans");
   });
});

// HELLO NODE API
app.get('/', (request, response) => {
    response.end("HELLO NODE API");
});

// Описываем функцию для добавления человека в БД
app.post('/add_one_record', (request, response) => {
    console.log("POST ONE RECORD");
    let bigString = "";
    request.on('data', (data) => {
        bigString += data;
    }).on('end', () => {
        const dataObj = JSON.parse(bigString);

        const nickname = dataObj.nickname;
        const age = dataObj.age;

        let aaa = {
            arr: []
        };

        makeQuery("SELECT * FROM people WHERE man_nickname = '" + nickname + "';", aaa, () => {
            if(aaa.arr.length > 0) {
                const answer = {
                   message: "NO_ADDING"
                };
                response.end(JSON.stringify(answer));
            } else {
                makeQuery("INSERT INTO people (man_nickname, man_age) VALUES ('" + nickname + "', " + age + ");", {}, () => {
                    const answer = {
                        message: "ADDING_SUCCESS"
                    };
                    response.end(JSON.stringify(answer));
                });
            }
        });
    });
});

// Запускаем сервер
let port = 80;
app.listen(port);
console.log("Server works on port " + port);

